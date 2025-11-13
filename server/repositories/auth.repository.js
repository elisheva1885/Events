// auth.repository.js
import User from '../models/user.model.js';
// 🔹 יצירת משתמש חדש
export async function createUser(userData) {
     const user = new User(userData);
  return await user.save();
    // TODO: לממש יצירת משתמש במסד הנתונים
}

// 🔹 התחברות – אימות סיסמה
export async function findUserByEmail(email) {
    // TODO: לממש התחברות ובדיקת סיסמה
  return await User.findOne({ email });
}

// 🔹 מציאת משתמש לפי Google ID
export async function findUserByGoogleId(googleId) {
    return await User.findOne({ 'social.googleId': googleId });
}

// 🔹 עדכון Google ID למשתמש קיים
export async function updateUserGoogleId(userId, googleId) {
    return await User.findByIdAndUpdate(
        userId,
        { 'social.googleId': googleId },
        { new: true }
    );
}

// 🔹 כניסה עם ספק חיצוני (Google)
export async function loginOrCreateGoogleUser({ email, name }) {
    // TODO: לממש כניסה או יצירת משתמש דרך Google
}

// 🔹 יצירת JWT
