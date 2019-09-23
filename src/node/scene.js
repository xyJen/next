import {createCanvas} from '@mesh.js/core/src/utils/canvas';
import Layer from './layer';
import Group from './group';
import createPointerEvents from '../event/pointer-events';
import Event from '../event/event';
import {loadTexture, loadFrames} from '../utils/texture_loader';
import ownerDocument from '../document';

const _enteredTargets = Symbol('enteredTargets');

function delegateEvents(scene) {
  const events = ['mousedown', 'mouseup', 'mousemove',
    'touchstart', 'touchend', 'touchmove', 'touchcancel',
    'click', 'dblclick'];

  const container = scene.container;
  const {left, top} = scene.options;

  container.addEventListener('mouseleave', (event) => {
    const enteredTargets = scene[_enteredTargets];
    if(enteredTargets.size) {
      const leaveEvent = new Event('mouseleave');
      leaveEvent.originalEvent = event;
      [...enteredTargets].forEach((target) => {
        target.dispatchEvent(leaveEvent);
      });
      scene[_enteredTargets].clear();
    }
  }, {passive: true});

  events.forEach((eventType) => {
    container.addEventListener(eventType, (event) => {
      const layers = scene.orderedChildren;
      const pointerEvents = createPointerEvents(event, {offsetLeft: left, offsetTop: top});
      pointerEvents.forEach((evt) => {
        // evt.scene = scene;
        for(let i = 0; i < layers.length; i++) {
          const layer = layers[i];
          if(layer.options.handleEvent !== false) {
            const ret = layer.dispatchPointerEvent(evt);
            if(ret) break;
          }
        }
        if(evt.type === 'mousemove') {
          const target = evt.target;
          const enteredTargets = scene[_enteredTargets];
          let enterSet;

          if(target) {
            const ancestors = target.ancestors || [];
            enterSet = new Set([target, ...ancestors]);
          } else {
            enterSet = new Set();
          }

          const entries = Object.entries(event);
          if(!enteredTargets.has(target)) {
            if(target) {
              const enterEvent = new Event('mouseenter');
              entries.forEach(([key, value]) => {
                enterEvent[key] = value;
              });

              enteredTargets.add(target);
              target.dispatchEvent(enterEvent);
              const ancestors = target.ancestors;

              if(ancestors) {
                ancestors.forEach((ancestor) => {
                  if(!enteredTargets.has(ancestor)) {
                    enteredTargets.add(ancestor);
                    ancestor.dispatchEvent(enterEvent);
                  }
                });
              }
            }
          }

          const leaveEvent = new Event('mouseleave');
          entries.forEach(([key, value]) => {
            leaveEvent[key] = value;
          });
          [...enteredTargets].forEach((target) => {
            if(!enterSet.has(target)) {
              enteredTargets.delete(target);
              target.dispatchEvent(leaveEvent);
            }
          });
        }
      });
    }, {passive: true});
  });
}

function setSize(options, canvas) {
  let {width, height, mode, container} = options;
  const {clientWidth, clientHeight} = container;

  width = width || clientWidth;
  height = height || clientHeight;

  if(mode === 'static') {
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    canvas.style.top = '50%';
    canvas.style.left = '50%';
    canvas.style.transform = 'translate(-50%, -50%)';
    canvas.style.webkitTransform = 'translate(-50%, -50%)';
  } else {
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = `${clientWidth}px`;
    canvas.style.height = `${clientHeight}px`;
  }
}

export default class Scene extends Group {
  /**
    width
    height
    mode: 'static', 'scale', 'stickyWidth', 'stickyHeight, 'stickyTop', 'stickyBottom', 'stickyLeft', 'stickyRight'
   */
  constructor(options = {}) {
    super();
    this.container = options.container;
    this.options = options;
    options.displayRatio = options.displayRatio || 1.0;
    options.mode = options.mode || 'scale';

    options.left = 0;
    options.top = 0;
    options.autoResize = options.autoResize || true;

    // if(options.width == null || options.height == null) {
    //   global.addEventListener('resize', () => {
    //     this.setResolution();
    //   });
    // }

    if(options.autoResize) {
      const _resizeHandler = () => {
        this.resize();
      };
      /* istanbul ignore next */
      this.container.addEventListener('DOMNodeRemovedFromDocument', () => {
        global.removeEventListener('resize', _resizeHandler);
      });

      global.addEventListener('resize', _resizeHandler);
    }

    this[_enteredTargets] = new Set();
    this.setResolution(options);
    delegateEvents(this);
  }

  /* override */
  setResolution({width, height} = {}) {
    const container = this.container;
    const {clientWidth, clientHeight} = container;
    if(width == null || height == null) {
      width = width == null ? clientWidth : width;
      height = height == null ? clientHeight : height;
    }

    const {mode, displayRatio} = this.options;
    width *= displayRatio;
    height *= displayRatio;

    if(mode === 'stickyHeight' || mode === 'stickyLeft' || mode === 'stickyRight') {
      const w = width;
      width = clientWidth * height / clientHeight;
      if(mode === 'stickyHeight') this.options.left = 0.5 * (width - w);
      if(mode === 'stickyRight') this.options.left = width - w;
    } else if(mode === 'stickyWidth' || mode === 'stickyTop' || mode === 'stickyBottom') {
      const h = height;
      height = clientHeight * width / clientWidth;
      if(mode === 'stickyWidth') this.options.top = 0.5 * (height - h);
      if(mode === 'stickyBottom') this.options.top = height - h;
    }
    super.setResolution({width, height});
  }

  resize() {
    const options = this.options;
    this.children.forEach((layer) => {
      setSize(options, layer.canvas);
    });
    const {mode, width, height} = options;
    if(mode !== 'scale' && mode !== 'static' || mode === 'static' && (width == null || height == null)) {
      this.setResolution({width, height});
    }
  }

  async preload(...resources) {
    const ret = [],
      tasks = [];

    for(let i = 0; i < resources.length; i++) {
      const res = resources[i];
      let task;

      if(typeof res === 'string') {
        task = loadTexture(res);
      } else if(Array.isArray(res)) {
        task = loadFrames(...res);
      } else {
        const {id, src} = res;
        task = loadTexture(src, id);
      }
      /* istanbul ignore if  */
      if(!(task instanceof Promise)) {
        task = Promise.resolve(task);
      }

      tasks.push(task.then((r) => {
        ret.push(r);
        const preloadEvent = new Event('preload');
        preloadEvent.detail = {current: r, loaded: ret, resources};
        this.dispatchEvent(preloadEvent);
      }));
    }

    await Promise.all(tasks);
    return ret;
  }

  layer(id, options = {}) {
    options = Object.assign({}, this.options, options);
    const layers = this.orderedChildren;
    for(let i = 0; i < layers.length; i++) {
      if(layers[i].id === id) return layers[i];
    }

    const {width, height} = this.options;
    const canvas = createCanvas(width, height, {offscreen: false});
    canvas.style.position = 'absolute';

    setSize(this.options, canvas);

    canvas.dataset.layerId = id;

    this.container.appendChild(canvas);
    if(!this.container.style.overflow) this.container.style.overflow = 'hidden';

    options.canvas = canvas;

    const layer = new Layer(options);
    layer.id = id;
    this.appendChild(layer);
    return layer;
  }
}

ownerDocument.registerNode(Scene, 'scene');