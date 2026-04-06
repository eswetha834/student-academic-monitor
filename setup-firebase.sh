#!/bin/bash

echo "🔥 Firebase Setup for Academic Monitor"
echo "======================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js and npm are installed"

# Navigate to client directory
cd client || {
    echo "❌ Client directory not found. Please run this script from the project root."
    exit 1
}

echo "📦 Installing Firebase dependencies..."

# Install Firebase
npm install firebase@10.7.1

if [ $? -eq 0 ]; then
    echo "✅ Firebase installed successfully"
else
    echo "❌ Failed to install Firebase"
    exit 1
fi

echo "📁 Firebase files created:"
echo "   - client/src/firebase.js"
echo "   - client/src/contexts/FirebaseContext.js"
echo "   - client/src/services/firebaseService.js"
echo "   - client/src/components/FirebaseAuth.js"
echo "   - client/src/test/FirebaseTest.js"

echo ""
echo "🚀 Next Steps:"
echo "1. Create a Firebase project at https://console.firebase.google.com"
echo "2. Enable Authentication (Email/Password)"
echo "3. Enable Firestore Database"
echo "4. Update firebaseConfig in client/src/firebase.js"
echo "5. Update App.js to wrap with FirebaseProvider"
echo "6. Test the integration using FirebaseTest component"

echo ""
echo "📖 For detailed setup instructions, see: FIREBASE_SETUP.md"

echo ""
echo "🎯 Quick Test Command:"
echo "   cd client && npm start"
echo "   Navigate to /firebase-test route to test all Firebase services"

echo ""
echo "✨ Firebase setup complete!"
