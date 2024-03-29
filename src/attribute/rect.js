import Path from './path';
import {toNumber, toArray} from '../utils/attribute_value';

const setDefault = Symbol.for('spritejs_setAttributeDefault');
const setAttribute = Symbol.for('spritejs_setAttribute');
const getAttribute = Symbol.for('spritejs_getAttribute');
// const _subject = Symbol.for('spritejs_subject');

function getPath(attr) {
  const {x, y, width, height} = attr;
  return `M${x} ${y}L${x + width} ${y}L${x + width} ${y + height}L${x} ${y + height}Z`;
}

export default class Rect extends Path {
  constructor(subject) {
    super(subject);

    this[setDefault]({
      width: 0,
      height: 0,
      /* size */
    });
  }

  // readonly
  get d() {
    return this[getAttribute]('d');
  }

  get width() {
    return this[getAttribute]('width');
  }

  set width(value) {
    value = toNumber(value);
    if(this[setAttribute]('width', value)) {
      const d = getPath(this);
      this[setAttribute]('d', d);
    }
  }

  get height() {
    return this[getAttribute]('height');
  }

  set height(value) {
    value = toNumber(value);
    if(this[setAttribute]('height', value)) {
      const d = getPath(this);
      this[setAttribute]('d', d);
    }
  }

  get size() {
    return [this.width, this.height];
  }

  set size(value) {
    value = toArray(value);
    if(!Array.isArray(value)) value = [value, value];
    this.width = value[0];
    this.height = value[1];
  }
}