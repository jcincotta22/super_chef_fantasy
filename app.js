const express = require('express');
const keys = require('./keys.js')
const app = express();
const rp = require('request-promise')
let response;

let url = "https://api.login.yahoo.com/oauth2/get_token"
let options = {
    "method": 'POST',
    "uri": url,
    "headers": {
    'Authorization': `Basic ${keys.base64token}`,
    'Content-Type': 'application/x-www-form-urlencoded'
    },
    'body': `grant_type=authorization_code&redirect_uri=oob&code=${keys.code}`
};

let refresh = {
      "method": 'POST',
      "uri": "https://api.login.yahoo.com/oauth2/get_token",
      "headers": {
      'Authorization': `Basic ${keys.base64token}`,
      'Content-Type': 'application/x-www-form-urlencoded'
      },
      'body': `grant_type=refresh_token&redirect_uri=oob&refresh_token=${keys.refresh_token}`
  };

let refreshToken = (refresh) => {
  return rp(refresh).then((data) => {
    response = JSON.parse(data)
  }).catch((err) => {
    throw err
  })
}

let getToken = (options) => {
  return rp(options).then((data) => {
    response = JSON.parse(data)
  }).catch((err) => {
    throw err
  })
}

getToken(options).then((data) => {
  console.log("access token", response.access_token)
}).catch((err) => {
  refreshToken(refresh).then((data) => {
    console.log("access token after refresh", response.access_token)
  })
});
