// discount.graphql.controller.js
// Example GraphQL controller (resolver) for CRUD operations on Discount
// Assumes you have a DiscountService with methods: createDiscount, getDiscountById, updateDiscount, deleteDiscount, getAllDiscounts

const DiscountService = require("../services/discount.service");

const discountResolvers = {
  Query: {
    // Get all discounts for a shop
    discounts: async (_, { shopId, filter, pagination }, context) => {
      // Optionally use context for authentication
      return DiscountService.GetAllDiscountsByShop({
        shop_id: shopId,
        ...filter,
        ...pagination,
      });
    },
    // Get a single discount by ID
    discount: async (_, { id }, context) => {
      return DiscountService.getDiscountById(id);
    },
  },
  Mutation: {
    // Create a new discount
    createDiscount: async (_, { input }, context) => {
      return DiscountService.createDiscount(input);
    },
    // Update an existing discount
    updateDiscount: async (_, { id, input }, context) => {
      return DiscountService.updateDiscount(id, input);
    },
    // Delete a discount
    deleteDiscount: async (_, { id }, context) => {
      return DiscountService.deleteDiscount(id);
    },
  },
};

// Example GraphQL typeDefs (for reference, not part of the controller file):
/*

type Discount {
  id: ID!
  name: String!
  description: String
  type: String
  value: Float
  code: String
  startDate: String
  endDate: String
  maxUses: Int
  usageCount: Int
  shopId: String
}

input DiscountInput {
  name: String!
  description: String
  type: String
  value: Float
  code: String
  startDate: String
  endDate: String
  maxUses: Int
  shopId: String
}

type Query {
  discounts(shopId: String!, filter: DiscountFilter, pagination: Pagination): [Discount]
  discount(id: ID!): Discount
}

type Mutation {
  createDiscount(input: DiscountInput!): Discount
  updateDiscount(id: ID!, input: DiscountInput!): Discount
  deleteDiscount(id: ID!): Boolean
}
*/

module.exports = discountResolvers;
