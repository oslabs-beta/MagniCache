### @magnicache/server

MagniCache is a lightweight GraphQL caching solution. Imported as a package from npm, MagniCache can be inserted into the middleware chain for a GraphQL endpoint to intercept GraphQL requests and scan the cache for previously executed queries. Queries present in the cache will return the cached result to the client, improving response speeds and overall GraphQL performance.

## Installation

1. Install MagniCache Server.

```bash
  npm i @magnicache/server
```

2. Import MagniCache.

```js
const MagniCache = require('@magnicache/server');
```

3. Declare a new instance of MagniCache, passing in your GraphQL schema.

```js
const magnicache = new MagniCache(schema);
```

4. Ensure that all incoming requests with JSON payloads are parsed via express.json().

```js
app.use(express.json());
```

5. Insert magnicache.query into the middleware chain for your '/graphql' route.

```js
app.use('/graphql', magnicache.query, (req, res) =>
  res.status(200).send(res.locals.queryResponse)
);
```
