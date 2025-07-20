# NutriTrack - Smart Nutrition Tracking App

A comprehensive Next.js application for tracking nutrition with AI-powered meal scanning, advanced barcode scanning, goal setting, and trend visualization.

## 🚀 Features

- **🧑‍💻 User Authentication**: Google Sign-In with OAuth
- **🍱 AI Meal Scanning**: Scan meals via image or text using Gemini AI
- **📱 Advanced Barcode Scanner**: Professional barcode scanning with camera and manual entry
- **🔍 Smart Product Recognition**: Instant nutrition data from Open Food Facts database
- **📊 Intelligent Serving Size Calculation**: Automatic nutrition scaling based on actual product sizes
- **💾 Offline Support**: Local caching with IndexedDB for offline barcode scanning
- **✍️ Manual Meal Entry**: Add and edit meals with detailed nutrition info
- **🎯 Nutrition Goals**: Set and track daily nutrition targets
- **📅 Daily Dashboard**: View daily nutrition summary with progress indicators
- **📊 Weekly Trends**: Interactive charts showing nutrition trends over time
- **🌙 Dark Mode Support**: Beautiful dark/light theme with system preference detection
- **📱 Responsive Design**: Mobile-first design optimized for all devices

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Authentication**: NextAuth.js with Google OAuth
- **Database**: MongoDB with Prisma ORM
- **AI Integration**: Google Gemini API for meal analysis
- **Barcode Scanning**: ZXing library for real-time barcode detection
- **Product Database**: Open Food Facts API integration
- **Offline Storage**: IndexedDB for local caching
- **Charts**: Recharts for data visualization
- **Styling**: Tailwind CSS 3 with custom design system
- **Icons**: Lucide React
- **Theme**: Next-themes for dark mode support

## 📋 Prerequisites

Before running this application, you need to set up:

1. **Google OAuth Credentials**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one
   - Enable Google+ API
   - Create OAuth 2.0 credentials
   - Add `http://localhost:3000/api/auth/callback/google` to authorized redirect URIs

2. **Gemini AI API Key**:
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a new API key for Gemini

## 🚀 Getting Started

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd nutrition-tracker
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   Copy `.env.example` to `.env.local` and fill in your credentials:
   ```bash
   cp .env.example .env.local
   ```
   
   Update `.env.local` with your actual values:
   ```env
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key"
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   GEMINI_API_KEY="your-gemini-api-key"
   ```

4. **Set up the database**:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Run the development server**:
   ```bash
   npm run dev
   ```

6. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📱 Usage

1. **Sign In**: Use Google OAuth to create an account
2. **Set Goals**: Configure your daily nutrition targets in Settings
3. **Log Meals**: 
   - **Barcode Scanning**: Point camera at product barcodes for instant nutrition data
   - **AI Meal Scanning**: Upload photos or describe meals for automatic analysis
   - **Manual Entry**: Add meals with detailed nutrition information
4. **Track Progress**: View daily dashboard with progress indicators
5. **Analyze Trends**: Check weekly nutrition trends with interactive charts

### 📱 Barcode Scanner Usage

1. **Navigate to Scan Page**: Click "Scan Meal" in navigation or go to `/scan`
2. **Select Barcode Tab**: Choose the "Barcode" scanning option
3. **Start Scanning**: 
   - **Camera Scanning**: Click "Start Camera Scanning" and allow camera permissions
   - **Manual Entry**: Click "Enter Barcode Manually" for custom modal input
   - **Test Mode**: Use sample barcode buttons (Nutella, Oreo, Maggi) for testing
4. **Review Product**: Edit serving sizes, nutrition info, and add notes
5. **Save to Log**: Click "Add to Meal Log" to save the meal

### 🔧 Barcode Scanner Troubleshooting

**Camera Permission Issues:**
- Look for camera icon in browser address bar and click "Allow"
- Refresh page after granting permissions
- Ensure no other apps are using the camera
- Try "Manual Entry" as fallback option

