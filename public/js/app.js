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

console.log('It works');
//# sourceMappingURL=../maps/app.js.map
