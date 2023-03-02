# MagniCache

MagniCache is a lightweight Express middleware caching solution. Imported as a package from npm, MagniCache can be inserted into the middleware chain for a GraphQL endpoint to intercept GraphQL requests and scan the cache for previously executed queries. Queries present in the cache will return the cached result to the client, improving response speeds and overall GraphQL performance.
