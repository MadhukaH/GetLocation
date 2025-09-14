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

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({
        success: false,
        message: 'Method not allowed',
      }),
    };
  }

  try {
    // Parse the request body
    const body = JSON.parse(event.body || '{}');
    
    // Validate required fields
    const { name, latitude, longitude, description } = body;
    
    if (!name || latitude === undefined || longitude === undefined) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          message: 'Missing required fields: name, latitude, longitude',
        }),
      };
    }

    // Connect to MongoDB
    const { db } = await connectToDatabase();
    
    // Get the collection
    const collection = db.collection('locations');
    
    // Create new location document
    const newLocation = {
      name,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      description: description || '',
      createdAt: new Date(),
    };
    
    // Insert the new location
    const result = await collection.insertOne(newLocation);
    
    // Return the inserted location with its ID
    const insertedLocation = {
      _id: result.insertedId,
      ...newLocation,
    };

    return {
      statusCode: 201,
      headers,
      body: JSON.stringify({
        success: true,
        data: insertedLocation,
        message: 'Location added successfully',
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
        message: 'Failed to add location',
      }),
    };
  }
}
