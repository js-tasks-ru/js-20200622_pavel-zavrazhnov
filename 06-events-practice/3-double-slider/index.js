export default class DoubleSlider {
  element;
  subElements = {};

  constructor({
    min = 0,
    max = 1000,
    formatValue = value => '$' + value,
    selected = {
      from: min,
      to: max
    }
  } = {}) {
    this.min = min;
    this.max = max;
    this.formatValue = formatValue;
    this.selected = {
      from: selected.from,
      to: selected.to
    };

    this.render();
  }

  valueToPercent (value) {
    return (value - this.min) / (this.max - this.min) * 100;
  }

  getRange() {
    const rangeValue = this.max - this.min;
    return {
      from: Math.round(this.min + .01 * parseFloat(this.subElements.thumbLeft.style.left) * (rangeValue)),
      to: Math.round(this.max - .01 * parseFloat(this.subElements.thumbRight.style.right) * (rangeValue))
    };
  }

  getSubElements() {
    const elements = this.element.querySelectorAll('[data-element]');
    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;
      return accum;
    }, {});
  }

  getRangeFrom () {
    return `<span data-element="from">${this.formatValue(this.selected.from)}</span>`;
  }

  getRangeTo () {
    return `<span data-element="to">${this.formatValue(this.selected.to)}</span>`;
  }

  getRangeProgress () {
    const left = this.valueToPercent(this.selected.from);
    const right = 100 - this.valueToPercent(this.selected.to);
    return `<span class="range-slider__progress" data-element="progress" style="left: ${left}%; right: ${right}%"></span>`;
  }

  getLeftThumb () {
    const left = this.valueToPercent(this.selected.from);
    return `<span class="range-slider__thumb-left" data-element="thumbLeft" style="left: ${left}%"></span>`;
  }

  getRightThumb () {
    const right = 100 - this.valueToPercent(this.selected.to);
    return `<span class="range-slider__thumb-right" data-element="thumbRight" style="right: ${right}%"></span>`;
  }

  getSlider () {
    return `
      <div class="range-slider">
        ${this.getRangeFrom()}
        <div class="range-slider__inner" data-element="inner">
            ${this.getRangeProgress()}
            ${this.getLeftThumb()}
            ${this.getRightThumb()}
        </div>
        ${this.getRangeTo()}
      </div>`;
  }

  onThumbPointerMove = (event) => {
    const innerRect = this.subElements.inner.getBoundingClientRect();
    switch (this.draggingThumb.dataset.element) {
    case 'thumbLeft':
      let newThumbLeft = (event.clientX - innerRect.left + this.shiftX) / innerRect.width;
      if (newThumbLeft < 0) {
        newThumbLeft = 0;
      }
      newThumbLeft *= 100;
      const currentThumbRight = parseFloat(this.subElements.thumbRight.style.right);
      if (newThumbLeft + currentThumbRight > 100) {
        newThumbLeft = 100 - currentThumbRight;
      }
      this.draggingThumb.style.left = this.subElements.progress.style.left = newThumbLeft + "%";
      this.subElements.from.innerHTML = this.formatValue(this.getRange().from);
      break;
    case 'thumbRight':
      let newThumbRight = (innerRect.right - event.clientX - this.shiftX) / innerRect.width;
      if (newThumbRight < 0) {
        newThumbRight = 0;
      }
      newThumbRight *= 100;
      const currentThumbLeft = parseFloat(this.subElements.thumbLeft.style.left);
      if (newThumbRight + currentThumbLeft > 100) {
        newThumbRight = 100 - currentThumbLeft;
      }
      this.draggingThumb.style.right = this.subElements.progress.style.right = newThumbRight + "%";
      this.subElements.to.innerHTML = this.formatValue(this.getRange().to);
      break;
    }
  }

  onThumbPointerDown = (event) => {
    event.preventDefault();
    const thumbClientRect = event.target.getBoundingClientRect();
    this.shiftX = event.target.dataset.element === 'thumbLeft'
      ? thumbClientRect.right - event.clientX
      : thumbClientRect.left - event.clientX;
    this.draggingThumb = event.target;
    this.element.classList.add('range-slider_dragging');
    document.addEventListener('pointermove', this.onThumbPointerMove);
    document.addEventListener('pointerup', this.onThumbPointerUp);
  }

  onThumbPointerUp = (event) => {
    this.element.classList.remove("range-slider_dragging");
    document.removeEventListener('pointermove', this.onThumbPointerMove);
    document.removeEventListener('pointerup', this.onThumbPointerUp);

    this.element.dispatchEvent(new CustomEvent("range-select", {
      detail: this.getRange()
    }));
  }

  render () {
    const $wrapper = document.createElement('div');
    $wrapper.innerHTML = this.getSlider();
    const element = $wrapper.firstElementChild;
    this.element = element;
    this.element.ondragstart = () => false;
    this.subElements = this.getSubElements(element);
    this.subElements.thumbLeft.addEventListener('pointerdown', this.onThumbPointerDown);
    this.subElements.thumbRight.addEventListener('pointerdown', this.onThumbPointerDown);
  }

  remove () {
    this.element.remove();
  }

  destroy () {
    this.remove();
  }
}
