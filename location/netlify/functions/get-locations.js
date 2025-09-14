import { MongoClient } from 'mongodb';

// MongoDB connection
let cachedClient = null;
let cachedDb = null;

async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  try {
    const uri = process.env.MONGODB_URI;
    
    if (!uri) {
      throw new Error('MONGODB_URI environment variable is not set');
    }

    const client = new MongoClient(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    await client.connect();
    
    // Extract database name from URI or use default
    const dbName = uri.split('/').pop().split('?')[0] || 'test';
    const db = client.db(dbName);

    cachedClient = client;
    cachedDb = db;

    return { client, db };
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    throw error;
  }
}

export async function handler(event, context) {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Content-Type': 'application/json',
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  try {
    // Connect to MongoDB
    const { db } = await connectToDatabase();
    
    // Get the collection (you can change this to your actual collection name)
    const collection = db.collection('locations');
    
    // Fetch sample data
    const locations = await collection.find({}).limit(10).toArray();
    
    // If no data exists, insert some sample data
    if (locations.length === 0) {
      const sampleData = [
        {
          name: 'Central Park',
          latitude: 40.7829,
          longitude: -73.9654,
          description: 'A large public park in Manhattan',
          createdAt: new Date(),
        },
        {
          name: 'Times Square',
          latitude: 40.7580,
          longitude: -73.9855,
          description: 'A major commercial intersection in Manhattan',
          createdAt: new Date(),
        },
        {
          name: 'Brooklyn Bridge',
          latitude: 40.7061,
          longitude: -73.9969,
          description: 'A hybrid cable-stayed/suspension bridge in New York City',
          createdAt: new Date(),
        },
      ];
      
      await collection.insertMany(sampleData);
      const newLocations = await collection.find({}).limit(10).toArray();
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          data: newLocations,
          message: 'Sample data inserted and retrieved',
        }),
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        data: locations,
        message: 'Locations retrieved successfully',
      }),
    };

  } catch (error) {
    console.error('Error:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: error.message,
        message: 'Failed to fetch locations',
      }),
    };
  }
}
