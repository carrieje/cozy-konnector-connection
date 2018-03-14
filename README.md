Cozy Konnector Connection Module
================================

What is it?
-----------

This small module named `connection` allow you to easily log in to your service
while you are developing a Cozy Konnector.

How does it work?
----------------

Require `connection` module.

```js
const connection = require('./connection')
```

Or if you want to use `yarn`:
`yarn add carrieje/cozy-konnector-connection`

```js
const connection = require('cozy-konnector-connection/connection.js')
```

Define your Konnector with a `login` function.

```js
module.export = new BaseKonnector(start)

function start (fields) {
  return login(fields)
  .then(() => {
    log('info', 'Successfully logged in')
  })
}

function login (fields) {
  // TODO
  return Promise.resolve()
}
```

Now let's code the `login` function.
`connection` gives us access to its `init` property.
The purpose of this function is to load (`GET`) a webpage containing a `form`.

The page full location is given by defining the first two arguments of the
`init` function, `baseUrl` and `page`. The full location is constructed by
concatenation of them using a `/` between.

To identify the form, you must give a third argument to `init`: `formSelector`.
This argument is processed by `cheerio` so it must respect its syntax.

The form will be submit (`POST`) to its `action` parameter.
For now, `connection` assumes this parameter is always relative, and
concatenates it to `baseUrl` with a `/` to constitute the final url.

The fourth argument allows you to populate the form before sending it.
It consists of a JS object, mapping name of inputs to its populated value.

An example of such a login function is as follow.

```js
const baseUrl = `https://espace-client.lanef.com/templates/logon`

function login (fields) {
  const page = 'logon.cfm'
  const population = {
    'USERID': fields.login,
    'STATIC': fields.password
  }
  return connection.init(baseUrl, page, '#formSignon', population)
}
```

`connection.init` ends by resolving a promise with the response body as
argument, if login is successfull according to its basic validation method.
The default one is to check if `statusCode` of the `POST` is `200`.
If it is not the case, a `new Error('LOGIN_FAILED')` is thrown.

Custom processing
-----------------

`connection` allows some customizations.

As a fifth argument to `init`, you can define a strategy to parse the `body`.
This parsed `body` would be passed as an argument when resolving the `init`
promise, and also to the validation function.
You have three options for this : `'raw'`, `'json'`, `'cheerio'`. `'cheerio'` is
the default strategy.

As a sixth argument to `init`, you can customize the validation function.
This must be a function with 2 arguments : `statusCode`, `parsedBody`.
You can use both arguments to determine whether login is successfull or not.
This function is a predicate for the success of the login process. It must
return a boolean.

```js
function validateLogin (statusCode, $) {
  console.log(statusCode)
  // always throw a LOGIN_FAILED
  return false
}

function login (fields) {
  // ...
  return connection.init(baseUrl, page, '#formSignon', population, 'cheerio', validateLogin)
}
```

The following promise can now rely on `$` to perform further actions.

```js
function start (fields) {
  return login(fields)
  .then($ => {
    // Parse the body using $ to perform further actions
  })
}
```

As a seventh argument, `connection` allows you to pass an `opts` object to its
`requestFactory`. If the page you are browsing uses `latin1` encoding, simply
add `{ encoding: 'latin1' }` to the `init` function.

Requirements
------------

This module needs no more than your Cozy Konnector to work.
It depends on `cozy-konnector-libs` and `cheerio`.

Known weaknesses
----------------

- This module has not been tested with form using `select` inputs.
- This module does not work with forms with an absolute path for `action`.

Full example
------------

Refer to `example.js` for a full example.
