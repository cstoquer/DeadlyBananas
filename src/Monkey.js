var level = require('./Level');

var TILE_WIDTH  = settings.spriteSize[0];
var TILE_HEIGHT = settings.spriteSize[1];

var GRAVITY     = 0.5;
var MAX_GRAVITY = 3;

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
function Monkey() {
	this.x  = 0;
	this.y  = 0;
	this.w  = TILE_WIDTH;
	this.h  = TILE_HEIGHT;
	this.sx = 0;
	this.sy = 0;

	// flags
	this.jumping  = false;
	this.grounded = false;
	this.isLocked = false;

	// counters
	this.jumpCounter = 0; // TODO: 

	// rendering
	this.flipH = false;
}

module.exports = Monkey;

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
Monkey.prototype.draw = function () {
	sprite(0, this.x, this.y, this.flipH);
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
Monkey.prototype.update = function (dt) {
	this._updateControls();

	// TODO: movement, gravity, friction

	this.sx *= 0.8; // friction TODO dt

	if (!this.grounded) {
		this.sy += GRAVITY;
		this.sy = Math.min(this.sy, MAX_GRAVITY);
	}
	this.levelCollisions();
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
Monkey.prototype.startJump = function () {
	if (!this.grounded) return;

	// if there is a ceiling directly on top of Monkey's head, cancel jump.
	// if (level.getTileAt(this.x + 1, this.y - 2).isSolid || level.getTileAt(this.x + 6, this.y - 2).isSolid) return;
	this.grounded    = false;
	this.jumping     = true;
	this.jumpCounter = 0;
};

Monkey.prototype.jump = function () {
	if (!this.jumping) return;
	if (this.jumpCounter++ > 12) this.jumping = false;
	this.sy = -3 + this.jumpCounter * 0.08;
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
Monkey.prototype._updateControls = function () {
	if (!this.isLocked) {
		if (btnp.up)  this.startJump();
		if (btnr.up)  this.jumping = false;
		if (btn.up)   this.jump();

		if ( btn.right && !btn.left) { this.sx =  1; this.flipH = false; } // going right
		if (!btn.right &&  btn.left) { this.sx = -1; this.flipH = true;  } // going left

		// if (btnp.A) this.action();
	} else {
		if (btn.up) this.jump(); // FIXME: this is to allow jump continuation during attack
	}
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
Monkey.prototype.levelCollisions = function () {
	// round speed
	this.sx = ~~(this.sx * 100) / 100;
	this.sy = ~~(this.sy * 100) / 100;

	var x = this.x + this.sx; // TODO dt
	var y = this.y + this.sy; // TODO dt

	// TODO: check level boundaries

	var front       = this.w;
	var frontOffset = 0;
	if (this.sx < 0) { front = 0; frontOffset = this.w; }

	//---------------------------------------------------------
	// horizontal collisions (check 2 front point)
	if (this.sx !== 0) {
		if (level.getTileAt(x + front, this.y + 1).isSolid || level.getTileAt(x + front, this.y + this.h - 1).isSolid) {
			this.sx = 0;
			x = ~~(x / TILE_WIDTH) * TILE_WIDTH + frontOffset;
		}
	}

	//---------------------------------------------------------
	// vertical collisions
	if (this.grounded) {
		// check if there is still floor under Monkey's feets
		var tileDL = level.getTileAt(x + 1,          y + this.h + 1);
		var tileDR = level.getTileAt(x + this.w - 2, y + this.h + 1);
		if (tileDL.isEmpty && tileDR.isEmpty) this.grounded = false;
	} else if (this.sy > 0) {
		// Monkey is falling. Check what is underneath
		var tileDL = level.getTileAt(x + 1,          y + this.h);
		var tileDR = level.getTileAt(x + this.w - 2, y + this.h);
		if (tileDL.isSolid || tileDR.isSolid) {
			// collided with solid ground
			this._ground();
			y = ~~(y / TILE_HEIGHT) * TILE_HEIGHT;
		} else if (tileDL.isTopSolid || tileDR.isTopSolid) {
			// collided with one-way thru platform. Check if Monkey where over the edge the frame before.
			var targetY = ~~(y / TILE_HEIGHT) * TILE_HEIGHT;
			if (this.y <= targetY) {
				this._ground();
				y = targetY;
			}
		}
	} else if (this.sy < 0) {
		// Monkey is moving upward. Check for ceiling collision
		var tileUL = level.getTileAt(x + 1,          y);
		var tileUR = level.getTileAt(x + this.w - 2, y);
		if (tileUL.isSolid || tileUR.isSolid) {
			this.sy = 0;
			y = ~~(y / TILE_HEIGHT) * TILE_HEIGHT + this.w;
		}
	}

	// fetch position
	this.x = x;
	this.y = y;
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
Monkey.prototype._ground = function () {
	this.grounded = true;
	this.jumping  = false;
	this.sy = 0;
};
