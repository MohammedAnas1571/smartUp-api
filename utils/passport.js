import {Strategy as GoogleStrategy} from 'passport-google-oauth20'
      
import passport from 'passport';
import {googleAuth} from "../controller/userAuthController.js"

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENTSECRET,
    callbackURL: "/google/callback",
    scope:["profile","email"]
  },
  googleAuth
));


export const passportController = passport