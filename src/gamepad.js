var MAPPING_BUTTONS = [
	'A', 'B', 'X', 'Y',           // buttons
	'lb', 'rb', 'lt','rt',        // bumpers and triggers
	'back', 'start',              // menu
	'lp', 'rp',                   // axis push
	'up', 'down', 'left', 'right' // dpad
];

var GAMEPAD_AVAILABLE = !!(navigator && navigator.getGamepads);

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
function Gamepad() {
	this.available = false;

	// buttons
	this.btn  = {};
	this.btnp = {};
	this.btnr = {};

	// axes
	this.x = 0;
	this.y = 0;
	this.z = 0;
	this.w = 0;

	// trigger analog value
	this.lt = 0;
	this.rt = 0;

	this._setupButtons();
}

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
Gamepad.prototype._setupButtons = function () {
	for (var i = 0; i < MAPPING_BUTTONS.length; i++) {
		var key = MAPPING_BUTTONS[i];
		this.btn[key]  = false;
		this.btnp[key] = false;
		this.btnr[key] = false;
	}
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
// function gamepadHandler(event, connecting) {
// 	console.log('Gamepad event', connecting)
// 	var gamepad = event.gamepad;
// 	if (connecting) {
// 		gamepads[gamepad.index] = gamepad;
// 	} else {
// 		delete gamepads[gamepad.index];
// 	}
// }

// window.addEventListener("gamepadconnected",    function (e) { gamepadHandler(e, true);  }, false);
// window.addEventListener("gamepaddisconnected", function (e) { gamepadHandler(e, false); }, false);

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
var GAMEPADS = [
	new Gamepad(),
	new Gamepad(),
	new Gamepad(),
	new Gamepad()
];

var ANY_GAMEPADS = new Gamepad();

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
function getAllGamepads() {
	var gamepads = navigator.getGamepads();

	for (var gamepadIndex = 0; gamepadIndex < 4; gamepadIndex++) {
		var gamepad = gamepads[gamepadIndex];
		var GAMEPAD = GAMEPADS[gamepadIndex];
		if (!gamepad) {
			GAMEPAD.available = false;
			continue;
		}

		GAMEPAD.available = true;

		// buttons
		for (var i = 0; i < MAPPING_BUTTONS.length; i++) {
			var key = MAPPING_BUTTONS[i];
			var button = gamepad.buttons[i].pressed;
			GAMEPAD.btnp[key] = !GAMEPAD.btn[key] &&  button;
			GAMEPAD.btnr[key] =  GAMEPAD.btn[key] && !button;
			GAMEPAD.btn[key]  =  button;
		}

		// axes
		GAMEPAD.x = gamepad.axes[0];
		GAMEPAD.y = gamepad.axes[1];
		GAMEPAD.z = gamepad.axes[2];
		GAMEPAD.w = gamepad.axes[3];

		// triggers
		GAMEPAD.lt = gamepad.buttons[6].value;
		GAMEPAD.rt = gamepad.buttons[7].value;
	}

	return GAMEPADS;
}

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
function getGamepadsFallback() {
	return GAMEPADS;
}

exports.getAllGamepads = GAMEPAD_AVAILABLE ? getAllGamepads : getGamepadsFallback;

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
exports.getAnyGamepad = function () {
	exports.getAllGamepads();
	
	// buttons
	for (var i = 0; i < MAPPING_BUTTONS.length; i++) {
		var key = MAPPING_BUTTONS[i];
		ANY_GAMEPADS.btnp[key] = btnp[key] || GAMEPADS[0].btnp[key] || GAMEPADS[1].btnp[key] || GAMEPADS[2].btnp[key] || GAMEPADS[3].btnp[key];
		ANY_GAMEPADS.btnr[key] = btnr[key] || GAMEPADS[0].btnr[key] || GAMEPADS[1].btnr[key] || GAMEPADS[2].btnr[key] || GAMEPADS[3].btnr[key];
		ANY_GAMEPADS.btn[key]  = btn[key]  || GAMEPADS[0].btn[key]  || GAMEPADS[1].btn[key]  || GAMEPADS[2].btn[key]  || GAMEPADS[3].btn[key];
	}

	// TODO: axes and triggers

	return ANY_GAMEPADS;
}

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
var inputMode = 0;

exports.setInpuMode = function (num) {
	inputMode = num;
};

exports.getGamepad = function () {
	// TODO optimize this (only  get the relevant gamepad)
	if (inputMode === -1) return window;
	return getAllGamepads()[inputMode];
};

