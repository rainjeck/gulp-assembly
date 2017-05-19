var mkdirp = require('mkdirp');

var obj = [
  'app',
    'app/fonts',
    'app/images',
    'app/plugins',
    'app/sprites',
      'app/sprites/png',
      'app/sprites/svg'
];

obj.forEach( function(element, index) {
  mkdirp(element, function (err) {
    if (err) console.error(err)
  });
});

console.log('Structure is created!');