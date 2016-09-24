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

var GAMEPAD = new Gamepad();

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
function getGamepad() {
	var gamepads = navigator.getGamepads();
	var gamepad = gamepads[0]; // TODO: all gamepads
	if (!gamepad) {
		GAMEPAD.available = false;
		return GAMEPAD;
	}

	GAMEPAD.available = true;

	// buttons
	for (var i = 0; i < MAPPING_BUTTONS.length; i++) {
		var key = MAPPING_BUTTONS[i];
		var button = gamepad.buttons[i];
		GAMEPAD.btnp[key] = !GAMEPAD.btn[key] &&  button;
		GAMEPAD.btnr[key] =  GAMEPAD.btn[key] && !button;
		GAMEPAD.btn[key]  =  button.pressed;
	}

	// axes
	GAMEPAD.x = gamepad.axes[0];
	GAMEPAD.y = gamepad.axes[1];
	GAMEPAD.z = gamepad.axes[2];
	GAMEPAD.w = gamepad.axes[3];

	// triggers
	GAMEPAD.lt = gamepad.buttons[6].value;
	GAMEPAD.rt = gamepad.buttons[7].value;

	return GAMEPAD;
}

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
function getGamepadFallback() {
	return GAMEPAD;
}

module.exports = GAMEPAD_AVAILABLE ? getGamepad : getGamepadFallback;
