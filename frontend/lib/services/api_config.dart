class ApiConfig {
  // 1. FOR PRESENTATION: Use your laptop's local IP address
  // Replace '192.168.1.100' with your IP from 'ipconfig'
  static const String localIp = '192.168.100.159';
  static const String baseUrl = 'http://$localIp:5000/api/v1';

  // 2. FOR EMULATOR: Use this if running on Android Emulator on the same laptop
  // static const String baseUrl = 'http://10.0.2.2:5000/api/v1';

  // 3. CLOUD: Your Render deployment
  // static const String baseUrl = 'https://vocal-odyssey-backend-t8e3.onrender.com/api/v1';
}
