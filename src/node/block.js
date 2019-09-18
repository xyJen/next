import {Figure2D, Mesh2D} from '@mesh.js/core';
import {mat2d} from 'gl-matrix';
import Node from './node';
import Attr from '../attribute/block';
import {setFillColor, setStrokeColor} from '../utils/color';
import {createRadiusBox} from '../utils/border_radius';

const _borderBoxMesh = Symbol('borderBoxMesh');
const _clientBoxMesh = Symbol('clientBoxMesh');

export default class Block extends Node {
  static Attr = Attr;

  constructor(attrs = {}) {
    super(attrs);
  }

  get contentSize() {
    const {width, height} = this.attributes;
    return [width || 0, height || 0];
  }

  // content + padding
  get clientSize() {
    const {paddingTop, paddingRight, paddingBottom, paddingLeft} = this.attributes;
    const [width, height] = this.contentSize;
    return [paddingLeft + width + paddingRight,
      paddingTop + height + paddingBottom];
  }

  get borderSize() {
    const {paddingTop, paddingRight, paddingBottom, paddingLeft, borderWidth} = this.attributes;
    const [width, height] = this.contentSize;
    return [paddingLeft + width + paddingRight + borderWidth,
      paddingTop + height + paddingBottom + borderWidth];
  }

  // content + padding + border
  get offsetSize() {
    const {paddingTop, paddingRight, paddingBottom, paddingLeft, borderWidth} = this.attributes;
    const [width, height] = this.contentSize;
    const bw2 = 2 * borderWidth;
    return [paddingLeft + width + paddingRight + bw2,
      paddingTop + height + paddingBottom + bw2];
  }

  get isVisible() {
    const [width, height] = this.contentSize;

    return this.attributes.opacity > 0 && (!!this.hasBorder || width > 0 && height > 0);
  }

  get hasBorder() {
    const borderWidth = this.attributes.borderWidth;
    const borderColor = this.attributes.borderColor;

    return borderWidth > 0 && borderColor[3] > 0;
  }

  get hasBackground() {
    const bgcolor = this.attributes.bgcolor;
    return bgcolor && bgcolor[3] > 0;
  }

  get originalClientRect() {
    if(this.clientBox) {
      const boundingBox = this.clientBoxMesh.boundingBox;
      return [boundingBox[0][0], boundingBox[0][1], boundingBox[1][0] - boundingBox[0][0], boundingBox[1][1] - boundingBox[0][1]];
    }
    return [0, 0, 0, 0];
  }

  get originalContentRect() {
    const [left, top, width, height] = this.originalClientRect;
    const padding = this.attributes.padding;
    return [left + padding[0], top + padding[1], width - padding[0] - padding[2], height - padding[1] - padding[3]];
  }

  get borderBoxMesh() {
    if(this.hasBorder) {
      const resolution = this.getResolution();
      let borderBoxMesh = this[_borderBoxMesh];
      if(!borderBoxMesh) {
        borderBoxMesh = new Mesh2D(this.borderBox, resolution);
        borderBoxMesh.box = this.borderBox;
        this[_borderBoxMesh] = borderBoxMesh;

        const {borderColor, borderWidth, borderDash, borderDashOffset, opacity} = this.attributes;
        setStrokeColor(borderBoxMesh, {color: borderColor, lineWidth: borderWidth, lineDash: borderDash, lineDashOffset: borderDashOffset});
        borderBoxMesh.uniforms.u_opacity = opacity;
      } else if(borderBoxMesh.box !== this.borderBox) {
        borderBoxMesh.contours = this.borderBox.contours;
        borderBoxMesh.box = this.borderBox;
      }
      const m = this.renderMatrix;
      const m2 = borderBoxMesh.transformMatrix;
      if(!mat2d.equals(m, m2)) {
        borderBoxMesh.setTransform(...m);
      }
      return borderBoxMesh;
    }
    return null;
  }

