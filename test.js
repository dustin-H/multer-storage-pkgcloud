var express = require('express')
var multer = require('multer')
var pkgcloud = require('pkgcloud')
var pkgcloudStorage = require('./index.js');

var pkgoptions = require('./pkgoptions.json');

var client = pkgcloud.storage.createClient(pkgoptions);

function destination(req, file, cb) {
	console.log(file);
	cb(null, {
		container: 'myContainer',
		remote: file.originalname
	})
}

var storage = pkgcloudStorage({
	client: client,
	destination: destination
});

var app = express();

var upload = multer({
	storage: storage
});

app.use('/', upload.array('fileToUpload', 12));

app.post('/', function(req, res, next) {
	res.json({
		multerContainer: req.multerContainer
	});
});

app.get('/', function(req, res, next) {
	res.send('<form action="/" method="post" enctype="multipart/form-data">Select image to upload:<input type="file" name="fileToUpload" id="fileToUpload" multiple><input type="submit" value="Upload Image" name="submit"></form>')
})

app.listen(1357);
