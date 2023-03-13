
## How to use @magnicache/client in your graphQL client

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
magniClient.query(
  `query {
    person(personID: 1) {
        name
        eyeColor
        height
    }
}`, '/graphql');
```

## Contributors

[Ahmed Chami](https://www.linkedin.com/in/ahmed-chami/)

[Aria Soltankhah](https://www.linkedin.com/in/ariasol/)

[Truman Miller](https://www.linkedin.com/in/truman-miller)

[Yousuf Elkhoga](https://www.linkedin.com/in/yousufelkhoga/)

