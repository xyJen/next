"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _get2 = _interopRequireDefault(require("@babel/runtime/helpers/get"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _core = require("@mesh.js/core");

var _glMatrix = require("gl-matrix");

var _node = _interopRequireDefault(require("./node"));

var _block = _interopRequireDefault(require("../attribute/block"));

var _color = require("../utils/color");

var _border_radius = require("../utils/border_radius");

var _filter = require("../utils/filter");

var _document = _interopRequireDefault(require("../document"));

var _bounding_box = _interopRequireDefault(require("../utils/bounding_box"));

require("gl-matrix").glMatrix.setMatrixArrayType(Array);

var _borderBoxMesh = Symbol('borderBoxMesh');

var _clientBoxMesh = Symbol('clientBoxMesh');

var _filters = Symbol('filters');

var Block =
/*#__PURE__*/
function (_Node) {
  (0, _inherits2.default)(Block, _Node);

  function Block() {
    var attrs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    (0, _classCallCheck2.default)(this, Block);
    return (0, _possibleConstructorReturn2.default)(this, (0, _getPrototypeOf2.default)(Block).call(this, attrs));
  }

  (0, _createClass2.default)(Block, [{
    key: "getBoundingClientRect",
    value: function getBoundingClientRect() {
      var boundingBox = null;

      if (this.clientBoxMesh) {
        boundingBox = (0, _toConsumableArray2.default)(this.clientBoxMesh.boundingBox);
        var borderWidth = this.attributes.borderWidth;

        if (borderWidth) {
          boundingBox[0] = [boundingBox[0][0] - borderWidth, boundingBox[0][1] - borderWidth];
          boundingBox[1] = [boundingBox[1][0] + borderWidth, boundingBox[1][1] + borderWidth];
        }
      }

      return (0, _bounding_box.default)(boundingBox, this.renderMatrix);
    }
  }, {
    key: "setResolution",

    /* override */
    value: function setResolution(_ref) {
      var width = _ref.width,
          height = _ref.height;
      (0, _get2.default)((0, _getPrototypeOf2.default)(Block.prototype), "setResolution", this).call(this, {
        width: width,
        height: height
      });
      if (this.clientBoxMesh) this.clientBoxMesh.setResolution({
        width: width,
        height: height
      });
      if (this.borderBoxMesh) this.borderBoxMesh.setResolution({
        width: width,
        height: height
      });
    } // transformPoint(x, y) {
    //   const m = mat2d.invert(this.renderMatrix);
    //   const newX = x * m[0] + y * m[2] + m[4];
    //   const newY = x * m[1] + y * m[3] + m[5];
    //   return [newX, newY];
    // }

  }, {
    key: "isPointCollision",
    value: function isPointCollision(x, y) {
      var pointerEvents = this.attributes.pointerEvents;
      if (pointerEvents === 'none') return false;
      if (pointerEvents !== 'all' && !this.isVisible) return false;

      if (pointerEvents !== 'visibleStroke' && this.clientBoxMesh.isPointCollision(x, y, 'fill')) {
        return true;
      }

      return pointerEvents !== 'visibleFill' && this.hasBorder && this.borderBoxMesh.isPointCollision(x, y, 'stroke');
    }
  }, {
    key: "onPropertyChange",
    value: function onPropertyChange(key, newValue, oldValue) {
      // eslint-disable-line complexity
      (0, _get2.default)((0, _getPrototypeOf2.default)(Block.prototype), "onPropertyChange", this).call(this, key, newValue, oldValue);

      if (key === 'anchorX' || key === 'anchorY' || key === 'width' || key === 'height' || key === 'borderWidth' || key === 'paddingLeft' || key === 'paddingRight' || key === 'paddingTop' || key === 'paddingBottom' || /^border(TopLeft|TopRight|BottomRight|BottomLeft)Radius$/.test(key)) {
        this.updateContours();
      }

      if (key === 'opacity') {
        if (this[_clientBoxMesh]) this[_clientBoxMesh].uniforms.u_opacity = newValue;
        if (this[_borderBoxMesh]) this[_borderBoxMesh].uniforms.u_opacity = newValue;
      }

      if (this[_clientBoxMesh] && key === 'bgcolor') {
        (0, _color.setFillColor)(this[_clientBoxMesh], {
          color: newValue
        });
      }

      if (this[_borderBoxMesh] && (key === 'borderColor' || key === 'borderWidth' || key === 'borderDash' || key === 'borderDashOffset')) {
        var _this$attributes = this.attributes,
            borderColor = _this$attributes.borderColor,
            borderWidth = _this$attributes.borderWidth,
            borderDash = _this$attributes.borderDash,
            borderDashOffset = _this$attributes.borderDashOffset;
        (0, _color.setStrokeColor)(this[_borderBoxMesh], {
          color: borderColor,
          lineWidth: borderWidth,
          lineDash: borderDash,
          lineDashOffset: borderDashOffset
        });
      }

      if (key === 'zIndex' && this.parent) {
        this.parent.reorder();
      }

      if (key === 'filter') {
        this[_filters] = (0, _filter.parseFilterString)(newValue);

        if (this[_clientBoxMesh]) {
          (0, _filter.applyFilters)(this[_clientBoxMesh], this[_filters]);
        }

        if (this[_borderBoxMesh]) {
          (0, _filter.applyFilters)(this[_borderBoxMesh], this[_filters]);
        }
      }
    }
  }, {
    key: "updateContours",
    value: function updateContours() {
      var _this$attributes2 = this.attributes,
          anchorX = _this$attributes2.anchorX,
          anchorY = _this$attributes2.anchorY,
          borderWidth = _this$attributes2.borderWidth,
          borderRadius = _this$attributes2.borderRadius;

      var _this$borderSize = (0, _slicedToArray2.default)(this.borderSize, 2),
          width = _this$borderSize[0],
          height = _this$borderSize[1];

      var offsetSize = this.offsetSize;
      var bw = 0.5 * borderWidth;
      var left = -anchorX * offsetSize[0] + bw;
      var top = -anchorY * offsetSize[1] + bw;
      this.borderBox = new _core.Figure2D();
      (0, _border_radius.createRadiusBox)(this.borderBox, [left, top, width, height], borderRadius);
      var clientRect = [left + bw - 1, top + bw - 1, width - borderWidth + 2, height - borderWidth + 2];
      this.clientBox = new _core.Figure2D();
      (0, _border_radius.createRadiusBox)(this.clientBox, clientRect, borderRadius);
    }
    /* override */

  }, {
    key: "connect",
    value: function connect(parent, zOrder) {
      (0, _get2.default)((0, _getPrototypeOf2.default)(Block.prototype), "connect", this).call(this, parent, zOrder);
      this.setResolution(parent.getResolution());
      this.forceUpdate();
    }
  }, {
    key: "disconnect",
    value: function disconnect() {
      var parent = this.parent;
      (0, _get2.default)((0, _getPrototypeOf2.default)(Block.prototype), "disconnect", this).call(this);
      if (parent) parent.forceUpdate();
    }
  }, {
    key: "draw",
    value: function draw() {
      if (!this.isVisible) return [];
      var ret = [];
      var borderBoxMesh = this.borderBoxMesh;

      if (borderBoxMesh) {
        ret.push(borderBoxMesh);
      }

      var clientBoxMesh = this.clientBoxMesh;

      if (clientBoxMesh) {
        ret.push(clientBoxMesh);
      }

      return ret;
    }
  }, {
    key: "contentSize",
    get: function get() {
      var _this$attributes3 = this.attributes,
          width = _this$attributes3.width,
          height = _this$attributes3.height;
      return [width || 0, height || 0];
    } // content + padding

  }, {
    key: "clientSize",
    get: function get() {
      var _this$attributes4 = this.attributes,
          paddingTop = _this$attributes4.paddingTop,
          paddingRight = _this$attributes4.paddingRight,
          paddingBottom = _this$attributes4.paddingBottom,
          paddingLeft = _this$attributes4.paddingLeft;

      var _this$contentSize = (0, _slicedToArray2.default)(this.contentSize, 2),
          width = _this$contentSize[0],
          height = _this$contentSize[1];

      return [paddingLeft + width + paddingRight, paddingTop + height + paddingBottom];
    }
  }, {
    key: "borderSize",
    get: function get() {
      var _this$attributes5 = this.attributes,
          paddingTop = _this$attributes5.paddingTop,
          paddingRight = _this$attributes5.paddingRight,
          paddingBottom = _this$attributes5.paddingBottom,
          paddingLeft = _this$attributes5.paddingLeft,
          borderWidth = _this$attributes5.borderWidth;

      var _this$contentSize2 = (0, _slicedToArray2.default)(this.contentSize, 2),
          width = _this$contentSize2[0],
          height = _this$contentSize2[1];

      return [paddingLeft + width + paddingRight + borderWidth, paddingTop + height + paddingBottom + borderWidth];
    } // content + padding + border

  }, {
    key: "offsetSize",
    get: function get() {
      var _this$attributes6 = this.attributes,
          paddingTop = _this$attributes6.paddingTop,
          paddingRight = _this$attributes6.paddingRight,
          paddingBottom = _this$attributes6.paddingBottom,
          paddingLeft = _this$attributes6.paddingLeft,
          borderWidth = _this$attributes6.borderWidth;

      var _this$contentSize3 = (0, _slicedToArray2.default)(this.contentSize, 2),
          width = _this$contentSize3[0],
          height = _this$contentSize3[1];

      var bw2 = 2 * borderWidth;
      return [paddingLeft + width + paddingRight + bw2, paddingTop + height + paddingBottom + bw2];
    }
  }, {
    key: "isVisible",
    get: function get() {
      var _this$contentSize4 = (0, _slicedToArray2.default)(this.contentSize, 2),
          width = _this$contentSize4[0],
          height = _this$contentSize4[1];

      return this.attributes.opacity > 0 && (!!this.hasBorder || width > 0 && height > 0);
    }
  }, {
    key: "hasBorder",
    get: function get() {
      var borderWidth = this.attributes.borderWidth;
      return borderWidth > 0;
    }
  }, {
    key: "hasBackground",
    get: function get() {
      return !!this.attributes.bgcolor;
    }
  }, {
    key: "originalClientRect",
    get: function get() {
      if (this.clientBox) {
        var boundingBox = this.clientBoxMesh.boundingBox;
        return [boundingBox[0][0], boundingBox[0][1], boundingBox[1][0] - boundingBox[0][0], boundingBox[1][1] - boundingBox[0][1]];
      }

      return [0, 0, 0, 0];
    }
  }, {
    key: "originalContentRect",
    get: function get() {
      var _this$originalClientR = (0, _slicedToArray2.default)(this.originalClientRect, 4),
          left = _this$originalClientR[0],
          top = _this$originalClientR[1],
          width = _this$originalClientR[2],
          height = _this$originalClientR[3];

      var padding = this.attributes.padding;
      return [left + padding[0], top + padding[1], width - padding[0] - padding[2], height - padding[1] - padding[3]];
    }
  }, {
    key: "borderBoxMesh",
    get: function get() {
      if (this.hasBorder) {
        var resolution = this.getResolution();
        var borderBoxMesh = this[_borderBoxMesh];

        if (!borderBoxMesh) {
          borderBoxMesh = new _core.Mesh2D(this.borderBox, resolution);
          borderBoxMesh.box = this.borderBox;
          this[_borderBoxMesh] = borderBoxMesh;
          var _this$attributes7 = this.attributes,
              borderColor = _this$attributes7.borderColor,
              borderWidth = _this$attributes7.borderWidth,
              borderDash = _this$attributes7.borderDash,
              borderDashOffset = _this$attributes7.borderDashOffset,
              opacity = _this$attributes7.opacity;
          (0, _color.setStrokeColor)(borderBoxMesh, {
            color: borderColor,
            lineWidth: borderWidth,
            lineDash: borderDash,
            lineDashOffset: borderDashOffset
          });
          borderBoxMesh.uniforms.u_opacity = opacity;

          if (this[_filters]) {
            (0, _filter.applyFilters)(borderBoxMesh, this[_filters]);
          }
        } else if (borderBoxMesh.box !== this.borderBox) {
          borderBoxMesh.contours = this.borderBox.contours;
          borderBoxMesh.box = this.borderBox;
        }

        var m = this.renderMatrix;
        var m2 = borderBoxMesh.transformMatrix;

        if (!_glMatrix.mat2d.equals(m, m2)) {
          var _borderBoxMesh2;

          (_borderBoxMesh2 = borderBoxMesh).setTransform.apply(_borderBoxMesh2, (0, _toConsumableArray2.default)(m));
        }

        return borderBoxMesh;
      }

      return null;
    }
  }, {
    key: "clientBoxMesh",
    get: function get() {
      if (this.clientBox) {
        var clientBoxMesh = this[_clientBoxMesh];
        var resolution = this.getResolution();

        if (!clientBoxMesh) {
          clientBoxMesh = new _core.Mesh2D(this.clientBox, resolution);
          clientBoxMesh.box = this.clientBox;
          this[_clientBoxMesh] = clientBoxMesh;
          var _this$attributes8 = this.attributes,
              bgcolor = _this$attributes8.bgcolor,
              opacity = _this$attributes8.opacity;

          if (this.hasBackground) {
            (0, _color.setFillColor)(clientBoxMesh, {
              color: bgcolor
            });
          }

          clientBoxMesh.uniforms.u_opacity = opacity;

          if (this[_filters]) {
            (0, _filter.applyFilters)(clientBoxMesh, this[_filters]);
          }
        } else if (clientBoxMesh.box !== this.clientBox) {
          clientBoxMesh.contours = this.clientBox.contours;
          clientBoxMesh.box = this.clientBox;
        }

        var m = this.renderMatrix;
        var m2 = clientBoxMesh.transformMatrix;

        if (!_glMatrix.mat2d.equals(m, m2)) {
          var _clientBoxMesh2;

          (_clientBoxMesh2 = clientBoxMesh).setTransform.apply(_clientBoxMesh2, (0, _toConsumableArray2.default)(m));
        }

        return clientBoxMesh;
      }

      return null;
    }
  }]);
  return Block;
}(_node.default);

exports.default = Block;
(0, _defineProperty2.default)(Block, "Attr", _block.default);

_document.default.registerNode(Block, 'block');