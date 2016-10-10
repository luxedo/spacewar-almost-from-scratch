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
const THRUSTER_SPEED = 0.002;
const FIRE_LENGTH = 10;
const SHOT_DISTANCE = 300;
const SHOT_SPEED = 1;
const SHOT_SIZE = 5;
const SHOT_INTERVAL = 500;
const BLACKHOLE_SIZE = 12;

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

function drawPoint(x, y, width=1, color="#FFF") {
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
    this.speedX = 0;
    this.speedY = 0;
  }
  draw() {}
  update() {
    this.x += this.speedX;
    this.y += this.speedY;
  }
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
    this.shots = [];
    this.shotTimeout = Date.now();

    // find centroid
    let flat = [].concat.apply([], this.shape);
    this.left = Math.min(...flat.map(value => value[0]))
    this.right = Math.max(...flat.map(value => value[0]))
    this.top = Math.min(...flat.map(value => value[1]))
    this.bottom = Math.max(...flat.map(value => value[1]))
    this.center = [(this.left+this.right)/2, (this.top+this.bottom)/2];

    // translate center
    this.showShape = this.shape
      .map(value0 => value0
        .map(value1 => [value1[0]-this.center[0], value1[1]-this.center[1]]
    ));
  }
  rotateVector(vector) {
    vector = [vector[0]-this.center[0], vector[1]-this.center[1]];
    let x = (vector[0]*Math.cos(this.rotation)-vector[1]*Math.sin(this.rotation));
    let y = (vector[1]*Math.cos(this.rotation)+vector[0]*Math.sin(this.rotation));
    return [x, y]
  }

  get rear() {
    let retval = this.rotateVector([this.left*this.size+this.center[0], (this.top+this.bottom)/2+this.center[1]*this.size]);
    retval = [retval[0]+this.x, retval[1]+this.y]
    return retval;
  }

  get tip() {
    let retval = this.rotateVector([this.right*this.size+this.center[0], (this.top+this.bottom)/2+this.center[1]*this.size]);
    retval = [retval[0]+this.x, retval[1]+this.y]
    return retval;
  }

  draw() {
    // draw ship
    this.showShape.forEach(value => drawArray(value
      .map(vector => [vector[0]*this.size+this.x, vector[1]*this.size+this.y])));
    // draw thrusters fire
    if (this.thrusters) {
      let fireLength = Math.random()*FIRE_LENGTH*this.size;
      let fireArray = [this.rear, [this.rear[0]-fireLength*Math.cos(this.rotation), this.rear[1]-fireLength*Math.sin(this.rotation)]];
      drawArray(fireArray);
    }
    // draw shots
    this.shots.forEach(shot => shot.draw());
  }
  update() {
    super.update();
    this.thrusters = false;
    if (Key.isDown(this.keyUp)) {
      // fire weapon
      let shotOrigin = this.tip;
      let now = Date.now();
      if (now >= this.shotTimeout) {
        this.shotTimeout = now+SHOT_INTERVAL;
        this.shots.push(new Shot(...this.tip, this.rotation));
      }
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
      this.rotation %= 2*Math.PI;
      // rotate vectors around center
      this.updateRotation();
    };
    // update shots
    let removeShots = 0
    this.shots.forEach((shot, index) => {
      if (shot.distance > SHOT_DISTANCE) removeShots++;
      shot.update()
    });
    for (let i=0; i<removeShots; i++) {
      this.shots.shift();
    }
  }
  updateRotation(angle) {
    if (angle !== undefined) this.rotation = angle;
    this.showShape = this.shape
      .map(value0 => value0
        .map(value1 => this.rotateVector(value1)
      ));
  }
}

class Shot extends BaseSprite {
  constructor(x, y, direction) {
    super(x, y);
    this.direction = direction;
    this.speedX = Math.cos(direction)*SHOT_SPEED;
    this.speedY = Math.sin(direction)*SHOT_SPEED;
    this.size = SHOT_SIZE;
    this.distance = 0;
  }
  draw() {
    drawArray([[this.x, this.y], [this.xf, this.yf]]);
    if (SHOT_DISTANCE-this.distance<=20) {
      // center of rotation
      let xc = this.x+Math.cos(this.direction)*this.size/2
      let yc = this.y+Math.sin(this.direction)*this.size/2
      // rotate vector
      let x0 = this.x-xc
      let y0 = this.y-yc
      let xr0 = x0*Math.cos(Math.PI/2)-y0*Math.sin(Math.PI/2)+xc;
      let yr0 = y0*Math.cos(Math.PI/2)+x0*Math.sin(Math.PI/2)+yc;
      let x1 = this.xf-xc
      let y1 = this.yf-yc
      let xr1 = x1*Math.cos(Math.PI/2)-y1*Math.sin(Math.PI/2)+xc;
      let yr1 = y1*Math.cos(Math.PI/2)+x1*Math.sin(Math.PI/2)+yc;
      drawArray([[xr0, yr0], [xr1, yr1]])
      this.size -= 0.5;
    }
  }
  update() {
    super.update();
    this.xf = this.x+Math.cos(this.direction)*this.size
    this.yf = this.y+Math.sin(this.direction)*this.size
    this.distance += SHOT_SPEED;
  }
}

class Blackhole extends BaseSprite {
  constructor(x, y) {
    super(x, y);
  }
  draw() {
    let size = Math.random()*BLACKHOLE_SIZE;
    let angle = Math.random()*Math.PI*2;
    let x0 = this.x + Math.cos(angle)*size
    let y0 = this.y + Math.sin(angle)*size
    let x1 = this.x - Math.cos(angle)*size
    let y1 = this.y - Math.sin(angle)*size
    console.log(this.y)
    drawArray([[x0, y0], [x1, y1]])
  }
  update() {
    super.update();
  }
}
