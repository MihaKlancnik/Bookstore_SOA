const axios = require('axios');
const { GraphQLScalarType, Kind } = require('graphql');

const dateTimeScalar = new GraphQLScalarType({
  name: 'DateTime',
  description: 'DateTime custom scalar type',
  serialize(value) {
    return value.toISOString();
  },
  parseValue(value) {
    return new Date(value);
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) {
      return new Date(ast.value);
    }
    return null;
  },
});

const resolvers = {
  DateTime: dateTimeScalar,

  Query: {
    getNotifications: async () => {
      try {
        const inventoryResponse = await axios.get('https://inventory-service-cxrs.onrender.com/api/inventory');
        
        if (inventoryResponse.status !== 200 || !Array.isArray(inventoryResponse.data) || inventoryResponse.data.length === 0) {
          return {
            message: 'Ni novih obvestil.',
            severity: 'info',
            timestamp: new Date(),
            items: []
          };
        }

        const inventory = inventoryResponse.data;
        const lowInventory = inventory.filter(item => item.quantity < 5);

        if (lowInventory.length > 0) {
          return {
            message: 'Pozor: Nekateri izdelki so skoraj razprodani!',
            severity: 'warning',
            timestamp: new Date(),
            items: lowInventory.map(item => ({
              id: item.id,
              quantity: item.quantity,
              lastUpdated: new Date()
            }))
          };
        } else {
          return {
            message: 'Vsi izdelki so na zalogi.',
            severity: 'success',
            timestamp: new Date(),
            items: []
          };
        }
      } catch (err) {
        return {
          message: `Napaka: ${err.message}`,
          severity: 'error',
          timestamp: new Date(),
          items: []
        };
      }
    },

    getInventory: async () => {
      try {
        const inventoryResponse = await axios.get('https://inventory-service-cxrs.onrender.com/api/inventory');
        
        if (inventoryResponse.status !== 200 || !Array.isArray(inventoryResponse.data)) {
          return {
            id: 'inventory-1',
            items: []
          };
        }

        return {
          id: 'inventory-1',
          items: inventoryResponse.data.map(item => ({
            id: item.id,
            quantity: item.quantity,
            lastUpdated: new Date()
          }))
        };
      } catch (err) {
        console.error('Error fetching inventory:', err);
        return {
          id: 'inventory-1',
          items: []
        };
      }
    }
  }
};

module.exports = resolvers;