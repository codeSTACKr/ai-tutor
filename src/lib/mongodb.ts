import { MongoClient, ObjectId } from "mongodb";
import type { Todo } from "./types";

if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
}

const uri = process.env.MONGODB_URI;
const options = {
  appName: "devrel.better-auth.demo",
};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === "development") {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  const globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options);
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default clientPromise;

// Export the database for Better Auth adapter
export const getDatabase = async (dbName?: string) => {
  const client = await clientPromise;
  return client.db(dbName);
};

// Get the main auth database
export const getAuthDatabase = async () => {
  const client = await clientPromise;
  return client.db(process.env.MONGODB_DB || "better-auth");
};

// Get the todos collection with proper typing
export const getTodosCollection = async () => {
  const database = await getAuthDatabase();
  return database.collection<Omit<Todo, "_id"> & { _id?: ObjectId }>("todos");
};

// Get synchronous database instance for better-auth adapter
// This uses the same singleton client but provides sync access
export const getAuthDatabaseSync = () => {
  // Use the same client instance but access it synchronously
  // This works because better-auth will handle the connection internally
  if (process.env.NODE_ENV === "development") {
    const globalWithMongo = global as typeof globalThis & {
      _mongoClient?: MongoClient;
    };
    
    if (!globalWithMongo._mongoClient) {
      globalWithMongo._mongoClient = new MongoClient(uri, options);
    }
    return globalWithMongo._mongoClient.db(process.env.MONGODB_DB || "better-auth");
  } else {
    // In production, create client if not exists (singleton pattern)
    if (!client) {
      client = new MongoClient(uri, options);
    }
    return client.db(process.env.MONGODB_DB || "better-auth");
  }
};