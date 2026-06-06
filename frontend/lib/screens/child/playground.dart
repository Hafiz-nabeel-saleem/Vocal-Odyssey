import 'dart:io';
import 'package:audioplayers/audioplayers.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:fluttertoast/fluttertoast.dart';
import 'package:lottie/lottie.dart';
import 'package:provider/provider.dart';
import 'package:path_provider/path_provider.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:speech_to_text/speech_to_text.dart' as stt;
import 'package:flutter_tts/flutter_tts.dart';
import 'package:vocal_odyssey/providers/user_provider.dart';
import 'package:vocal_odyssey/services/attempt_service.dart';
import 'package:vocal_odyssey/widgets/my_app_bar.dart';
import 'package:vocal_odyssey/widgets/my_elevated_button.dart';
import 'package:vocal_odyssey/widgets/my_scaffold_layout.dart';
import '../../models/level.dart';
import '../../providers/level_provider.dart';
import '../../utils/functions.dart';
import '../../utils/enums.dart' as myEnum;

class PlaygroundScreen extends StatefulWidget {
  const PlaygroundScreen({super.key});

  @override
  PlaygroundScreenState createState() => PlaygroundScreenState();
}

class PlaygroundScreenState extends State<PlaygroundScreen> {
  late Level level;
  bool isLoading = true;
  int currentIndex = 0;
  Map<String, int> _mistakesCount = {};
  double _scoreSum = 0;
  int _scoreCount = 0;

  final audioPlayer = AudioPlayer();
  final stt.SpeechToText speechToText = stt.SpeechToText();
  final FlutterTts flutterTts = FlutterTts();
  
