const { insertPlayersData, insertMatchData, addTeam, processMatchResult, getResultOfTeams } = require('./service');
const { createTeamsCollection, createMatchesCollection, createPlayersCollection } = require('./db_collections');
const { HttpResponseAndErrorHandling, BadRequest } = require('./common/utilities');
const { MongoClient, ServerApiVersion } = require('mongodb');
const { db_collections } = require('./common/variables');
const { StatusCodes } = require('http-status-codes');
const express = require('express');
const fs = require('fs/promises');
require('dotenv').config();
const Joi = require('joi');
const app = express();

app.use(express.json());

const port = process.env['SERVER_PORT'] || 3000;
// please create a .env file place the credentials for connecting to atlas
const DB_USER = process.env['DB_USER'];
const DB_URL = process.env['DB_URL'];
const DB_NAME = process.env['DB_NAME'] || "task-fantasyCricketApp";
const DB_PWD = encodeURIComponent(process.env['DB_PWD']);


// const uri = `mongodb+srv://${DB_USER}:${DB_PWD}@${DB_URL}/?retryWrites=true&w=majority`;

//local
const uri = `mongodb://127.0.0.1:27017`

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
let db;
async function connectToDB() {
  try {
    await client.connect();
    console.log("You successfully connected to MongoDB!");
    await client.db("admin").command({ ping: 1 });
    db = client.db(DB_NAME);
    const collectionNames = await db.listCollections().toArray();

    const playerCollectionExists = collectionNames.some(collection => collection.name === db_collections.players);
    if (!playerCollectionExists) {
      // await createPlayersCollection(db);
    }
    const matchCollectionExists = collectionNames.some(collection => collection.name === db_collections.matches);
    if (!matchCollectionExists) {
      // await createMatchesCollection(db);
    }
    const teamsCollectionExists = collectionNames.some(collection => collection.name === db_collections.teams);
    if (!teamsCollectionExists) {
      await createTeamsCollection(db);
    }

  } catch (error) {
    console.log("DB connection error:", error);
    throw new Error("DB Connection Error.")
  }
}

app.get('/', async (req, res) => {
  res.send('Hello World!');
});


// app.post('/insertPlayersData', async (req, res, next) => {
//   try {
//     const result = await insertPlayersData(db);
//     res.status(StatusCodes.OK).json(result);
//   } catch (error) {
//     next(error);
//   }
// });

// app.post('/insertMatchData', async (req, res, next) => {
//   try {
//     const { matchName } = req.query;
//     const result = await insertMatchData(db, matchName);
//     res.status(StatusCodes.OK).json(result);
//   } catch (error) {
//     next(error);
//   }
// });

const teamEntrySchema = Joi.object({
  teamName: Joi.string().required(),
  players: Joi.array().items(Joi.string()).unique()
    .min(9).max(9).required()
    .messages({
      'array.unique': 'Player names must be unique'
    }),
  captain: Joi.string().required().custom((value, helpers) => {
    const players = helpers.state.ancestors[0].players;
    if (players.includes(value)) {
      return helpers.message('Captain must not in players');
    }
    return value;
  }),
  viceCaptain: Joi.string().required().custom((value, helpers) => {
    const players = helpers.state.ancestors[0].players;
    const captain = helpers.state.ancestors[0].captain;
    if (captain == value) {
      return helpers.message('Vice captain & Captain should be different');
    }
    if (players.includes(value)) {
      return helpers.message('Vice captain must not in players');
    }
    return value;
  })
});

app.post('/add-team', async (req, res, next) => {
  try {
    const { body } = req;
    if (!body) {
      throw new BadRequest("please give validate team Data.")
    }
    const { error, value } = teamEntrySchema.validate(body);
    if (error) {
      throw new BadRequest(error.details[0].message)
    }
    await addTeam(db, value)
    let responseObj = new HttpResponseAndErrorHandling("successfully added the teams", null, null).getSuccessResponse();
    res.status(StatusCodes.OK).json(responseObj);
  } catch (error) {
    next(error);
  }
});

app.post('/process-result', async (req, res, next) => {
  try {
    const filePath = 'data/match.json';
    await fs.access(filePath)
    const matchData = await fs.readFile( filePath , 'utf-8');
    const parsedMatchData = JSON.parse(matchData);

    if ((!Array.isArray(parsedMatchData)) && (!parsedMatchData.length)) {
      throw new Error("Invalid match data format | no Data");
    }

    await processMatchResult(db, parsedMatchData);
    let responseObj = new HttpResponseAndErrorHandling("successfully computed the results", null, null).getSuccessResponse();
    res.status(StatusCodes.OK).json(responseObj);
  } catch (error) {
    next(error);
  }
});

app.get('/team-result', async (req, res, next) => {
  try {
    const matchName = "RR and CSK 2022"; // can make from query.

    let result = await getResultOfTeams(db, matchName);
    let responseObj = new HttpResponseAndErrorHandling("successfully fetch the team results", result, null).getSuccessResponse();
    res.json(responseObj);
  } catch (error) {
    next(error);
  }
});


app.use((error, req, res, next) => {
  console.error("Error:", error);
  const statusCode = error instanceof BadRequest ? StatusCodes.BAD_REQUEST : StatusCodes.INTERNAL_SERVER_ERROR;
  let responseObj = new HttpResponseAndErrorHandling(error.message, null, error).getErrorResponse();
  res.status(statusCode).json(responseObj);
});



app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});

connectToDB();