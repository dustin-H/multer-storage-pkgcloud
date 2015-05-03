function PkgcloudStorage(opts) {
	this.client = opts.client
	this.getDestination = opts.destination
}

PkgcloudStorage.prototype.handleFile = function handleFile(req, file, cb) {
	var that = this;

	// Change destination if needed
	that.getDestination(req, file, function(err, dest) {
		if (err) {
			return cb(err);
		};

		var params = {
			container: dest.container,
			remote: dest.remote,
			contentType: file.mimetype
		};
		
		// ensuring existence of container
		that.client.createContainer({
			'name': params.container
		}, function(err, container) {

			// need to check for an error and if the container is null (can really happen)
			if (err != null || container == null) {
				cb(err);
			} else {

				// storing of pkgcloud container object in req for processing afterwords
				req.multerContainer = container;

				var outStream = that.client.upload(params);

				file.stream.pipe(outStream)
				outStream.on('error', cb)
				outStream.on('success', function(info) {
					cb(null, {
						size: info.size,
						container: dest.container,
						remote: dest.remote
					});
				});


			}
		});

	});
};

module.exports = function(opts) {
	return new PkgcloudStorage(opts)
};
