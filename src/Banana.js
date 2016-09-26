var level = require('./Level');

var TILE_WIDTH  = settings.spriteSize[0];
var TILE_HEIGHT = settings.spriteSize[1];

var FRICTION         = 0.9;
var ACCELERATION     = 0.01;
var MAX_ACCELERATION = 0.5;
var THROW_DURATION   = 20;
var MAX_SPEED        = 3;

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
function Banana(owner) {
	this.x  = 0;
	this.y  = 0;
	this.w  = 2;
	this.h  = 2;
	this.sx = 0;
	this.sy = 0;

	this.owner  = owner;

	// flags
	this.flying   = false;
	this.throwing = false;

	//counters
	this.throwCounter = 0;
}

module.exports = Banana;

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
Banana.prototype.draw = function () {
	sprite(16, this.x - 3, this.y - 3, this.flipH);
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
Banana.prototype.maxSpeed = function () {
	if (this.sx >  MAX_SPEED) this.sx =  MAX_SPEED;
	if (this.sx < -MAX_SPEED) this.sx = -MAX_SPEED;
	if (this.sy >  MAX_SPEED) this.sy =  MAX_SPEED;
	if (this.sy < -MAX_SPEED) this.sy = -MAX_SPEED;
}


//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
Banana.prototype.update = function () {
	if (this.throwing) {
		if (this.throwCounter++ > THROW_DURATION) {
			this.throwing = false;
		}
		this.levelCollisions();
	} else if (this.flying) {
		this.sx += clip((this.owner.x - this.x) * ACCELERATION, -MAX_ACCELERATION, MAX_ACCELERATION);
		this.sy += clip((this.owner.y - this.y) * ACCELERATION, -MAX_ACCELERATION, MAX_ACCELERATION);

		this.sx *= FRICTION;
		this.sy *= FRICTION;

		this.maxSpeed();
		this.levelCollisions();
		
	} else {
		this.x = this.owner.x + 3;
		this.y = this.owner.y + 3;
	}
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
Banana.prototype.levelCollisions = function () {

	var x = this.x + this.sx;
	var y = this.y + this.sy;


	if (level.getTileAt(x, this.y).isSolid) {
		this.sx *= -1;
		x = this.x; // TODO
		// x = ~~(x / TILE_WIDTH) * TILE_WIDTH + frontOffset;
	}

	if (level.getTileAt(this.x, y).isSolid) {
		this.sy *= -1;
		y = this.y; // TODO
	}


	// fetch position
	this.x = x;
	this.y = y;
};


//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
Banana.prototype.fire = function (sx, sy) {
	this.flying = true;
	this.throwing = true;
	this.throwCounter = 0;
	this.sx = sx;
	this.sy = sy;
	this.maxSpeed();
};