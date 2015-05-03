# multer-storage-pkgcloud

This is a multer storage plugin to upload files into a from pkgcloud supported cloud object storage.

It is just a plugin for multer. So you will need multer as well as pkgcloud to use this plugin. Please have a look at these two awesome projects:

- [multer](https://github.com/expressjs/multer)
- [pkgcloud](https://github.com/pkgcloud/pkgcloud#storage)

**IMPORTANT**: This is a storage for the next major release of multer. It will not work with the current version of multer. If you need a quick solution have a look at this pull request [#102](https://github.com/expressjs/multer/pull/102) or use [multer-pkgcloud](https://www.npmjs.com/package/multer-pkgcloud).

## API

#### Installation

`$ npm install multer-storage-pkgcloud`

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
		remote: 'myFile.txt'
	})
}
```
Now create a instance of pkgcloudStorage.
```js
var storage = pkgcloudStorage({
	client: client,
	destination: destination
})
```

Then use the multer middleware in your express app.
```js
var app = express();

app.use('/', multer({
	storage: storage
}));
```

You can access the pkgcloud container in the `request` object:
```js
app.post('/', function(req, res, next) {
	res.json({
		multerContainer: req.multerContainer
	});
});
```

## [MIT Licensed](LICENSE)
