# Magnicache/server

@magnicache/server is a lightweight GraphQL caching solution. 

Imported as a package from npm, @magnicache/server can be inserted into the middleware chain for a GraphQL endpoint to intercept GraphQL requests and scan the cache for previously executed queries. 
<br>

Queries present in the cache will return the cached result to the client, improving response speeds and overall GraphQL performance.

<br>

## How to use @magnicache/server in your GraphQL api

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

4. Insert magnicache.query into the middleware chain for your '/graphql' route.

   - Ensure all request bodies are parsed

```js
app.use(express.json());

app.use('/graphql', magnicache.query, (req, res) =>
  res.status(200).send(res.locals.queryResponse)
);
```

## Contributors

[Ahmed Chami](https://www.linkedin.com/in/ahmed-chami/)

[Aria Soltankhah](https://www.linkedin.com/in/ariasol/)

[Truman Miller](https://www.linkedin.com/in/truman-miller)

[Yousuf Elkhoga](https://www.linkedin.com/in/yousufelkhoga/)
