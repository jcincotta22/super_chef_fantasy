_ = require('lodash');

let cleanStats = (leagueStats) => {
    let allStats = {};
    for(let team in leagueStats){
        allStats[team] = {};
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
    }
    return statRanks
};

module.exports = statRank;
