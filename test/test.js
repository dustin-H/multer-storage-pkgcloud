/*global describe, before, beforeEach, it*/

var request = require('supertest')
var express = require('express')
var multer = require('multer')
var assert = require('assert')
var async = require('async')
var ary = require('lodash.ary')

var pkgcloudClient = require('./support/pkgcloud-client')
var pkgcloudStorage = require('..')

var TEST_CONTAINER = pkgcloudClient.TEST_CONTAINER

describe('multer-storage-pkgcloud', function () {
  var app, http, client

  before(function (done) { pkgcloudClient.destroyContainer(TEST_CONTAINER, done) })
  before(function (done) { pkgcloudClient.createContainer(TEST_CONTAINER, done) })

  before(function () {
    client = pkgcloudClient

    var storage = pkgcloudStorage({
      client: client,
      container: TEST_CONTAINER
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
          function (done) { client.getFiles(TEST_CONTAINER, ary(done, 2)) },
          function (files, done) {
            async.each(files, function (f, done) {
              f.remove(done)
            }, done)
          }
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
