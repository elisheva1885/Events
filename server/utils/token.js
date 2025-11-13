// 🔹 יצירת JWT
function generateToken(payload) {}

<<<<<<< Updated upstream
// 🔹 אימות JWT
function verifyToken(token) {}
=======
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
    return token;
}

// // 🔹 אימות JWT
// function verifyToken(token) { }

// // 🔹 חידוש JWT
// function refreshToken(token) { }
>>>>>>> Stashed changes

// 🔹 חידוש JWT
function refreshToken(token) {}

module.exports = {
    generateToken,
    verifyToken,
    refreshToken
};
