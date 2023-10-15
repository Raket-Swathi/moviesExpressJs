const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const dbPath = path.join(__dirname, "cricketTeam.db");
const app = express();
app.use(express.json());

let db = null;
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () =>
      console.log("Server Running at http://localhost:3000/")
    );
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();
const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

app.get("/players/", async (request, response) => {
  const getPlayersQuery = `
  SELECT
    *
    FROM
    cricket_team;`;
  const playersArray = await db.all(getPlayersQuery);
  response.send(
    playersArray.map((eachPlayer) =>
      convertDbObjectToResponseObject(eachPlayer)
    )
  );
});
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerQuery = `SELECT
    *
    FROM
    cricket_team
    WHERE
    player_id=${playerId};`;
  const player = await database.get(getPlayerQuery);
  response.send(convertDbObjectToResponseObject(player));
});

app.post("/players/", async (response, request) => {
  const addNewPlayer = request.body;
  const { playerName, jerseyNumber, role } = addNewPlayer;
  const addPlayer = `
   INSERT INTO
   cricket_team (player_name,jersey_number,role)
   values 
   ('${playerName}', ${jerseyNumber}, '${role}');`;

  const dbResponse = await db.run(addPlayer);
  const playerId = dbResponse.lastID;
  response.send("Player Added to Team");
});

app.put("/players/:playerId/", async (request, response) => {
  const { playerName, jerseyNumber, role } = request.body;
  const { playerId } = request.params;
  const updatePlayerQuery = `UPDATE
    cricket_team
    SET
    player_name='${playerName}',
    jersey_number=${jerseyNumber},
    role='${role}'
    WHERE
    player_id=${playerId};`;
  await database.run(updatePlayerQuery);
  response.send("Player Details Updated");
});

app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayerQuery = `
    DELETE FROM
    cricket_team
    WHERE
    player_id=${playerId};`;
  await database.run(deletePlayerQuery);
  response.send("Player Removed");
});

module.exports = app;
