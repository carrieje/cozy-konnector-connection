'use strict'
const {requestFactory, errors} = require('cozy-konnector-libs')
const cheerio = require('cheerio')

const rq = requestFactory({
  cheerio: true,
  jar: true,
  json: false
})

const defaultValidate = function (statusCode, $, json) {
  return statusCode === 200
}

module.exports.init = function (baseUrl, page, formSelector, population, validate = defaultValidate) {
  return rq(`${baseUrl}/${page}`)
  .then($ => {
    const [action, inputs] = formContent($, formSelector)
    for (let name in population) {
      inputs[name] = population[name]
    }
    return post(`${baseUrl}/${action}`, inputs)
  })
  .then(response => {
    const $ = cheerio.load(response.body)
    if (!validate(response.statusCode, $, response.body)) {
      throw new Error(errors.LOGIN_FAILED)
    } else {
      return Promise.resolve()
    }
  })
}

function formContent ($, formSelector) {
  const action = $(formSelector).attr('action')
  const inputs = {}
  const arr = $(formSelector).serializeArray()
  for (let input of arr) {
    inputs[input.name] = input.value
  }
  return [action, inputs]
}

function post (uri, inputs) {
  return rq({
    uri: uri,
    resolveWithFullResponse: true,
    method: 'POST',
    form: {
      ...inputs
    }
  })
}