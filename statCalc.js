_ = require('lodash');
let teamAveRanks = {};
let teamObj = {};

let cleanStats = (leagueStats) => {
    let allStats = {};
    for(let team in leagueStats){
        allStats[team] = {};
        teamAveRanks[team] = [];
        leagueStats[team].forEach((teamStat) => {
            allStats[team][teamStat.stat.stat_id] = teamStat.stat.value;
        });
    }
    return allStats;
};

let sortStats = (statArray, statId) => {
    let sortedStatList = statArray.sort((a, b) => {
        let aKey = Object.keys(a);
        let bKey = Object.keys(b);
        if(isNaN(parseInt(a[aKey]))){
            return parseFloat(b[bKey]) - parseFloat(a[aKey]);
        }else if(statId === '60'){
            a = parseFloat(parseInt(a[aKey].split('/')[0]) / parseInt(a[aKey].split('/')[1]));
            b = parseFloat(parseInt(b[bKey].split('/')[0]) / parseInt(b[bKey].split('/')[1]));
            return b - a;
        }else{
            return parseInt(b[bKey]) - parseInt(a[aKey]);
        }

    });
    return sortedStatList
};

let getAveRanks = (sortedStats) => {
    let duplicates = [];
    let dupObj = {};
    let team;
    let index = 0;
    sortedStats.forEach((stat) => {
        team = Object.keys(stat);
        if(dupObj[stat[team]])
            duplicates.push(index);
        else
            dupObj[stat[team]] = team;
        index++;
    });
    let rank = 1;
    index = 0;
    sortedStats.forEach((stat) => {
        team = Object.keys(stat);
        if(duplicates.indexOf(index) === -1){
            stat['rank'] = rank;
            teamAveRanks[team[0]].push(rank)
        }else{
            stat['rank'] = sortedStats[index - 1].rank;
            teamAveRanks[team[0]].push(sortedStats[index - 1].rank);
        }
        index++;
        rank++;
    });
    teamObj = createAveRankObj(teamAveRanks);
};

let statRank = (leagueStats) => {
    let allStats = cleanStats(leagueStats);
    let statList = [];
    let statRanks = {};
    let count = 0;
    for(let team in allStats){
        if(count === 0){
            leagueStats[team].forEach((stats) => {
                statList.push(stats.stat.stat_id);
                statRanks[stats.stat.stat_id] = [];
            });
        }
        count++;
        statList.forEach((stat) => {
            let statObj = {};
            statObj[team] = allStats[team][stat];
            let statClone = _.cloneDeep(statObj);
            statRanks[stat].push(statClone);
        })
    }
    for(statId in statRanks){
        statRanks[statId] = sortStats(statRanks[statId], statId)
        getAveRanks(statRanks[statId])
    }
    return [statRanks, teamObj]
};

let teamAveRank = (aveRankArray) => {
    let sum = aveRankArray.reduce((a, b) => { return a + b; });
    let avg = parseFloat(sum / aveRankArray.length);
    return avg;
};

let createAveRankObj = (teamAveRanks) => {
    let teamAveRankObj = {};
    for(let team in teamAveRanks){
        teamAveRankObj[team] = teamAveRank(teamAveRanks[team])
    }
    return teamAveRankObj
};

let sortObject = (obj) => {
    let arr = [];
    let prop;
    for (prop in obj) {
        if (obj.hasOwnProperty(prop)) {
            arr.push({
                'key': prop,
                'value': parseFloat(obj[prop])
            });
        }
    }
    arr.sort(function(a, b) {
        return a.value - b.value;
    });
    return arr; // returns array
};

module.exports.statRank = statRank;
module.exports.sortObject = sortObject;