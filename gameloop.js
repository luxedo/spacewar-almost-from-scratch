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

const VERSION = "no version yet";
// keyboard handler
let Key = {
  _pressed: {},
  _single: {},
  isDown: function(keyCode) {return this._pressed[keyCode]},
  onKeydown: function(event) {this._pressed[event.keyCode] = true},
  onKeyup: function(event) {delete this._pressed[event.keyCode]},
};
window.addEventListener('keyup', (event) => { Key.onKeyup(event) }, false);
window.addEventListener("keydown", (event) => {
  Key.onKeydown(event);
  if([32, 37, 38, 39, 40].indexOf(event.keyCode) > -1) {event.preventDefault()}
}, false);

// Game object
let Game = {
  fps: 60,
  width: 600,
  height: 600,
  radius: 300
};

// Screens objects
let versusScreen = {}
let gameOverScreen = {}
let startScreen = {}
let creditsScreen = {}
let enemyScreen = {}

// Game globals
let winner = "player 1 wins";
let gameMode = "enemy";

// Sounds assets
let explosionURL = "assets/334266__projectsu012__short-explosion-1.wav";
let laser1URL  = "assets/344511__jeremysykes__laser03.wav";
let laser2URL  = "assets/268168__shaun105__laser.wav";
let thrustersURL  = "assets/238283__meroleroman7__8-bit-noise.wav";

// sound factory
function soundFactory(audio, start, stop) {
  return () => {
    if (audio.paused) {
      audio.play();
      setTimeout(()=>{
        audio.pause();
        audio.currentTime = start;
      }, stop);
    }
  }
}

Game._onEachFrame = (function() {
  if (window.RequestAnimationFrame) {
   return (cb) => {
      let _cb = () => { cb(); window.RequestAnimationFrame(_cb)}
      _cb();
    };
  } else {
    return (cb) => {setInterval(cb, 1000 / Game.fps)}
  }
})();

// Game methods
Game.start = function() {
  Game.canvas = document.createElement("canvas"); // Create canvas
  Game.canvas.setAttribute("id", "game");
  Game.canvas.width = Game.width;
  Game.canvas.height = Game.height;
  Game.context = Game.canvas.getContext("2d"); // Get canvas context
  document.getElementById("game-frame").appendChild(Game.canvas); // Add canvas to game-frame

  // mask outside border
  Game.maskCanvas = document.createElement("canvas"); // Create canvas
  Game.maskCanvas.setAttribute("id", "game-mask");
  Game.maskCanvas.width = Game.width;
  Game.maskCanvas.height = Game.height;
  Game.maskContext = Game.maskCanvas.getContext("2d"); // Get canvas context
  Game.maskContext.fillRect(0, 0, Game.width, Game.height);
  Game.maskContext.globalCompositeOperation = "xor"
  Game.maskContext.arc(Game.width/2, Game.height/2, Game.radius+1, 0, 2*Math.PI);
  Game.maskContext.fill();

  // Sounds
  Game.explosionSound = new Audio(explosionURL);
  Game.laser1Sound = new Audio(laser1URL);
  Game.laser2Sound = new Audio(laser2URL);
  Game.thrustersSound = new Audio(thrustersURL);
  Game.explosion = soundFactory(Game.explosionSound, 0, 300);
  Game.laser1 = soundFactory(Game.laser1Sound, 0, 300);
  Game.laser2 = soundFactory(Game.laser2Sound, 0, 300);
  Game.thrusters = soundFactory(Game.thrustersSound, 100, 350);

  // run loop
  Game.changeState(startScreen)
  Game._onEachFrame(Game.run);
};

Game.changeState = function(screen) {
  Game.keyTimeout = Date.now() + 200;
  screen.init();
  Game.draw = screen.draw;
  Game.update = screen.update;
}

Game.run = (function() {
  let loops = 0, skipTicks = 1000 / Game.fps,
      maxFrameSkip = 10,
      nextGameTick = (new Date).getTime(),
      lastGameTick;

  return () => {
    loops = 0;

    while ((new Date).getTime() > nextGameTick) {
      Game.update();
      nextGameTick += skipTicks;
      loops++;
    }

    if (loops) Game.draw();
  }
})();
