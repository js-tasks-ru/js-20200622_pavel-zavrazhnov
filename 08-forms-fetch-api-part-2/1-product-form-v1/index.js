import escapeHtml from './utils/escape-html.js';
import fetchJson from './utils/fetch-json.js';

async function wait(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

const IMGUR_CLIENT_ID = '28aaa2e823b03b1';
const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ProductForm {
  productId;
  element;
  subElements = {};
  product = {
    title: '',
    description: '',
    quantity: 1,
    subcategory: '',
    status: 1,
    price: 100,
    discount: 0
  };

  constructor(productId = '') {
    this.baseUrl = new URL(BACKEND_URL);
    this.productId = productId;
  }

  save () {
    //alert('save test!');
  }

  onSubmit = event => {
    event.preventDefault();
    this.save();
  }

  getImageList () {
    return `
    `;
  }

  getCategoryList () {
    return `
    `;
  }

  template () {
    return `
      <div class="product-form">
        <form data-element="productForm" class="form-grid">
          <div class="form-group form-group__half_left">
            <fieldset>
              <label class="form-label">Название товара</label>
              <input required="" type="text" name="title" class="form-control" placeholder="Название товара">
            </fieldset>
          </div>
          <div class="form-group form-group__wide">
            <label class="form-label">Описание</label>
            <textarea required="" class="form-control" name="description" data-element="productDescription" placeholder="Описание товара"></textarea>
          </div>
          <div class="form-group form-group__wide" data-element="sortable-list-container">
            <label class="form-label">Фото</label>
            <div data-element="imageListContainer">
              <ul class="sortable-list">${this.getImageList()}</ul>
            </div>
            <button type="button" name="uploadImage" class="button-primary-outline"><span>Загрузить</span></button>
          </div>
          <div class="form-group form-group__half_left">
            <label class="form-label">Категория</label>
            <select class="form-control" name="subcategory">${this.getCategoryList()}</select>
          </div>
          <div class="form-group form-group__half_left form-group__two-col">
            <fieldset>
              <label class="form-label">Цена ($)</label>
              <input required="" type="number" name="price" class="form-control" placeholder="100">
            </fieldset>
            <fieldset>
              <label class="form-label">Скидка ($)</label>
              <input required="" type="number" name="discount" class="form-control" placeholder="0">
            </fieldset>
          </div>
          <div class="form-group form-group__part-half">
            <label class="form-label">Количество</label>
            <input required="" type="number" class="form-control" name="quantity" placeholder="1">
          </div>
          <div class="form-group form-group__part-half">
            <label class="form-label">Статус</label>
            <select class="form-control" name="status">
              <option value="1">Активен</option>
              <option value="0">Неактивен</option>
            </select>
          </div>
          <div class="form-buttons">
            <button type="submit" name="save" class="button-primary-outline">
              Сохранить товар
            </button>
          </div>
        </form>
      </div>`;
  }

  prepareCategories (categories) {
    return categories.reduce((result, category) => {
      const subcategories = category.subcategories
        .map(subcategory => new Option(category.title + " > " + subcategory.title, subcategory.id));
      return [...result, ...subcategories];
    }, []);
  }

  async loadCategories () {
    const categoriesUrl = new URL('api/rest/categories', this.baseUrl);
    categoriesUrl.searchParams.set('_sort', 'weight');
    categoriesUrl.searchParams.set('_refs', 'subcategory');
    try {
      const categories = await fetchJson(categoriesUrl.href);
      return this.prepareCategories(categories);
    } catch (e) {
      return [];
    }
  }

  async loadProductData () {
    const productsUrl = new URL('api/rest/products', this.baseUrl);
    productsUrl.searchParams.set('id', this.productId);
    try {
      const data = await fetchJson(productsUrl.href);
      return data[0];
    } catch (e) {
      return [];
    }
  }

  async render () {
    const categories = await this.loadCategories();

    if (this.productId) {
      this.product = await this.loadProductData();
    }

    const element = document.createElement('div');

    element.innerHTML = this.template();

    this.element = element.firstElementChild;
    this.subElements = this.getSubElements(this.element);
    const { productForm } = this.subElements;
    productForm.addEventListener("submit", this.onSubmit);
    await wait(2000);
    console.log(productForm);
    productForm.subcategory.append(...categories);
    productForm.subcategory.value = this.product.subcategory === ''
      ? categories[0].value
      : this.product.subcategory;
    // setting simple form fields
    ['title', 'description', 'price', 'discount', 'quantity', 'status'].forEach(key => {
      productForm[key].value = this.product[key];
    });

    return this.element;
  }

  getSubElements(element) {
    const elements = element.querySelectorAll('[data-element]');

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
  }
}
