const express = require('express');
const keys = require('./keys.js')
const app = express();
const rp = require('request-promise')
const getStandings = require('./oauthRequests.js')

getStandings().then((data) => {
  console.log(data)
}).catch((err) => {
  console.log(err)
})
