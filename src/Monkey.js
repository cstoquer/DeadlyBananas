var level       = require('./Level');
var Banana      = require('./Banana');

var TILE_WIDTH  = settings.spriteSize[0];
var TILE_HEIGHT = settings.spriteSize[1];

var GRAVITY     = 0.5;
var MAX_GRAVITY = 3;
var SPEED_WALK  = 1;
var SPEED_RUN   = 2;

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
function Monkey(gamepadIndex) {
	this.x  = 0;
	this.y  = 0;
	this.w  = TILE_WIDTH;
	this.h  = TILE_HEIGHT;
	this.sx = 0;
	this.sy = 0;

	this.gamepadIndex = gamepadIndex || 0;
	this.banana = new Banana(this);

	// flags
	this.jumping  = false;
	this.grounded = false;
	this.isLocked = false;

	// counters
	this.jumpCounter = 0; // TODO: 

	// rendering
	this.sprite = gamepadIndex * 16;
	this.frame = 0;
	this.flipH = false;
}

module.exports = Monkey;

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
Monkey.prototype.draw = function () {
	var s = 0;
	//jumping
	if (this.jumping) s = 1;

	//running
	else if (this.sx > 0.5 || this.sx < -0.5) {
		this.frame += 0.3;
		if (this.frame >= 3) this.frame = 0;
		s = 2 + ~~this.frame;
	}
	sprite(this.sprite + s, this.x, this.y, this.flipH);
	this.banana.draw();
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
Monkey.prototype.update = function (gamepads, dt) {
	this._updateControls(gamepads);

	// TODO: movement, gravity, friction

	this.sx *= 0.8; // friction TODO dt

	if (!this.grounded) {
		this.sy += GRAVITY;
		this.sy = Math.min(this.sy, MAX_GRAVITY);
	}
	this.levelCollisions();

	this.banana.update();
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
Monkey.prototype.action = function (gamepad) {
	// test if hold banana
	if (this.banana.flying) return; // TODO allow a number of extra push
	this.banana.fire(this.sx + gamepad.x * 4, this.sy + gamepad.y * 4);
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
Monkey.prototype.teleport = function () {
	// TODO: cooldown
	var x = this.x;
	var y = this.y;
	this.x = this.banana.x;
	this.y = this.banana.y;
	this.banana.x = x;
	this.banana.y = y;
	// TODO move monkey away from solid tile
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
Monkey.prototype._updateControls = function (gamepads) {
	var gamepad = gamepads[this.gamepadIndex];
	if (!this.isLocked) {
		if (gamepad.btnp.A) this.startJump();
		if (gamepad.btnr.A) this.jumping = false;
		if (gamepad.btn.A)  this.jump();

		if (gamepad.btn.right || gamepad.x >  0.5) { this.sx = gamepad.btn.rt ?  SPEED_RUN :  SPEED_WALK; this.flipH = false; } // going right
		if (gamepad.btn.left  || gamepad.x < -0.5) { this.sx = gamepad.btn.rt ? -SPEED_RUN : -SPEED_WALK; this.flipH = true;  } // going left

		if (gamepad.btnp.X) this.action(gamepad);
		if (gamepad.btnp.B) this.teleport(); // TODO
			

	} else {
		if (gamepad.btn.A) this.jump(); // FIXME: this is to allow jump continuation during attack
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
