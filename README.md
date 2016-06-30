# test.me.js

Simple nodejs module loader capable of mocking `require`d dependencies

[![NPM](https://nodei.co/npm/test.me.png)](https://npmjs.org/package/test.me)

[![Build Status](https://travis-ci.org/nyrkovalex/test.me.js.svg?branch=master)](https://travis-ci.org/nyrkovalex/test.me.js)

## Usage

As simple as that

`myModule.js` file:

```javascript
'use strict';

var fs = require('fs');

// Yes, you don't even need to export this in order to test
function readStuff(cb) {
  fs.readFile(__dirname + '/someStuff', cb);
}
```

`myModule.spec.js` test file (let's assume we're using [mocha](http://mochajs.org/)
with [chai](http://chaijs.com/) assertions):

```javascript
'use strict';

var testMe = require('test.me');
var expect = require('chai').expect;

var mockFs = {
  readFile: function (path, cb) {
    cb(null, 'stuff');
  }
};

describe('test.me usage example', function () {
  // we load our module with out mock instead of required `fs`
  var myModule = testMe('./myModule', {
    fs: mockFs
  }, {
    __dirname: '/my/dir' // will be used as `__dirname` global by your script
  });

  it('should read some stuff', function (done) {
    // every top-level function defined in the file is accessible via loaded object
    myModule.readStuff(function (err, stuff) {
      // mocked fs always returns 'stuff' string
      expect(stuff).to.be.equal('stuff');
      done();
    });
  });
});
```
