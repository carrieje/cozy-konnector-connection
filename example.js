'use strict'
const {BaseKonnector, log} = require('cozy-konnector-libs')
const connection = require('./connection')

const baseUrl = `https://espace-client.lanef.com/templates/logon`
module.export = new BaseKonnector(start)

function start (fields) {
  return login(fields)
  .then(() => {
    log('info', 'Successfully logged in')
  })
}

function validateLogin (statusCode, $, json) {
  console.log(statusCode)
  return false
}

function login (fields) {
  const page = 'logon.cfm'
  const population = {
    'USERID': fields.login,
    'STATIC': fields.password
  }
  return connection.init(baseUrl, page, '#formSignon', population, validateLogin)
}
