# Med Genie - AI-Powered Health Assistant

Med Genie is a comprehensive AI-powered health assistant that provides personalized medical guidance, vital signs tracking, prescription analysis, and emergency support. Built with Next.js, TypeScript, and advanced AI capabilities.

## 🚀 Features

### 🤖 Enhanced AI Chatbot
- **Personalized Health Guidance**: AI analyzes your complete health profile for accurate responses
- **Context-Aware Responses**: Considers your age, weight, height, medical history, current medications, and vital signs
- **Health Insights**: Provides personalized health insights and recommendations
- **Follow-up Questions**: Intelligently asks for missing information to improve accuracy

### 📊 Vital Signs Tracking
- **Real-time Monitoring**: Track heart rate, blood pressure, temperature, oxygen saturation, blood glucose, steps, and sleep
- **Google Fit Integration**: Connect with Google Fit for automatic data sync from wearable devices
- **Manual Entry**: Add vital signs manually when needed
- **Trend Analysis**: Visualize health trends with interactive charts
- **Normal Range Alerts**: Get notified when vital signs are outside normal ranges

### 💊 Prescription Analysis
- **AI-Powered Image Analysis**: Upload prescription images for automatic medication extraction
- **Medication Management**: Track current medications, dosages, and schedules
- **Interaction Checking**: AI analyzes potential medication interactions
- **Prescription History**: Maintain a complete history of your prescriptions

### 🚨 Emergency SOS System
- **One-Click Emergency Alert**: Quick access to emergency support
- **Location Tracking**: Automatic GPS location sharing during emergencies
- **Emergency Contact Notification**: Automatically notify your emergency contacts
- **Severity Assessment**: Classify emergency severity levels
- **Emergency Services Integration**: Direct escalation to emergency services when needed

### 👤 Comprehensive Health Profile
- **Basic Requirements**: Age, weight, height, gender for personalized analysis
- **Medical History**: Complete medical background tracking
- **Current Medications**: Active medication list with dosages
- **Allergies**: Allergy tracking and alerts
- **Lifestyle Information**: Diet, exercise, and lifestyle factors
- **Emergency Contacts**: Quick access to emergency contact information

### 🎨 Modern UI/UX
- **Tabbed Interface**: Organized sections for Chat, Vitals, Medications, and Profile
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Dark/Light Mode**: Toggle between themes
- **Real-time Updates**: Live data updates and notifications
- **Accessibility**: WCAG compliant design

## 🛠️ Technology Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **UI Components**: Radix UI, Tailwind CSS, shadcn/ui
- **AI/ML**: Google Gemini AI, Genkit framework
- **Charts**: Recharts for data visualization
- **Health Integration**: Google Fit API (planned)
- **Image Analysis**: AI-powered prescription analysis
- **Emergency Services**: SMS/Phone integration (planned)

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/med-genie.git
   cd med-genie
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   ```
   
   Update `.env.local` with your API keys:
   ```env
   GOOGLE_AI_API_KEY=your_google_ai_api_key_here
   GOOGLE_FIT_CLIENT_ID=your_google_fit_client_id_here
   GOOGLE_FIT_CLIENT_SECRET=your_google_fit_client_secret_here
   PRESCRIPTION_ANALYSIS_API_KEY=your_prescription_analysis_api_key_here
   EMERGENCY_SMS_API_KEY=your_emergency_sms_api_key_here
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:9002](http://localhost:9002)

## 🔧 Configuration

### Google AI API Setup
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add the key to your `.env.local` file

### Google Fit Integration (Optional)
1. Go to [Google Cloud Console](https://console.developers.google.com/)
2. Create a new project or select existing one
3. Enable Google Fit API
4. Create OAuth 2.0 credentials
5. Add credentials to your `.env.local` file

### Emergency Services (Optional)
For SMS notifications, you can use services like:
- Twilio
- AWS SNS
- MessageBird
- Or any other SMS service provider

## 🚀 Usage

### Getting Started
1. **Create Your Profile**: Click "Update Health Info" to add your basic information
2. **Set Emergency Contacts**: Add emergency contact information in the Profile tab
3. **Connect Devices**: Link your Google Fit account for automatic vital signs tracking
4. **Start Chatting**: Ask health questions and get personalized responses

### Using the SOS Feature
1. **Emergency Button**: Click the red SOS button in the bottom-right corner
2. **Describe Symptoms**: Enter your symptoms and select severity level
3. **Location Sharing**: Allow location access for emergency services
4. **Contact Notification**: Emergency contacts will be automatically notified

### Tracking Vital Signs
1. **Manual Entry**: Add vital signs manually in the Vitals tab
2. **Google Fit Sync**: Connect your Google Fit account for automatic sync
3. **View Trends**: See your health trends over time with interactive charts
4. **Get Alerts**: Receive notifications for abnormal readings

### Managing Medications
1. **Upload Prescriptions**: Take photos of your prescriptions
2. **AI Analysis**: Let AI extract medication information automatically
3. **Manual Review**: Review and edit extracted information
4. **Track Interactions**: AI analyzes potential medication interactions

## 🔒 Privacy & Security

- **Local Storage**: All health data is stored locally in your browser session
- **No Data Sharing**: Your health information is never shared with third parties
- **Encrypted Communication**: All API communications are encrypted
- **HIPAA Compliance**: Designed with healthcare privacy standards in mind

## ⚠️ Medical Disclaimer

**Important**: Med Genie is an AI health assistant designed to provide general health information and guidance. It is NOT a substitute for professional medical advice, diagnosis, or treatment.

- Always consult with qualified healthcare professionals for medical decisions
- Never rely solely on AI for emergency medical situations
- Use the SOS feature for immediate emergency assistance
- Follow your doctor's recommendations for medications and treatments

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](Contributing.md) for details.

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [License](License.md) file for details.

## 🆘 Support

- **Documentation**: Check our [Wiki](https://github.com/yourusername/med-genie/wiki)
- **Issues**: Report bugs and request features on [GitHub Issues](https://github.com/yourusername/med-genie/issues)
- **Discussions**: Join our [GitHub Discussions](https://github.com/yourusername/med-genie/discussions)

## 🔮 Roadmap

- [ ] **Advanced AI Models**: Integration with specialized medical AI models
- [ ] **Wearable Device Support**: Apple Health, Fitbit, and other device integrations
- [ ] **Telemedicine Integration**: Direct connection to healthcare providers
- [ ] **Medication Reminders**: Smart medication scheduling and reminders
- [ ] **Health Goals**: Personalized health goal setting and tracking
- [ ] **Family Health**: Multi-user support for family health management
- [ ] **Offline Mode**: Basic functionality without internet connection
- [ ] **Voice Interface**: Voice commands and responses
- [ ] **Multi-language Support**: Internationalization and localization

## 🙏 Acknowledgments

- Google AI for providing the Gemini AI platform
- The open-source community for amazing tools and libraries
- Healthcare professionals for guidance on medical accuracy
- Beta testers for valuable feedback and suggestions

---

**Made with ❤️ for better health outcomes**
