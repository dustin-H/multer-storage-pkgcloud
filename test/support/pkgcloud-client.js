
var pkgcloud = require('pkgcloud')
var mkdirp = require('mkdirp')
var path = require('path')

var client
var TEST_CONTAINER = process.env.TEST_CONTAINER || 'test-container'

switch (process.env.PKGCLOUD_STORAGE) {
  case 'amazon':
    client = pkgcloud.storage.createClient({
      provider: 'amazon',
      key: process.env.PKGCLOUD_KEY,
      keyId: process.env.PKGCLOUD_KEYID,
      region: process.env.PKGCLOUD_REGION
    })

    break

  case 'filesystem':
  default:
    pkgcloud.providers.filesystem = {}
    pkgcloud.providers.filesystem.storage = require('filesystem-storage-pkgcloud')

    var TEST_ROOT = '/tmp/multer-storage-pkgcloud'

    mkdirp.sync(path.join(TEST_ROOT, TEST_CONTAINER))

    client = pkgcloud.storage.createClient({
      provider: 'filesystem',
      root: TEST_ROOT
    })

    break
}

client.TEST_CONTAINER = TEST_CONTAINER
module.exports = client
