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
const RADIUS = 300;
const STARS = 40;
let player1Keys = {
  keyUp: 87,
  keyDown: 83,
  keyLeft: 65,
  keyRight: 68,
};
let player2Keys = {
  keyUp: 38,
  keyDown: 40,
  keyLeft: 37,
  keyRight: 39,
};
let player1Vectors = [
  [[8, 0], [1, 2], [-1, 2], [-8, 1], [-8, -1], [-1, -2], [1, -2], [8, 0]],
  [[-1,  2], [-6,  4], [-8,  4], [-5,  1.5]],
  [[-1, -2], [-6, -4], [-8, -4], [-5, -1.5]]
];
let player2Vectors = [
  [[8, 0], [1, 2], [-8, 2], [-8, -2], [1, -2], [8, 0]],
  [[-1,  2], [-6,  4], [-8,  4], [-8, 2]],
  [[-1, -2], [-6, -4], [-8, -4], [-8, -2]]
];

gameScreen.init = function () {
  // Setup background
  gameScreen.stars = []
  let [xc, yc] = [Game.width/2, Game.height/2]
  while (gameScreen.stars.length < STARS) {
    let [xp, yp] = [Math.random()*Game.width, Math.random()*Game.height]
    if (Math.sqrt(Math.pow(xp-xc, 2)+Math.pow(yp-yc, 2))<RADIUS) {
      gameScreen.stars.push([xp, yp]);
    }
  }
  // Create players
  gameScreen.player1 = new Ship(110, 110, player1Keys, player1Vectors, 2);
  gameScreen.player2 = new Ship(490, 490, player2Keys, player2Vectors, 2);
  gameScreen.player1.updateRotation(Math.PI/4);
  gameScreen.player2.updateRotation(-3*Math.PI/4);
  gameScreen.blackhole = new Blackhole(Game.width/2, Game.height/2)
}

gameScreen.draw = function () {
  Game.context.clearRect(0, 0, Game.width, Game.height);
  drawCircle(Game.width/2, Game.height/2, RADIUS)
  gameScreen.stars.forEach((value) => drawPoint(...value));
  gameScreen.player1.draw();
  gameScreen.player2.draw();
  gameScreen.blackhole.draw();
}

gameScreen.update = function () {
  gameScreen.player1.update();
  gameScreen.player2.update();
  gameScreen.blackhole.update();
}
