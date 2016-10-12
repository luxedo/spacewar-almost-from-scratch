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
const GRAVITY = 20;

const p1Spawn = [150, 150];
// const p1Spawn = [450, 410];
const p2Spawn = [450, 450];
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
  [[-1,  2], [-6,  4], [-8,  4], [-8,  2]],
  [[-1, -2], [-6, -4], [-8, -4], [-8, -2]],
  [[8, 0], [-8, 0]]
];

gameScreen.init = function () {
  // Setup background
  gameScreen.stars = []
  let [xc, yc] = [Game.width/2, Game.height/2]
  while (gameScreen.stars.length < STARS) {
    let theta = Math.random()*2*Math.PI;
    let r = Math.random()*Game.radius;
    gameScreen.stars.push([r*Math.cos(theta)+Game.width/2, r*Math.sin(theta)+Game.height/2]);
  }
  // Create players
  gameScreen.player1 = new Ship(...p1Spawn, player1Keys, player1Vectors, 1.5);
  gameScreen.player2 = new Ship(...p2Spawn, player2Keys, player2Vectors, 1.5);
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
  // addGravity(gameScreen.player1, Game.width/2, Game.height/2, GRAVITY);
  // addGravity(gameScreen.player2, Game.width/2, Game.height/2, GRAVITY);

  //check for players collision
  if (gameScreen.checkCollision(gameScreen.player1, gameScreen.player2)) {
    gameScreen.player1.explode();
    gameScreen.player2.explode();
  }
}

gameScreen.rotateVector = function(vector, angle) {
  let x = (vector[0]*Math.cos(angle)-vector[1]*Math.sin(angle));
  let y = (vector[1]*Math.cos(angle)+vector[0]*Math.sin(angle));
  return [x, y]
}

gameScreen.checkCollision = function(sprite1, sprite2) {
  // Limits of the sprite
  const p1c = sprite1.corners;
  const p2c = sprite2.corners;
  // Translate sprites to make p1c[0] the origin
  const p1cT = sprite1.corners.map(val => [val[0]-p1c[0][0], val[1]-p1c[0][1]]);
  const p2cT = sprite2.corners.map(val => [val[0]-p1c[0][0], val[1]-p1c[0][1]]);
  // Calculate the rotation to align the p1 bounding box
  const angle = Math.atan2(p1cT[2][1], p1cT[2][0]);
  // Rotate vetcors to align
  const p1cTR = p1cT.map(val => gameScreen.rotateVector(val, angle));
  const p2cTR = p2cT.map(val => gameScreen.rotateVector(val, angle));
  // Calculate extreme points of the bounding boxes
  const p1left = Math.min(...p1cTR.map(value => value[0]))
  const p1right = Math.max(...p1cTR.map(value => value[0]))
  const p1top = Math.min(...p1cTR.map(value => value[1]))
  const p1bottom = Math.max(...p1cTR.map(value => value[1]))
  const p2left = Math.min(...p2cTR.map(value => value[0]))
  const p2right = Math.max(...p2cTR.map(value => value[0]))
  const p2top = Math.min(...p2cTR.map(value => value[1]))
  const p2bottom = Math.max(...p2cTR.map(value => value[1]))
  // Check if shadows overlap in both axes
  if (p2left < p1right && p1left < p2right && p2top < p1bottom && p1top < p2bottom) return true;
  return false;
}
