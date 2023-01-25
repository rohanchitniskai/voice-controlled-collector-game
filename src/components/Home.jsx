import { useState, useRef, useEffect } from "react";
import AudioCaptureStreamingService from "../services/audio-services";
import { fetchWebsocketUrl } from "../services/microphone-service";
import "./Home.css";

const Home = () => {
  /* state to set grid */
  const [grid, setGrid] = useState();
  const [gridRows, setGridRows] = useState(10);
  const [gridCols, setGridCols] = useState(10);

  /* collector speed default set to 1000ms */
  const [collectorSpeed, setCollectorSpeed] = useState(1000);

  /* state to set collector direction */
  const [collectorPosition, setCollectorPosition] = useState("left");

  /* voice command state */
  const [collectorCommand, setCollectorCommand] = useState(collectorPosition);

  /* state to set collector co-ordinates in grid */
  const [collectorCoordinates, setCollectorCoordinates] = useState({
    xCord: 0,
    yCord: 5,
  });

  // The state for our timer
  const [timer, setTimer] = useState("00:00:00");
  const [score, setScore] = useState([]);

  /* running state of a grid simulation */
  const [running, setRunning] = useState(false);
  const runningRef = useRef(running);
  runningRef.current = running;
  let timeOutId = null;
  const positionRef = useRef(collectorPosition);
  let scoreBoard = [];
  let scoreboardTime = {};

  const timerRef = useRef(null);
  const [connection, setConnection] = useState(false);

  useEffect(() => {
    /* initialize the grid */
    setGrid(initializeGrid());
  }, [gridRows, gridCols]);

  /* initialize the grid with collector position */
  const initializeGrid = () => {
    const xCord = 0;
    const yCord = 5;
    const rows = [];
    for (let i = 0; i < gridRows; i++) {
      rows.push(
        Array.from(Array(gridCols), (ele, colIndex) =>
          i === xCord && colIndex === yCord ? 2 : 0
        )
      );
    }
    return initializeMines(rows);
  };

  /* initialize the grid with mines 1/8th of the grid spots */
  const initializeMines = (rows) => {
    const numberOfMines = parseInt((gridRows * gridCols) / 8);
    let minesCount = 0;
    /* populate mines at random positions */
    while (minesCount < numberOfMines) {
      const x = Math.floor(Math.random() * rows.length);
      const y = Math.floor(Math.random() * rows[0].length);
      if (rows[x][y] === 0) {
        rows[x][y] = 1;
        minesCount++;
      }
    }
    return rows;
  };

  /*call methods if position changes */
  useEffect(() => {
    if (collectorPosition === "right") {
      moveCollectorRight();
    } else if (collectorPosition === "left") {
      moveCollectorLeft();
    } else if (collectorPosition === "down") {
      moveCollectorBottom();
    } else if (collectorPosition === "up") {
      moveCollectorTop();
    } else {
      moveCollectorRight();
    }
  }, [collectorPosition]);

  /* check voice command change */
  useEffect(() => {
    if (collectorCommand === "go" || collectorCommand === "stop") {
      if (collectorCommand === "stop") {
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      }
      startGame();
    }
  }, [collectorCommand]);

  /* set collector direction on UI */
  const getCollectorDirection = () => {
    return collectorPosition === "right" ? (
      <span className="collector-icon">&#8594;</span>
    ) : collectorPosition === "left" ? (
      <span className="collector-icon">&#8592;</span>
    ) : collectorPosition === "up" ? (
      <span className="collector-icon">&#8593;</span>
    ) : collectorPosition === "down" ? (
      <span className="collector-icon">&#8595;</span>
    ) : (
      <span>&#8594;</span>
    );
  };

  /* function to start game */
  const startGame = () => {
    setRunning(!running);
    if (!running) {
      if (!timerRef.current) startTimer();
      runningRef.current = true;
      // Ref.current = id;
      if (collectorPosition === "right") {
        moveCollectorRight();
      } else if (collectorPosition === "left") {
        moveCollectorLeft();
      } else if (collectorPosition === "down") {
        moveCollectorBottom();
      } else if (collectorPosition === "top") {
        moveCollectorTop();
      } else {
        moveCollectorRight();
      }
    }
  };

  /* reset game  */
  const restart = () => {
    // setRunning(false);
    setCollectorCommand("stop");
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setTimer("00:00:00");
    scoreboardTime = {};
    // /* initialize the grid */
    setTimeout(() => {
      setCollectorCoordinates({
        xCord: 0,
        yCord: 5,
      });
      setGrid(initializeGrid());
    }, 1000);
    setCollectorPosition("left");
  };

  /* start timer */
  const startTimer = () => {
    const startTime = new Date();
    timerRef.current = setInterval(() => {
      const timers = getElapsedTime(startTime);
      setTimer(timers.time);
      scoreboardTime = { time: timers.time, timestamp: timers.timestamp };
    }, 1000);
  };

  /* get time elapsed */
  const getElapsedTime = (startTime) => {
    let endTime = new Date();
    let timeDiff = endTime.getTime() - startTime.getTime();
    const timestamp = timeDiff;

    timeDiff = timeDiff / 1000;
    let seconds = Math.floor(timeDiff % 60);
    let secondsAsString = seconds < 10 ? "0" + seconds : seconds + "";
    timeDiff = Math.floor(timeDiff / 60);
    let minutes = timeDiff % 60;
    let minutesAsString = minutes < 10 ? "0" + minutes : minutes + "";
    timeDiff = Math.floor(timeDiff / 60);
    let hours = timeDiff % 24;
    timeDiff = Math.floor(timeDiff / 24);
    let days = timeDiff;

    let totalHours = hours + days * 24; // add days to hours
    let totalHoursAsString =
      totalHours < 10 ? "0" + totalHours : totalHours + "";

    if (totalHoursAsString === "00") {
      return {
        time: "00" + ":" + minutesAsString + ":" + secondsAsString,
        timestamp: timestamp,
      };
    } else {
      return {
        time:
          totalHoursAsString + ":" + minutesAsString + ":" + secondsAsString,
        timestamp: timestamp,
      };
    }
  };

  /* move collector right on the grid */
  const moveCollectorRight = async () => {
    positionRef.current = "right";
    if (runningRef.current && collectorPosition === "right") {
      let gridCopy = JSON.parse(JSON.stringify(grid));
      /* traverse grid left to right */
      let y = collectorCoordinates.yCord;
      for (let i = collectorCoordinates.xCord; i < gridRows; i++) {
        for (let j = y; j < gridCols; j++) {
          /* stop loop if running state change or direction changes  */
          if (!runningRef.current || positionRef.current !== "right") {
            setCollectorPosition(positionRef.current);
            clearTimeout(timeOutId);
            return;
          }
          await moveCollectorRightPosition(i, j, gridCopy);
          setGrid(JSON.parse(JSON.stringify(gridCopy)));
        }
        y = 0;
      }
    } else if (!runningRef.current) {
      setCollectorPosition(positionRef.current);
    }
  };

  /* move collector left on the grid */
  const moveCollectorLeft = async () => {
    positionRef.current = "left";
    if (runningRef.current && collectorPosition === "left") {
      let gridCopy = JSON.parse(JSON.stringify(grid));
      /* traverse grid right to left */
      let y = collectorCoordinates.yCord;
      for (let i = collectorCoordinates.xCord; i < gridRows; i++) {
        for (let j = y; j >= 0; j--) {
          /* stop loop if running state change or direction changes  */
          if (!runningRef.current || positionRef.current !== "left") {
            setCollectorPosition(positionRef.current);
            clearTimeout(timeOutId);
            return;
          }
          await runCollectorLeftPosition(i, j, gridCopy);
          setGrid(JSON.parse(JSON.stringify(gridCopy)));
        }
        y = gridCols - 1;
      }
    } else if (!runningRef.current) {
      setCollectorPosition(positionRef.current);
    }
  };

  /* move collector down on the grid */
  const moveCollectorBottom = async () => {
    positionRef.current = "down";
    if (runningRef.current && collectorPosition === "down") {
      let gridCopy = JSON.parse(JSON.stringify(grid));
      /* traverse grid top to down */
      let y = collectorCoordinates.xCord;
      for (let i = collectorCoordinates.yCord; i < gridCols; i++) {
        for (let j = y; j < gridRows; j++) {
          /* stop loop if running state change or direction changes  */
          if (!runningRef.current || positionRef.current !== "down") {
            setCollectorPosition(positionRef.current);
            clearTimeout(timeOutId);
            return;
          }
          await runCollectorBottomPosition(i, j, gridCopy);
          setGrid(JSON.parse(JSON.stringify(gridCopy)));
        }
        y = 0;
      }
    } else if (!runningRef.current) {
      setCollectorPosition(positionRef.current);
    }
  };

  /* move collector up on the grid */
  const moveCollectorTop = async () => {
    positionRef.current = "up";
    if (runningRef.current && collectorPosition === "up") {
      let gridCopy = JSON.parse(JSON.stringify(grid));
      /* traverse grid bottom to up */
      let y = collectorCoordinates.xCord;
      for (let i = collectorCoordinates.yCord; i >= 0; i--) {
        for (let j = y; j >= 0; j--) {
          /* stop loop if running state change or direction changes  */
          if (!runningRef.current || positionRef.current !== "up") {
            setCollectorPosition(positionRef.current);
            clearTimeout(timeOutId);
            return;
          }
          await runCollectorTopPosition(i, j, gridCopy);
          setGrid(JSON.parse(JSON.stringify(gridCopy)));
        }
        y = gridCols - 1;
      }
    } else if (!runningRef.current) {
      setCollectorPosition(positionRef.current);
    }
  };

  /* reset values of visited cells of the grid moving right direction*/
  const moveCollectorRightPosition = (i, j, gridCopy) => {
    return new Promise(function (resolve) {
      timeOutId = setTimeout(function () {
        /* check boundary*/
        if (i < 0 || j < 0 || i >= gridRows || j >= gridCols) {
        } else {
          if (j - 1 >= 0) {
            if (gridCopy[i][j - 1] !== 1) gridCopy[i][j - 1] = 0;
            /* change value of cell visited 1 to 0 i.e. mine picked */
            if (gridCopy[i][j] === 1) {
              gridCopy[i][j] = 0;
              getMinesCount(gridCopy);
            }
          } else {
            if (i - 1 >= 0) gridCopy[i - 1][gridCols - 1] = 0;
          }
          gridCopy[i][j] = 2;

          /* set updated position of collector */
          setCollectorCoordinates({
            xCord: i,
            yCord: j,
          });
        }
        resolve(gridCopy);
      }, collectorSpeed);
    });
  };

  /* reset values of visited cells of the grid moving left direction*/
  const runCollectorLeftPosition = (i, j, gridCopy) => {
    return new Promise(function (resolve) {
      timeOutId = setTimeout(function () {
        /* check boundary*/
        if (i < 0 || j < 0 || i >= gridRows || j >= gridCols) {
        } else {
          if (j + 1 < gridCols) {
            if (gridCopy[i][j + 1] !== 1) gridCopy[i][j + 1] = 0;
            /* change value of cell visited 1 to 0 i.e. mine picked */
            if (gridCopy[i][j] === 1) {
              gridCopy[i][j] = 0;

              getMinesCount(gridCopy);
            }
          } else if (i - 1 >= 0) {
            gridCopy[i - 1][0] = 0;
          }
          gridCopy[i][j] = 2;
          /* set updated position of collector */
          setCollectorCoordinates({
            ...collectorCoordinates,
            xCord: i,
            yCord: j,
          });
        }
        resolve(gridCopy);
      }, collectorSpeed);
    });
  };

  /* reset values of visited cells of the grid moving up direction*/
  const runCollectorTopPosition = (i, j, gridCopy) => {
    return new Promise(function (resolve) {
      timeOutId = setTimeout(function () {
        if (i < 0 || j < 0 || i >= gridCols || j >= gridRows) {
        } else {
          if (j + 1 < gridRows) {
            if (gridCopy[j + 1][i] !== 1) gridCopy[j + 1][i] = 0;
            /* change value of cell visited 1 to 0 i.e. mine picked */
            if (gridCopy[j][i] === 1) {
              gridCopy[j][i] = 0;
              getMinesCount(gridCopy);
            }
          } else if (i + 1 < gridCols) {
            gridCopy[0][i + 1] = 0;
          }
          gridCopy[j][i] = 2;
          /* set updated position of collector */
          setCollectorCoordinates({
            ...collectorCoordinates,
            xCord: j,
            yCord: i,
          });
        }
        resolve(gridCopy);
      }, collectorSpeed);
    });
  };

  /* reset values of visited cells of the grid moving bottom direction*/
  const runCollectorBottomPosition = (i, j, gridCopy) => {
    return new Promise(function (resolve) {
      timeOutId = setTimeout(function () {
        if (i < 0 || j < 0 || i >= gridCols || j >= gridRows) {
        } else {
          if (j - 1 >= 0) {
            if (gridCopy[j - 1][i] !== 1) gridCopy[j - 1][i] = 0;
            /* change value of cell visited 1 to 0 i.e. mine picked */
            if (gridCopy[j][i] === 1) {
              gridCopy[j][i] = 0;
              getMinesCount(gridCopy);
            }
          } else {
            if (i - 1 >= 0) gridCopy[gridRows - 1][i - 1] = 0;
          }
          gridCopy[j][i] = 2;
          /* set updated position of collector */
          setCollectorCoordinates({
            xCord: j,
            yCord: i,
          });
        }
        resolve(gridCopy);
      }, collectorSpeed);
    });
  };

  /* connect to web socket */
  const connectWebsocket = async () => {
    const { websocketSendUrl, websocketReceiveUrl } = await fetchWebsocketUrl();
    startMicrophoneCapture(websocketSendUrl, websocketReceiveUrl);
  };

  //Start audio capturing services using microphone input
  const startMicrophoneCapture = (websocketSendUrl, websocketReceiveUrl) => {
    AudioCaptureStreamingService.start(websocketSendUrl);
    let websocket;
    //Connect to websocket to receive result data
    if (websocket === undefined) {
      const socket = new WebSocket(websocketReceiveUrl);
      socket.onopen = () => {
        setConnection(true);
        console.log("Websocket is connected");
        socket.addEventListener("message", (event) => {
          let currentDate = new Date();
          console.log(
            "At " + currentDate + " Websocket message: " + event.data
          );
          const jsonData = JSON.parse(event.data);
          interpretGrammarMessage(jsonData);
        });

        //Resets text box highlight on websocket close
        socket.addEventListener("close", () => {
          console.log("Websocket closed.");
          AudioCaptureStreamingService.stop();
        });

        socket.addEventListener("error", (event) => {
          console.log("Websocket error:", event);
        });
      };
    }
  };

  //Processing grammar websocket results
  const interpretGrammarMessage = (message) => {
    try {
      if (message.lastEvent === "RECOGNITION-COMPLETE") {
        //If a word in the grammar has MATCHED
        if (message.status == "MATCH") {
          const utterance = message.alternatives[0].utterance;
          if (utterance !== "go" && utterance !== "stop")
            setCollectorPosition(utterance);
          setCollectorCommand(utterance);
        } else if (message.status == "NOMATCH") {
        }
      } else if (message.lastEvent !== "RECOGNITION-COMPLETE") {
      } else throw new Error("Unable to obtain grammar.");
    } catch (err) {
      alert(err.message);
      console.log(err.message);
    }
  };

  /* change grid size */
  const onChangeGridSize = (e) => {
    const number = Number(e.target.value);
    setCollectorCoordinates({
      xCord: 0,
      yCord: 5,
    });
    setTimer("00:00:00");
    scoreboardTime = {};
    setGridRows(number);
    setGridCols(number);
  };

  /* change collector speed */
  const onChangeCollectorSpeed = (e) => {
    const speed = Number(e.target.value);
    setCollectorSpeed(speed);
  };

  /* get total remaining mines  */
  const getMinesCount = (gridCopy) => {
    let mineCount = 0;
    for (let i = 0; i < gridRows; i++) {
      for (let j = 0; j < gridCols; j++) {
        if (gridCopy[i][j] === 1) {
          mineCount++;
        }
      }
    }
    if (mineCount === 0) {
      setRunning(false);
      if (timerRef.current) clearInterval(timerRef.current);
      setScoreBoard();
    }
  };

  /* set scoreboard with gridsize and time */
  const setScoreBoard = () => {
    const prevScoreBoard =
      JSON.parse(localStorage.getItem("score")) || scoreBoard;
    scoreBoard = [
      ...prevScoreBoard,
      {
        gird: "" + gridRows + "*" + "" + gridCols,
        time: scoreboardTime.time,
        timestamp: scoreboardTime.timestamp,
      },
    ];
    scoreBoard = scoreBoard.sort((a, b) => a.timestamp - b.timestamp);
    setScore(scoreBoard);
    localStorage.setItem("score", JSON.stringify(scoreBoard));
  };

  return (
    <div style={{ display: "flex" }}>
      <div className="gridSetting">
        <label htmlFor="gridSize">Grid Size:</label>
        <select
          className="gridSizeOption"
          name="gridSize"
          disabled={running}
          onChange={(e) => onChangeGridSize(e)}
        >
          <option value="10">10*10</option>
          <option value="15">15*15</option>
          <option value="20">20*20</option>
        </select>
        <label htmlFor="collectorSpeed">Collector Speed:</label>
        <select
          className="gridSizeOption"
          name="collectorSpeed"
          disabled={running}
          onChange={(e) => onChangeCollectorSpeed(e)}
        >
          <option value="1000">1000 ms</option>
          <option value="500">500 ms</option>
          <option value="600">600 ms</option>
        </select>
      </div>
      <div style={{ width: "60%" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${gridCols}, 42px)`,
            padding: "10px",
            width: "fit-content",
            margin: "0 auto",
          }}
        >
          {grid &&
            grid.map((rows, i) =>
              rows.map((col, k) => (
                <div
                  key={`${i}-${k}`}
                  style={{
                    border: "1px solid rgba(0, 0, 0, 0.8)",
                    height: "30px",
                    width: "30px",
                    padding: "5px",
                    border: "1px solid #595959",
                  }}
                >
                  {grid[i][k] === 2 && getCollectorDirection()}

                  {grid[i][k] === 1 ? <span>&#9711;</span> : null}
                </div>
              ))
            )}
        </div>
        <div className="btn-container">
          <button className="button" onClick={() => connectWebsocket()}>
            <span>{connection ? "Connected" : "Connect"}</span>
          </button>
          <button className="button" onClick={() => restart()}>
            <span>{"Restart"}</span>
          </button>
        </div>
      </div>
      <div className="scoreBoard">
        <label>Timer</label> :{" "}
        <span style={{ fontSize: "20px", fontWeight: "500" }}>{timer}</span>
        <table>
          <tbody>
            <tr>
              <th>Grid Size</th>
              <th>Time</th>
            </tr>
            {score.map((val, key) => {
              return (
                <tr key={key}>
                  <td>{val.gird}</td>
                  <td>{val.time}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Home;
