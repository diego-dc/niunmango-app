import passport from "passport";
import { Strategy as GoogleStrategy, Profile } from "passport-google-oauth20";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env["GOOGLE_CLIENT_ID"]!,
      clientSecret: process.env["GOOGLE_CLIENT_SECRET"]!,
      callbackURL: process.env["GOOGLE_REDIRECT_URI"]!,
    },
    async (
      _accessToken: string,
      _refreshToken: string,
      profile: Profile,
      done
    ) => {
      try {
        // Check if user already exists
        let user = await prisma.user.findUnique({
          where: { googleId: profile.id },
        });

        if (user) {
          // User exists, update last login info if needed
          user = await prisma.user.update({
            where: { id: user.id },
            data: {
              name: profile.displayName,
              // You could add lastLogin timestamp here
            },
          });
          return done(null, user);
        }

        // Check if user exists by email
        const existingUserByEmail = await prisma.user.findUnique({
          where: { email: profile.emails?.[0]?.value || "" },
        });

        if (existingUserByEmail) {
          // Link Google account to existing user
          user = await prisma.user.update({
            where: { id: existingUserByEmail.id },
            data: {
              googleId: profile.id,
              name: profile.displayName,
            },
          });
          return done(null, user);
        }

        // Create new user
        user = await prisma.user.create({
          data: {
            googleId: profile.id,
            email: profile.emails?.[0]?.value || "",
            name: profile.displayName,
          },
        });

        return done(null, user);
      } catch (error) {
        console.error("Error in Google OAuth strategy:", error);
        return done(error, false);
      }
    }
  )
);

// Serialize user for session
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
    });
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;
