'use strict';

const path = require('path');

const mods = [
  'cleaner',
  'errors',
  'logging',
  'metadata',
  'pin',
  'redis',
  'settings',
  'thumbnail',
];

module.exports = {
  handlers: {
    delAttachment: require('./components/handlers/del_attachment'),
    download: require('./components/handlers/download'),
    downloadThumb: require('./components/handlers/download_thumb'),
    upload: require('./components/handlers/upload'),
  },
  storageBackends: {
    FilesystemStorage: require('./components/storage-backends/filesystem'),
    IpfsStorage: require('./components/storage-backends/ipfs'),
  },
};

mods.forEach((mod) => {
  module.exports[mod] = require(
    path.join(__dirname, 'components', mod)
  );
});
