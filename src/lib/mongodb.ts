import { MongoClient } from "mongodb";

if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
}

const uri = process.env.MONGODB_URI;
const options = {
  // Connection timeout options
  serverSelectionTimeoutMS: 10000,
  connectTimeoutMS: 10000
};

let client;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === "development") {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    console.log("Creating new MongoDB client connection in development");
    client = new MongoClient(uri, options);
    globalWithMongo._mongoClientPromise = client.connect()
      .then(client => {
        console.log("MongoDB connected successfully in development mode");
        return client;
      })
      .catch(error => {
        console.error("Failed to connect to MongoDB in development:", error);
        throw error;
      });
  } else {
    console.log("Using existing MongoDB client connection in development");
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  console.log("Creating new MongoDB client connection in production");
  client = new MongoClient(uri, options);
  clientPromise = client.connect()
    .then(client => {
      console.log("MongoDB connected successfully in production mode");
      return client;
    })
    .catch(error => {
      console.error("Failed to connect to MongoDB in production:", error);
      throw error;
    });
}

// Export a module-scoped MongoClient promise.
// By doing this in a separate module, the client can be shared across functions.
export default clientPromise; 