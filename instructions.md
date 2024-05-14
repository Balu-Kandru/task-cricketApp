# npm run dev 
    for using nodemon (watch mode)

# DB

    for connecting to atlas create a env file with
        DB_USER=
        DB_PWD=
        DB_URL=
        DB_NAME=task-fantasyCricketApp
        SERVER_PORT=3000


## API

# 1.endpoint: localhost:3000/add-team
  method: POST
  payload:
    {
        "teamName": "yellow-team",
        "players": [
            "SO Hetmyer",
            "Ravindra Jadeja",
            "Deepak Chahar",
            "Dwayne Bravo",
            "DP Conway",
            "Simarjeet Singh",
            "PH Solanki",
            "Shivam Dube",
            "Kuldip Yadav"
        ],
        "captain": "MS Dhoni",
        "viceCaptain": "SV Samson"
    }

# 2.endpoint: localhost:3000/process-result
  method: POST
  payload: --empty

# 3.endpoint: localhost:3000/team-result
  method: GET
  payload: --empty
