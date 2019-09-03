import Attr from '../attribute/node';

export default class {
  static Attr = Attr;

  constructor() {
    this.attributes = new this.constructor.Attr(this);
    // if(Object.seal) {
    //   Object.seal(this.attributes);
    // }
  }

  get nodeName() {
    return 'node';
  }

  get layer() {
    return this.parent && this.parent.layer;
  }

  get zIndex() {
    return this.attributes.zIndex;
  }

  remove() {
    if(this.parent && this.parent.removeChild) {
      this.parent.removeChild(this);
      return true;
    }
    return false;
  }

  onPropertyChange(key, newValue, oldValue) {
    // if(this.layer && this.layer.useCSS) {
    //   this.updateCSS();
    // }
  }

  forceUpdate() {

  }

  updateCSS() {

  }

  reflow() {

  }

  relayout() {

  }

  // 获取可继承的和被样式影响的属性
  getComputedAttribute(key) {

  }

  setAttribute(key, value) {
    this.attributes[key] = value;
  }

  getAttribute(key) {
    return this.attributes[key];
  }

  connect(parent, zOrder) {
    Object.defineProperty(this, 'parent', {
      value: parent,
      writable: false,
      configurable: true,
    });
    Object.defineProperty(this, 'zOrder', {
      value: zOrder,
      writable: false,
      configurable: true,
    });
  }

  disconnect() {
    delete this.parent;
    delete this.zOrder;
  }
}