const { db_collections } = require('./common/variables');

async function createPlayersCollection(db) {
    await db.createCollection(db_collections.players, {
        validator: {
            $jsonSchema: {
                bsonType: "object",
                required: ["Player", "Team", "Role"],
                properties: {
                    Player: {
                        bsonType: "string",
                        description: "Players must be a string."
                    },
                    Team: {
                        bsonType: "string",
                        description: "Team must be a string."
                    },
                    Role: {
                        bsonType: "string",
                        description: "Role must be a string."
                    }
                }
            }
        },
        validationLevel: "strict"
    });
}

async function createMatchesCollection(db) {
    await db.createCollection(db_collections.matches, {
        validator: {
            $jsonSchema: {
                bsonType: "object",
                required: ["name", "scoredCalculated", "commentary"],
                properties: {
                    name: {
                        bsonType: "string",
                        description: "name must be a string."
                    },
                    scoredCalculated: {
                        bsonType: "bool",
                        description: "scoredCalculated must be a boolean."
                    },
                    commentary: {
                        bsonType: "array",
                        description: "commentary must be an array of objects.",
                        items: {
                            bsonType: "object",
                            required: ["ID", "innings", "overs", "ballnumber", "batter", "bowler", "non-striker", "extra_type", "batsman_run", "extras_run", "total_run", "non_boundary", "isWicketDelivery", "player_out", "kind", "fielders_involved", "BattingTeam"],
                            properties: {
                                ID: { bsonType: "int", description: "ID must be an integer." },
                                innings: { bsonType: "int", description: "innings must be an integer." },
                                overs: { bsonType: "int", description: "overs must be an integer." },
                                ballnumber: { bsonType: "int", description: "ballnumber must be an integer." },
                                batter: { bsonType: "string", description: "batter must be a string." },
                                bowler: { bsonType: "string", description: "bowler must be a string." },
                                "non-striker": { bsonType: "string", description: "non-striker must be a string." },
                                extra_type: { bsonType: "string", description: "extra_type must be a string." },
                                batsman_run: { bsonType: "int", description: "batsman_run must be an integer." },
                                extras_run: { bsonType: "int", description: "extras_run must be an integer." },
                                total_run: { bsonType: "int", description: "total_run must be an integer." },
                                non_boundary: { bsonType: "int", description: "non_boundary must be an integer." },
                                isWicketDelivery: { bsonType: "int", description: "isWicketDelivery must be an integer." },
                                player_out: { bsonType: "string", description: "player_out must be a string." },
                                kind: { bsonType: "string", description: "kind must be a string." },
                                fielders_involved: { bsonType: "string", description: "fielders_involved must be a string." },
                                BattingTeam: { bsonType: "string", description: "BattingTeam must be a string." }
                            }
                        }
                    }
                }
            }
        },
        validationLevel: "strict"
    });
}

async function createTeamsCollection(db) {
    await db.createCollection(db_collections.teams, {
        validator: {
          $jsonSchema: {
            bsonType: "object",
            required: ["name", "matchName", "totalScore", "players", "captain", "viceCaptain"],
            properties: {
              name: {
                bsonType: "string",
                description: "name must be a string."
              },
              matchName: {
                bsonType: "string",
                description: "match mame must be a string."
              },
              totalScore: {
                oneOf: [
                  { bsonType: "int", description: "total score must be an integer." },
                  { bsonType: "double", description: "total score must be a decimal." }
                ]
              },
              captain: {
                bsonType: "object",
                description: "Captain must be a object.",
                properties: {
                  name: { bsonType: "string", description: "Name of the captain." },
                  scored: { bsonType: "int", description: "Scored points by the captain." }
                }
              },
              viceCaptain: {
                bsonType: "object",
                description: "Vice-Captain must be a object.",
                properties: {
                  name: { bsonType: "string", description: "Name of the vice-captain." },
                  scored: {
                    oneOf: [
                      { bsonType: "int", description: "scored points by the vice-captain as integer." },
                      { bsonType: "double", description: "scored points by the vice-captain as decimal." }
                    ]
                  }
                }
              },
              players: {
                bsonType: "array",
                description: "players must be an array of objects.",
                items: {
                  bsonType: "object",
                  required: ["name", "scored"],
                  properties: {
                    name: { bsonType: "string", description: "player's name." },
                    scored: { bsonType: "int", description: "Scored points by the player." },
                  }
                }
              }
            }
          }
        },
        validationLevel: "strict"
      });
}

module.exports = {
    createPlayersCollection,
    createMatchesCollection,
    createTeamsCollection
};
