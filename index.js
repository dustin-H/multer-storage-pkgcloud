
function PkgcloudStorage (opts) {
  this.client = opts.client
  this.getDestination = opts.destination || getDestination

  function getDestination (req, file, cb) {
    cb(null, {
      container: opts.container || 'uploads',
      remote: file.originalname
    })
  }
}

PkgcloudStorage.prototype._handleFile = function _handleFile (req, file, cb) {
  var that = this

  // Change destination if needed
  that.getDestination(req, file, function (err, dest) {
    if (err) return cb(err)

    var params = {
      container: dest.container,
      remote: dest.remote,
      contentType: file.mimetype
    }

    var outStream = that.client.upload(params)

    file.stream.pipe(outStream)
    outStream.on('error', cb)
    outStream.on('success', function (info) {
      cb(null, {
        size: info.size,
        container: params.container,
        remote: params.remote
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
