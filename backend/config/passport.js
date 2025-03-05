const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/User'); // Ensure this path is correct

module.exports = function (passport) {
    // Define Local Strategy (Skip password check)
    passport.use(
        new LocalStrategy({ usernameField: 'email' }, async (email, _, done) => {
            try {
                console.log(`🔍 Checking user with email: ${email}`);

                const user = await User.findOne({ email });
                if (!user) {
                    console.log("❌ User not found");
                    return done(null, false, { message: 'No user found with that email' });
                }

                console.log("✅ User found, logging in...");
                return done(null, user); // Skip password validation
            } catch (err) {
                console.error("⚠️ Error in passport authentication:", err);
                return done(err);
            }
        })
    );

    // Serialize User
    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    // Deserialize User
    passport.deserializeUser(async (id, done) => {
        try {
            const user = await User.findById(id);
            done(null, user);
        } catch (err) {
            done(err);
        }
    });
};
