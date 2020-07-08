export default class SortableTable {
  element;
  constructor(
    header = [], {
      data = []
    } = {}) {
    this.header = [...header];
    this.data = [...data];

    this.render();
  }

  template() {
    return `
      <div class="sortable-table">
        <div data-element="header" class="sortable-table__header sortable-table__row">
            ${this.renderHeader(this.header)}
        </div>
        <div data-element="body" class="sortable-table__body">
            ${this.renderBody(this.data)}
        </div>
        <div data-element="loading" class="loading-line sortable-table__loading-line"></div>
        <div data-element="emptyPlaceholder" class="sortable-table__empty-placeholder">
          <div>
            <p>No products satisfies your filter criteria</p>
            <button type="button" class="button-primary-outline">Reset all filters</button>
          </div>
        </div>
      </div>
    `
    ;
  }

  renderRow(row) {
    return this.header
      .map(obj => obj.template
        ? obj.template(row[obj.id])
        : `<div class="sortable-table__cell" data-name="${obj.id}">${row[obj.id]}</div>`
      )
      .join('');
  }

  renderBody(data) {
    return data
      .map(row => `
        <a href="/products/${row.id}" class="sortable-table__row">
            ${this.renderRow(row)}
        </a>
      `)
      .join('');
  }

  renderHeader(header) {
    return header
      .map(item => `
        <div class="sortable-table__cell" data-name="${item.id}" ${item.sortable ? `data-sortable` : ``}>
          <span>${item.title}</span>
          ${item.sortable
    ? `
              <span class="sortable-table__sort-arrow">
                <span class="sort-arrow"></span>
              </span>
            `
    : ``
}
        </div>
      `)
      .join('');
  }

  render() {
    const element = document.createElement('div');
    element.innerHTML = this.template();
    this.element = element.firstElementChild;
    this.subElements = this.getSubElements();
  }

  getSubElements() {
    const elements = this.element.querySelectorAll('[data-element]');
    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;
      return accum;
    }, {});
  }

  sortByType(fieldValue, orderValue = 'asc', type = 'string') {
    const direction = {
      asc: 1,
      desc: -1
    };
    switch (type) {
    case 'string':
      this.data = [...this.data].sort((a, b) => {
        return direction[orderValue] * a[fieldValue].localeCompare(b[fieldValue], ['ru-RU'], {caseFirst: 'upper'});
      });
      break;
    case 'number':
      this.data = [...this.data].sort((a, b) => {
        return direction[orderValue] * (a[fieldValue] - b[fieldValue]);
      });
      break;
    }
  }

  sort(fieldValue, orderValue) {
    const headerItem = this.header.find(item => item.id === fieldValue);
    if (headerItem === undefined) {
      return;
    }
    switch (headerItem?.sortType) {
    case 'number':
    case 'string':
      this.sortByType(fieldValue, orderValue, headerItem.sortType);
      break;
    }
    this.subElements.body.innerHTML = this.renderBody(this.data);
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
  }
}

