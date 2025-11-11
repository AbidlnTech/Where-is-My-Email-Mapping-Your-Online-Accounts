const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      trim: true,
      minlength: 2,
      maxlength: 50,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"], // ✅ regex validation
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
      select: true, // keep selectable for login, but hide in APIs
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationCode: {
      type: String,
      default: null,
      select: false, // ✅ don’t expose in queries by default
    },
    codeExpiry: {
      type: Date,
      default: null,
      select: false, // ✅ hide from queries unless explicitly requested
    },
  },
  { timestamps: true } // ✅ adds createdAt & updatedAt
);

// ✅ Always remove sensitive fields when converting to JSON
UserSchema.set("toJSON", {
  transform: function (doc, ret) {
    delete ret.password;
    delete ret.verificationCode;
    delete ret.codeExpiry;
    return ret;
  },
});

module.exports = mongoose.model("User", UserSchema);
