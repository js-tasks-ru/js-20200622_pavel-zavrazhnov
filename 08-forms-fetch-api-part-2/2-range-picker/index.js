export default class RangePicker {
  isOpen = false;
  locale = 'ru';

  constructor({
    from = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    to = new Date(),
  } = {}) {
    this.range = {
      from,
      to
    };
    this.startDate = new Date(from);
    this.render();
  }

  onDocumentClick = event => {
    if (this.isOpen && !this.element.contains(event.target)) {
      this.element.classList.toggle("rangepicker_open");
      this.isOpen = !this.isOpen;
    }
  }

  onSelectorClick = event => {
    if (event.target.className === 'rangepicker__selector-control-left') {
      this.startDate.setMonth(this.startDate.getMonth() - 1);
      this.renderSelector();
    } else if (event.target.className === 'rangepicker__selector-control-right') {
      this.startDate.setMonth(this.startDate.getMonth() + 1);
      this.renderSelector();
    } else if (event.target.className.includes('rangepicker__cell')) {
      if (this.range.from && this.range.to) {
        this.range = {
          from: new Date(event.target.dataset.value),
          to: null
        };
      } else if (this.range.from && this.range.to === null) {
        this.range.to = new Date(event.target.dataset.value);
        if (this.range.to < this.range.from) {
          [this.range.from, this.range.to] = [this.range.to, this.range.from];
        }
        this.element.dispatchEvent(new CustomEvent('date-select', {
          bubbles: true,
          detail: this.range
        }));
        this.element.classList.toggle('rangepicker_open');
        this.isOpen = !this.isOpen;
        this.subElements.from.innerHTML = this.range.from.toLocaleString(this.locale, {
          dateStyle: 'short'
        });
        this.subElements.to.innerHTML = this.range.to.toLocaleString(this.locale, {
          dateStyle: 'short'
        });
      }
      this.renderSelectedRange();
    }
  }

  onInputClick = event => {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.renderSelector();
    }
    this.element.classList.toggle("rangepicker_open");
  }

  renderSelectedRange() {
    this.subElements.selector.querySelectorAll('.rangepicker__cell').forEach(cell => {
      const value = cell.dataset.value;
      cell.className = 'rangepicker__cell';
      if (this.range.from && value === this.range.from.toISOString()) {
        cell.className += ' rangepicker__selected-from';
      }
      if (this.range.to && value === this.range.to.toISOString()) {
        cell.className += ' rangepicker__selected-to';
      }
      if ((this.range.from && this.range.to) && value > this.range.from.toISOString() && value < this.range.to.toISOString()) {
        cell.className += ' rangepicker__selected-between';
      }
    });
  }

  renderDays (date) {
    const monthCountDays = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    return [...Array(monthCountDays - 1).keys()].map(number => {
      date.setDate(number + 2);
      return `<button type="button" class="rangepicker__cell" data-value="${date.toISOString()}">${number + 2}</button>`;
    }).join('');
  }

  renderMonth (date) {
    const month = date.toLocaleString(this.locale, { month: 'long' });
    const weekDay = (date.getDay() === 0) ? 7 : date.getDay();
    return `
      <div class="rangepicker__calendar">
        <div class="rangepicker__month-indicator">
          <time datetime="${month}">${month}</time>
        </div>
        <div class="rangepicker__day-of-week">
          <div>Пн</div>
          <div>Вт</div>
          <div>Ср</div>
          <div>Чт</div>
          <div>Пт</div>
          <div>Сб</div>
          <div>Вс</div>
        </div>
        <div class="rangepicker__date-grid">
          <button type="button" class="rangepicker__cell" data-value="${date.toISOString()}" style="--start-from: ${weekDay}">1</button>  
          ${this.renderDays(date)}
        </div>
      </div>`;
  }

  renderSelector () {
    const monthFrom = new Date(this.startDate);
    monthFrom.setDate(1);
    const monthTo = new Date(this.startDate);
    monthTo.setMonth(monthTo.getMonth() + 1);
    monthTo.setDate(1);
    this.subElements.selector.innerHTML = `
      <div class="rangepicker__selector-arrow"></div>
      <div class="rangepicker__selector-control-left"></div>
      <div class="rangepicker__selector-control-right"></div>
      ${this.renderMonth(monthFrom)}${this.renderMonth(monthTo)}`;
    this.renderSelectedRange();
  }

  renderInput () {
    const to = this.range.to.toLocaleString(this.locale, { dateStyle: 'short' });
    const from = this.range.from.toLocaleString(this.locale, { dateStyle: 'short' });

    return `<span data-element="from">${from}</span> - <span data-element="to">${to}</span>`;
  }

  template () {
    return `
      <div class="rangepicker">
        <div class="rangepicker__input" data-element="input">
          ${this.renderInput()}  
        </div>
        <div class="rangepicker__selector" data-element="selector"></div>
      </div>
    `;
  }

  render () {
    const $wrapper = document.createElement('div');
    $wrapper.innerHTML = this.template();
    const element = $wrapper.firstElementChild;
    this.element = element;
    this.subElements = this.getSubElements(element);
    const { input, selector } = this.subElements;
    input.addEventListener('click', this.onInputClick);
    selector.addEventListener('click', this.onSelectorClick, true);
    document.addEventListener('click', this.onDocumentClick, true);
  }

  getSubElements() {
    const elements = this.element.querySelectorAll('[data-element]');
    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;
      return accum;
    }, {});
  }

  remove () {
    this.element.remove();
  }

  destroy () {
    this.remove();
    document.removeEventListener("click", this.onDocumentClick, true);
  }
}
