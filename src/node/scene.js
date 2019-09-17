import {createCanvas} from '@mesh.js/core/src/utils/canvas';
import Layer from './layer';
import Group from './group';
import createPointerEvents from '../event/pointer-events';

function delegateEvents(scene) {
  const events = ['mousedown', 'mouseup', 'mousemove',
    'touchstart', 'touchend', 'touchmove', 'touchcancel',
    'click', 'dblclick'];

  const container = scene.container;
  const {left, top} = scene.options;

  events.forEach((eventType) => {
    container.addEventListener(eventType, (event) => {
      const layers = scene.orderedChildren;
      const pointerEvents = createPointerEvents(event, {offsetLeft: left, offsetTop: top});
      pointerEvents.forEach((evt) => {
        for(let i = 0; i < layers.length; i++) {
          const layer = layers[i];
          if(layer.options.handleEvent !== false) {
            const ret = layer.dispatchPointerEvent(evt);
            if(ret) return true;
          }
        }
      });
    }, {passive: true});
  });
}

export default class Scene extends Group {
  /**
    width
    height
    mode: 'static', 'scale', 'sticky-width', 'sticky-height, 'sticky-top', 'sticky-bottom', 'sticky-left', 'sticky-right'
   */
  constructor(container, options = {}) {
    super();
    this.container = container;
    this.options = options;
    options.displayRatio = options.displayRatio || 1.0;
    options.mode = options.mode || 'static';

    options.left = 0;
    options.top = 0;

    if(options.width == null || options.height == null) {
      global.addEventListener('resize', () => {
        this.setResolution();
      });
    }
    this.setResolution(options);
    delegateEvents(this);
  }

  /* override */
  setResolution({width, height} = {}) {
    const container = this.container;
    if(width == null || height == null) {
      const {clientWidth, clientHeight} = container;
      width = width == null ? clientWidth : width;
      height = height == null ? clientHeight : height;
    }

    const options = this.options;
    options.width = options.displayRatio * width;
    options.height = options.displayRatio * height;

    const mode = options.mode;
    const {clientWidth, clientHeight} = container;
    if(mode === 'sticky-height' || mode === 'sticky-left' || mode === 'sticky-right') {
      const w = options.width;
      options.width = clientWidth * options.height / clientHeight;
      if(mode === 'sticky-height') options.left = 0.5 * (options.width - w);
      if(mode === 'sticky-right') options.left = options.width - w;
      // console.log(clientWidth, width);
    } else if(mode === 'sticky-width' || mode === 'sticky-top' || mode === 'sticky-bottom') {
      const h = options.height;
      options.height = clientHeight * options.width / clientWidth;
      if(mode === 'sticky-width') options.top = 0.5 * (options.height - h);
      if(mode === 'sticky-bottom') options.top = options.height - h;
    }
    super.setResolution(options);
  }

  layer(id) {
    const layers = this.orderedChildren;
    for(let i = 0; i < layers.length; i++) {
      if(layers[i].id === id) return layers[i];
    }

    const {width, height, mode} = this.options;

    const canvas = createCanvas(width, height, {offscreen: false});
    canvas.style.position = 'absolute';

    if(mode === 'static') {
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
    } else {
      canvas.style.width = '100%';
      canvas.style.height = '100%';
    }
    canvas.style.top = '50%';
    canvas.style.left = '50%';
    canvas.style.transform = 'translate(-50%, -50%)';
    canvas.style.webkitTransform = 'translate(-50%, -50%)';

    this.container.appendChild(canvas);
    if(!this.container.style.overflow) this.container.style.overflow = 'hidden';
    const layer = new Layer(canvas, this.options);
    layer.id = id;
    this.appendChild(layer);
    return layer;
  }
}