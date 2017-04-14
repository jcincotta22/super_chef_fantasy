const keys = require('./keys.js')
const rp = require('request-promise')
let response;
let standings;
let gameKey = 'mlb.l.17560'
let url = "https://api.login.yahoo.com/oauth2/get_token"

let refreshToken = (base64token, refreshToken) => {
  let refresh = {
        "method": 'POST',
        "uri": url,
        "headers": {
        'Authorization': `Basic ${base64token}`,
        'Content-Type': 'application/x-www-form-urlencoded'
        },
        'body': `grant_type=refresh_token&redirect_uri=oob&refresh_token=${refreshToken}`
    };
  return rp(refresh).then((data) => {
    response = JSON.parse(data)
    console.log('saved new access token after refresh')
  }).catch((err) => {
    throw err
  })
}

let getToken = (base64token, code) => {
  let options = {
      "method": 'POST',
      "uri": url,
      "headers": {
      'Authorization': `Basic ${base64token}`,
      'Content-Type': 'application/x-www-form-urlencoded'
      },
      'body': `grant_type=authorization_code&redirect_uri=oob&code=${code}`
  };
  return rp(options).then((data) => {
    response = JSON.parse(data)
    console.log("token did not expire")
  }).catch((err) => {
    throw err
  })
}

let getStandings = () => {
  let getLeagueUri = `https://fantasysports.yahooapis.com/fantasy/v2/league/${gameKey}/standings?format=json`
  return Promise.resolve()
  .then(() => {
    return getToken(keys.base64token, keys.code).then((data) => {
      console.log("access token", response.access_token)
    })
  })
  .then(() => {
    let getLeagueOptions = {
      "method": 'GET',
      "uri": getLeagueUri,
      "headers": {
        'Authorization': `Bearer ${response.access_token}`
      }
    };
    return rp(getLeagueOptions).then((data) => {
      standings = JSON.parse(data)
      return standings
    })
    .catch((err) => {
      console.log(err)
    });
  })
  .catch((err) => {
    return Promise.resolve()
    .then(() => {
      return refreshToken(keys.base64token, keys.refresh_token)
    })
    .then(() => {
      let getLeagueOptions = {
        "method": 'GET',
        "uri": getLeagueUri,
        "headers": {
          'Authorization': `Bearer ${response.access_token}`
        }
      };
      return rp(getLeagueOptions).then((data) => {
        standings = JSON.parse(data)
        return standings
      });
    })
  });
}

module.exports = getStandings;
