var STAGE_WIDTH  = 20 * 8;
var STAGE_HEIGHT = 20 * 8;

function Level(levelDef) {
	this.background = new Texture(STAGE_WIDTH, STAGE_HEIGHT);
	this.load(levelDef);
}

module.exports = Level;

Level.prototype.load = function (levelDef) {
	var id = levelDef.id;
	this.background.paper(levelDef.paper);
	this.background.cls();
	var path = 'level' + id + '/';
	var l = 0;
	var layer = getMap(path + 'L' + l);
	while (layer) {
		this.background.draw(layer);
		layer = getMap(path + 'L' + (++l));
	}
	return this;
};

Level.prototype.draw = function () {
	draw(this.background, 0, 0);
};