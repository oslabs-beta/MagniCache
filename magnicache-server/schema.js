const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLList,
  GraphQLSchema,
} = require('graphql');

const db = require('./db');

// Define the Customer type
const CustomerType = new GraphQLObjectType({
  name: 'Customer',
  fields: () => ({
    id: { type: GraphQLInt },
    name: { type: GraphQLString },
    address: { type: GraphQLString },
    zip: { type: GraphQLString },
    sales: {
      type: new GraphQLList(SalesType),
      resolve(parent, args) {
        // Query the sales table for sales by this customer
        // and return them as an array
        return db
          .query(`SELECT * FROM sales WHERE customer_id = ${parent.id}`)
          .then((res) => res.rows)
          .catch((err) => console.error(err));
      },
    },
  }),
});

// Define the Sales type
const SalesType = new GraphQLObjectType({
  name: 'Sales',
  fields: () => ({
    date: { type: GraphQLString },
    total: { type: GraphQLInt },
    customer: {
      type: CustomerType,
      resolve(parent, args) {
        // Query the customer table for the customer associated
        // with this sale and return it
        return db
          .query(`SELECT * FROM customers WHERE id = ${parent.customer_id}`)
          .then((res) => res.rows[0])
          .catch((err) => console.error(err));
      },
    },
    items: {
      type: new GraphQLList(SalesItemType),
      resolve(parent, args) {
        // Query the sales_item table for items associated
        // with this sale and return them as an array
        return db
          .query(`SELECT * FROM sales_item WHERE sale_id = ${parent.id}`)
          .then((res) => res.rows)
          .catch((err) => console.error(err));
      },
    },
  }),
});

// Define the Sales Item type
const SalesItemType = new GraphQLObjectType({
  name: 'SalesItem',
  fields: () => ({
    quantity: { type: GraphQLInt },
    product: {
      type: ProductType,
      resolve(parent, args) {
        // Query the products table for the product associated
        // with this sales item and return it
        return db
          .query(`SELECT * FROM products WHERE id = ${parent.product_id}`)
          .then((res) => res.rows[0])
          .catch((err) => console.error(err));
      },
    },
  }),
});

// Define the Product type
const ProductType = new GraphQLObjectType({
  name: 'Product',
  fields: () => ({
    id: { type: GraphQLInt },
    name: { type: GraphQLString },
    sales_items: {
      type: new GraphQLList(SalesItemType),
      resolve(parent, args) {
        // Query the sales_item table for sales items associated
        // with this product and return them as an array
        return db
          .query(`SELECT * FROM sales_item WHERE product_id = ${parent.id}`)
          .then((res) => res.rows)
          .catch((err) => console.error(err));
      },
    },
  }),
});

// Define the root Query type
const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    customer: {
      type: CustomerType,
      args: { id: { type: GraphQLInt } },
      resolve(parent, args) {
        // Query the customer table for a customer with the specified ID
        // and return it
        return db
          .query(`SELECT * FROM customers WHERE id = ${args.id}`)
          .then((res) => res.rows[0])
          .catch((err) => console.error(err));
      },
    },
    customers: {
      type: new GraphQLList(CustomerType),
      resolve(parent, args) {
        // Query the customer table for a customer with the specified ID
        // and return it
        return db
          .query(`SELECT * FROM customers`)
          .then((res) => res.rows)
          .catch((err) => console.error(err));
      },
    },
    // sales: {},
    // products: {},
  },
});

// Define the root Query type
const RootMutation = new GraphQLObjectType({
  name: 'RootMutationType',
  fields: {},
});

module.exports = new GraphQLSchema({
  query: RootQuery,
});
