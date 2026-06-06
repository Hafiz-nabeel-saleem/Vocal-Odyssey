const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const https = require('https');

const createSpeech = async (req, res) => {
  try {
    const { text, voiceId } = req.body;

    if (!text || !voiceId) {
      return res.status(400).json({ error: 'Missing required parameters: text or voiceId' });
    }

    const murfResponse = await axios.post(
      'https://api.murf.ai/v1/speech/generate',
      { text, voiceId },
      {
        headers: {
          'Content-Type': 'application/json',
          'api-key': process.env.MURF_KEY
        }
      }
    );

    const audioUrl = murfResponse.data.audioFile;
    
    const file = await new Promise((resolve, reject) => {
      https.get(audioUrl, (response) => {
        const chunks = [];
        response.on('data', (chunk) => chunks.push(chunk));
        response.on('end', () => resolve(Buffer.concat(chunks)));
      }).on('error', reject);
    });

    res.set({
      'Content-Type': 'audio/wav',
      'Content-Disposition': 'attachment; filename="speech.wav"',
      'Content-Length': file.length
    });
    res.send(file);

  } catch (error) {
    console.error('Error creating speech:', error.message);
    res.status(500).json({ 
      error: 'Failed to create speech', 
      details: error.message,
      ...(error.response?.data && { apiError: error.response.data })
    });
  }
};

const evaluateSpeech = async (req, res) => {
  try {
    const { text, question_info, no_mc } = req.body;
    const audioFile = req.file;

    if (!text || !audioFile) {
      return res.status(400).json({ error: 'Missing required parameters: text, or audio file' });
    }

    const form = new FormData();
    form.append('text', text);
    form.append('user_audio_file', fs.createReadStream(audioFile.path));

    if (question_info) form.append('question_info', question_info);
    if (no_mc) form.append('no_mc', no_mc);

    const speechaceUrl = `https://api5.speechace.com/api/scoring/text/v9/json?key=${process.env.SPEECHACE_KEY}&dialect=en-us&user_id=XYZ-ABC-99001`;

    const response = await axios.post(speechaceUrl, form, {
      headers: {
        ...form.getHeaders(),
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });

    fs.unlinkSync(audioFile.path);

    res.json(response.data);

  } catch (error) {
    console.error('Error evaluating speech:', error.message);
    res.status(500).json({ error: 'Failed to evaluate speech', details: error.message });
  }
};

module.exports = {
  createSpeech,
  evaluateSpeech
};
