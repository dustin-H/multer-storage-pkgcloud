
function PkgcloudStorage (opts) {
  this.client = opts.client
  this.getDestination = opts.destination || getDestination
  this.transformFile = opts.transform || function (originalFile, cb) {cb(originalFile)}
  function getDestination (req, file, cb) {
    cb(null, {
      container: opts.container || 'uploads',
      remote: file.originalname
    })
  }
}

PkgcloudStorage.prototype._handleFile = function _handleFile (req, originalFile, cb) {
  var that = this
  
  // Apply an image transform and 
  // Change destination if needed
  this.transformFile(originalFile, function (file) {
    that.getDestination(req, file, function (err, dest) {
      if (err) return cb(err)

      var params = {
        container: dest.container,
        remote: dest.remote,
        contentType: file.mimetype
      }

      var outStream = that.client.upload(params)
      const stream = file.stream || file
      stream.pipe(outStream)
      outStream.on('error', cb)
      outStream.on('success', function (info) {
        cb(null, {
          size: info.size,
          container: params.container,
          remote: params.remote
        })
      })
    })
  })
}

PkgcloudStorage.prototype._removeFile = function _removeFile (req, file, cb) {
  this.client.removeFile(file.container, file.remote, cb)
}

module.exports = function (opts) {
  return new PkgcloudStorage(opts)
}
