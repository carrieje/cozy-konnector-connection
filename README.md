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
For now `connection` assumes this parameter is always relative, and concatenates
it to `baseUrl` with a `/` to constitute the final url.

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

`connection.init` ends with an empty `Promise.resolve` if login is successfull
according to its basic validation method.
The default one is to check if `statusCode` of the `POST` is `200`.
If it is not the case, a `new Error('LOGIN_FAILED')` is thrown.

You can customize this validation method by giving a last argument to `init`.
This must be a function with 3 arguments : `statusCode`, `$` and `json`.
You can use all of three arguments to determine whether login is successfull or
not. Note that `json` is the raw body of the response. Ignore this argument if
the response is not a json payload, parse it before using it otherwise.
If you have to crawl through a webpage for spotting errors, use `$` which is
just a `cheerio` object of the response body.

This function is a predicate for the success of the login process. It must
return a boolean.

```js
function validateLogin (statusCode, $, json) {
  console.log(statusCode)
  // always throw a LOGIN_FAILED
  return false
}

function login (fields) {
  // ...
  return connection.init(baseUrl, page, '#formSignon', population, validateLogin)
}
```

Requirements
------------

This module needs no more than your Cozy Konnector to work.
For instance, it depends on `cozy-konnector-libs`.

Known weaknesses
----------------

- This module has not been tested with form using `select` inputs.
- This module does not work with forms with an absolute path for `action`.

Full example
------------

Refer to `example.js` for a full example.
