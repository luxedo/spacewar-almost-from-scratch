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

const positions = [[180, 360], [230, 410]]


gameOverScreen.init = function() {
  gameOverScreen.stars = gameScreen.makeStars()
  gameOverScreen.arrow = new ShipCursor(positions, player1Vectors, 3);
  gameOverScreen.arrow.dead = true;
}
gameOverScreen.draw = function() {
  Game.context.clearRect(0, 0, Game.width, Game.height);
  gameOverScreen.stars.forEach((value) => drawPoint(...value));
  // draw board
  drawCircle(Game.width/2, Game.height/2, Game.radius)

  gameOverScreen.arrow.draw()
  writeCentered(100, "GAME OVER", 5);
  writeCentered(200, winner, 3);
  writeCentered(350, "play again", 2);
  writeCentered(400, "menu", 2);
  writeCentered(570, VERSION);
}
gameOverScreen.update = function() {
  gameOverScreen.arrow.update()
  if (Key.isDown(13)) {
    if (Game.keyTimeout > Date.now()) return
    Game.keyTimeout = Date.now()+200;
    // Game.blip4();
    if (gameOverScreen.arrow.current === 0) Game.changeState(gameScreen);
    else if (gameOverScreen.arrow.current === 1) {
    }
  } else if (Key.isDown(27)) {
    // Game.blip4();
    // Game.changeState(startScreen)
  }
}
