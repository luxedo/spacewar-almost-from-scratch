/*
spacewar-almost-from-scratch
This is an attempt of making the game pong using modern programming languages

Copyright (C) 2016  Luiz Eduardo Amaral - <luizamaral306@gmail.com>

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/
"use strict";

const gameOverPositions = [[180, 360], [230, 410]]
const startScreenPositions = [[190, 310], [190, 360], [200, 410]]


creditsScreen.init = () => {
  creditsScreen.stars = versusScreen.makeStars()
}
creditsScreen.draw = () => {
  Game.context.clearRect(0, 0, Game.width, Game.height);
  // draw board
  drawCircle(Game.width/2, Game.height/2, Game.radius)
  creditsScreen.stars.forEach((value) => drawPoint(...value));
  // add text
  writeCentered(50, "SPACEWAR", 4);
  writeCentered(100, "almost from scratch", 2);
  writeText(50, 200, "This is an attempt of making the game spacewar using", 1);
  writeText(50, 220, "modern programming languages. You can find more", 1);
  writeText(50, 240, "information about the project in it's github page:", 1);
  writeCentered(280, "https://github.com/ArmlessJohn404/spacewar-almost-from-scratch", 0.8);
  writeText(50, 320, "Thanks to meroleroman7, Shaun105, jeremysykes and", 1);
  writeText(50, 340, "ProjectsU012 for the sound assets.", 1);
  writeCentered(460, "This project is under a GNU GPL3 license. Have fun! ;)", 0.9);
  writeCentered(480, "Copyright (C) 2016  Luiz Eduardo Amaral", 0.9);
  writeCentered(500, "<luizamaral306(at)gmail.com>", 0.9);

  writeCentered(550, "esc - go back");
  writeCentered(570, VERSION);
}
creditsScreen.update = () => {
  if (Key.isDown(27)) {
    Game.laser1();
    Game.changeState(startScreen);
  }
}

startScreen.init = () => {
  startScreen.stars = versusScreen.makeStars()
  startScreen.arrow = new ShipCursor(startScreenPositions, player1Vectors, 3);
}
startScreen.draw = () => {
  Game.context.clearRect(0, 0, Game.width, Game.height);
  // draw board
  drawCircle(Game.width/2, Game.height/2, Game.radius)
  startScreen.stars.forEach((value) => drawPoint(...value));

  startScreen.arrow.draw()
  writeCentered(100, "SPACEWAR", 5);
  writeCentered(200, "almost from scratch", 3);
  writeCentered(300, "1p start", 2);
  writeCentered(350, "2p start", 2);
  writeCentered(400, "credits", 2);
  writeCentered(510, "'wasd' - player 1         arrows - player 2");
  writeCentered(530, "enter - go              esc - go back");
  writeCentered(570, VERSION);
}
startScreen.update = () => {
  startScreen.arrow.update()
  if (Key.isDown(13)) {
    if (Game.keyTimeout > Date.now()) return;
    Game.keyTimeout = Date.now()+200;
    Game.laser2();
    if (startScreen.arrow.current === 0) Game.changeState(enemyScreen);
    else if (startScreen.arrow.current === 1) Game.changeState(versusScreen);
    else if (startScreen.arrow.current === 2) Game.changeState(creditsScreen);
  }
}

gameOverScreen.init = () => {
  gameOverScreen.stars = versusScreen.makeStars()
  gameOverScreen.arrow = new ShipCursor(gameOverPositions, player1Vectors, 3);
}
gameOverScreen.draw = () => {
  Game.context.clearRect(0, 0, Game.width, Game.height);
  // draw board
  drawCircle(Game.width/2, Game.height/2, Game.radius)
  gameOverScreen.stars.forEach((value) => drawPoint(...value));

  gameOverScreen.arrow.draw()
  writeCentered(100, "GAME OVER", 5);
  if (gameMode === "versus" || winner === "draw") writeCentered(200, winner, 3);
  else writeCentered(200, (winner==="player 1 wins"?"you win":"you lose"), 3);
  writeCentered(350, "play again", 2);
  writeCentered(400, "menu", 2);
  writeCentered(570, VERSION);
}
gameOverScreen.update = () => {
  gameOverScreen.arrow.update()
  if (Key.isDown(13)) {
    if (Game.keyTimeout > Date.now()) return
    Game.keyTimeout = Date.now()+200;
    Game.laser2();
    if (gameOverScreen.arrow.current === 0) {
      if (gameMode === "versus") Game.changeState(versusScreen);
      else Game.changeState(enemyScreen);
    }
    else if (gameOverScreen.arrow.current === 1) Game.changeState(startScreen);
  } else if (Key.isDown(27)) {
    Game.laser1();
    Game.changeState(versusScreen);
  }
}