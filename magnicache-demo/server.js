const path = require('path');
const express = require('express');
const app = express();
const db = require('./db-model.js');
const MagniCache = require('./magnicache-server.js');

const {
  GraphQLNonNull,
  GraphQLInt,
  GraphQLList,
  GraphQLString,
  GraphQLBoolean,
  GraphQLSchema,
  GraphQLObjectType,
} = require('graphql');

const PORT = 3000;

app.use(express.json());
// app.use(cookieParser());

app.get('/', (req, res) => {
  res.status(200).sendFile(path.join(__dirname, '../client/index.html'));
});

const UserType = new GraphQLObjectType({
  name: 'User',
  description: 'type of Users',
  fields: () => ({
    user_id: { type: GraphQLInt },
    username: { type: GraphQLString },
    password: { type: GraphQLString },
  }),
});

const MessageType = new GraphQLObjectType({
  name: 'Message',
  description: 'type Message',
  fields: () => ({
    message: { type: GraphQLString },
    message_id: { type: GraphQLInt },
    sender_id: { type: GraphQLInt },
    time: { type: GraphQLString, resolve: () => new Date().toDateString() },
    human: { type: GraphQLString },
    user: {
      type: UserType,
      resolve: async (message) => {
        const value = [message.sender_id];
        const query = 'SELECT * FROM users WHERE users.user_id = $1';
        const data = await db.query(query, value);
        return data.rows[0];
      },
    },
  }),
});

const RootQueryType = new GraphQLObjectType({
  name: 'Query',
  description: 'Root Query',
  fields: () => ({
    allMessages: {
      type: new GraphQLList(MessageType),
      description: 'all the  messages',
      resolve: async () => {
        const query =
          'SELECT m.*, users.username FROM messages m INNER JOIN users ON users.user_id = m.sender_id';
        const data = await db.query(query);
        return data.rows;
      },
    },
    messageById: {
      type: new GraphQLList(MessageType),
      description: ' ',
      args: {
        id: { type: GraphQLInt },
      },
      resolve: async (parent, args) => {
        const value = [args.id];
        const query = 'SELECT m.* FROM messages m WHERE message_id=$1 ';
        const data = await db.query(query, value);
        return data.rows;
      },
    },
  }),
});

const RootMutationType = new GraphQLObjectType({
  name: 'Mutation',
  description: 'Mutates Messages',
  fields: () => ({
    addMessage: {
      type: MessageType,
      description: 'add a message to the db',
      args: {
        sender_id: { type: GraphQLInt },
        message: { type: GraphQLString },
      },
      resolve: async (parent, args) => {
        const message = {
          sender_id: args.sender_id,
          message: args.message,
        };
        const value = [args.message, args.sender_id];
        const query =
          'INSERT INTO messages (sender_id,message) VALUES ($2, $1) RETURNING *;';
        const data = await db.query(query, value);
        return data.rows[0];
      },
    },
  }),
});

const schema = new GraphQLSchema({
  query: RootQueryType,
  mutation: RootMutationType,
});

const magnicache = new MagniCache(schema);

//ideally, we would want a viz to have the following middleware:
//app.get(/magnicache, magnicache.viz, (req,res) => {
//return res.status(200).sendFile(<root>)
//})

//currently, we want any requests being sent to /graphql to come back w a custom (header/cookie?) that shows if it is chached or not
//
//alternatively, we can have magnicache.query take a vizaulaizer options, set and the send the respoinser from the middleware
app.use('/graphql', magnicache.query, (req, res) => {
  return res.status(200).send(res.locals.queryResponse);
});

//catch-all route
app.use('/', (req, res, next) =>
  //TODO add a 404 page to route to
  next({
    log: 'Express catch all handler caught unknown route',
    status: 404,
    message: { err: 'Route not found' },
  })
);

const defaultErr = {
  log: 'Express error handler caught an unknown middleware error',
  status: 400,
  message: { err: 'An error occurred' },
};

app.use((err, req, res, next) => {
  const errorObj = Object.assign(defaultErr, err);
  // console.log(errorObj.log);
  return res.status(errorObj.status).json(errorObj.message);
});

app.listen(PORT, () => {
  console.log(`Server listening on PORT ${PORT}`);
});
