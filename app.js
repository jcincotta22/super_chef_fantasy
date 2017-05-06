const express = require('express');
const app = express();
const request = require('./oauthRequests.js');
const statCalc = require('./statCalc.js');
const statIdObj = {
    "3": "AVG", "4": "OBP", "5": "SLG", "7": "R", "12": "HR",
    "13": "RBI", "16": "SB", "26": "ERA", "27": "WHIP",
    "28": "W", "29": "L", "32": "S", "42": "K", "83": "QS"
};

app.listen(process.env.PORT || 3000, () => {
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
        console.log(err.message)
    });

});

app.get('/roto', (req, res) => {
    let stats = {};
    let week;
    console.log("homepage");
    console.log('before roto');

    request.getRotoStandings(req.query.week).then((data) => {
        week = data.week;
        for(let i = 0; i < data[0].matchups.count; i++){
            stats[data[0].matchups[i].matchup[0].teams[0].team[0][2].name] = data[0].matchups[i].matchup[0].teams[0].team[1].team_stats.stats;
            stats[data[0].matchups[i].matchup[0].teams[1].team[0][2].name] = data[0].matchups[i].matchup[0].teams[1].team[1].team_stats.stats;
        }
        let newStats = statCalc.statRank(stats);
        let sortedRanks = statCalc.sortObject(newStats[1]);
        res.render('roto.ejs', {
            week: week,
            stats: newStats[0],
            statIdObj: statIdObj,
            sortedRanks: sortedRanks
        });
    }).catch((err) => {
        console.log(err.message)
    });

});
