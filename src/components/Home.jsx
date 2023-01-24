import { useState, useRef, useEffect } from "react";
import "./Home.css";

const Home = () => {
  /* state to set grid */
  const [grid, setGrid] = useState();

  /* state to set collector direction */
  const [collectorPosition, setCollectorPosition] = useState("left");

  /* state to set collector co-ordinates in grid */
  const [collectorCoordinates, setCollectorCoordinates] = useState({
    xCord: 0,
    yCord: 5,
  });
  /* running state of a grid simulation */
  const [running, setRunning] = useState(false);
  const runningRef = useRef(running);
  runningRef.current = running;
  let timeOutId = null;
  const positionRef = useRef(collectorPosition);

  /* number of rows in grid */
  const numRows = 10;

  /* number of columns in grid */
  const numCols = 10;

  useEffect(() => {
    /* initialize the grid */
    setGrid(initializeGrid());
  }, []);

  /*call methods if position changes */
  useEffect(() => {
    if (collectorPosition === "right") {
      moveCollectorRight();
    } else if (collectorPosition === "left") {
      moveCollectorLeft();
    } else if (collectorPosition === "bottom") {
      moveCollectorBottom();
    } else if (collectorPosition === "top") {
      moveCollectorTop();
    } else {
      moveCollectorRight();
    }
  }, [collectorPosition]);

  // useEffect(() => {
  //   connectWebsocket();
  // }, []);

  /* initialize the grid with collector position */
  const initializeGrid = () => {
    const rows = [];
    for (let i = 0; i < numRows; i++) {
      rows.push(
        Array.from(Array(numCols), (ele, colIndex) =>
          i === collectorCoordinates.xCord &&
          colIndex === collectorCoordinates.yCord
            ? 2
            : 0
        )
      );
    }
    return initializeMines(rows);
  };

  /* initialize the grid with mines 1/8th of the grid spots */
  const initializeMines = (rows) => {
    const numberOfMines = parseInt((numRows * numCols) / 8);
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

  /* set collector direction on UI */
  const getCollectorDirection = () => {
    return collectorPosition === "right" ? (
      <span className="collector-icon">&#8594;</span>
    ) : collectorPosition === "left" ? (
      <span className="collector-icon">&#8592;</span>
    ) : collectorPosition === "top" ? (
      <span className="collector-icon">&#8593;</span>
    ) : collectorPosition === "bottom" ? (
      <span className="collector-icon">&#8595;</span>
    ) : (
      <span>&#8594;</span>
    );
  };

  /* function to start game */
  const startGame = () => {
    setRunning(!running);
    if (!running) {
      runningRef.current = true;
      if (collectorPosition === "right") {
        moveCollectorRight();
      } else if (collectorPosition === "left") {
        moveCollectorLeft();
      } else if (collectorPosition === "bottom") {
        moveCollectorBottom();
      } else if (collectorPosition === "top") {
        moveCollectorTop();
      } else {
        moveCollectorRight();
      }
    }
  };

  /* move collector right on the grid */
  const moveCollectorRight = async () => {
    positionRef.current = "right";
    if (runningRef.current && collectorPosition === "right") {
      let gridCopy = JSON.parse(JSON.stringify(grid));
      /* traverse grid left to right */
      let y = collectorCoordinates.yCord;
      for (let i = collectorCoordinates.xCord; i < numRows; i++) {
        for (let j = y; j < numCols; j++) {
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
      for (let i = collectorCoordinates.xCord; i < numRows; i++) {
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
        y = numCols - 1;
      }
    } else if (!runningRef.current) {
      setCollectorPosition(positionRef.current);
    }
  };

  /* move collector down on the grid */
  const moveCollectorBottom = async () => {
    positionRef.current = "bottom";
    if (runningRef.current && collectorPosition === "bottom") {
      let gridCopy = JSON.parse(JSON.stringify(grid));
      /* traverse grid top to bottom */
      let y = collectorCoordinates.xCord;
      for (let i = collectorCoordinates.yCord; i < numCols; i++) {
        for (let j = y; j < numRows; j++) {
          /* stop loop if running state change or direction changes  */
          if (!runningRef.current || positionRef.current !== "bottom") {
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
    positionRef.current = "top";
    if (runningRef.current && collectorPosition === "top") {
      let gridCopy = JSON.parse(JSON.stringify(grid));
      /* traverse grid bottom to top */
      let y = collectorCoordinates.xCord;
      for (let i = collectorCoordinates.yCord; i >= 0; i--) {
        for (let j = y; j >= 0; j--) {
          /* stop loop if running state change or direction changes  */
          if (!runningRef.current || positionRef.current !== "top") {
            setCollectorPosition(positionRef.current);
            clearTimeout(timeOutId);
            return;
          }
          await runCollectorTopPosition(i, j, gridCopy);
          setGrid(JSON.parse(JSON.stringify(gridCopy)));
        }
        y = numCols - 1;
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
        if (i < 0 || j < 0 || i >= numRows || j >= numCols) {
        } else {
          if (j - 1 >= 0) {
            if (gridCopy[i][j - 1] !== 1) gridCopy[i][j - 1] = 0;
            /* change value of cell visited 1 to 0 i.e. mine picked */
            if (gridCopy[i][j] === 1) {
              gridCopy[i][j] = 0;
            }
          } else {
            if (i - 1 >= 0) gridCopy[i - 1][numCols - 1] = 0;
          }
          gridCopy[i][j] = 2;

          /* set updated position of collector */
          setCollectorCoordinates({
            xCord: i,
            yCord: j,
          });
        }
        resolve(gridCopy);
      }, 1000);
    });
  };

  /* reset values of visited cells of the grid moving left direction*/
  const runCollectorLeftPosition = (i, j, gridCopy) => {
    return new Promise(function (resolve) {
      timeOutId = setTimeout(function () {
        /* check boundary*/
        if (i < 0 || j < 0 || i >= numRows || j >= numCols) {
        } else {
          if (j + 1 < numCols) {
            if (gridCopy[i][j + 1] !== 1) gridCopy[i][j + 1] = 0;
            /* change value of cell visited 1 to 0 i.e. mine picked */
            if (gridCopy[i][j] === 1) {
              gridCopy[i][j] = 0;
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
      }, 1000);
    });
  };

  /* reset values of visited cells of the grid moving up direction*/
  const runCollectorTopPosition = (i, j, gridCopy) => {
    return new Promise(function (resolve) {
      timeOutId = setTimeout(function () {
        if (i < 0 || j < 0 || i >= numCols || j >= numRows) {
        } else {
          if (j + 1 < numRows) {
            if (gridCopy[j + 1][i] !== 1) gridCopy[j + 1][i] = 0;
            /* change value of cell visited 1 to 0 i.e. mine picked */
            if (gridCopy[j][i] === 1) {
              gridCopy[j][i] = 0;
            }
          } else if (i + 1 < numCols) {
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
      }, 1000);
    });
  };

  /* reset values of visited cells of the grid moving bottom direction*/
  const runCollectorBottomPosition = (i, j, gridCopy) => {
    return new Promise(function (resolve) {
      timeOutId = setTimeout(function () {
        if (i < 0 || j < 0 || i >= numCols || j >= numRows) {
        } else {
          if (j - 1 >= 0) {
            if (gridCopy[j - 1][i] !== 1) gridCopy[j - 1][i] = 0;
            /* change value of cell visited 1 to 0 i.e. mine picked */
            if (gridCopy[j][i] === 1) {
              gridCopy[j][i] = 0;
            }
          } else {
            if (i - 1 >= 0) gridCopy[numRows - 1][i - 1] = 0;
          }
          gridCopy[j][i] = 2;
          /* set updated position of collector */
          setCollectorCoordinates({
            xCord: j,
            yCord: i,
          });
        }
        resolve(gridCopy);
      }, 1000);
    });
  };

  return (
    <div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${numCols}, 42px)`,
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
        <button className="button" onClick={() => startGame()}>
          <span>{running ? "Stop" : "Start"}</span>
        </button>
        <button className="button" onClick={() => moveCollectorLeft()}>
          <span>{"Left"}</span>
        </button>
        <button className="button" onClick={() => moveCollectorRight()}>
          <span>{"Right"}</span>
        </button>
        <button className="button" onClick={() => moveCollectorTop()}>
          <span>{"Up"}</span>
        </button>
        <button className="button" onClick={() => moveCollectorBottom()}>
          <span>{"Down"}</span>
        </button>
      </div>
    </div>
  );
};

export default Home;
