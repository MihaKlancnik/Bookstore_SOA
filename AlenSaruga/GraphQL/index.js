const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const typeDefs = require('./schema');
const resolvers = require('./resolvers');

async function startServer() {
  const app = express();
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    formatError: (err) => {
      console.error('GraphQL Error:', err);
      return err;
    },
  });

  await server.start();
  server.applyMiddleware({ app });

  const PORT = 4004;
  app.listen(PORT, () => {
    console.log(`🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`);
  });
}

startServer();

/*

query {
  getNotifications {
    message
    severity
    timestamp
    items {
      id
      quantity
      lastUpdated
    }
  }
}

query {
  getInventory {
    id
    items {
      id
      quantity
      lastUpdated
    }
  }
}

  
*/