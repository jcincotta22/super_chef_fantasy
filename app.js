const express = require('express');
const app = express();
const request = require('./oauthRequests.js');
const statRank = require('./statCalc.js');

app.listen(3000, () => {
    console.log('listening on 3000');
});

app.get('/', (req, res) => {
    let teams = [];
    let leagueName;
    console.log("homepage");

    request.getStandings().then((data) => {
        leagueName = data[0].name;
        for(let i = 0; i < data[1].standings[0].teams.count; i++){
            teams.push(data[1].standings[0].teams[i].team[0][2].name)
        }
        res.render('index.ejs', {
            leagueName: leagueName,
            teams: teams
        });
    }).catch((err) => {
        console.log(err)
    });

});

app.get('/roto', (req, res) => {
    let stats = {};
    let week;
    console.log("homepage");

    request.getRotoStandings("1").then((data) => {
        week = data.week;
        for(let i = 0; i < data[0].matchups.count; i++){
            stats[data[0].matchups[i].matchup[0].teams[0].team[0][2].name] = data[0].matchups[i].matchup[0].teams[0].team[1].team_stats.stats;
            stats[data[0].matchups[i].matchup[0].teams[1].team[0][2].name] = data[0].matchups[i].matchup[0].teams[1].team[1].team_stats.stats;
        }
        let newStats = statRank(stats);
        res.render('roto.ejs', {
            week: week,
            stats: newStats
        });
    }).catch((err) => {
        console.log(err)
    });

});
