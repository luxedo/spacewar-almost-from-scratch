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

const STARS = 40;
const GRAVITY = 50;

const p1Spawn = [100, 100];
const p2Spawn = [500, 500];
const player1Keys = {
  keyUp: 87,
  keyDown: 83,
  keyLeft: 65,
  keyRight: 68,
};
const player2Keys = {
  keyUp: 38,
  keyDown: 40,
  keyLeft: 37,
  keyRight: 39,
};
const player1Vectors = [
  [[8, 0], [1, 2], [-1, 2], [-8, 1], [-8, -1], [-1, -2], [1, -2], [8, 0]],
  [[-1,  2], [-6,  4], [-8,  4], [-5,  1.5]],
  [[-1, -2], [-6, -4], [-8, -4], [-5, -1.5]]
];
const player2Vectors = [
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
      if (Math.sqrt(Math.pow(xp-xc, 2)+Math.pow(yp-yc, 2))<Game.radius) {
        gameScreen.stars.push([xp, yp]);
    }
  }
  // Create players
  gameScreen.player1 = new Ship(...p1Spawn, player1Keys, player1Vectors, 2);
  gameScreen.player2 = new Ship(...p2Spawn, player2Keys, player2Vectors, 2);
  gameScreen.player1.updateRotation(Math.PI/4);
  gameScreen.player2.updateRotation(-3*Math.PI/4);
  gameScreen.blackhole = new Blackhole(Game.width/2, Game.height/2)
}

gameScreen.draw = function () {
  Game.context.clearRect(0, 0, Game.width, Game.height);
  // draw board
  drawCircle(Game.width/2, Game.height/2, Game.radius)
  gameScreen.stars.forEach((value) => drawPoint(...value));
  // draw sprites
  gameScreen.player1.draw();
  gameScreen.player2.draw();
  gameScreen.blackhole.draw();
  // draw mask to hide things outside the border
  Game.context.drawImage(Game.maskCanvas, 0, 0)
}

gameScreen.update = function () {
  gameScreen.player1.update();
  gameScreen.player2.update();
  gameScreen.blackhole.update();
  addGravity(gameScreen.player1, Game.width/2, Game.height/2, GRAVITY);
  addGravity(gameScreen.player2, Game.width/2, Game.height/2, GRAVITY);
}

gameScreen.respawnPlayer = function(player, speedX=false, speedY=false, angle=false) {
  let location = Math.random()*Math.PI*2;
  if (angle) location = angle;
  let x = (Game.radius-10)*Math.cos(location)+Game.width/2;
  let y = (Game.radius-10)*Math.sin(location)+Game.height/2;
  let rotation = Math.random()*Math.PI*2;
  player.resetPlayer(x, y, rotation, speedX, speedY);
}
