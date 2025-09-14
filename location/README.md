# GetLocation - Free GB Claim App

A professional React application that allows users to claim free data by providing their phone number and current location.

## Features

- 📱 Phone number input with automatic formatting
- 📍 Real-time location tracking using browser geolocation API
- 🎯 GB selection with "Most Popular" highlighting
- 💾 MongoDB integration for data storage
- 🎨 Modern, responsive UI with animations
- ♿ Full accessibility support
- 🔒 Secure data handling

## Tech Stack

### Frontend
- React 19.1.1
- Vite (build tool)
- Axios (HTTP client)
- CSS3 with custom properties

### Backend
- Node.js
- Express.js
- MongoDB
- CORS enabled

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
Create a `.env` file in the root directory:
```env
MONGODB_URI=mongodb+srv://hettiarachchimadhuka:nGHSbN4SO9mjMsME@cluster0.inl3fwt.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
PORT=3001
```

### 3. Run the Application

#### Option 1: Run both frontend and backend together
```bash
npm run dev:full
```

#### Option 2: Run separately
```bash
# Terminal 1 - Backend server
npm run server

# Terminal 2 - Frontend development server
npm run dev
```

### 4. Access the Application
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001
- Health Check: http://localhost:3001/api/health

## API Endpoints

### POST /api/claim-data
Submit a data claim with location information.

**Request Body:**
```json
{
  "phoneNumber": "+94 (555) 123-4567",
  "selectedGB": "5 GB",
  "location": {
    "latitude": 6.9271,
    "longitude": 79.8612,
    "accuracy": 20,
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Data claim submitted successfully",
  "claimId": "65a1b2c3d4e5f6789abcdef0",
  "data": {
    "phoneNumber": "+94 (555) 123-4567",
    "selectedGB": "5 GB",
    "location": {
      "latitude": 6.9271,
      "longitude": 79.8612,
      "accuracy": 20
    }
  }
}
```

### GET /api/claims
Retrieve all submitted claims (for admin purposes).

### GET /api/health
Health check endpoint.

## MongoDB Schema

The application stores data in the `data_claims` collection with the following structure:

```javascript
{
  _id: ObjectId,
  phoneNumber: String,
  selectedGB: String,
  location: {
    latitude: Number,
    longitude: Number,
    accuracy: Number,
    timestamp: String
  },
  timestamp: Date,
  ipAddress: String,
  userAgent: String
}
```

## Location Tracking

The app uses the browser's Geolocation API to get the user's current position:

- **High Accuracy**: Enabled for precise location
- **Timeout**: 10 seconds maximum wait time
- **Cache**: 5 minutes maximum age
- **Error Handling**: Comprehensive error messages for different failure scenarios

## Security Features

- Input validation and sanitization
- CORS protection
- Error handling without exposing sensitive information
- Secure MongoDB connection
- Input length limits and format validation

## Browser Compatibility

- Modern browsers with Geolocation API support
- HTTPS required for location access in production
- Responsive design for mobile and desktop

## Development

### Project Structure
```
location/
├── src/
│   ├── InputPage.jsx      # Main component
│   ├── InputPage.css      # Styles
│   ├── App.jsx           # App wrapper
│   └── main.jsx          # Entry point
├── server.js             # Backend server
├── .env                  # Environment variables
└── package.json          # Dependencies
```

### Key Components

- **InputPage**: Main form component with location tracking
- **PhoneInput**: Phone number input with formatting
- **GBSelector**: Data amount selection buttons
- **useGeolocation**: Custom hook for location management
- **useFormValidation**: Form validation logic

## Production Deployment

1. Set up environment variables
2. Ensure MongoDB connection is secure
3. Use HTTPS for location access
4. Configure proper CORS settings
5. Set up error monitoring and logging

## License

This project is for educational and demonstration purposes.