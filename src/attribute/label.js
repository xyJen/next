import parseFont from '@mesh.js/core/src/utils/parse-font';
import {toNumber, toString} from '../utils/attribute_value';
import {parseColor} from '../utils/color';
import Block from './block';

const setDefault = Symbol.for('spritejs_setAttributeDefault');
const setAttribute = Symbol.for('spritejs_setAttribute');
const getAttribute = Symbol.for('spritejs_getAttribute');
const attributes = Symbol.for('spritejs_attributes');

export default class Label extends Block {
  constructor(subject) {
    super(subject);
    this[setDefault]({
      text: '',
      fontSize: 16,
      fontFamily: 'sans-serif',
      fontStyle: 'normal',
      fontVariant: 'normal',
      fontWeight: 'normal',
      fontStretch: 'normal',
      lineHeight: '',
      /* font */
      textAlign: 'left',
      strokeColor: undefined,
      fillColor: [0, 0, 0, 1],
      verticalAlign: 'middle',
    });
  }

  get [attributes]() {
    const ret = super[attributes];
    return Object.assign(ret, {
      font: this.font,
    });
  }

  get text() {
    return this[getAttribute]('text') || ' ';
  }

  set text(value) {
    this[setAttribute]('text', toString(value));
  }

  get fontSize() {
    return this[getAttribute]('fontSize');
  }

  set fontSize(value) {
    this[setAttribute]('fontSize', toNumber(value));
  }

  get fontFamily() {
    return this[getAttribute]('fontFamily');
  }

  set fontFamily(value) {
    this[setAttribute]('fontFamily', toString(value));
  }

  get fontStyle() {
    return this[getAttribute]('fontStyle');
  }

  set fontStyle(value) {
    this[setAttribute]('fontStyle', toString(value));
  }

  get fontVariant() {
    return this[getAttribute]('fontVariant');
  }

  set fontVariant(value) {
    this[setAttribute]('fontVariant', toString(value));
  }

  get fontWeight() {
    return this[getAttribute]('fontWeight');
  }

  set fontWeight(value) {
    this[setAttribute]('fontWeight', toString(value));
  }

  get fontStretch() {
    return this[getAttribute]('fontStretch');
  }

  set fontStretch(value) {
    this[setAttribute]('fontStretch', toString(value));
  }

  get lineHeight() {
    return this[getAttribute]('lineHeight') || this.fontSize;
  }

  set lineHeight(value) {
    this[setAttribute]('lineHeight', toNumber(value));
  }

  get textAlign() {
    return this[getAttribute]('textAlign');
  }

  set textAlign(value) {
    this[setAttribute]('textAlign', toString(value));
  }

  get strokeColor() {
    return this[getAttribute]('strokeColor');
  }

  set verticalAlign(value) {
    this[setAttribute]('verticalAlign', toString(value));
  }

  get verticalAlign() {
    return this[getAttribute]('verticalAlign');
  }

  set strokeColor(value) {
    this[setAttribute]('strokeColor', parseColor(value));
  }

  get fillColor() {
    return this[getAttribute]('fillColor');
  }

  set fillColor(value) {
    this[setAttribute]('fillColor', parseColor(value));
  }

  get font() {
    const {fontStyle, fontVariant, fontWeight, fontStretch, fontSize, lineHeight, fontFamily} = this;
    return `${fontStyle} ${fontVariant} ${fontWeight} ${fontStretch} ${fontSize}px/${lineHeight}px ${fontFamily}`;
  }

  set font(value) {
    const fontInfo = parseFont(value);
    this.fontStyle = fontInfo.style;
    this.fontVariant = fontInfo.variant;
    this.fontWeight = fontInfo.weight;
    this.fontStretch = fontInfo.stretch;
    this.fontSize = fontInfo.size;
    if(fontInfo.lineHeight) {
      this.lineHeight = fontInfo.pxLineHeight;
    }
    this.fontFamily = fontInfo.family;
  }
}