  bool _isRecording = false;
  String _recognizedText = '';
  bool _isInit = true;
  String _currentLocaleId = '';

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (_isInit) {
      final arguments = ModalRoute.of(context)!.settings.arguments as PlaygroundScreenArguments;
      level = arguments.level;
      _initServices();
      playAudio(AssetSource('audios/greetings.wav'));
      _isInit = false;
    }
  }

  @override
  void dispose() {
    audioPlayer.dispose();
    speechToText.stop();
    flutterTts.stop();
    super.dispose();
  }

  Future<void> _initServices() async {
    setState(() => isLoading = true);

    try {
      await flutterTts.setLanguage("en-US");
      await flutterTts.setSpeechRate(0.4);
      await flutterTts.setVolume(1.0);
      await flutterTts.setPitch(1.0);

      var status = await Permission.microphone.request();
      if (status.isGranted) {
        bool available = await speechToText.initialize(
          onError: (val) {
            print('STT Error: ${val.errorMsg}');
            if (mounted && _isRecording) {
              setState(() => _isRecording = false);
              if (val.errorMsg != 'error_no_match') {
                Fluttertoast.showToast(msg: "Mic Error: ${val.errorMsg}");
              }
            }
          },
          onStatus: (status) {
            print('STT Status: $status');
            if (status == 'notListening' && _isRecording && mounted) {
              _stopRecordingAndEvaluate();
            }
          },
        );
        
        if (available) {
          var systemLocale = await speechToText.systemLocale();
          if (systemLocale != null) {
            _currentLocaleId = systemLocale.localeId;
          }
        }
      }
    } catch (e) {
      print('Initialization failed: $e');
    }

    if (mounted) setState(() => isLoading = false);
    
    // Wait for the intro audio to finish before speaking the first item
    Future.delayed(const Duration(seconds: 4), () { 
      if (mounted) repeatAudio(); 
    });
  }

  Future<void> _handleSpeakButton() async {
    audioPlayer.stop();
    await flutterTts.stop();

    if (!_isRecording) {
      if (!speechToText.isAvailable) {
        await _initServices();
      }

      setState(() {
        _isRecording = true;
        _recognizedText = '';
      });

      // Shorter timeout for phonics (single letters) to avoid double-detection
      // Longer for sentences.
      int pauseSeconds = level.type == myEnum.ContentType.phonics
          ? 3
          : level.type == myEnum.ContentType.words
              ? 5
              : 8;

      speechToText.listen(
        onResult: (val) {
          setState(() => _recognizedText = val.recognizedWords);

          // For Phonics: If we hear anything at all, we can stop sooner if the user pauses
          if (level.type == myEnum.ContentType.phonics &&
              val.recognizedWords.isNotEmpty &&
              !val.finalResult) {
            // We got a partial match, we can wait for finalResult or let it timeout fast
          }

          if (val.finalResult) _stopRecordingAndEvaluate();
        },
        localeId: _currentLocaleId,
        listenFor: Duration(seconds: 20),
        pauseFor: Duration(seconds: pauseSeconds),
        partialResults: true,
        cancelOnError: false,
      );
    } else {
      _stopRecordingAndEvaluate();
    }
  }

  void _stopRecordingAndEvaluate() async {
    if (!_isRecording) return;
    
    await speechToText.stop();
    await Future.delayed(Duration(milliseconds: 600)); 

    if (!mounted) return;
    setState(() => _isRecording = false);

    if (_recognizedText.trim().isEmpty) {
      Fluttertoast.showToast(msg: "We didn't catch that. Try again!");
      return;
    }

    showLoadingDialog(
      context,
      text: 'Evaluating your speech',
      widget: Lottie.asset('assets/animations/bubbles.json', width: 120),
    );
    
    await Future.delayed(Duration(seconds: 1));
    Navigator.pop(context);

    final score = calculateScore(level.content[currentIndex], _recognizedText);

    if (score < 85) {
      _mistakesCount.update(level.content[currentIndex], (v) => v + 1, ifAbsent: () => 1);
    }

    if (score >= 85) {
      _scoreSum += score;
      _scoreCount += 1;
      _playFeedback(score);
      _showSuccessDialog(score);
    } else {
      await showTryAgainDialogue(score);
      repeatAudio();
    }
  }

  void _playFeedback(int score) {
    if (score >= 98) playAudio(AssetSource('audios/feedback-1.wav'));
    else if (score >= 90) playAudio(AssetSource('audios/feedback-2.wav'));
    else playAudio(AssetSource('audios/feedback-3.wav'));
  }

  void _showSuccessDialog(int score) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (_) => Dialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Lottie.asset('assets/animations/congrats.json'),
              Text('Your accuracy is: $score%', style: TextStyle(fontSize: 18)),
              SizedBox(height: 10),
              TextButton(
                onPressed: () { Navigator.pop(context); moveToNext(); },
                child: Text('Continue', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
              ),
            ],
          ),
        ),
      ),
    );
  }

  int calculateScore(String reference, String spoken) {
    if (spoken.isEmpty) return 0;
    reference = reference.toLowerCase().replaceAll(RegExp(r'[^\w\s]'), '').trim();
    spoken = spoken.toLowerCase().replaceAll(RegExp(r'[^\w\s]'), '').trim();
    if (reference == spoken) return 100;
    
    int levenshtein(String a, String b) {
      List<int> v0 = List.generate(b.length + 1, (i) => i);
      List<int> v1 = List.filled(b.length + 1, 0);
      for (int i = 0; i < a.length; i++) {
        v1[0] = i + 1;
        for (int j = 0; j < b.length; j++) {
          int cost = (a[i] == b[j]) ? 0 : 1;
          v1[j + 1] = [v1[j] + 1, v0[j + 1] + 1, v0[j] + cost].reduce((m, v) => v < m ? v : m);
        }
        for (int j = 0; j < v0.length; j++) v0[j] = v1[j];
      }
      return v1[b.length];
    }
    
    int dist = levenshtein(reference, spoken);
    int maxLen = reference.length > spoken.length ? reference.length : spoken.length;
    double accuracy = (1 - (dist / maxLen)) * 100;
    int score = accuracy.round();
    if (score >= 70 && score < 100) score += 10;
    return score.clamp(0, 100);
  }

  Future<void> showTryAgainDialogue(int score) async {
    playAudio(AssetSource(score >= 60 ? 'audios/retry-1.wav' : 'audios/retry-2.wav'));
    return showDialog(
      context: context,
      barrierDismissible: false,
      builder: (_) => Dialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Lottie.asset('assets/animations/sad.json', width: 90),
              Text('Try Again!', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
              Text('Accuracy: $score%'),
              TextButton(
                onPressed: () => Navigator.pop(context),
                child: Text('Retry', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Future<void> playAudio(Source source) async { await audioPlayer.play(source); }

  void repeatAudio() async {
    String label = level.type == myEnum.ContentType.phonics ? "Letter" : level.type == myEnum.ContentType.words ? "Word" : "Sentence";
    final text = "The $label is: '${level.content[currentIndex]}'";
    
    // Using local TTS now to avoid backend 400 error and work offline
    await flutterTts.speak(text);
  }

  void moveToNext() {
    if (currentIndex < level.content.length - 1) {
      setState(() => currentIndex += 1);
      repeatAudio();
    } else {
      endLevel();
    }
  }

  void endLevel() async {
    audioPlayer.stop();
    double avgScore = _scoreCount > 0 ? _scoreSum / _scoreCount : 0;
    final userProvider = Provider.of<UserProvider>(context, listen: false);
    final levelProvider = Provider.of<LevelProvider>(context, listen: false);
    final progressId = levelProvider.levelsWithProgress.firstWhere((l) => l.level.id == level.id).progress.id;
    int totalMistakes = _mistakesCount.values.fold(0, (sum, count) => sum + count);
    int stars = (avgScore >= level.idealScore && totalMistakes == 0) ? 3 : (avgScore >= level.idealScore && totalMistakes <= 1) ? 2 : 1;

    try {
      showLoadingDialog(context, text: 'Saving attempt...', widget: Lottie.asset('assets/animations/fruits.json', width: 90));
      final savedAttempt = await AttemptService.createAttempt(
        token: userProvider.token!, progressId: progressId, score: avgScore.toInt(), mistakesCounts: _mistakesCount, stars: stars,
      );
      Navigator.pop(context);
      levelProvider.addAttemptToLevel(progressId, savedAttempt);
      _showCompletionDialog(avgScore.toInt(), stars);
    } catch (e) {
      if (mounted) Navigator.pop(context);
    }
  }

  void _showCompletionDialog(int score, int stars) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (_) => Dialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text('Level Complete!', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
              Text('Score: $score% | Stars: $stars/3'),
              Row(
                mainAxisSize: MainAxisSize.min,
                children: List.generate(stars, (i) => Lottie.asset('assets/animations/star.json', width: 70)),
              ),
              TextButton(
                onPressed: () { Navigator.pop(context); Navigator.pop(context); },
                child: Text('Continue', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Future<void> onBackPressed() async {
    final shouldExit = await showConfirmationDialog(
      context: context,
      title: 'Exit Level',
      message: 'Your attempt will not be saved!',
      cancelText: 'No',
      confirmText: 'Exit',
    );
    if (shouldExit == true) {
      audioPlayer.stop();
      Navigator.pop(context);
    }
  }

  @override
  Widget build(BuildContext context) {
    final isLightTheme = Theme.of(context).brightness == Brightness.light;
    return PopScope<Object?>(
      canPop: false,
      onPopInvokedWithResult: (didPop, result) async { if (!didPop) await onBackPressed(); },
      child: MyScaffoldLayout(
        appBar: MyAppBar(title: level.name, onBack: onBackPressed),
        topPadding: isLoading ? 150 : 10,
        children: isLoading ? [buildLoadingIndicator(widget: Lottie.asset('assets/animations/shapes_loading.json', width: 200), text: "Getting ready...")] : [
          Text(level.description, style: TextStyle(fontSize: 18.0, fontWeight: FontWeight.w500)),
          SizedBox(height: 10.0),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(_isRecording ? 'LISTENING...' : 'Ready to speak?', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: _isRecording ? Colors.red : null)),
                  Text(_isRecording ? 'Go ahead, say it!' : 'Tap Speak below.', style: TextStyle(fontSize: 16)),
                ],
              ),
              Lottie.asset('assets/animations/robot.json', width: 75),
            ],
          ),
          SizedBox(height: 20.0),
          _buildContentBox(),
          SizedBox(height: 5),
          Center(child: Text('${currentIndex + 1} / ${level.content.length}')),
          if (_recognizedText.isNotEmpty) Padding(
            padding: const EdgeInsets.all(8.0),
            child: Text("I heard: \"$_recognizedText\"", style: TextStyle(fontStyle: FontStyle.italic, color: Colors.blue)),
          ),
          SizedBox(height: 15),
          MyElevatedButton(
            text: 'Repeat',
            prefix: SvgPicture.asset('assets/icons/repeat.svg', width: 22, colorFilter: ColorFilter.mode(isLightTheme ? Colors.white : Colors.grey, BlendMode.srcIn)),
            onPressed: repeatAudio,
          ),
          SizedBox(height: 10),
          MyElevatedButton(
            text: !_isRecording ? 'Speak' : 'Stop',
            prefix: SvgPicture.asset('assets/icons/${_isRecording ? 'mic_off' : 'mic'}.svg', width: 22, colorFilter: ColorFilter.mode(isLightTheme ? Colors.white : Colors.grey, BlendMode.srcIn)),
            onPressed: _handleSpeakButton,
          ),
        ],
      ),
    );
  }

  Widget _buildContentBox() {
    return AspectRatio(
      aspectRatio: 1.1,
      child: Container(
        decoration: BoxDecoration(borderRadius: BorderRadius.circular(12), border: Border.all(width: 1)),
        child: Center(
          child: Text(level.content[currentIndex], style: TextStyle(fontSize: getFontSize(level.type), fontWeight: FontWeight.w900), textAlign: TextAlign.center),
        ),
      ),
    );
  }
}

class PlaygroundScreenArguments {
  Level level;
  PlaygroundScreenArguments({required this.level});
}
