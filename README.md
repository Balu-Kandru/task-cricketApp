## Fantasy Cricket API

### Task

Developeed a **backend** for a fantasy cricket app using **Node.js** with **Express** and **MongoDB**.

### Tech Stack
- **Node.js with Express**
- **MongoDB**

---

## Data

### Players
- CSV and JSON files under the `data` folder contain a list of players for **RR** and **CSK** (2022).
- These players can be selected for **team entries**.

### Match
- CSV and JSON files under the `data` folder contain **ball-by-ball** results of the **RR vs CSK 2022** match.
- These results should be used for **point calculation** and **team ranking**.

---

## Rules

### Team Selection
- A **team must have 11 players**.
- A **maximum of 10 players** can be selected from any **one team**.

| Player Type      | Min | Max |
|-----------------|-----|-----|
| Wicket Keeper (WK)  | 1   | 8   |
| Batter (BAT)        | 1   | 8   |
| All-Rounder (AR)    | 1   | 8   |
| Bowler (BWL)        | 1   | 8   |

- **Captain:** Scores **2x** their match points.
- **Vice-Captain:** Scores **1.5x** their match points.

### Scoring System

#### Batting Points
| Event | Points |
|--------|---------|
| Run | +1 |
| Boundary Bonus | +1 |
| Six Bonus | +2 |
| 30 Run Bonus | +4 |
| Half-century Bonus | +8 |
| Century Bonus | +16 |
| Dismissal for a Duck (BAT, WK, AR) | -2 |

#### Bowling Points
| Event | Points |
|--------|---------|
| Wicket (Excl. Run Out) | +25 |
| Bonus (LBW/Bowled) | +8 |
| 3 Wicket Bonus | +4 |
| 4 Wicket Bonus | +8 |
| 5 Wicket Bonus | +16 |
| Maiden Over | +12 |

#### Fielding Points
| Event | Points |
|--------|---------|
| Catch | +8 |
| 3 Catch Bonus | +4 |
| Stumping | +12 |
| Run Out | +6 |

---

## Endpoints

### 1️⃣ Add Team Entry - `/add-team` (POST)
- Submit a new team entry.
- Validate **player selection rules**.

```bash
POST http://localhost:3000/add-team
```
#### Request Payload:
```json
{
    "teamName": "yellow-team",
    "players": ["SO Hetmyer", "Ravindra Jadeja", "Deepak Chahar"],
    "captain": "MS Dhoni",
    "viceCaptain": "SV Samson"
}
```

### 2️⃣ Process Match Result - `/process-result` (POST)
- Calculate points for players based on **match.json** results.
- Assign scores to teams accordingly.
- **No input parameters** required.

```bash
POST http://localhost:3000/process-result


### 3️⃣ View Team Results - `/team-result` (GET)
- Get a **list of all team entries** with their calculated points.
- Show the **winner** (or multiple winners if tied).
- **No input parameters** required.

```bash
GET http://localhost:3000/team-result
```

---

## Development

### Run in Watch Mode
```bash
npm run dev
```

### Database Connection (MongoDB Atlas)
Create a `.env` file with:
```env
DB_USER=
DB_PWD=
DB_URL=
DB_NAME=task-fantasyCricketApp
SERVER_PORT=3000
```
