'use strict';

const path = require('path');

let mods = [
  'cleaner',
  'errors',
  'ipfs',
  'logging',
  'metadata',
  'pin',
  'redis',
  'settings',
  'thumbnail',
];

module.exports = {};

mods.forEach((mod) => {
  module.exports[mod] = require(
    path.join(__dirname, 'components', mod)
  );
});
