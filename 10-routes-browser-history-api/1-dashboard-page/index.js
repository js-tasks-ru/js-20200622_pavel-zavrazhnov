import RangePicker from './components/range-picker/src/index.js';
import SortableTable from './components/sortable-table/src/index.js';
import ColumnChart from './components/column-chart/src/index.js';
import header from './bestsellers-header.js';

import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru/';
const API_BASE_URL = 'api/dashboard/';


export default class Page {
  element;
  subElements = {};
  components = {}

  async initComponents () {
    const to = new Date();
    const from = new Date(to.getTime() - 30 * 24 * 60 * 60 * 1000);

    const rangePicker = new RangePicker({
      from,
      to
    });

    const ordersChart = new ColumnChart( {
      label: 'orders',
      link: '#',
      url: API_BASE_URL + 'orders',
      range: {
        from,
        to
      }
    });

    const salesChart = new ColumnChart( {
      label: 'sales',
      url: API_BASE_URL + 'sales',
      range: {
        from,
        to
      }
    });

    const customersChart = new ColumnChart( {
      label: 'customers',
      url: API_BASE_URL + 'customers',
      range: {
        from,
        to
      }
    });

    const sortableTable = new SortableTable(header, {
      url: `${API_BASE_URL}bestsellers${this.getSortableTableSearchParams({to, from})}`,
      isSortLocally: true
    });

    this.components = {
      rangePicker,
      ordersChart,
      salesChart,
      customersChart,
      sortableTable
    };
  }

  getSortableTableSearchParams ({
    to = new Date(),
    from = new Date(to.getTime() - 30 * 24 * 60 * 60 * 1000),
    step = 20,
    start = 1,
    end = start + step
  } = {}) {
    const url = new URL(BACKEND_URL);
    url.searchParams.set('from', from.toISOString());
    url.searchParams.set('to', to.toISOString());
    url.searchParams.set('_start', start.toString(10));
    url.searchParams.set('_end', end.toString(10));
    return url.search;
  }

  async updateComponents (from, to) {
    const sortableTableUrl = `${BACKEND_URL}${API_BASE_URL}bestsellers${this.getSortableTableSearchParams({to, from})}`;
    const { sortableTable, ordersChart, salesChart, customersChart } = this.components;
    const promisesCharts = [ordersChart, salesChart, customersChart].map(chart => chart.update(from, to));
    const [tableData] = await Promise.all([fetchJson(sortableTableUrl), ...promisesCharts]);
    sortableTable.addRows(tableData);
  }

  get template () {
    return `
      <div class="dashboard">
        <div class="content__top-panel">
          <h2 class="page-title">Dashboard</h2>
          <div data-element="rangePicker"></div>
        </div>
        <div data-element="chartsRoot" class="dashboard__charts">
          <div data-element="ordersChart" class="dashboard__chart_orders"></div>
          <div data-element="salesChart" class="dashboard__chart_sales"></div>
          <div data-element="customersChart" class="dashboard__chart_customers"></div>
        </div>
        <h3 class="block-title">Best sellers</h3>
        <div data-element="sortableTable"></div>
      </div>
    `;
  }

  async render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.template;
    this.element = wrapper.firstElementChild;
    this.subElements = this.getSubElements(this.element);

    await this.initComponents();
    this.renderComponents();
    this.initEventListeners();

    return this.element;
  }

  renderComponents() {
    Object.keys(this.components).forEach(component => {
      const root = this.subElements[component];
      const { element } = this.components[component];
      root.append(element);
    });
  }

  getSubElements(element) {
    const elements = element.querySelectorAll('[data-element]');
    return [...elements].reduce((acc, subElement) => {
      acc[subElement.dataset.element] = subElement;
      return acc;
    }, {});
  }

  initEventListeners() {
    this.components.rangePicker.element.addEventListener('date-select', this.onDateSelect);
  }

  onDateSelect = async event => {
    const { from, to } = event.detail;
    await this.updateComponents(from, to);
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    for (const component of Object.values(this.components)) {
      component.destroy();
    }
  }
}
