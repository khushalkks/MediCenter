import mongoose from "mongoose";

const connectDB = async () => {
    const primaryURI = process.env.MONGODB_URI;
    const dbName = process.env.DB_NAME || "wellora";
    const localURI = `mongodb://127.0.0.1:27017/${dbName}`;

    try {
        console.log("🔄 Connecting to MongoDB Atlas...");
        await mongoose.connect(primaryURI, {
            dbName: dbName,
            serverSelectionTimeoutMS: 5000 // Fast failover in local development
        });
        console.log("✅ MongoDB Connected Successfully to Atlas!");
    } catch (primaryError) {
        console.warn(`⚠️ Atlas MongoDB connection failed: ${primaryError.message}`);
        console.log(`🔄 Attempting local fallback: ${localURI}...`);
        
        try {
            await mongoose.connect(localURI);
            console.log("✅ MongoDB Connected Successfully to local fallback!");
        } catch (localError) {
            console.error("❌ Both MongoDB Atlas and Local connections failed.");
            console.error(`Local error: ${localError.message}`);
            console.log("\n💡 Tips to resolve this:");
            console.log("1. Make sure your IP address is whitelisted on MongoDB Atlas (if using Atlas).");
            console.log("2. Or start a local MongoDB service: run `docker compose up -d` or start your local MongoDB service.");
            console.log("3. Or set a custom MONGODB_URI in your backend/.env file.\n");
            
            process.exit(1); // Exit process if all DB connections fail
        }
    }
};

export default connectDB;
