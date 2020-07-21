import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class SortableTable {
  element;
  subElements = {};
  headersConfig = [];
  data = [];
  pageSize = 30;
  loading = false;

  onWindowScroll = async event => {
    if (this.loading) {
      return;
    }
    if (this.element.getBoundingClientRect().bottom < document.documentElement.clientHeight) {
      const sortedData = await this.sortOnServer(this.sorted.id, this.sorted.order);
      this.data.push(...sortedData);
      this.subElements.body.innerHTML += this.getTableRows(sortedData);
    }
  }

  onHeaderPointerDown = async (event) => {
    const column = event.target.closest('[data-sortable="true"]');
    const toggleOrder = order => {
      const orders = {
        asc: 'desc',
        desc: 'asc'
      };

      return orders[order];
    };

    if (column) {
      let {id, order} = column.dataset;
      order = order === '' ? 'asc' : order;
      this.subElements.body.innerHTML = '';
      this.data = [];
      const sortedData = (this.staticTable)
        ? this.sortData(id, toggleOrder(order))
        : await this.sortOnServer(id, toggleOrder(order));
      this.subElements.body.innerHTML = this.getTableRows(sortedData);
      this.data = [...sortedData];
      const arrow = column.querySelector('.sortable-table__sort-arrow');

      column.dataset.order = order === 'asc' ? 'desc' : 'asc';

      this.sorted = {
        id: column.dataset.id,
        order: column.dataset.order
      };
      if (!arrow) {
        column.append(this.subElements.arrow);
      }
    }
  }

  constructor(headersConfig, {
    url = '',
    data = [],
    sorted = {
      id: headersConfig.find(col => col.sortable).id,
      order: 'asc'
    }
  } = {}) {
    this.headersConfig = headersConfig;
    this.data = [...data];
    this.sorted = sorted;
    this.url = BACKEND_URL + '/' + url;
    this.staticTable = url === '';

    (async () => {
      await this.render();
    })();
  }

  getTableHeader() {
    return `<div data-element="header" class="sortable-table__header sortable-table__row">
      ${this.headersConfig.map(item => this.getHeaderRow(item)).join('')}</div>`;
  }

  getHeaderRow({id, title, sortable}) {
    return `
      <div class="sortable-table__cell" data-id="${id}" data-sortable="${sortable}" data-order>
        <span>${title}</span>
        ${this.getHeaderSortingArrow(id)}
      </div>
    `;
  }

  getHeaderSortingArrow(id) {
    const isOrderExist = this.sorted.id === id ? this.sorted.order : '';
    return isOrderExist
      ? `<span data-element="arrow" class="sortable-table__sort-arrow">
          <span class="sort-arrow"></span>
        </span>`
      : '';
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
        <div data-element="loading" class="loading-line sortable-table__loading-line"></div>
        <div data-element="emptyPlaceholder" class="sortable-table__empty-placeholder">
          <div>
            <p>No products satisfies your filter criteria</p>
          </div>
        </div>
      </div>`;
  }

  async render() {
    const $wrapper = document.createElement('div');

    $wrapper.innerHTML = this.getTable(this.data);
    const element = $wrapper.firstElementChild;

    this.element = element;
    this.subElements = this.getSubElements(element);
    this.subElements.header.addEventListener('pointerdown', this.onHeaderPointerDown);
    const currentColumn = this.element.querySelector(`.sortable-table__cell[data-id="${this.sorted.id}"]`);
    currentColumn.dataset.order = this.sorted.order;

    this.subElements.body.innerHTML = '';
    const sortedData = (this.staticTable)
      ? this.sortData(this.sorted.id, 'asc')
      : await this.sortOnServer(this.sorted.id, 'asc');
    this.subElements.body.innerHTML = this.getTableRows(sortedData);
    this.data = [...sortedData];
    window.addEventListener("scroll", this.onWindowScroll);
  }

  async sortOnServer(id, order) {
    const _start = this.data.length;
    const _end = _start + this.pageSize;
    const url = encodeURI(`${this.url}?_sort=${id}&_order=${order}&_start=${_start}&_end=${_end}`);
    this.element.classList.add("sortable-table_loading");
    this.loading = true;
    try {
      const data = await fetchJson(url);
      this.element.classList.remove("sortable-table_loading");
      this.loading = false;
      return data;
    } catch (e) {
      this.element.classList.remove("sortable-table_loading");
      this.loading = false;
      return [];
    }
  }

  /*sort(id, order) {
    const sortedData = this.sortData(id, order);

    this.subElements.body.innerHTML = this.getTableRows(sortedData);
  }*/

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
    window.removeEventListener("scroll", this.onWindowScroll);
    this.remove();
    this.subElements = {};
  }
}
