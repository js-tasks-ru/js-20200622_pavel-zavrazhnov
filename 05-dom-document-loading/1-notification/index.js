export default class NotificationMessage {
  static instance;
  hide = true;
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

  show(element) {
    if (!this.hide) {
      this.remove();
      clearTimeout(this.timerId);
      console.log(this.timerId);
    }
    if (element) {
      element.append(this.element);
    } else {
      document.body.append(this.element);
    }
    //NotificationMessage.instance.element.style.display = 'none';
    //NotificationMessage.instance.element.style.display = 'block';
    this.hide = false;
    this.timerId = setTimeout(() => {
      this.remove();
      this.hide = true;
    }, this.duration);
  }
  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
  }
}
