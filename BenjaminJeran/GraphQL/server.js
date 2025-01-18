const { ApolloServer } = require('@apollo/server');
const { startStandaloneServer } = require('@apollo/server/standalone');
const { MongoClient } = require('mongodb');

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);

const typeDefs = `
  type Book {
    _id: String!
    views: Int!
    createdAt: String
  }

  type Query {
    getMostViewedBooks: [Book!]!
    getBook(id: String!): Book
  }

  type Mutation {
    incrementBookViews(id: String!): Book
  }
`;

const resolvers = {
  Query: {
    getMostViewedBooks: async () => {
      try {
        await client.connect();
        const database = client.db();
        const books = database.collection('books');
        
        return await books
          .find({})
          .sort({ views: -1 })
          .limit(10)
          .toArray();
      } finally {
        await client.close();
      }
    },
    getBook: async (_, { id }) => {
      try {
        await client.connect();
        const database = client.db();
        const books = database.collection('books');
        
        return await books.findOne({ _id: id });
      } finally {
        await client.close();
      }
    }
  },
  Mutation: {
    incrementBookViews: async (_, { id }) => {
      try {
        await client.connect();
        const database = client.db();
        const books = database.collection('books');
        
        const result = await books.findOneAndUpdate(
          { _id: id },
          { 
            $inc: { views: 1 },
            $setOnInsert: { createdAt: new Date().toISOString() }
          },
          { 
            upsert: true,
            returnDocument: 'after'
          }
        );
        
        return result;
      } finally {
        await client.close();
      }
    }
  }
};

async function startServer() {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  const { url } = await startStandaloneServer(server, {
    listen: { port: 4000 }
  });

  console.log(`🚀 Server ready at ${url}`);
}

startServer();