## The App UI

The App UI contains the following components - 
1.Main page contains the grid by default 10\*10.
2.Grid has a collector placed at random position.
3.Grid has mines 1/8th of the grid spots randomly placed.
4.Dropdown option to change grid size.
5.Dropdown option to change collector speed.
6.Connect button to connect with voice API and websocket.
7.Restart button to restart the game.
8.Timer to show time elapsed of gameplay.
9.Table to show scoreboard with grid size and time

## How to Play
1.Click on the connect button to connect with voice API and websocket
2.Once connected give the following voice commands - 
    1. "go" to move collector
    2. "stop" to stop collector
    3. "left" to move collector left
    4. "right" to move collector right
    5. "up" to move collector up
    6. "down" to move collector
3.Once all the mines are picked, grid size and time will be recorded.
4.Best score will be displayed at the top of the table.
5.Click on restart button to restart game.

## How to Run

Run command npm install in project directory to install dependencies
To start server, run command npm run start while in project directory

## The Files

package.json - dependencies required for npm install
Home.jsx - component creating UI for the app containing the Grid, buttons and methods.
Home.css- styles for Home.jsx component
audio-service.js - file contains web socket audio service
microphone-service.js - file contains microphone voice capture service
