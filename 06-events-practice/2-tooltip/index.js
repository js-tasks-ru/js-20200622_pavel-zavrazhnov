class Tooltip {
  element;

  setPosition (left, top) {
    this.element.style.left = (left + 5) + 'px';
    this.element.style.top = (top + 5) + 'px';
  }

  onHandleEvent = (event) => {
    if (event.target.dataset.tooltip !== undefined) {
      switch (event.type) {
      case 'pointerover':
        this.render(event.target.dataset.tooltip);
        this.setPosition(event.clientX, event.clientY);
        break;
      case 'pointerout':
        this.remove();
        break;
      case 'pointermove':
        if (this.element) {
          this.setPosition(event.clientX, event.clientY);
        }
        break;
      }
    }
  };

  render (text) {
    this.element = document.createElement('div');
    this.element.className = 'tooltip';
    this.element.innerHTML = text;
    document.body.append(this.element);
  }

  initEventListeners() {
    document.addEventListener('pointerover', this.onHandleEvent);
    document.addEventListener('pointerout', this.onHandleEvent);
    document.addEventListener('pointermove', this.onHandleEvent);
  }

  removeEventListeners() {
    document.removeEventListener('pointerover', this.onHandleEvent);
    document.removeEventListener('pointerout', this.onHandleEvent);
    document.removeEventListener('pointermove', this.onHandleEvent);
  }

  initialize () {
    this.initEventListeners();
  }

  destroy() {
    this.removeEventListeners();
    this.remove();
  }

  remove () {
    if (this.element) {
      this.element.remove();
      this.element = null;
    }
  }
}

const tooltip = new Tooltip();

export default tooltip;
