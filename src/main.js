var level       = require('./Level');
var Monkey      = require('./Monkey');
var getGamepads = require('./gamepad.js');

var TILE_WIDTH  = settings.spriteSize[0];
var TILE_HEIGHT = settings.spriteSize[1];

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
var canvas = $screen.canvas;
canvas.style.width  = '100%';
canvas.style.height = '100%';

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
var levelNum = random(2) + 1;
level.load(assets.levels['level' + levelNum]);

// TODO: make this array dynamic to add and remove monkeys
var monkeys = [
	new Monkey(0),
	new Monkey(1),
	new Monkey(2),
	new Monkey(3)
];

var spawnPoints = level.getSpawnPoints();
for (var i = 0; i < monkeys.length; i++) {
	monkeys[i].x = spawnPoints[i].x * TILE_WIDTH;
	monkeys[i].y = spawnPoints[i].y * TILE_HEIGHT;
}

console.log(monkeys)

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
// Update is called once per frame
exports.update = function () {
	cls();
	level.draw();
	var gamepads = getGamepads();
	for (var i = 0; i < monkeys.length; i++) {
		monkeys[i].update(gamepads);
		monkeys[i].draw();
	}
};
