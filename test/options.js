/*global describe, it*/

var assert = require('assert')
var pkgcloudStorage = require('..')

var file = {
  originalname: 'foo'
}

describe('multer-storage-pkgcloud : options', function () {
  describe('Destionation', function () {
    it('Use default destination', function (done) {
      assertDestionationEqual({}, {
        container: 'uploads',
        remote: file.originalname
      }, done)
    })

    it('Overwrite default container', function (done) {
      assertDestionationEqual({
        container: 'bar'
      }, {
        container: 'bar',
        remote: file.originalname
      }, done)
    })

    it('Overwrite destionation function', function (done) {
      assertDestionationEqual({
        destination: function (req, file, done) {
          done(null, {
            container: 'bar',
            remote: 'some/path/to/file.txt'
          })
        }
      }, {
        container: 'bar',
        remote: 'some/path/to/file.txt'
      }, done)
    })
  })
})

function getDestination (pkgcloudStorageOptions, done) {
  var req = {}
  var storage = pkgcloudStorage(pkgcloudStorageOptions)
  storage.getDestination(req, file, function (err, dest) {
    if (err) return done(err)
    done(null, dest)
  })
}

function assertDestionationEqual (pkgcloudStorageOptions, expected, done) {
  getDestination(pkgcloudStorageOptions, function (err, dest) {
    if (err) return done(err)
    assert.deepEqual(dest, expected)
    done()
  })
}
