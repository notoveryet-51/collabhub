import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    firebaseUid: {
      type: String,
      required: true,
      unique: true,
      index: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      index: true
    },

    name: {
      type: String,
      default: "User"
    },

    username: {
      type: String,
      unique: true,
      sparse: true,
      index: true
    },

    photo: {
      type: String,
      default: null
    },

    location: {
      city: String,
      college: String
    },

    interests: {
      type: [String],
      default: []
    },

    badges: {
      type: [String],
      default: []
    },

    streak: {
      type: Number,
      default: 0
    },

    visibility: {
      type: String,
      enum: ["public", "private"],
      default: "public"
    },

    lastLogin: Date
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
