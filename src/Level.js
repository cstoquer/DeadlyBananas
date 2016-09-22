var tiles = require('./tiles');


var TILE_WIDTH  = settings.spriteSize[0];
var TILE_HEIGHT = settings.spriteSize[1];

var STAGE_WIDTH  = 20;
var STAGE_HEIGHT = 20;


//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
function Level() {
	this.width  = STAGE_WIDTH;
	this.height = STAGE_HEIGHT;
	this.background = new Texture(STAGE_WIDTH * TILE_WIDTH, STAGE_HEIGHT * TILE_HEIGHT);
	this.geometry   = new Map(STAGE_WIDTH, STAGE_HEIGHT);
}

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
Level.prototype.load = function (levelDef) {
	var id = levelDef.id;
	var path = 'level' + id + '/';

	// geometry
	this.geometry = getMap(path + 'G');
	if (!this.geometry) console.error('Could not find map', path + 'G');

	// design
	this.background.paper(levelDef.paper);
	this.background.cls();
	var l = 0;
	var layer = getMap(path + 'L' + l);
	while (layer) {
		this.background.draw(layer);
		layer = getMap(path + 'L' + (++l));
	}

	return this;
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
Level.prototype.draw = function () {
	draw(this.background, 0, 0);
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
Level.prototype.getTileAt = function (x, y) {
	x = ~~(x / TILE_WIDTH);
	y = ~~(y / TILE_HEIGHT);
	// clamp position in level bondaries
	if (x < 0) x = 0; else if (x >= this.width)  x = this.width  - 1;
	if (y < 0) y = 0; else if (y >= this.height) y = this.height - 1;
	// if (x < 0 || y < 0 || x >= this.width || y >= this.height) return EMPTY;
	return tiles.getTileFromMapItem(this.geometry.get(x, y));
};

module.exports = new Level();
