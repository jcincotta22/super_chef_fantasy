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

let statRank = (leagueStats) => {
    let allStats = cleanStats(leagueStats);
    let statList = [];
    let sortedStatRanks = {};
    let count = 0;
    for(let team in allStats){
        if(count == 0){
            leagueStats[team].forEach((stats) => {
                statList.push(stats.stat.stat_id);
                sortedStatRanks[stats.stat.stat_id] = [];
            });
        }
        count++;
        statList.forEach((stat) => {
            let statObj = {};
            statObj[team] = allStats[team][stat];
            let statClone = _.cloneDeep(statObj);
            sortedStatRanks[stat].push(statClone);
        })
    }

    // for(let team in allStats) {
    //     for(let stat in sortedStatRanks) {
    //         sortedStatRanks[stat] = sortedStatRanks[stat].sort((a, b) => {
    //             a[team] - b[team];
    //         });
    //     }
    // }
    return sortedStatRanks
};

module.exports = statRank;
