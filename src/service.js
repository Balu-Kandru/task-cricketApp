const { BadRequest } = require("./common/utilities");
const { db_collections, points_system, scoreBonus, defaultValues } = require("./common/variables");
const { ObjectId } = require('mongodb');
const fs = require('fs/promises');

async function insertPlayersData(db) {
  try {
    const playerData = await fs.readFile('data/players.json', 'utf-8');
    const parsedPlayersData = JSON.parse(playerData);
    console.log("Players count:", parsedPlayersData.length);
    await db.collection(db_collections.players).insertMany(parsedPlayersData);
    let responseObj = new HttpResponseAndErrorHandling("Players data inserted successfully", parsedPlayersData, null).getSuccessResponse();
    return responseObj;
  } catch (error) {
    throw error;
  }
}

async function insertMatchData(matchName, db) {
  try {
    const matchData = await fs.readFile('data/match.json', 'utf-8');
    const parsedMatchData = JSON.parse(matchData);
    const obj = {
      name: matchName,
      commentary: parsedMatchData,
      scoredCalculated: matchStatus.pending
    };
    await db.collection(db_collections.matches).insertOne(obj);
    let responseObj = new HttpResponseAndErrorHandling("Match data inserted successfully", parsedMatchData, null).getSuccessResponse();
    return responseObj;
  } catch (error) {
    throw error;
  }
}

async function checkingThePlayersListPresentInDB(db, team) {
  try {
    let playerNamesOfUser = [...team.players, team.captain, team.viceCaptain];
    const filePath = 'data/players.json';
    await fs.access(filePath)
    const matchData = await fs.readFile(filePath , 'utf-8');
    const parsedMatchData = JSON.parse(matchData);

    const playersDataFromDB = parsedMatchData.filter(player => playerNamesOfUser.includes(player.Player));

    // let playersDataFromDB = await db.collection(db_collections.players).aggregate([
    //   { $match: { "Player": { $in: playerNamesOfUser } } }
    // ]).toArray();


    if (!(playersDataFromDB.length === 11)) {
      const invalidPlayers = playerNamesOfUser.filter(player => !playersDataFromDB.some(p => p.Player === player));
      throw new BadRequest(`Invalid players: ${invalidPlayers.join(', ')}`);
    };
    return playersDataFromDB;
  } catch (error) {
    throw error;
  }
}

async function validatingTheMembers(playersDataFromDB) {
  try {
    const teamCount = playersDataFromDB.reduce((acc, curr) => {
      acc[curr.Team] = acc[curr.Team] ? acc[curr.Team] + 1 : 1;
      return acc
    }, {});

    if (Object.keys(teamCount).length > 2) {
      const error = new BadRequest("Something went wrong.");
      error.name = "unknown team";
      error.extraData = { teams: teamCount };
      throw error;
    }

    const maxTeamRepresentationExceeded = Object.values(teamCount).some(count => count > 10);
    if (maxTeamRepresentationExceeded) {
      const error = new BadRequest("maximum team representation exceeded (max: 10)");
      error.extraData = { teams: teamCount };
      throw error;
    }
  } catch (error) {
    throw error;
  }
}

async function checkingRolesMaxNMin(playersDataFromDB) {
  try {
    let roleCount = playersDataFromDB.reduce((acc, curr) => {
      acc[curr.Role] = acc[curr.Role] ? acc[curr.Role] + 1 : 1;
      return acc
    }, {
      "BOWLER": 0,
      "ALL-ROUNDER": 0,
      "BATTER": 0,
      "WICKETKEEPER": 0
    })

    const invalidRoles = Object.entries(roleCount).filter(([role, count]) => {
      return count < 1 || count > 8;
    });

    if (invalidRoles.length > 0) {
      const errors = invalidRoles.map(([role, count]) => `${role}: ${count}`);
      throw new BadRequest(`Invalid player counts (min 1, max 8): ${errors.join(', ')}`);
    }
  } catch (error) {
    throw error;
  }
}

async function validationsWithDB(db, teamEntry) {
  try {
    let playersDataFromDB = await checkingThePlayersListPresentInDB(db, teamEntry);
    await validatingTheMembers(playersDataFromDB);
    await checkingRolesMaxNMin(playersDataFromDB);
  } catch (error) {
    throw error;
  }
}

async function structureTheData(payload) {
  try {
    const structuredData = {
      name: payload.teamName,
      matchName: 'RR and CSK 2022', //can change by taking matchId from body 
      totalScore: 0,
      captain: {
        name: payload.captain,
        scored: 0
      },
      viceCaptain: {
        name: payload.viceCaptain,
        scored: 0
      },
      players: payload.players.map(player => ({
        name: player,
        scored: 0
      }))
    };
    return structuredData;
  } catch (error) {
    throw error;
  }
}

async function addTeam(db, payload) {
  try {
    await validationsWithDB(db, payload);
    const structuredData = await structureTheData(payload);
    const insertedData = await db.collection(db_collections.teams).insertOne(structuredData);
    return insertedData;
  } catch (error) {
    throw error;
  }
}

const calculateMaidenBonus = (runsConceded) => {
  const bonusPoints = {
    0: 12
  };
  return bonusPoints[runsConceded] || 0;
};

