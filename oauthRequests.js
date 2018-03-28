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
let response;
let standings;
const gameKey = 'mlb.l.47680'
const url = "https://api.login.yahoo.com/oauth2/get_token"

const refreshToken = (base64token, refreshToken) => {
  const refresh = {
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

const getToken = (base64token, code) => {
  const options = {
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

const getStandings = () => {
  const getLeagueUri = `https://fantasysports.yahooapis.com/fantasy/v2/league/${gameKey}/standings?format=json`
  return Promise.resolve()
    .then(() => {
      return getToken(keys.base64token, keys.code).then((data) => {
    })
  })
  .then(() => {
    const getLeagueOptions = {
      "method": 'GET',
      "uri": getLeagueUri,
      "headers": {
        'Authorization': `Bearer ${response.access_token}`
      }
    };
    return rp(getLeagueOptions).then((data) => {
      standings = JSON.parse(data)
      return standings.fantasy_content.league
    })
    .catch((err) => {
      console.log("Error getting data")
    });
  })
  .catch((err) => {
    return Promise.resolve()
    .then(() => {
      return refreshToken(keys.base64token, keys.refresh_token)
    })
    .then(() => {
      const getLeagueOptions = {
        "method": 'GET',
        "uri": getLeagueUri,
        "headers": {
          'Authorization': `Bearer ${response.access_token}`
        }
      };
      return rp(getLeagueOptions).then((data) => {
        standings = JSON.parse(data)
        return standings.fantasy_content.league
      });
    })
  });
};

const getRotoStandings = (week) => {
    const getScoreBoard = `https://fantasysports.yahooapis.com/fantasy/v2/league/${gameKey}/scoreboard;week=${week}?format=json`
    return Promise.resolve()
        .then(() => {
            return getToken(keys.base64token, keys.code).then((data) => {
                console.log("recieved access token")
            })
        })
        .then(() => {
          let getLeagueOptions = {
            "method": 'GET',
            "uri": getScoreBoard,
            "headers": {
              'Authorization': `Bearer ${response.access_token}`
            }
          };
          return rp(getLeagueOptions)
        })
        .then((data) => {
          return JSON.parse(data).fantasy_content.league
        })
        .catch((err) => {
          return Promise.resolve()
          .then(() => {
            return refreshToken(keys.base64token, keys.refresh_token)
          })
          .then(() => {
            let getLeagueOptions = {
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
