const express = require('express');
const app = express();
const getStandings = require('./oauthRequests.js');

app.listen(3000, () => {
    console.log('listening on 3000');
});

app.get('/', (req, res) => {
    let teams = [];
    let leagueName;
    console.log("homepage");

    getStandings().then((data) => {
        leagueName = data[0].name;
        for(let i = 0; i < data[1].standings[0].teams.count; i++){
            teams.push(data[1].standings[0].teams[i].team[0][2].name)
        }
        // data[1].standings[0].teams.forEach((team) => {
        //     teams.push(team.team[0][2].name)
        // });
        console.log(data)
        res.render('index.ejs', {
            leagueName: leagueName,
            teams: teams
        });
    }).catch((err) => {
        console.log(err)
    });

});
