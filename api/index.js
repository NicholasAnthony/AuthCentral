require('dotenv').config()
import express from 'express';
import session from 'express-session';
import uuid from 'uuid/v4';
import { ApolloServer } from 'apollo-server-express';
import User from './User';
import typeDefs from './typeDefs';
import resolvers from './resolvers';
import passport from './passportStrategies';

const PORT = 4000;
const SESSION_SECRECT = 'bad secret';

const app = express();

app.use(session({
  genid: (req) => uuid(),
  secret: SESSION_SECRECT,
  resave: false,
  saveUninitialized: false,
}));

app.use(passport.initialize());
app.use(passport.session());

const {
  REACT_APP_FACBOOK_APP_SCOPES,
  REACT_APP_INSTA_APP_SCOPES,
  REACT_APP_API_URL
} = process.env;


const authRedirects = {
  successRedirect: `${REACT_APP_API_URL}/graphql`,
  failureRedirect: `${REACT_APP_API_URL}/graphql`,
}

app.get('/auth/facebook', passport.authenticate('facebook', { scope: REACT_APP_FACBOOK_APP_SCOPES.split(" ") }));
app.get('/auth/facebook/callback', passport.authenticate('facebook', authRedirects));

app.get('/auth/instagram', passport.authenticate('instagram', { scope: REACT_APP_INSTA_APP_SCOPES.split(" ") }));
app.get('/auth/instagram/callback', passport.authenticate('instagram', authRedirects));

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => ({
    getUser: () => req.user,
    logout: () => req.logout(),
  }),
  playground: {
    settings: {
      'request.credentials': 'same-origin',
    },
  },
});

server.applyMiddleware({ app });

app.listen({ port: PORT }, () => {
  console.log(`🚀 Server ready at http://localhost:${PORT}`);
});