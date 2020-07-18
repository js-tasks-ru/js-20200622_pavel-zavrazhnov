export default class ColumnChart {
  element;
  chartHeight = 50;
  subElements = {};

  constructor({
    url = '',
    range = {
      from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      to: new Date(),
    },
    formatHeading = (data) => data,
    label = '',
    link = '',
    value = 0
  } = {}) {
    this.url = url;
    this.formatHeading = formatHeading;
    this.data = {};
    this.label = label;
    this.link = link;
    this.value = value;

    this.element = document.createElement('div');
    this.element.className = 'column-chart column-chart_loading';

    this.render();
    this.subElements.header = this.element.querySelector('.column-chart__header');
    this.subElements.body = this.element.querySelector('.column-chart__chart');
    this.update(range.from, range.to);
  }

  async fetchData (baseUrl, from, to) {
    const url = encodeURI(`${baseUrl}?from=${from.toISOString()}&to=${to.toISOString()}`);
    try {
      let response = await fetch(url);
      return await response.json();
    } catch (e) {
      return [];
    }
  }

  setColumns() {
    const maxValue = Object.entries(this.data).reduce((max, [key, value]) => Number(value) > max ? value : max, 0);
    const scale = this.chartHeight / maxValue;

    this.columns = Object.entries(this.data).map(([key, value]) => {
      return {
        date: (new Date(key)).toLocaleDateString('ru-RU', {
          year: "numeric",
          month: "long",
          day: "numeric"
        }),
        percent: (value / maxValue * 100).toFixed(0) + '%',
        value: String(Math.floor(value * scale))
      };
    });
  }

  renderColumns() {
    return this.columns
      .map(item => `<div style="--value:${item.value}" data-tooltip="<div><small>${item.date}</small></div><strong>${item.percent}</strong>"></div>`)
      .join('');
  }

  async update(from, to) {
    this.element.className = 'column-chart column-chart_loading';
    this.data = await this.fetchData(this.url, from, to);
    if (Object.keys(this.data).length > 0) {
      this.value = Object.entries(this.data).reduce((sum, [_, value]) => sum + Number(value), 0);
      this.setColumns();
      this.subElements.header.innerHTML = this.formatHeading(this.value);
      this.subElements.body.innerHTML = this.renderColumns();
      this.element.className = 'column-chart';
    }
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
