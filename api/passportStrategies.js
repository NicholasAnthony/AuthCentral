require('dotenv').config()
import passport from 'passport';
import FacebookStrategy from 'passport-facebook';
import InstagramStrategy from 'passport-instagram';
import User from './User';

const {
  REACT_APP_FACBOOK_APP_ID: fbAppId,
  REACT_APP_FACBOOK_APP_SECRET: fbAppSecret,
  REACT_APP_FACBOOK_APP_REDIRECT_URL: fbAppRedirect,
  REACT_APP_FACBOOK_APP_SCOPES: fbAppScopes,
  REACT_APP_INSTA_APP_REDIRECT: instaAppRedirect,
  REACT_APP_INSTA_APP_SCOPES: instaAppScopes

} = process.env;

const facebookOptions = {
  clientID: fbAppId,
  clientSecret: fbAppSecret,
  callbackURL: fbAppRedirect,
  profileFields: fbAppScopes.split(" "),
};

const facebookCallback = (accessToken, refreshToken, profile, done) => {
  const users = User.getUsers();
  const matchingUser = users.find(user => user.facebookId === profile.id);

  if (matchingUser) {
    done(null, matchingUser);
    return;
  }

  const newUser = {
    id: uuid(),
    facebookId: profile.id,
    firstName: profile.name.givenName,
    lastName: profile.name.familyName,
    email: profile.emails && profile.emails[0] && profile.emails[0].value,
  };
  users.push(newUser);
  done(null, newUser);
};


passport.use(new FacebookStrategy(
  facebookOptions,
  facebookCallback
));

const instaOptions = {
  clientID: fbAppScopes,
  clientSecret: fbAppSecret,
  callbackURL: instaAppRedirect
}

const instaCallback = (accessToken, refreshToken, profile, done) => {
  console.log('profile, accessToken', profile, accessToken);
  const instaData = { accessToken, refreshToken, profile };
  //
  // Find or create
  // User.findOrCreate({ instagramId: profile.id }, function (err, user) {
  //   return done(err, user);
  // });
  // 
  // 
  // OR
  // 
  // 
  // const users = User.getUsers();
  // const matchingUser = users.find(user => user.facebookId === profile.id);
  //
  // if (matchingUser) {
  //   done(null, matchingUser);
  //   return;
  // }
  //
  // const newUser = {
  //   id: uuid(),
  //   facebookId: profile.id,
  //   firstName: profile.name.givenName,
  //   lastName: profile.name.familyName,
  //   email: profile.emails && profile.emails[0] && profile.emails[0].value,
  // };
  // users.push(newUser);
  //
  // Wrap done with follwing line for asynchronous verification, for effect. 
  // see: https://github.com/jaredhanson/passport-instagram/blob/master/examples/login/app.js
  // process.nextTick(function () {}
  done(null, instaData);

};


passport.use(new InstagramStrategy(
  instaOptions,
  instaCallback
));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  const users = User.getUsers();
  const matchingUser = users.find(user => user.id === id);
  done(null, matchingUser);
});



export default passport;