**Barcode Detection Issues:**
- Ensure good lighting and steady camera
- Position barcode clearly within the scanning frame
- Try different angles if barcode isn't detected
- Use manual entry for damaged or unclear barcodes

**Product Not Found:**
- Verify barcode number is correct (usually 8-13 digits)
- Try manual entry to double-check barcode
- Some products may not be in Open Food Facts database
- Use manual meal entry as alternative

## 🏗️ Project Structure

```
├── app/
│   ├── api/           # API routes
│   ├── dashboard/     # Main dashboard page
│   ├── meals/         # Meal management pages
│   ├── scan/          # Meal scanning page
│   ├── settings/      # User settings page
│   ├── trends/        # Analytics and trends page
│   └── layout.tsx     # Root layout
├── components/        # Reusable components
├── lib/              # Utility functions and configurations
├── prisma/           # Database schema and migrations
└── public/           # Static assets
```

## 🔧 API Endpoints

- `POST /api/meals` - Create a new meal
- `GET /api/meals` - Get user's meals
- `PUT /api/meals/[id]` - Update a meal
- `DELETE /api/meals/[id]` - Delete a meal
- `POST /api/meals/analyze` - Analyze meal from image/text
- `GET /api/nutrition/daily` - Get daily nutrition summary
- `GET /api/nutrition/weekly` - Get weekly nutrition data
- `GET /api/user/goals` - Get user's nutrition goals
- `PUT /api/user/goals` - Update user's nutrition goals
- `GET /api/barcode/[barcode]` - Get product info by barcode

## 🎨 Features in Detail

### AI Meal Scanning
- Upload photos of meals for automatic nutrition analysis
- Text-based meal description analysis
- Powered by Google Gemini AI for accurate food recognition

### Advanced Barcode Scanner
- **Real-time Camera Scanning**: Professional camera interface with live barcode detection
- **Smart Product Recognition**: Instant lookup from Open Food Facts database (500,000+ products)
- **Intelligent Serving Size Calculation**: Automatically scales nutrition from per-100g to actual product size
- **Beautiful Manual Entry**: Custom modal for manual barcode input (no ugly browser prompts)
- **Offline Support**: Local caching with IndexedDB for previously scanned products
- **Product Review Interface**: Edit nutrition info, adjust serving sizes, and add notes before saving
- **Error Handling**: Graceful fallbacks with helpful troubleshooting tips
- **Test Mode**: Built-in test barcodes for development and demonstration
- **Camera Permissions**: Smart permission handling with clear user guidance
- **Mobile Optimized**: Touch-friendly interface optimized for mobile scanning

### Nutrition Tracking
- Comprehensive macro and micronutrient tracking
- Visual progress indicators for daily goals
- Historical data storage and retrieval

### Data Visualization
- Interactive line and bar charts
- Weekly trend analysis
- Average nutrition calculations

### User Experience
- Dark/light mode toggle
- Responsive mobile-first design
- Intuitive navigation and user interface

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### Other Platforms
The app can be deployed to any platform that supports Next.js applications.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues or have questions:
1. Check the existing issues on GitHub
2. Create a new issue with detailed information
3. Include error messages and steps to reproduce

## 🔮 Future Enhancements

- **Recipe Management**: Create and save custom recipes with nutrition calculations
- **Meal Planning**: Weekly meal planning with shopping lists
- **Social Features**: Share meals and progress with friends
- **Fitness Tracker Integration**: Connect with Apple Health, Google Fit, and Fitbit
- **Nutritionist Recommendations**: AI-powered meal suggestions based on goals
- **Export Functionality**: Export nutrition data to CSV, PDF, or health apps
- **Voice Commands**: Voice-activated meal logging
- **Grocery Integration**: Connect with grocery delivery services
- **Restaurant Menu Integration**: Scan restaurant menus for nutrition info