async function calculateScore(db, parsedMatchData) {
  try {
    const bowlers = await db.collection(db_collections.players).find({ Role: points_system.BOWLER_ROLE }).toArray();
    const bowlerSet = new Set(bowlers.map(bowler => bowler.Player));

    const commonObj = {
      totalScore: 0,
      caughtCount: 0,
      wicketCount: 0,
    };

    let overCount = points_system.OVER_COUNT_ZERO;

    const playerStats = parsedMatchData.reduce((acc, curr) => {
      const batter = curr.batter;
      const bowler = curr.bowler;
      const fielder = curr.fielders_involved;
      const outPlayer = curr.player_out;

      acc[batter] = acc[batter] || { ...commonObj };
      acc[bowler] = acc[bowler] || { ...commonObj };
      if (fielder !== "NA") {
        acc[fielder] = acc[fielder] || { ...commonObj };
      }

      overCount += curr.total_run;
      if (curr.ballnumber === points_system.SIXTH_BALL) {
        acc[bowler].totalScore += calculateMaidenBonus(overCount);
        overCount = points_system.OVER_COUNT_ZERO;
      }

      const score = curr.batsman_run;
      if (score) {
        acc[batter].totalScore += score;
        const battingPoints = points_system.BATTING_POINTS[score];
        if (battingPoints && battingPoints.score) {
          acc[batter].totalScore += battingPoints.score;
        }
        const totalScore = acc[batter].totalScore;
        const battingBonus = points_system.BATTING_POINTS[totalScore];
        if (battingBonus && battingBonus.bonus) {
          acc[batter].totalScore += battingBonus.bonus;
        }
      }

      if (curr.isWicketDelivery) {
        acc[bowler].wicketCount++;

        if (acc[outPlayer].totalScore <= points_system.OVER_COUNT_ZERO && !bowlerSet.has(outPlayer)) {
          acc[outPlayer].totalScore -= points_system.DUCK;
        }

        const kind = curr.kind;
        const wicket = points_system.WICKET_KIND_SCORES[kind];
        if (wicket) {
          const role = wicket.role;
          const scoreKey = wicket.score;
          const bonusKey = wicket.bonus;

          if (kind !== "run out") {
            acc[bowler].totalScore += points_system.WICKET_SCORE;
          }

          acc[role === "BOWLER" ? bowler : fielder].totalScore += points_system[scoreKey];

          if (role === "FIELDER" && bonusKey) {
            acc[fielder].caughtCount += 1;
            if (acc[fielder].caughtCount === points_system.CAUGHT_BONUS_AT) {
              acc[fielder].totalScore += points_system[bonusKey];
            }
          }
        }

        const wicketBonus = points_system[`WICKET_BONUS_${acc[bowler].wicketCount}`];
        if (wicketBonus) {
          acc[bowler].totalScore += wicketBonus;
        }
      }
      return acc;
    }, {});
    return playerStats;
  } catch (error) {
    throw new Error(`Error occured while processing match result: ${error.message}`);
  }
};

async function assignToUsers(db, playerStats) {
  try {
    // can be taken from query.
    const matchName = "RR and CSK 2022";

    const participatedTeams = await db.collection(db_collections.teams).find({ matchName: matchName }).toArray();

    if (!participatedTeams.length) {
      throw new BadRequest("No teams participated.")
    }

    const updateList = [];
    for (let team of participatedTeams) {
      let totalScore = defaultValues.zero;
      for (let player of team.players) {
        const playerName = player.name;
        let playerScore = playerStats[playerName] ? playerStats[playerName].totalScore : defaultValues.zero;
        totalScore += playerScore;
        player.scored = playerScore;
      }
      let captainName = team.captain.name;
      let captainScore = playerStats[captainName] ? (playerStats[captainName].totalScore * scoreBonus.captain) : defaultValues.zero;
      team.captain.scored = captainScore;
      totalScore += captainScore;

      let viceCaptainName = team.viceCaptain.name;
      let viceCaptainScore = playerStats[viceCaptainName] ? (playerStats[viceCaptainName].totalScore * scoreBonus.viceCaptain) : defaultValues.zero;
      team.viceCaptain.scored = viceCaptainScore;
      totalScore += viceCaptainScore;

      team.totalScore = totalScore

      updateList.push({
        updateOne: {
          filter: { _id: new ObjectId(team._id) },
          update: {
            $set: {
              totalScore: team.totalScore,
              players: team.players,
              captain: team.captain,
              viceCaptain: team.viceCaptain
            }
          }
        }
      });
    }
    if (updateList.length > 0) {
      await db.collection(db_collections.teams).bulkWrite(updateList);
    }
    // return participatedTeams;
  } catch (error) {
    throw error;
  }
}

async function processMatchResult(db, matchDataJSON) {
  try {
    let playerStats = await calculateScore(db, matchDataJSON);
    await assignToUsers(db, playerStats);
  } catch (error) {
    throw error;
  }
}

async function getResultOfTeams(db, matchName) {
  try {
    const participatedTeams = await db.collection(db_collections.teams)
      .find({ matchName: matchName })
      .project({ name: 1, totalScore: 1, _id: 0 })
      .sort({ totalScore: -1 })
      .toArray();

    if (!participatedTeams.length) {
      throw new BadRequest("No teams participated.")
    }

    const highestScore = participatedTeams[0].totalScore;
    if(!highestScore){
      throw new BadRequest("No winner / scored not calculated")
    }
    const winningTeams = participatedTeams.filter(team => team.totalScore === highestScore);
    let runnerups = participatedTeams.filter(team => !winningTeams.includes(team))
    return { winningTeams, runnerups };
  } catch (error) {
    throw error;
  }
}


module.exports = {
  insertPlayersData,
  insertMatchData,
  addTeam,
  processMatchResult,
  getResultOfTeams
};