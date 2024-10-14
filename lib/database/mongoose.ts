/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose, { Mongoose } from 'mongoose';

const MongoDB_URL = process.env.MONGODB_URL;

interface MongooseConnection {
    conn: Mongoose | null;
    promise: Promise<Mongoose> | null;

}

let cached: MongooseConnection = (global as any).mongoose

if (!cached) {
    cached = (global as any).mongoose = { conn: null, promise: null }
}

export const ConnectToDatabase = async () => {
    if (cached.conn) return cached.conn;
    if (!MongoDB_URL) throw new Error('MongoDB URL error , not defined');
    cached.promise = cached.promise || mongoose.connect(MongoDB_URL, { dbName: 'GenCable', bufferCommands: false });

    cached.conn = await cached.promise;

    return cached.conn;
}
