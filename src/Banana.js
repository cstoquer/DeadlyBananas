var level = require('./Level');

var FRICTION = 0.9;
var ACCELERATION = 0.1;

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
function Banana(owner) {
	this.x  = 0;
	this.y  = 0;
	this.w  = 2;
	this.h  = 2;
	this.sx = 0;
	this.sy = 0;

	this.owner  = owner;
	this.flying = false;
}

module.exports = Banana;

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
Banana.prototype.draw = function () {
	sprite(1, this.x - 3, this.y - 3, this.flipH);
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
Banana.prototype.update = function () {
	if (this.flying) {
		this.sx += (this.owner.x - this.x) * ACCELERATION;
		this.sy += (this.owner.y - this.y) * ACCELERATION;

		this.sx *= FRICTION;
		this.sy *= FRICTION;

		this.x += this.sx;
		this.y += this.sy;
	} else {
		this.x = this.owner.x;
		this.y = this.owner.y;
	}
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
Banana.prototype.fire = function (sx, sy) {
	this.flying = true;
	this.sx = sx;
	this.sy = sy;
};