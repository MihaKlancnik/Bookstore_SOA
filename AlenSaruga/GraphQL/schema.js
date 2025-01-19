const { gql } = require('apollo-server-express');

const typeDefs = gql`

    scalar DateTime

  type InventoryItem {
    id: String!
    quantity: Int!
    lastUpdated: DateTime!
  }

  type Inventory {
    id: String!
    items: [InventoryItem!]
    }

  type Notification {
    message: String!
    severity: String!
    timestamp: DateTime!
    items: [InventoryItem!]
  }

  type Query {
    getNotifications: Notification!
    getInventory: Inventory!
  }
`;

module.exports = typeDefs;