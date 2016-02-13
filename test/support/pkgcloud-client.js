
var pkgcloud = require('pkgcloud')

switch (process.env.PKGCLOUD_STORAGE) {
  case 'amazon':
    module.exports = pkgcloud.storage.createClient({
      provider: 'amazon',
      key: process.env.PKGCLOUD_KEY,
      keyId: process.env.PKGCLOUD_KEYID,
      region: process.env.PKGCLOUD_REGION
    })

    break

  case 'filesystem':
  default:
    var mkdirp = require('mkdirp')

    pkgcloud.providers.filesystem = {}
    pkgcloud.providers.filesystem.storage = require('filesystem-storage-pkgcloud')

    var TEST_ROOT = '/tmp/multer-storage-pkgcloud'
    mkdirp.sync(TEST_ROOT)

    module.exports = pkgcloud.storage.createClient({
      provider: 'filesystem',
      root: '/tmp/multer-storage-pkgcloud'
    })

    break
}
