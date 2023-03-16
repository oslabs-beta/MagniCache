# Magnicache/client

<!-- @magnicache/client is a powerful library designed to significantly improve response times for GraphQL queries by leveraging the browser's localStorage. -->

A lightweight client-side GraphQL caching solution that optimizes queries by atomizing complex queries and caching them individually.
<br/>
MagniClient utilizes localStorage to cache query results across sessions.
<br>
Configurable cache size.

<br>

## How to use @magnicache/client in your GraphQL client

1. Install MagniCache Client.

```bash
npm i @magnicache/client
```

2. Import MagniCache Client.

```js
const MagniClient = require('@magnicache/client');
```

3. Declare a new instance of MagniClient, optionally passing in a cache capacity(defaults to 40).

```js
const magniClient = new MagniClient(maxSize);
```

4. Invoke magniClient.query, passing in the query string and the graphql endpoint.

```js
magniClient
  .query(
    `query {
    person(personID: 1) {
        name
        eyeColor
        height
    }
  }`,
    '/graphql'
  )
  .then((response) => {
    const queryData = response[0];
    const cacheStatus = response[1];
    // Handle the response data
  })
  .catch((err) => {
    // Handle errors
  });
```

## Contributors

[Ahmed Chami](https://www.linkedin.com/in/ahmed-chami/)

[Aria Soltankhah](https://www.linkedin.com/in/ariasol/)

[Truman Miller](https://www.linkedin.com/in/truman-miller)

[Yousuf Elkhoga](https://www.linkedin.com/in/yousufelkhoga/)
