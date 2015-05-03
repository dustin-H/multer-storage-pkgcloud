function PkgcloudStorage(opts) {
	this.client = opts.client
	this.getDestination = opts.destination
}

function upload(req, file, that, params, cb){
	var outStream = that.client.upload(params);

	file.stream.pipe(outStream)
	outStream.on('error', cb)
	outStream.on('success', function(info) {
		cb(null, {
			size: info.size,
			container: params.container,
			remote: params.remote
		});
	});
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

		// check if existence check is necessary
		if(req.multerPkgcloudRecentContainer != null && req.multerPkgcloudRecentContainer.indexOf(params.container) >= 0){
			return upload(req, file, that, params, cb);
		}

		// ensuring existence of container
		that.client.createContainer({
			'name': params.container
		}, function(err, container) {

			// need to check for an error and if the container is null (can really happen)
			if (err != null) return cb(err);
			if (container == null) return cb(new Error('Failed to ensure existence of container "' + params.container + '"'));

			// storing of pkgcloud container object in req for processing afterwords
			req.multerContainer = container;
			if(req.multerPkgcloudRecentContainer == null){
				req.multerPkgcloudRecentContainer = [];
			}
			req.multerPkgcloudRecentContainer.push(params.container);
			upload(req, file, that, params, cb);
		});
	});
};

module.exports = function(opts) {
	return new PkgcloudStorage(opts)
};
