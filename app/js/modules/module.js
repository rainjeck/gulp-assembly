// module
(function () {
  var module = {
    init: function () {
      this.listeners();
    },
    listeners: function () {
      console.log('It works!');
    }
  }
  module.init();
}());