const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const typeDefs = `
  type BookBasic {
    id: Int!
    author: String!
    category: String!
    description: String!
    price: Float!
    stock: Int!
    title: String!
  }

  type BookViews {
    _id: String!
    createdAt: String
    views: Int!
  }

  type BookEnriched {
    id: Int!
    author: String!
    category: String!
    description: String!
    price: Float!
    stock: Int!
    title: String!
    views: Int!
    createdAt: String
  }

  type VisitStats {
    totalVisits: Int!
    pageVisits: [PageVisit!]!
  }

  type PageVisit {
    page: String!
    visits: Int!
  }

  type Query {
    getMostViewedBooks: [BookViews!]!
    getVisitStats: VisitStats!
    getAllBooks: [BookBasic!]!
    getAllBooksEnriched: [BookEnriched!]!
  }
`;

const resolvers = {
  Query: {
    getMostViewedBooks: async () => {
      const response = await fetch("https://soa-serverless.vercel.app/api/most-viewed.js", {
        method: "GET",
      });
      const data = await response.json();
      return data.books;
    },
    getVisitStats: async () => {
      const response = await fetch("https://visitors-latest.onrender.com/stats", {
        method: "GET",
      });
      const data = await response.json();
      return {
        totalVisits: data.totalVisits,
        pageVisits: Object.entries(data.pageVisits).map(([page, visits]) => ({
          page,
          visits,
        })),
      };
    },
    getAllBooks: async () => {
      const response = await fetch("http://localhost:3000/api/books");  // Updated endpoint
      return response.json();
    },
    getAllBooksEnriched: async () => {
      try {
        const [viewsResponse, booksResponse] = await Promise.all([
          fetch("https://soa-serverless.vercel.app/api/most-viewed.js"),
          fetch("http://localhost:3000/api/books")  // Updated endpoint
        ]);

        if (!viewsResponse.ok) {
          throw new Error(`Views API error: ${viewsResponse.status}`);
        }
        if (!booksResponse.ok) {
          throw new Error(`Books API error: ${booksResponse.status}`);
        }

        const viewsData = await viewsResponse.json();
        const booksData = await booksResponse.json();

        // Create a map of views data for easy lookup
        const viewsMap = new Map(
          viewsData.books.map(book => [book._id, book])
        );

        // Combine the data
        return booksData.map(book => ({
          ...book,
          views: viewsMap.get(book.id.toString())?.views || 0,
          createdAt: viewsMap.get(book.id.toString())?.createdAt || null
        }));
      } catch (error) {
        console.error('Error in getAllBooksEnriched:', error);
        throw new Error('Failed to fetch enriched books data');
      }
    }
  },
};

async function startServer() {
  const app = express();
  
  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  await server.start();

  app.use(
    '/',
    cors({
      origin: 'http://localhost:5173',  // Your Svelte app URL
      credentials: true
    }),
    express.json(),
    expressMiddleware(server)
  );

  app.listen(4000, () => {
    console.log(`🚀 Server ready at http://localhost:4000`);
  });
}

startServer();