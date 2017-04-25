(function () {
  var module = {
    init: function () {
      this.listeners();
    },
    listeners: function () {
      window.addEventListener('load', module.show );
    },
    show: function () {
      console.log('module');
    }
  }
  module.init();
}());
