# MagniCache

<img src="./assets/OGLOGO.png">

MagniCache is a lightweight GraphQL caching solution. Packaged and shipped as two separate npm packages, MagniCache can be implemented seamlessly into projects as an Express middleware for server-side caching of queries and mutations, or as a localStorage manipulation device for client-side caching.

What does your product do?
What problem does it solve?
What are its most important features (i.e. what makes it stand out)?
For iterations, it may be useful to highlight any major new features here

(deprecated) MagniCache is a lightweight GraphQL caching solution. Imported as a package from npm, MagniCache can be inserted into the middleware chain for a GraphQL endpoint to intercept GraphQL requests and scan the cache for previously executed queries. Queries present in the cache will return the cached result to the client, improving response speeds and overall GraphQL performance.

## How to install MagniCache

### Server-side Caching

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

### Client-side Caching

1. Install MagniCache Client.

```bash
  npm i @magnicache/client
```

2. Import MagniCache.

```js
const MagniClient = require('@magnicache/client');
```

3. Declare a new instance of MagniClient, optionally passing in a cache capacity.

```js
const magniClient = new MagniClient(maxSize);
```

4. Invoke magniclient.query, passing in the query string and the graphql endpoint.

```js
'TBD .....';
```

## License

MIT

## Contributors

Ahmed Chami / <a href="https://github.com/Achami64">Github</a> / <a href="https://www.linkedin.com/in/ahmed-chami-dev/">LinkedIn</a>

Aria Soltankhah / <a href="https://github.com/ariasoltank">Github</a> / <a href="https://www.linkedin.com/in/ariasol/">LinkedIn</a>

Truman Miller / <a href="https://github.com/trumanmiller">Github</a> / <a href="https://www.linkedin.com/in/truman-miller/">LinkedIn</a>

Yousuf Elkhoga / <a href="https://github.com/yousuf-e">Github</a> / <a href="https://www.linkedin.com/in/yousufelkhoga/">LinkedIn</a>
