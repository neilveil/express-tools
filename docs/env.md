# Express tools environment file management

## Setup

Create a new file `.env` at the root of your project & `express-tools` will automatically import the environment variables.

## Usage

`express-tools` only use key-value pairs & the type of value will always be a string even if a numeric or boolean value is set. Empty lines & lines starting with "#" are ignored.

Example environment file

```
PORT=8080
DB_URI=db://username:password@host:port/dbname
MY_VAR1=abc
# MY_VAR2=xyz
MY_VAR3=123
```

Reading environment variables

```js
console.log(process.env.PORT) // "8080"
console.log(process.env.DB_URI) // "db://username:password@host:port/dbname"
console.log(process.env.MY_VAR1) // "abc"
console.log(process.env.MY_VAR2) // undefined
console.log(process.env.MY_VAR2) // "123"
```

## Environment file path

By default `express-tools` uses `.env` file placed at the root of the project. To use a different environment file, path can be set as `ENVF` environment variable which can be directly provided while running the server.

```json
..
  "script": "ENVF='./path/to/my/.custom.env' node index.js"
..
```
