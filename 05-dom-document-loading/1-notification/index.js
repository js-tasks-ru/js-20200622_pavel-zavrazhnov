export default class NotificationMessage {
  static instance;
  visible = false;
  constructor(message, {
    duration = 2000,
    type = 'success'
  } = {}) {
    if (!NotificationMessage.instance) {
      NotificationMessage.instance = this;
      NotificationMessage.instance.element = document.createElement('div');
    }
    NotificationMessage.instance.message = message;
    NotificationMessage.instance.duration = duration;
    NotificationMessage.instance.type = type;

    NotificationMessage.instance.element.className = `notification ${type}`;
    NotificationMessage.instance.element.style.cssText = `--value: ${Math.ceil(duration / 1000)}s;`;
    NotificationMessage.instance.element.innerHTML = NotificationMessage.instance.template();
    return NotificationMessage.instance;
  }

  template() {
    return `
      <!--<div class="notification ${this.type}" style="--value:${Math.ceil(this.duration / 1000)}s">-->
        <div class="timer"></div>
        <div class="inner-wrapper">
          <div class="notification-header">${this.type}</div>
          <div class="notification-body">
            ${this.message}
          </div>
        </div>
      <!--</div>-->`
    ;
  }

  show(element = document.body) {
    if (this.visible) {
      this.remove();
      clearTimeout(this.timerId);
    }
    element.append(this.element);
    this.visible = true;
    this.timerId = setTimeout(() => {
      this.remove();
      this.visible = false;
    }, this.duration);
  }
  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
  }
}
