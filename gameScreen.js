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

gameScreen.init = function () {
  writeText(10, 20, "SPACEWAR ALMOST", 3);
  writeText(10, 70, "FROM SCRATCH", 3);
  writeText(10, 150, "HELLO WORLD!", 2);
  writeText(10, 200, "ABCDEFGHIJKLMNOPQRSTUVWXYZ", 2);
  writeText(10, 250, "0123456789.,:;!?\"'°$/()|-+=*&<>", 2);
  drawArray([[20, 300], [580, 300]]);
  drawArray([[20, 300], [20, 580]]);
  drawArray([[20, 300], [580, 580]]);
}

gameScreen.draw = function () {}
gameScreen.update = function () {}
