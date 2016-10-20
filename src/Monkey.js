// var viewManager = require('./viewManager');
var gameView    = require('./view/gameView');
var level       = require('./level');
var Weapon      = require('./Weapon');
var AABB        = require('./AABBcollision');
var tiles       = require('./tiles');

var TILE_WIDTH  = settings.spriteSize[0];
var TILE_HEIGHT = settings.spriteSize[1];

var GRAVITY     = 0.5;
var MAX_GRAVITY = 3;
var SPEED_WALK  = 1;
var SPEED_RUN   = 2;
var THROW_SPEED = 4;

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
function Monkey(gamepadIndex, monkeyIndex, weaponIndex) {
	this.x  = 0;
	this.y  = 0;
	this.w  = TILE_WIDTH;
	this.h  = TILE_HEIGHT;

	this.gamepadIndex = gamepadIndex || 0;
	this.asset  = assets.monkey[monkeyIndex];

	this.weapon = new Weapon(this, weaponIndex);
	
	this.maxLife = 4;
	this.lifePoints = this.maxLife;

	// rendering
	this.sprite = gamepadIndex * 16;

	this.reset();
}

module.exports = Monkey;

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
Monkey.prototype.reset = function () {
	this.sx = 0;
	this.sy = 0;
	this.dx = 0;
	this.dy = 0;

	// state
	this.onTile = tiles.EMPTY;

	// flags
	this.aiming   = false;
	this.jumping  = false;
	this.grounded = false;
	this.isLocked = false;
	this.isHit    = false;

	// counters
	this.jumpCounter = 0;
	this.hitCounter  = 0;

	// rendering
	this.frame = 0;
	this.flipH = false;
	
	this.weapon.reset();
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
Monkey.prototype.draw = function () {
	if (this.aiming) {
		draw(this.asset.arrowDot, this.x + this.dx * 6,  this.y + this.dy * 6  - 7);
		draw(this.asset.arrowDot, this.x + this.dx * 11, this.y + this.dy * 11 - 7);
		draw(this.asset.arrow,    this.x + this.dx * 16, this.y + this.dy * 16 - 7);
	}

	// idle
	var img = this.asset.idle;

	// hit
	if (this.isHit && this.isLocked) img = this.asset.hit;

	//jumping
	else if (this.jumping) img = this.asset.jump;

	//running
	else if (this.sx > 0.5 || this.sx < -0.5) {
		this.frame += 0.3;
		if (this.frame >= 3) this.frame = 0;
		img = this.asset['run' + ~~this.frame];
	}

	draw(img, this.x - 1, this.y - 1, this.flipH);
	this.weapon.draw();
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
Monkey.prototype.update = function (gamepads) {
	this._updateControls(gamepads);

	// movement, gravity, friction
	this.sx *= this.isHit ? 0.99 : 0.8;

	if (!this.grounded) {
		this.sy += GRAVITY;
		this.sy = Math.min(this.sy, MAX_GRAVITY);
	}

	// hit
	if (this.isHit) {
		this.hitCounter++;
		if (this.hitCounter > 16) {
			if (this.lifePoints <= 0) this.death();
			this.isLocked = false;
		}
		// keep Monkey invulnerable for few more frames
		if (this.hitCounter > 50) this.isHit = false;
	}

	this.levelCollisions();

	this.weapon.update();
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
Monkey.prototype.aim = function (gamepad) {
	if (this.weapon.flying) return;

	this.aiming = true;

	// throw direction
	// this.dx = 0;
	// this.dy = 0;
	if (gamepad.x >  0.2) this.flipH = false;
	if (gamepad.x < -0.2) this.flipH = true;
	// if (gamepad.y >  0.5)  this.dy += 1;
	// if (gamepad.y < -0.5)  this.dy -= 1;

	// // orient monkey in aiming direction
	// if (this.dx === 0 && this.dy === 0) this.dx = this.flipH ? -1 : 1;

	if (Math.abs(gamepad.x) < 0.2 && Math.abs(gamepad.y) < 0.2) {
		// no aim, just throw forward
		this.dx = this.flipH ? -1 : 1;
		this.dy = 0;
	} else {
		var a = Math.atan2(gamepad.y, gamepad.x);
		this.dx = Math.cos(a);
		this.dy = Math.sin(a);
	}
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
Monkey.prototype.teleport = function () {
	if (!this.weapon.flying) return;
	var position = this.weapon.getTeleportPosition();
	if (!position) return;
	// TODO: cooldown

	// sfx('teleport');

	this.weapon.x = this.x + 4;
	this.weapon.y = this.y + 4;
	this.x = position.x;
	this.y = position.y;

	this.grounded = false;
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
Monkey.prototype.startJump = function () {
	if (!this.grounded) return;

	// sfx('jump');

	// if there is a ceiling directly on top of Monkey's head, cancel jump.
	// if (level.getTileAt(this.x + 1, this.y - 2).isSolid || level.getTileAt(this.x + 6, this.y - 2).isSolid) return;
	this.grounded    = false;
	this.jumping     = true;
	this.jumpCounter = 0;
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
Monkey.prototype.jump = function () {
	if (!this.jumping) return;
	if (this.jumpCounter++ > 12) this.jumping = false;
	this.sy = -3 + this.jumpCounter * 0.08;
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
Monkey.prototype.fire = function (gamepad) {
	this.aiming = false;
	// this.weapon.fire(this.dx * THROW_SPEED, this.dy * THROW_SPEED);

	var dx, dy;

	if (Math.abs(gamepad.x) < 0.2 && Math.abs(gamepad.y) < 0.2) {
		// no aim, just throw forward
		dx = this.flipH ? -THROW_SPEED : THROW_SPEED;
		dy = 0;
	} else {
		var a = Math.atan2(gamepad.y, gamepad.x);
		dx = Math.cos(a) * THROW_SPEED;
		dy = Math.sin(a) * THROW_SPEED;
	}

	this.weapon.fire(dx, dy);
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
Monkey.prototype._updateControls = function (gamepads) {
	if (this.isLocked) return;

	var gamepad = gamepads[this.gamepadIndex];

	// throw weapon
	if (gamepad.btnr.X && !this.weapon.flying) this.fire(gamepad);

	// teleport
	if (gamepad.btnp.X && this.weapon.flying) this.teleport();

	// jump
	if (gamepad.btnp.A) this.startJump();
	if (gamepad.btnr.A) this.jumping = false;
	if (gamepad.btn.A)  this.jump();

	// aiming
	if (gamepad.btn.X) return this.aim(gamepad);

	// move
	if (gamepad.x >  0.5) { this.sx = gamepad.btn.rt ?  SPEED_RUN :  SPEED_WALK; this.flipH = false; }
	if (gamepad.x < -0.5) { this.sx = gamepad.btn.rt ? -SPEED_RUN : -SPEED_WALK; this.flipH = true;  }

	// check tile
	var tile = this.onTile = level.getTileAt(this.x + 4, this.y + 4);
	if (tile.kill) return this.death();
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
Monkey.prototype.levelCollisions = function () {
	// round speed
	this.sx = ~~(this.sx * 100) / 100;
	this.sy = ~~(this.sy * 100) / 100;

	var x = this.x + this.sx; // TODO dt
	var y = this.y + this.sy; // TODO dt

	// check level boundaries
	var maxX = level.width  * TILE_WIDTH - this.w; // TODO don't need to be calculated each frames
	var maxY = level.height * TILE_HEIGHT + 64; // give monkey 8 more tiles for chnce to teleport
	if (x < 0)    x = 0;
	if (x > maxX) x = maxX;
	if (y > maxY) {
		// sfx('fall');
		this.death();
		return;
	}

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

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
Monkey.prototype.checkCollisionWithEntity = function (entity) {
	var weapon = this.weapon;
	if (                 entity.collisionMonkey && AABB(this,   entity)) entity.collisionMonkey(this);
	if (weapon.flying && entity.collisionWeapon && AABB(weapon, entity)) entity.collisionWeapon(weapon);
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
Monkey.prototype.hit = function (entity) {
	if (this.isHit) return;

	// sfx('hit');

	this.sx = entity.x < this.x ? 1.6 : -1.6;
	this.sy = entity.y < this.y ? 2 : -3;

	// TODO
	this.aiming     = false;
	this.grounded   = false;
	this.isLocked   = true;
	this.isHit      = true;
	this.hitCounter = 0;

	this.lifePoints -= 1;
	gameView.shakeCamera(3);
	// gameView.updateHealthHUD(this.gamepadIndex);
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
Monkey.prototype.death = function () {
	// audioManager.stopLoopSound('weapon');
	// TODO animation
	this.lifePoints = this.maxLife;
	this.isHit      = true;
	this.isLocked   = true;
	// viewManager.open('gameover');

	// TODO
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
Monkey.prototype.collisionWeapon = function (weapon) {
	// sfx('explosion');
	this.hit(weapon);
	// TODO
};
