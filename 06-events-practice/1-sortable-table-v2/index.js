export default class SortableTable {
  element;
  subElements = {};
  headersConfig = [];
  data = [];

  onHeaderPointerDown = (event) => {
    const order = ['', 'asc'].includes(event.currentTarget.dataset.order) ? 'desc' : 'asc';
    this.sort(event.currentTarget.dataset.id, order);
  }

  constructor(headersConfig, {
    data = []
  } = {}) {
    const field = headersConfig.find(col => col.sortable);
    this.headersConfig = headersConfig;
    this.data = data;

    this.render();
    this.sort(field.id, 'asc');
  }

  getTableHeader() {
    return `<div data-element="header" class="sortable-table__header sortable-table__row">
      ${this.headersConfig.map(item => this.getHeaderRow(item)).join('')}</div>`;
  }

  getHeaderRow({id, title, sortable}) {
    return `
      <div class="sortable-table__cell" data-id="${id}" data-sortable="${sortable}">
        <span>${title}</span>
        ${this.getHeaderSortingArrow()}
      </div>
    `;
  }

  getHeaderSortingArrow() {
    return `
      <span data-element="arrow" class="sortable-table__sort-arrow">
        <span class="sort-arrow"></span>
      </span>`;
  }

  getTableBody(data) {
    return `
      <div data-element="body" class="sortable-table__body">
        ${this.getTableRows(data)}
      </div>`;
  }

  getTableRows(data) {
    return data.map(item => `
      <div class="sortable-table__row">
        ${this.getTableRow(item, data)}
      </div>`
    ).join('');
  }

  getTableRow(item) {
    const cells = this.headersConfig.map(({id, template}) => {
      return {
        id,
        template
      };
    });

    return cells.map(({id, template}) => {
      return template
        ? template(item[id])
        : `<div class="sortable-table__cell">${item[id]}</div>`;
    }).join('');
  }

  getTable(data) {
    return `
      <div class="sortable-table">
        ${this.getTableHeader()}
        ${this.getTableBody(data)}
      </div>`;
  }

  render() {
    const $wrapper = document.createElement('div');

    $wrapper.innerHTML = this.getTable(this.data);

    const element = $wrapper.firstElementChild;

    this.element = element;
    this.subElements = this.getSubElements(element);

    const allColumns = this.element.querySelectorAll('.sortable-table__cell[data-id]');
    allColumns.forEach(column => {
      if (column.dataset.sortable === 'true') {
        column.addEventListener('pointerdown', this.onHeaderPointerDown);
      }
    });
  }

  sort(field, order) {
    const sortedData = this.sortData(field, order);
    const allColumns = this.element.querySelectorAll('.sortable-table__cell[data-id]');
    const currentColumn = this.element.querySelector(`.sortable-table__cell[data-id="${field}"]`);

    // NOTE: Remove sorting arrow from other columns
    allColumns.forEach(column => {
      column.dataset.order = '';
    });

    currentColumn.dataset.order = order;

    this.subElements.body.innerHTML = this.getTableRows(sortedData);
  }

  sortData(field, order) {
    const arr = [...this.data];
    const column = this.headersConfig.find(item => item.id === field);
    const {sortType, customSorting} = column;
    const direction = order === 'asc' ? 1 : -1;

    return arr.sort((a, b) => {
      switch (sortType) {
      case 'number':
        return direction * (a[field] - b[field]);
      case 'string':
        return direction * a[field].localeCompare(b[field], ['ru-RU'], {caseFirst: 'upper'});
      case 'custom':
        return direction * customSorting(a, b);
      default:
        return direction * (a[field] - b[field]);
      }
    });
  }

  getSubElements(element) {
    const elements = element.querySelectorAll('[data-element]');

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;

      return accum;
    }, {});
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    const allColumns = this.element.querySelectorAll('.sortable-table__cell[data-id]');
    allColumns.forEach(column => {
      if (column.dataset.sortable === 'true') {
        column.removeEventListener('pointerdown', this.onHeaderPointerDown);
      }
    });
    this.remove();
    this.subElements = {};
  }
}
