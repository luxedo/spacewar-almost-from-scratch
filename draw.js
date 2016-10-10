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

const ROTATION_SPEED = 3;
const THRUSTER_SPEED = 0.01;
const FIRE_LENGTH = 10;

function drawArray(array, width=1, color="#FFF") {
  array = array.slice();
  // setup style
  Game.context.lineWidth = width;
  Game.context.strokeStyle = color;
  // go to starting position
  Game.context.beginPath();
  Game.context.moveTo(...array[0]);
  array.shift();
  // draw line
  array.forEach((value) => Game.context.lineTo(...value));
  Game.context.stroke();
}

function drawCircle(x, y, radius, width=1, color="#FFF") {
  // setup style
  Game.context.lineWidth = width;
  Game.context.strokeStyle = color;
  // draw circle
  Game.context.beginPath();
  Game.context.arc(x, y, radius, 0, 2*Math.PI);
  Game.context.stroke();
}

function drawPoint(x, y, width=2, color="#FFF") {
  drawArray([[x, y], [x+width, y+width]], width)
}

function parseLetter(letter) {
  let limits = alphabeth[letter]
    .match(/\D{2}/)[0]
    .split("")
    .map((value) => value.charCodeAt(0)-82);
  let coordinates = alphabeth[letter]
    .replace(/\d/g, "")
    .split(" ")
    .map((value, index) => (index === 0? value.slice(2): value.slice(1)))
    .map((value) => value.match(/(..?)/g))
  if (coordinates[0] !== null) {
    coordinates = coordinates.map((value0) => value0.map((value1) => [value1.charCodeAt(0)-82-limits[0], value1.charCodeAt(1)-82+6]));
  } else {
    coordinates = [[0, 0]]
  }
  let finalPosition = limits[1]-limits[0];
  return [coordinates, finalPosition];
}

function writeText(x, y, text, size=1, width=1, color="#FFF") {
  let lastPosition = 0;
  text.split("").forEach((letter) => {
      let [coordinates, finalPosition] = parseLetter(letter.toUpperCase());
      coordinates.forEach((value) => {
        value = value.map(element => [element[0]*size+x+lastPosition*size, element[1]*size+y])
        drawArray(value, width, color)
      });
      lastPosition += finalPosition;
  });
}

class BaseSprite {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
  draw() {}
  update() {}
}

class Ship extends BaseSprite {
  constructor(x, y, keys, shape, size) {
    super(x, y);
    this.keyUp = keys.keyUp;
    this.keyDown = keys.keyDown;
    this.keyLeft = keys.keyLeft;
    this.keyRight = keys.keyRight;
    this.shape = shape;
    this.size = size;
    this.rotation = 0;
    this.direction = 0;
    this.speedX = 0;
    this.speedY = 0;

    // find centroid
    let flat = [].concat.apply([], this.shape);
    let left = Math.min(...flat.map(value => value[0]))
    let right = Math.max(...flat.map(value => value[0]))
    let top = Math.min(...flat.map(value => value[1]))
    let bottom = Math.max(...flat.map(value => value[1]))
    this.center = [(left+right)/2, (top+bottom)/2];
    this.rear = [left*this.size+this.center[0], (top+bottom)/2+this.center[1]*this.size];
    // translate center
    this.showShape = this.shape
      .map(value0 => value0
        .map(value1 => [value1[0]-this.center[0], value1[1]-this.center[1]]
    ));
  }
  draw() {
    this.showShape.forEach(value => drawArray(value.map(vector => [vector[0]*this.size+this.x, vector[1]*this.size+this.y])
      )
    );
    if (this.thrusters) {
      let fireLength = Math.random()*FIRE_LENGTH*this.size;
      let fireArray = [this.rear, [this.rear[0]-fireLength, this.rear[1]]];
      fireArray = fireArray
        .map(value => {
            value = [value[0]-this.center[0], value[1]-this.center[1]]
            let x = (value[0]*Math.cos(this.rotation)-value[1]*Math.sin(this.rotation));
            let y = (value[1]*Math.cos(this.rotation)+value[0]*Math.sin(this.rotation));
            return [x+this.x, y+this.y]
          }
        );
      drawArray(fireArray);
    }
  }
  update() {
    this.thrusters = false;
    if (Key.isDown(this.keyUp)) {
      // fire weapon
    };
    if (Key.isDown(this.keyDown)) {
      // fire thrusters
      this.thrusters = true;
      // calculate new velocity vector
      this.speedX += THRUSTER_SPEED*Math.cos(this.rotation);
      this.speedY += THRUSTER_SPEED*Math.sin(this.rotation);
    };
    if (Key.isDown(this.keyLeft) || Key.isDown(this.keyRight)) {
      // rotate ship
      this.rotation += (Key.isDown(this.keyRight)?ROTATION_SPEED:-ROTATION_SPEED)*Math.PI/180
      this.rotation %= 360;
      // rotate vectors around center
      this.updateRotation();
    };
    this.x += this.speedX;
    this.y += this.speedY;
  }
  updateRotation(angle) {
    if (angle !== undefined) this.rotation = angle;
    this.showShape = this.shape
      .map(value0 => value0
        .map(value1 => {
          value1 = [value1[0]-this.center[0], value1[1]-this.center[1]]
          let x = (value1[0]*Math.cos(this.rotation)-value1[1]*Math.sin(this.rotation));
          let y = (value1[1]*Math.cos(this.rotation)+value1[0]*Math.sin(this.rotation));
          return [x, y]
        }
      ));
  }
}
