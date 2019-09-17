import Block from './block';
import Attr from '../attribute/group';

const _zOrder = Symbol('zOrder');

const _ordered = Symbol('ordered');

export default class Group extends Block {
  static Attr = Attr;

  constructor(attrs = {}) {
    super(attrs);
    this.children = [];
    this[_ordered] = null;
    this[_zOrder] = 0;
  }

  reorder() {
    this[_ordered] = null;
  }

  get orderedChildren() {
    if(!this[_ordered]) {
      this[_ordered] = [...this.children];
      this[_ordered].sort((a, b) => {
        return a.zIndex - b.zIndex || a.zOrder - b.zOrder;
      });
    }
    return this[_ordered];
  }

  /* override */
  get contentSize() {
    const {width, height} = this.attributes;
    const {width: rw, height: rh} = this.getResolution();
    return [
      width != null ? width : rw,
      height != null ? height : rh,
    ];
  }

  /* override */
  get hasBackground() {
    return this.children.length > 0;
  }

  /* override */
  setResolution({width, height}) {
    super.setResolution({width, height});
    this.children.forEach((child) => {
      child.setResolution({width, height});
    });
  }

  appendChild(el) {
    el.remove();
    this.children.push(el);
    el.connect(this, this[_zOrder]++);
    if(this[_ordered]) {
      if(this[_ordered].length && el.zIndex < this[_ordered][this[_ordered].length - 1].zIndex) {
        this.reorder();
      } else {
        this[_ordered].push(el);
      }
    }
  }

  replaceChild(el, ref) {
    el.remove();
    const refIdx = this.children.indexOf(ref);
    if(refIdx < 0) {
      throw new Error('Invalid reference node.');
    }
    this.children[refIdx] = el;
    el.connect(this, ref.zOrder);
    if(this[_ordered]) {
      if(el.zIndex !== ref.zIndex) {
        this.reorder();
      } else {
        const idx = this[_ordered].indexOf(ref);
        this[_ordered][idx] = el;
      }
    }
    ref.disconnect();
  }

  removeChild(el) {
    const idx = this.children.indexOf(el);
    if(idx >= 0) {
      this.children.splice(idx, 1);
      if(this[_ordered]) {
        const _idx = this[_ordered].indexOf(el);
        this[_ordered].splice(_idx, 1);
      }
      el.disconnect();
      return true;
    }
    return false;
  }

  insertBefore(el, ref) {
    el.remove();
    const refIdx = this.children.indexOf(ref);
    if(refIdx < 0) {
      throw new Error('Invalid reference node.');
    }
    const zOrder = ref.zOrder;
    for(let i = refIdx; i < this.children.length; i++) {
      const order = this.children[i].zOrder;
      const child = this.children[i];
      delete child.zOrder;
      Object.defineProperty(child, 'zOrder', {
        value: order + 1,
        writable: false,
        configurable: true,
      });
    }
    this.children.splice(refIdx, 0, el);
    el.connect(this, zOrder);
    if(this[_ordered]) {
      if(el.zIndex !== ref.zIndex) {
        this.reorder();
      } else {
        const idx = this[_ordered].indexOf(ref);
        this[_ordered].splice(idx, 0, el);
      }
    }
  }

  /* override */
  dispatchPointerEvent(event) {
    const children = this.orderedChildren;
    for(let i = children.length - 1; i >= 0; i--) {
      const child = children[i];
      if(child.dispatchPointerEvent(event)) return true;
    }
    return false;
  }

  draw() {
    const meshes = [];
    this.orderedChildren.forEach((child) => {
      const res = child.draw();
      if(res) meshes.push(...res);
    });

    return meshes;
  }
}