  get clientBoxMesh() {
    if(this.clientBox) {
      let clientBoxMesh = this[_clientBoxMesh];
      const resolution = this.getResolution();

      if(!clientBoxMesh) {
        clientBoxMesh = new Mesh2D(this.clientBox, resolution);
        clientBoxMesh.box = this.clientBox;
        this[_clientBoxMesh] = clientBoxMesh;

        const {bgcolor, opacity} = this.attributes;

        if(bgcolor && bgcolor[3] > 0) {
          setFillColor(clientBoxMesh, {color: bgcolor});
        }
        clientBoxMesh.uniforms.u_opacity = opacity;
      } else if(clientBoxMesh.box !== this.clientBox) {
        clientBoxMesh.contours = this.clientBox.contours;
        clientBoxMesh.box = this.clientBox;
      }
      const m = this.renderMatrix;
      const m2 = clientBoxMesh.transformMatrix;
      if(!mat2d.equals(m, m2)) {
        clientBoxMesh.setTransform(...m);
      }
      return clientBoxMesh;
    }
    return null;
  }

  /* override */
  setResolution({width, height}) {
    super.setResolution({width, height});
    if(this.clientBoxMesh) this.clientBoxMesh.setResolution({width, height});
    if(this.borderBoxMesh) this.borderBoxMesh.setResolution({width, height});
  }

  // transformPoint(x, y) {
  //   const m = mat2d.invert(this.renderMatrix);
  //   const newX = x * m[0] + y * m[2] + m[4];
  //   const newY = x * m[1] + y * m[3] + m[5];
  //   return [newX, newY];
  // }

  isPointCollision(x, y) {
    const pointerEvents = this.attributes.pointerEvents;
    if(pointerEvents === 'none') return false;
    if(pointerEvents !== 'all' && !this.isVisible) return false;
    if(pointerEvents !== 'visibleStroke' && this.clientBoxMesh && this.clientBoxMesh.isPointCollision(x, y, 'fill')) {
      return true;
    }
    return pointerEvents !== 'visibleFill' && this.hasBorder && this.borderBoxMesh.isPointCollision(x, y, 'stroke');
  }

  onPropertyChange(key, newValue, oldValue) {
    super.onPropertyChange(key, newValue, oldValue);
    if(key === 'anchorX' || key === 'anchorY' || key === 'width' || key === 'height' || key === 'borderWidth'
      || key === 'paddingLeft' || key === 'paddingRight' || key === 'paddingTop' || key === 'paddingBottom'
      || /^border(TopLeft|TopRight|BottomRight|BottomLeft)Radius$/.test(key)) {
      this.updateContours();
    }
    if(this[_clientBoxMesh] && key === 'bgcolor') {
      setFillColor(this[_clientBoxMesh], {color: newValue});
    }
    if(this[_borderBoxMesh]
      && (key === 'borderColor'
      || key === 'borderWidth'
      || key === 'borderDash'
      || key === 'borderDashOffset')) {
      const {borderColor, borderWidth, borderDash, borderDashOffset} = this.attributes;
      setStrokeColor(this[_borderBoxMesh], {color: borderColor, lineWidth: borderWidth, lineDash: borderDash, lineDashOffset: borderDashOffset});
    }
    if(key === 'zIndex' && this.parent) {
      this.parent.reorder();
    }
  }

  updateContours() {
    const {anchorX, anchorY, borderWidth, borderRadius} = this.attributes;
    const [width, height] = this.borderSize;
    const offsetSize = this.offsetSize;

    const bw = 0.5 * borderWidth;

    const left = -anchorX * offsetSize[0] + bw;
    const top = -anchorY * offsetSize[1] + bw;

    this.borderBox = this.borderBox || new Figure2D();
    createRadiusBox(this.borderBox, [left, top, width, height], borderRadius);
    // figure.rect(left, top, width, height);

    this.clientBox = this.clientBox || new Figure2D();
    createRadiusBox(this.clientBox, [left + bw, top + bw, width - borderWidth, height - borderWidth], borderRadius);
    // innerFigure.rect(left + bw, top + bw, width - borderWidth, height - borderWidth);
  }

  /* override */
  connect(parent, zOrder) {
    super.connect(parent, zOrder);
    this.setResolution(parent.getResolution());
    this.forceUpdate();
  }

  disconnect() {
    const parent = this.parent;
    super.disconnect();
    if(parent) parent.forceUpdate();
  }

  draw() {
    if(!this.isVisible) return [];

    const ret = [];

    const borderBoxMesh = this.borderBoxMesh;
    if(borderBoxMesh) {
      ret.push(borderBoxMesh);
    }

    const clientBoxMesh = this.clientBoxMesh;
    if(clientBoxMesh) {
      ret.push(clientBoxMesh);
    }

    return ret;
  }
}