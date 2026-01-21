import mongoose from "mongoose";
import User from "./models/User.js"; 

// 1. Connection String (Lowercase 'collabhub')
const dbURI = "mongodb://127.0.0.1:27017/collabhub";

const seedDatabase = async () => {
  try {
    await mongoose.connect(dbURI);
    console.log("🔌 Connected to MongoDB for Seeding...");

    // 2. Define the Fake User Data
    const testUser = {
      uid: "MANUAL_TEST_999",
      email: "manual_test@example.com",
      displayName: "Code Injected User",
      photoURL: "https://via.placeholder.com/150",
      location: {
        country: "India",
        city: "Prayagraj",
        college: "MNNIT"
      },
      interests: ["Testing", "MongoDB", "Scripts"],
      stats: { loginStreak: 5 }
    };

    // 3. Save to Database
    const savedUser = await User.findOneAndUpdate(
      { uid: testUser.uid }, 
      { $set: testUser },   
      { upsert: true, new: true } 
    );

    console.log("✅ SUCCESS! User has been saved to Compass.");

  } catch (error) {
    console.error("❌ Error Seeding Database:", error);
  } finally {
    await mongoose.connection.close();
    console.log("🔌 Disconnected.");
    process.exit();
  }
};

seedDatabase();