const request = require('supertest');
// const express = require('express');
const app = require('../magnicache-demo/server.js');
const { IntrospectionQuery } = require('./IntrospectionQuery.js');

describe('root Endpoint', () => {
  it('should respond with a html file', async () => {
    const response = await request(app)
      .get('/')
      .send()
      .set('Accept', 'application/html')
      .expect('Content-Type', /html/)
      .expect(200);
  });
});

describe('Graphql Endpoint', () => {
  it('should be a valid graphql endpoint', async () => {
    const response = await request(app)
      .post('/graphql')
      .send({ query: IntrospectionQuery })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body.data).toBeDefined();
  });
});
