/*global describe, before, beforeEach, it*/

var request = require('supertest')
var pkgcloud = require('pkgcloud')
var express = require('express')
var multer = require('multer')
var assert = require('assert')
var mkdirp = require('mkdirp')
var async = require('async')
var pkgcloudStorage = require('..')

pkgcloud.providers.filesystem = {}
pkgcloud.providers.filesystem.storage = require('filesystem-storage-pkgcloud')

var TEST_ROOT = '/tmp/multer-storage-pkgcloud'
var TEST_CONTAINER = 'test-container'
mkdirp.sync(TEST_ROOT + '/' + TEST_CONTAINER)

describe('multer-storage-pkgcloud', function () {
  var app, http, client

  before(function () {
    client = pkgcloud.storage.createClient({
      provider: 'filesystem',
      root: '/tmp/multer-storage-pkgcloud'
    })

    var storage = pkgcloudStorage({
      client: client,
      destination: function destination (req, file, cb) {
        cb(null, {
          container: TEST_CONTAINER,
          remote: file.originalname
        })
      }
    })

    var upload = multer({
      storage: storage
    })

    app = express()
    app.post('/single', upload.single('singlefile'), function (req, res, next) {
      res.status(200).send('OK')
    })
  })

  function whenPostedFile (url, fieldName, fileBuffer, fileName, fn) {
    describe('POST ' + url, function () {
      beforeEach(function (done) {
        async.waterfall([
          function (done) { client.getFiles(TEST_CONTAINER, done) },
          function (files, done) { async.each(files, function (f, done) { f.remove(done) }, done) }
        ], done)
      })

      beforeEach(function (done) {
        http = request(app)
          .post(url)
          .attach(fieldName, fileBuffer, fileName)
          .end(done)
      })

      fn()
    })
  }

  describe('Upload a single file', function () {
    whenPostedFile('/single', 'singlefile', new Buffer('foo'), 'foo.txt', function () {
      it('Should results in 200 OK', function () {
        assert.equal(http.res.statusCode, 200)
      })

      it('Should upload the file', function (done) {
        client.getFiles(TEST_CONTAINER, function (err, files) {
          if (err) return done(err)

          assert.equal(files.length, 1)

          done()
        })
      })
    })
  })
})
