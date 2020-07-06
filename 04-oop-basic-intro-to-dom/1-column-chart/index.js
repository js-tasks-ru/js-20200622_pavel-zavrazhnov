export default class ColumnChart {
  element;
  chartColumns;
  chartHeight = 50;

  constructor({
    data = [],
    label = '',
    link = '',
    value = 0
  } = {}) {
    this.data = [...data];
    this.label = label;
    this.link = link;
    this.value = value;

    this.element = document.createElement('div');
    this.element.className += `column-chart${this.data.length === 0 ? ' column-chart_loading' : ''}`;

    this.setColumns();
    this.render();
    this.chartColumns = this.element.querySelector('.column-chart__chart');
  }

  setColumns() {
    const maxValue = Math.max(...this.data);
    const scale = this.chartHeight / maxValue;

    this.columns = this.data.map(item => {
      return {
        percent: (item / maxValue * 100).toFixed(0) + '%',
        value: String(Math.floor(item * scale))
      };
    });
  }

  renderColumns() {
    return this.columns
      .map(item => `<div style="--value:${item.value}" data-tooltip="${item.percent}"></div>`)
      .join('');
  }

  update({
    bodyData = this.data,
  } = {}) {
    this.data = [...bodyData];
    this.setColumns();
    this.chartColumns.innerHTML = this.renderColumns();
  }

  render() {
    const viewAll = this.link ? `<a href="/${this.link}" class="column-chart__link">View all</a>` : '';

    this.element.innerHTML = `
      <div class="column-chart__title">
        Total ${this.label}
        ${viewAll}
      </div>
      <div class="column-chart__container">
        <div data-element="header" class="column-chart__header">${this.value}</div>
      </div>
      <div class="column-chart__chart">
        ${this.renderColumns()}
      </div>
    `;
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
  }
}
