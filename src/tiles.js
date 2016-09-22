var EMPTY   = exports.EMPTY   = { isEmpty: true,  isSolid: false, isTopSolid: false };
var SOLID   = exports.SOLID   = { isEmpty: false, isSolid: true,  isTopSolid: true  };
var ONE_WAY = exports.ONE_WAY = { isEmpty: false, isSolid: false, isTopSolid: true  };

var tileBySprite = {
	'0': SOLID,
	'1': ONE_WAY
};

exports.getTileFromMapItem = function (mapItem) {
	if (!mapItem) return EMPTY;
	return tileBySprite[mapItem.sprite] || EMPTY;
};

