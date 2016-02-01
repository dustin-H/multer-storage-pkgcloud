# multer-storage-pkgcloud

[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)

This is a multer storage plugin to upload files into a from pkgcloud supported cloud object storage.

It is just a storage plugin for multer. So you will need multer as well as pkgcloud to use this plugin. Please have a look at these two awesome projects:

- [multer](https://github.com/expressjs/multer)
- [pkgcloud](https://github.com/pkgcloud/pkgcloud#storage)

**IMPORTANT**: Multer version >= 1.0.0 required!
## API

#### Installation

`$ npm install multer-storage-pkgcloud`

npm-link: [multer-storage-pkgcloud](https://www.npmjs.com/package/multer-storage-pkgcloud)

#### Usage

Get the dependencies and create a pkgcloud client.
```js
var express = require('express')
var multer  = require('multer')
var pkgcloud = require('pkgcloud')
var pkgcloudStorage = require('multer-storage-pkgcloud')

var client = pkgcloud.storage.createClient({ /* pkgcloud config object */ });
// See pkgcloud docu for more information
```

Now create a destination function which will be called for each file-upload to rename the container and/or the remote file.
See documentation of [multer](https://github.com/expressjs/multer) to get more information about the `file` object.

The object passed to the callback `cb` is a option object from pkgcloud. See [pkgcloud/pkgcloud#file](https://github.com/pkgcloud/pkgcloud#file).

```js
function destination(req, file, cb) {
	cb(null, {
		container: 'myContainer',
		remote: file.originalname
	})
}
```

Now create a new pkgcloudStorage.
```js
var storage = pkgcloudStorage({
	client: client,
	destination: destination
})
```

Then use the multer middleware in your express app. See [multer](https://github.com/expressjs/multer) for more detailed usage information of `upload`.
```js
var app = express();

var upload = multer({
	storage: storage
});

app.use('/', upload.single('fieldname1'));
app.use('/', upload.array('fieldname2', 12));
```

You can access the pkgcloud container in the `req` object after uploading:
```js
app.post('/', function(req, res, next) {
	res.json({
		multerContainer: req.multerContainer
	});
});
```

## [MIT Licensed](LICENSE)
