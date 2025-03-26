const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

app.use(express.static(path.join(__dirname, '../client')));

// Чтение данных о товарах
const products = JSON.parse(fs.readFileSync(path.join(__dirname, 'products.json'), 'utf-8'));

// Определение схемы GraphQL
const schema = buildSchema(`
  type Product {
    id: Int
    name: String
    price: Float
    description: String
    categories: [String]
  }

  type Query {
    products: [Product]
    product(id: Int!): Product
    productsByName(name: String!): [Product]
    productsByCategory(category: String!): [Product]
    productNames: [String]
    productPrices: [Float]
    productNamesWithPrices: [ProductNameWithPrice]
  }

  type ProductNameWithPrice {
    name: String
    price: Float
  }
`);

// Корневой резолвер
const root = {
  products: () => products,
  product: ({ id }) => products.find(p => p.id === id),
  productsByName: ({ name }) => products.filter(p => p.name.includes(name)),
  productsByCategory: ({ category }) => products.filter(p => p.categories.includes(category)),
  productNames: () => products.map(p => p.name),
  productPrices: () => products.map(p => p.price),
  productNamesWithPrices: () => products.map(p => ({ name: p.name, price: p.price }))
};

// Добавляем GraphQL endpoint
app.use('/graphql', graphqlHTTP({
  schema: schema,
  rootValue: root,
  graphiql: true
}));

// Оставляем REST endpoint для обратной совместимости
app.get('/products', (req, res) => {
  res.json(products);
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  console.log(`GraphQL endpoint at http://localhost:${port}/graphql`);
});