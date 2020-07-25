import SortableList from '../2-sortable-list/index.js';
import escapeHtml from './utils/escape-html.js';
import fetchJson from './utils/fetch-json.js';

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
    discount: 0,
    images: []
  };

  constructor(productId = '') {
    this.baseUrl = new URL(BACKEND_URL);
    this.productId = productId;
  }

  getImageRow(image) {
    return `
      <li data-url="${image.url}" data-source="${image.source}" class="products-edit__imagelist-item sortable-list__item" style="">
        <input type="hidden" name="url" value="${image.url}">
        <input type="hidden" name="source" value="${image.source}">
        <span>
          <img src="icon-grab.svg" data-grab-handle="" alt="grab">
          <img class="sortable-table__cell-img" alt="Image" src="${image.url}">
          <span>${image.source}</span>
        </span>
        <button type="button">
          <img src="icon-trash.svg" data-delete-handle="" alt="delete">
        </button>
      </li>`;
  }

  template () {
    return `
      <div class="product-form">
        <form data-element="productForm" class="form-grid">
        <input type="file" id="fileInput" hidden data-element="fileInput">
          <div class="form-group form-group__half_left">
            <fieldset>
              <label class="form-label">Название товара</label>
              <input id="title" required="" type="text" name="title" class="form-control" placeholder="Название товара" data-element="title">
            </fieldset>
          </div>
          <div class="form-group form-group__wide">
            <label class="form-label">Описание</label>
            <textarea id="description" required="" class="form-control" name="description" data-element="description" placeholder="Описание товара"></textarea>
          </div>
          <div class="form-group form-group__wide" data-element="sortable-list-container">
            <label class="form-label">Фото</label>
            <div data-element="imageListContainer"></div>
            <button type="button" name="uploadImage" class="button-primary-outline" data-element="uploadImage"><span>Загрузить</span></button>
          </div>
          <div class="form-group form-group__half_left">
            <label class="form-label">Категория</label>
            <select id="subcategory" class="form-control" name="subcategory" data-element="subcategory"></select>
          </div>
          <div class="form-group form-group__half_left form-group__two-col">
            <fieldset>
              <label class="form-label">Цена ($)</label>
              <input id="price" required="" type="number" name="price" class="form-control" placeholder="100" data-element="price">
            </fieldset>
            <fieldset>
              <label class="form-label">Скидка ($)</label>
              <input id="discount" required="" type="number" name="discount" class="form-control" placeholder="0" data-element="discount">
            </fieldset>
          </div>
          <div class="form-group form-group__part-half">
            <label class="form-label">Количество</label>
            <input id="quantity" required="" type="number" class="form-control" name="quantity" placeholder="1" data-element="quantity">
          </div>
          <div class="form-group form-group__part-half">
            <label class="form-label">Статус</label>
            <select id="status" class="form-control" name="status" data-element="status">
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

    const categories = await fetchJson(categoriesUrl.href);
    return this.prepareCategories(categories);

  }

  async loadProductData () {
    const productsUrl = new URL('api/rest/products', this.baseUrl);
    productsUrl.searchParams.set('id', this.productId);

    const data = await fetchJson(productsUrl.href);
    return data[0];
  }

  prepareFormData() {
    const {title, description, subcategory, price, quantity, discount, status} = this.subElements;
    const images = [...this.sortableList.element.children].map(item => {
      return {
        source: item.dataset.source,
        url: item.dataset.url
      };
    });

    return {
      id: this.productId,
      title: title.value,
      description: description.value,
      subcategory: subcategory.value,
      price: parseInt(price.value, 10),
      quantity: parseInt(quantity.value, 10),
      discount: parseInt(discount.value, 10),
      status: parseInt(status.value, 10),
      images
    };
  }

  async save() {
    const productsUrl = new URL('api/rest/products', this.baseUrl);
    try {
      const product = await fetchJson(productsUrl.href, {
        method: this.productId ? "PATCH" : "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(this.prepareFormData())
      });

      const customEventName = this.productId ? 'product-updated' : 'product-saved';
      const productCustomEvent = new CustomEvent(customEventName, {
        detail: product.id
      });
      this.element.dispatchEvent(productCustomEvent);
    } catch (e) {
      alert(e);
    }
  }

  onSubmit = async event => {
    event.preventDefault();
    await this.save();
  }

  onFileChange = async event => {
    const file = event.target.files[0];
    const { uploadImage } = this.subElements;
    uploadImage.classList.add("is-loading");
    uploadImage.disabled = true;
    const formData = new FormData();
    formData.append('image', file);
    try {
      const response = await fetchJson('https://api.imgur.com/3/image', {
        method: 'POST',
        headers: {
          Authorization: `Client-ID ${IMGUR_CLIENT_ID}`
        },
        body: formData,
      });

      this.sortableList.addItem(this.createImageRow({url: response.data.link, source: file.name}));
    } catch (e) {
      alert(e);
    } finally {
      uploadImage.classList.remove("is-loading");
      uploadImage.disabled = false;
    }
  }

  onImageUpload = async event => {
    const {fileInput} = this.subElements;
    fileInput.click();
  }

  createImageRow (image) {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.getImageRow(image);

    return wrapper.firstElementChild;
  }

  async render () {
    let categories;
    [categories, this.product] = await Promise.all([
      this.loadCategories(),
      (this.productId) ? this.loadProductData() : Promise.resolve(this.product)
    ]);

    const element = document.createElement('div');

    element.innerHTML = this.template();

    this.element = element.firstElementChild;
    this.subElements = this.getSubElements(this.element);
    const { productForm, subcategory, uploadImage, imageListContainer, fileInput } = this.subElements;
    productForm.addEventListener('submit', this.onSubmit);
    uploadImage.addEventListener('click', this.onImageUpload);
    fileInput.addEventListener('change', this.onFileChange);
    subcategory.append(...categories);
    subcategory.value = this.product.subcategory === ''
      ? categories[0].value
      : this.product.subcategory;
    // setting simple form fields
    ['title', 'description', 'price', 'discount', 'quantity', 'status'].forEach(key => {
      this.subElements[key].value = this.product[key];
    });

    this.sortableList = new SortableList({
      items: this.product.images.map(image => {
        return this.createImageRow(image);
      })
    });
    imageListContainer.append(this.sortableList.element);

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
