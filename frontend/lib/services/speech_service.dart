import 'dart:convert';
import 'package:http/http.dart' as http;
import 'api_config.dart';

class SpeechService {
  static Future<http.Response> createSpeech({
    required String token,
    required String text,
    String voiceId = 'en-US-marcus',
  }) async {
    final url = Uri.parse('${ApiConfig.baseUrl}/speech/create');
    final response = await http.post(
      url,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
      body: jsonEncode({'text': text, 'voiceId': voiceId}),
    );
    return response;
  }
}
