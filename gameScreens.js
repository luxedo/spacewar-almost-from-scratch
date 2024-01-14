/*
spacewar-almost-from-scratch
This is an attempt of making the game spacewar using modern programming languages

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

const p1Spawn = [150, 150];
const p2Spawn = [450, 450];

const clearP2Commands = () => {
  if (!Game.player2) return;
  Game.player2.keyUp = undefined;
  Game.player2.keyDown = undefined;
  Game.player2.keyLeft = undefined;
  Game.player2.keyRight = undefined;
}

const initPlayers = () => {
  Game.player1 = new Ship(...p1Spawn, player1Keys, player1Vectors, 1.5, Game.laser1);
  Game.player1.updateRotation(Math.PI/4);
  Game.player2 = new Ship(...p2Spawn, player2Keys, player2Vectors, 1.5, Game.laser2);
  Game.player2.updateRotation(-3*Math.PI/4);
  if (gameMode === "versus") return;
  clearP2Commands();
}

const initArena = () => {
    // Setup background
    versusScreen.stars = versusScreen.makeStars();
    // Create players
    versusScreen.blackhole = new Blackhole(Game.width/2, Game.height/2)
    versusScreen.ended = false;
}



versusScreen.init = () => {
  gameMode = "versus";
  initPlayers();
  initArena();
}

versusScreen.draw = function () {
  Game.context.clearRect(0, 0, Game.width, Game.height);
  // draw board
  drawCircle(Game.width/2, Game.height/2, Game.radius)
  versusScreen.stars.forEach((value) => drawPoint(...value));
  // draw sprites
  Game.player1.draw();
  Game.player2.draw();
  versusScreen.blackhole.draw();
  // draw mask to hide things outside the border
  if (!document.hasFocus()) {
    writeCentered(Game.height/2, "PAUSED", 4)
  }
  Game.context.drawImage(Game.maskCanvas, 0, 0)
}

versusScreen.update = function () {  
  checkGamepadState();
  if (Key.isDown(27)) {
    Game.changeState(startScreen);
  }
  if (!document.hasFocus()) {
    return
  }
  Game.player1.update();
  Game.player2.update();
  versusScreen.blackhole.update();
  addGravity(Game.player1, Game.width/2, Game.height/2, GRAVITY);
  addGravity(Game.player2, Game.width/2, Game.height/2, GRAVITY);

  // check for collision
  let collisionArr1 = Game.player1.shots.slice();
  collisionArr1.push(Game.player1);
  let collisionArr2 = Game.player2.shots.slice();
  collisionArr2.push(Game.player2);
  for (let i=0; i<collisionArr1.length; i++) {
    for (let j=0; j<collisionArr2.length; j++) {
      let sprite1 = collisionArr1[i];
      let sprite2 = collisionArr2[j];
      if (versusScreen.checkCollision(sprite1, sprite2)) {
        sprite1.explode();
        sprite2.explode();
      }
    }
  }
  if ((Game.player1.dead || Game.player2.dead) && !versusScreen.ended) {
    versusScreen.ended = true;
    setTimeout(() => Game.changeState(gameOverScreen), 1000);
  }
}

versusScreen.rotateVector = (vector, angle) => {
  let x = (vector[0]*Math.cos(angle)-vector[1]*Math.sin(angle));
  let y = (vector[1]*Math.cos(angle)+vector[0]*Math.sin(angle));
  return [x, y]
}

versusScreen.checkCollision = function(sprite1, sprite2) {
  // Limits of the sprite
  const p1c = sprite1.corners;
  const p2c = sprite2.corners;
  // Translate sprites to make p1c[0] the origin
  const p1cT = sprite1.corners.map(val => [val[0]-p1c[0][0], val[1]-p1c[0][1]]);
  const p2cT = sprite2.corners.map(val => [val[0]-p1c[0][0], val[1]-p1c[0][1]]);
  // Calculate the rotation to align the p1 bounding box
  const angle = Math.atan2(p1cT[2][1], p1cT[2][0]);
  // Rotate vetcors to align
  const p1cTR = p1cT.map(val => versusScreen.rotateVector(val, angle));
  const p2cTR = p2cT.map(val => versusScreen.rotateVector(val, angle));
  // Calculate extreme points of the bounding boxes
  const p1left = Math.min(...p1cTR.map(value => value[0]))
  const p1right = Math.max(...p1cTR.map(value => value[0]))
  const p1top = Math.min(...p1cTR.map(value => value[1]))
  const p1bottom = Math.max(...p1cTR.map(value => value[1]))
  const p2left = Math.min(...p2cTR.map(value => value[0]))
  const p2right = Math.max(...p2cTR.map(value => value[0]))
  const p2top = Math.min(...p2cTR.map(value => value[1]))
  const p2bottom = Math.max(...p2cTR.map(value => value[1]))

  if (p2left < p1right && p1left < p2right && p2top < p1bottom && p1top < p2bottom) return true;
  return false;
}

versusScreen.makeStars = () => {
  let stars = []
  let [xc, yc] = [Game.width/2, Game.height/2]
  while (stars.length < STARS) {
    let theta = Math.random()*2*Math.PI;
    let r = Math.random()*Game.radius;
    stars.push([r*Math.cos(theta)+Game.width/2, r*Math.sin(theta)+Game.height/2]);
  }
  return stars;
}

// Play against AI
enemyScreen.init = () => { 
  gameMode = "enemy";
  initPlayers();
  initArena();
  Game.player2.evade();
};
enemyScreen.draw = versusScreen.draw;
enemyScreen.update = () => {
  checkGamepadState();
  if (!document.hasFocus()) {
    return
  }
  versusScreen.update();
  if (!Game.player2.dead && !Game.player2.evading) {
    // basic vectors
    let p1dx = Game.player1.x-Game.player2.x;
    let p1dy = Game.player1.y-Game.player2.y;
    let p1r = Math.hypot(p1dx, p1dy);
    // player1 angle in relation to player2
    let angleDelta = (Math.atan2(p1dy, p1dx)-Game.player2.rotation)%(Math.PI*2)
    // Adjust angles and limit to ROTATION_SPEED
    angleDelta = (angleDelta<Math.PI?angleDelta:angleDelta-2*Math.PI)
    angleDelta = (angleDelta<-Math.PI?angleDelta+2*Math.PI:angleDelta)
    angleDelta = (Math.abs(angleDelta)<ROTATION_SPEED?angleDelta:Math.sign(angleDelta)*ROTATION_SPEED);
    // Apply actions
    Game.player2.updateRotation(Game.player2.rotation+angleDelta);
    if (p1r < SHOT_DISTANCE*1.5 && angleDelta<ROTATION_SPEED) {
      Game.player2.fire();
    }
    if (Game.player1.shots.length > 2 || (p1r>SHOT_DISTANCE*1.5 && angleDelta<ROTATION_SPEED)) {
      Game.player2.fireThrusters()
    }
  }
}
