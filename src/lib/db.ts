import { MongoClient, Db } from "mongodb";

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  if (!process.env.MONGODB_URI) {
    throw new Error("Please define the MONGODB_URI environment variable");
  }

  // Simplified MongoDB connection options
  const options = {
    serverSelectionTimeoutMS: 10000,
    connectTimeoutMS: 10000
  };

  try {
    const client = new MongoClient(process.env.MONGODB_URI, options);
    await client.connect();
    
    const dbName = process.env.MONGODB_DB || "fitvision-pro";
    const db = client.db(dbName);
    
    cachedClient = client;
    cachedDb = db;
    
    console.log("Successfully connected to MongoDB");
    return { client, db };
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    throw new Error("Could not connect to database");
  }
} 