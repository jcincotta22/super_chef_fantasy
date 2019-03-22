let keys;

if(process.env.client_id){
    keys = {};
    keys.client_id = process.env.client_id;
    keys.secret = process.env.secret;
    keys.code = process.env.code;
    keys.refresh_token = process.env.refresh_token;
    keys.base64token = process.env.base64token;
}else{
    keys = require('./keys.js')
}

const rp = require('request-promise')
const gameKey = 'mlb.l.52590'
const url = "https://api.login.yahoo.com/oauth2/get_token"

const buildRequestOptions = (method, uri, headers, body = null) => {
  if(body) {
    return {
      "method": method,
      "uri": url,
      "headers": headers,
      "body": body,
    };
  }
  return {
      "method": method,
      "uri": url,
      "headers": headers,
  };
}

const refreshToken = (base64token, refreshToken) => {
  console.log('refresh')
  const headers = {
          'Authorization': `Basic ${base64token}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
  const body = `grant_type=refresh_token&redirect_uri=oob&refresh_token=${refreshToken}`
  const options = buildRequestOptions('POST', url, headers, body);
  return rp(options).then((data) => {
    console.log('saved new access token after refresh')
    return JSON.parse(data);
  }).catch((err) => {
    throw err
  })
}

const getToken = (base64token, code) => {
  console.log('get')
  const headers = {
          'Authorization': `Basic ${base64token}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
  const body = `grant_type=authorization_code&redirect_uri=oob&code=${code}`
  console.log('getting token')
  return rp(buildRequestOptions('POST', url, headers, body)).then((data) => {
    console.log("token did not expire")
    return JSON.parse(data)
  }).catch((err) => {
    throw err
  })
}

const getStandings = () => {
  const getLeagueUri = `https://fantasysports.yahooapis.com/fantasy/v2/league/${gameKey}/standings?format=json`
  return Promise.resolve()
    .then(() => {
      return getToken(keys.base64token, keys.code);
  })
  .then((response) => {
    const header = {
      'Authorization': `Bearer ${response.access_token}`
    };
    return rp(buildRequestOptions('GET', getLeagueUri, header)).then((data) => {
      return JSON.parse(data).fantasy_content.league
    })
    .catch((err) => {
      console.log("Error getting data")
    });
  })
  .catch((err) => {
      return refreshToken(keys.base64token, keys.refresh_token)
    })
    .then((response) => {
      const getLeagueOptions = {
        "method": 'GET',
        "uri": getLeagueUri,
        "headers": {
          'Authorization': `Bearer ${response.access_token}`
        }
      };
      return rp(getLeagueOptions).then((data) => {
        return JSON.parse(data).fantasy_content.league
      });
    })
};

const getRotoStandings = (week) => {
    const getScoreBoard = `https://fantasysports.yahooapis.com/fantasy/v2/league/${gameKey}/scoreboard;week=${week}?format=json`
    return Promise.resolve()
        .then(() => {
          return getToken(keys.base64token, keys.code).then((response) => {
              console.log("recieved access token")
              const getLeagueOptions = {
                "method": 'GET',
                "uri": getScoreBoard,
                "headers": {
                  'Authorization': `Bearer ${response.access_token}`
                }
              };
              return rp(getLeagueOptions)
            })
        })
        .then((data) => {
          return JSON.parse(data).fantasy_content.league
        })
        .catch((err) => {
          return refreshToken(keys.base64token, keys.refresh_token)
            .then((response) => {
              const getLeagueOptions = {
                "method": 'GET',
                "uri": getScoreBoard,
                "headers": {
                  'Authorization': `Bearer ${response.access_token}`
                }
              };
              return rp(getLeagueOptions)
            })
          .then((data) => {
            return JSON.parse(data).fantasy_content.league[1].scoreboard
          })
          .catch((err) => {
            console.log(err)
            throw err
          });
        });
};

module.exports.getStandings = getStandings;
module.exports.getRotoStandings = getRotoStandings;
