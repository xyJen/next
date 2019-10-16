"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parseColor = parseColor;
exports.setFillColor = setFillColor;
exports.setStrokeColor = setStrokeColor;
exports.Gradient = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _colorRgba = _interopRequireDefault(require("color-rgba"));

require("gl-matrix").glMatrix.setMatrixArrayType(Array);

var Gradient =
/*#__PURE__*/
function () {
  function Gradient(_ref) {
    var vector = _ref.vector,
        colors = _ref.colors;
    (0, _classCallCheck2.default)(this, Gradient);

    if (!Array.isArray(vector) || vector.length !== 4 && vector.length !== 6) {
      throw new TypeError('Invalid gradient');
    }

    this.vector = vector;
    this.colors = colors.map(function (_ref2) {
      var offset = _ref2.offset,
          color = _ref2.color;
      return {
        offset: offset,
        color: parseColor(color)
      };
    });
  }

  (0, _createClass2.default)(Gradient, [{
    key: "toString",
    value: function toString() {
      return JSON.stringify({
        vector: this.vector,
        colors: this.colors
      });
    }
  }]);
  return Gradient;
}();

exports.Gradient = Gradient;

function parseColor(color) {
  // if(Array.isArray(color)) return color;
  if (color == null) return color;
  if (!color) color = 'transparent';
  if (color instanceof Gradient) return color;
  var ret = (0, _colorRgba.default)(color);
  if (!ret || !ret.length) throw new TypeError('Invalid color value.');
  return "rgba(".concat(ret.join(), ")");
}

function setFillColor(mesh, _ref3) {
  var fillColor = _ref3.color;

  if (fillColor.vector) {
    // gradient
    var vector = fillColor.vector,
        colors = fillColor.colors;

    if (vector.length === 4) {
      mesh.setLinearGradient({
        vector: vector,
        colors: colors,
        type: 'fill'
      });
    } else {
      mesh.setRadialGradient({
        vector: vector,
        colors: colors,
        type: 'fill'
      });
    }
  } else {
    if (mesh.gradient) delete mesh.gradient.fill;
    mesh.setFill({
      color: fillColor
    });
  }

  return mesh;
}

function setStrokeColor(mesh, _ref4) {
  var strokeColor = _ref4.color,
      lineWidth = _ref4.lineWidth,
      lineCap = _ref4.lineCap,
      lineJoin = _ref4.lineJoin,
      lineDash = _ref4.lineDash,
      lineDashOffset = _ref4.lineDashOffset,
      miterLimit = _ref4.miterLimit;

  if (strokeColor.vector) {
    // gradient
    var _strokeColor = strokeColor,
        vector = _strokeColor.vector,
        colors = _strokeColor.colors;

    if (vector.length === 4) {
      mesh.setLinearGradient({
        vector: vector,
        colors: colors,
        type: 'stroke'
      });
    } else {
      mesh.setRadialGradient({
        vector: vector,
        colors: colors,
        type: 'stroke'
      });
    }

    strokeColor = [0, 0, 0, 1];
  } else if (mesh.gradient) {
    delete mesh.gradient.stroke;
  }

  mesh.setStroke({
    color: strokeColor,
    thickness: lineWidth,
    cap: lineCap,
    join: lineJoin,
    miterLimit: miterLimit,
    lineDash: lineDash,
    lineDashOffset: lineDashOffset
  });
}