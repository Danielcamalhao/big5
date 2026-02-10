import mongodb, { MongoClient } from 'mongodb';

let cachedDb: mongodb.Db | null = null;
let mongoClient: MongoClient | null = null;

export async function connectToDatabase() {
  if (cachedDb) return cachedDb;

  const url = process.env.DB_URL;
  if (!url) {
    throw new Error(
      'Please define the DB_URL environment variable inside .env.local'
    );
  }

  const dbName = process.env.DB_NAME || 'results';

  if (!mongoClient) {
    mongoClient = new MongoClient(url);
  }

  const client = await mongoClient.connect();
  const db = client.db(dbName);
  cachedDb = db;
  return db;
}
