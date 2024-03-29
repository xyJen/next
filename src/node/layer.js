import {Renderer} from '@mesh.js/core';
import {Timeline} from 'sprite-animator';
import Group from './group';
import ownerDocument from '../document';

const defaultOptions = {
  antialias: true,
  autoRender: true,
};

const _autoRender = Symbol('autoRender');
const _renderer = Symbol('renderer');
const _timeline = Symbol('timeline');

export default class Layer extends Group {
  constructor(options = {}) {
    super();
    const canvas = options.canvas;
    const opts = Object.assign({}, defaultOptions, options);
    this[_autoRender] = opts.autoRender;
    delete options.autoRender;
    this[_renderer] = new Renderer(canvas, opts);
    this.setResolution(canvas);
    this.options = options;
    this.canvas = canvas;
    this[_timeline] = new Timeline();
  }

  /* override */
  get renderer() {
    return this[_renderer];
  }

  get layer() {
    return this;
  }

  get timeline() {
    return this[_timeline];
  }

  get renderOffset() {
    if(this.parent && this.parent.options) {
      const {left, top} = this.parent.options;
      return [left, top];
    }
    return [0, 0];
  }

  /* override */
  setResolution({width, height}) {
    if(this.canvas) {
      this.canvas.width = width;
      this.canvas.height = height;
    }
    if(this.renderer.glRenderer) {
      this.renderer.glRenderer.gl.viewport(0, 0, width, height);
    }
    if(this.parent && this.parent.options) {
      const {left, top} = this.parent.options;
      this.renderer.setGlobalTransform(1, 0, 0, 1, left, top);
    }
    super.setResolution({width, height});
  }

  toLocalPos(x, y) {
    const {width, height} = this.getResolution();
    const offset = this.renderOffset;
    const viewport = [this.canvas.clientWidth, this.canvas.clientHeight];
    x = x * width / viewport[0] - offset[0];
    y = y * height / viewport[1] - offset[1];

    return [x, y];
  }

  toGlobalPos(x, y) {
    const {width, height} = this.getResolution();
    const offset = this.renderOffset;
    const viewport = [this.canvas.clientWidth, this.canvas.clientHeight];

    x = x * viewport[0] / width + offset[0];
    y = y * viewport[1] / height + offset[1];

    return [x, y];
  }

  render() {
    const meshes = this.draw();
    this[_renderer].clear();
    if(meshes && meshes.length) {
      this.renderer.drawMeshes(meshes);
    }
  }

  /* override */
  forceUpdate() {
    if(this[_autoRender] && !this.prepareRender) {
      this.prepareRender = new Promise((resolve) => {
        requestAnimationFrame(() => {
          delete this.prepareRender;
          this.render();
          resolve();
        });
      });
    }
  }
}

ownerDocument.registerNode(Layer, 'layer');