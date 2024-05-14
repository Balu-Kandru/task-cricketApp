const db_collections = {
    players : "players",
    matches : "matches",
    teams: "teams",
}

const matchStatus = {
    completed: true,
    pending: false
}

const scoreBonus = {
    captain: 2,
    viceCaptain: 1.5
}

const defaultValues = {
    zero: 0
}

const points_system = {
    BOWLER_ROLE: "BOWLER",
    FOR_DUCK_MINUS_BY: 2,
    SIXTH_BALL: 6,
    OVER_COUNT_ZERO: 0,
    MAIDEN_FORSCORE: 12,
    CAUGHT_BONUS_AT: 3,
    WICKET_BONUS_3: 4,
    WICKET_BONUS_4: 8,
    WICKET_BONUS_5: 16,
    WICKET_SCORE: 25,
    STUMP_SCORE: 12,
    LBW_BOWLED_BONUS: 8,
    CATCH_SCORE: 8,
    THREE_CATCH_BONUS: 4,
    RUN_OUT_SCORE: 6,
    CATCH_AND_BOWL_BONUS: 8 + 8,
    WICKET_KIND_SCORES: {
      lbw: { role: "BOWLER", score: "LBW_BOWLED_BONUS" },
      bowled: { role: "BOWLER", score: "LBW_BOWLED_BONUS" },
      caught: { role: "FIELDER", score: "CATCH_SCORE", bonus: "THREE_CATCH_BONUS" },
      "caught and bowled": { role: "BOWLER", score: "CATCH_AND_BOWL_BONUS" },
      stump: { role: "FIELDER", score: "STUMP_SCORE" },
      "run out": { role: "FIELDER", score: "RUN_OUT_SCORE" }
    },
    BATTING_POINTS: {
      4: { score: 1 },
      6: { score: 2 },
      30: { bonus: 4 },
      50: { bonus: 8 },
      100: { bonus: 16 },
    }
  };

module.exports = { 
    db_collections,
    matchStatus,
    scoreBonus,
    points_system,
    defaultValues
};