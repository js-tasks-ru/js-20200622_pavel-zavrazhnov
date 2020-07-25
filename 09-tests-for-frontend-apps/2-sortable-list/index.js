export default class SortableList {
  draggingItem = null;

  constructor({
    items = []
  } = {}) {
    this.items = [...items];

    this.render();
  }

  startDragging (item, {clientX, clientY}) {
    this.itemInitIndex = [...this.element.children].indexOf(item);
    this.pointerInitShift = {
      x: clientX - item.getBoundingClientRect().x,
      y: clientY - item.getBoundingClientRect().y
    };
    this.draggingItem = item;
    this.placeholderItem = document.createElement('div');
    this.placeholderItem.className = 'sortable-list__placeholder';
    item.style.width = item.offsetWidth + 'px';
    item.style.height = item.offsetHeight + 'px';
    this.placeholderItem.style.width = item.style.width;
    this.placeholderItem.style.height = item.style.height;
    item.classList.add('sortable-list__item_dragging');
    item.after(this.placeholderItem);
    this.element.append(item);
    this.moveDraggingAt(item.clientX, item.clientY);
    document.addEventListener('pointermove', this.onDocumentPointerMove);
    document.addEventListener('pointerup', this.onDocumentPointerUp);
  }

  moveDraggingAt(x, y) {
    this.draggingItem.style.left = x - this.pointerInitShift.x + "px";
    this.draggingItem.style.top = y - this.pointerInitShift.y + "px";
  }

  onDocumentPointerMove = event => {
    this.moveDraggingAt(event.clientX, event.clientY);
    if (event.clientY < this.element.firstElementChild.getBoundingClientRect().top) {
      this.movePlaceholderAt(0);
    } else if (event.clientY > this.element.lastElementChild.getBoundingClientRect().bottom) {
      this.movePlaceholderAt(this.element.children.length);
    } else {
      for (let i = 0; i < this.element.children.length; i++) {
        let item = this.element.children[i];
        if (item !== this.draggingItem && (event.clientY > item.getBoundingClientRect().top && event.clientY < item.getBoundingClientRect().bottom)) {
          if (event.clientY < item.getBoundingClientRect().top + item.offsetHeight / 2) {
            this.movePlaceholderAt(i);
            break;
          }
          this.movePlaceholderAt(i + 1);
          break;
        }
      }}
    this.scrollIfCloseToWindowEdge(event);
  }

  scrollIfCloseToWindowEdge(event) {
    if (event.clientY < 20) {
      window.scrollBy(0, -10);
    } else if (event.clientY > document.documentElement.clientHeight - 20) {
      window.scrollBy(0, 10);
    }
  }

  movePlaceholderAt(index) {
    if (this.element.children[index] !== this.placeholderItem) {
      this.element.insertBefore(this.placeholderItem, this.element.children[index]);
    }
  }

  onDocumentPointerUp = event => {
    this.stopDragging();
  }

  stopDragging() {
    //let index = [...this.element.children].indexOf(this.placeholderItem);
    this.placeholderItem.replaceWith(this.draggingItem);
    this.draggingItem.classList.remove('sortable-list__item_dragging');
    this.draggingItem.style.left = '';
    this.draggingItem.style.top = '';
    this.draggingItem.style.width = '';
    this.draggingItem.style.height = '';
    document.removeEventListener('pointermove', this.onDocumentPointerMove);
    document.removeEventListener('pointerup', this.onDocumentPointerUp);
    this.draggingItem = null;
  }

  onPointerDown = event => {
    const item = event.target.closest('.sortable-list__item'); // down to item list region
    if (item && event.target.closest('[data-grab-handle]')) { // down to draggable region
      event.preventDefault();
      this.startDragging(item, event);
    }
    if (item && event.target.closest('[data-delete-handle]')) { // to remove item region
      event.preventDefault();
      this.removeItem(item);
    }
  }

  render () {
    this.element = document.createElement('ul');
    this.element.className = 'sortable-list';
    for (let item of this.items) {
      this.addItem(item);
    }

    this.element.addEventListener("pointerdown", this.onPointerDown);
  }

  addItem(item) {
    item.classList.add('sortable-list__item');
    this.element.append(item);
  }

  removeItem(item) {
    item.remove();
  }

  remove () {
    this.element.remove();
  }

  destroy () {
    this.remove();
  }
}
