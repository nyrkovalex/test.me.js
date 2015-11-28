'use strict';

var load = require('./test.me');
var path = require('path');
var expect = require('chai').expect;

describe('test.me module loader', function () {
  var testMe, mockFs, mockVm;

  beforeEach(function () {
    mockFs = {
      readFileSync: function (name) {
        return name + ' content';
      }
    };
    mockVm = {
      ranWith: {},
      runInNewContext: function (script, context) {
        this.ranWith.script = script;
        this.ranWith.context = context;
      }
    };
    testMe = load('./test.me', {
      fs: mockFs,
      vm: mockVm
    });
  });

  describe('modulePath function', function () {
    var modulePath;

    beforeEach(function () {
      modulePath = testMe.modulePath;
    });

    it('should return original path', function () {
      expect(modulePath('foo', __filename)).to.equal('foo');
    });

    it('should return absolute path', function () {
      expect(modulePath('./foo', __filename)).to.equal(__dirname + path.sep + 'foo');
    });
  });

  describe('appendJs function', function () {
    var appendJs;

    beforeEach(function () {
      appendJs = testMe.appendJs;
    });

    it('should return original filename', function () {
      expect(appendJs('foo.js')).to.equal('foo.js');
    });

    it('should appen js to filename', function () {
      expect(appendJs('foo')).to.equal('foo.js');
    });
  });

  describe('fromCache function', function () {
    var fromCache;

    beforeEach(function () {
      fromCache = testMe.fromCache;
    });

    it('should save new record to cache', function () {
      fromCache('foo');
      expect(testMe.cache['foo']).to.equal('foo content');
    });

  });

  describe('requireMock function', function () {
    var requireMock;

    beforeEach(function () {
      requireMock = testMe.requireMock;
    });


    it('should return mock', function () {
      expect(requireMock('a', __filename, { a: 'b' })).to.equal('b');
    });

    it('should require original module', function () {
      expect(requireMock('fs', __filename)).to.equal(mockFs);
    });

    it('should resolve module path', function () {
      testMe.modulePath = function () {
        return 'fs';
      };
      expect(requireMock('fs', __filename)).to.equal(mockFs);
    });
  });

  describe('createContext function', function () {
    var createContext;

    beforeEach(function () {
      createContext = testMe.createContext;
    });

    it('should use same object for exports & module.exports', function () {
      var context = createContext('foo');
      expect(context.exports).to.equal(context.module.exports);
    });

    it('should use requireFn function', function () {
      var mocks = {};
      var requireFn = function (name, fileName, passedMocks) {
        if (fileName !== 'foo' || passedMocks !== mocks) {
          return null;
        }
        return name + ' required';
      };
      var context = createContext('foo', mocks, requireFn);
      expect(context.require('test')).to.equal('test required');
    });

    it('should expose real console', function () {
      var context = createContext('foo');
      expect(context.console).to.equal(console);
    });

    it('should use provided console implementation', function () {
      var myConsole = { console: true };
      var context = createContext('foo', null, null, {
        console: myConsole
      });
      expect(context.console).to.equal(myConsole);
    });

    it('should set globals', function () {
      var context = createContext('foo', {}, null, {
        __dirname: 'test.dir'
      });
      expect(context.__dirname).to.equal('test.dir');
    });
  });

  describe('loadModule function', function () {
    var loadModule;

    beforeEach(function () {
      loadModule = testMe.loadModule;
    });

    it('should be exported', function() {
      expect(loadModule).to.equal(testMe.module.exports);
    });

    it('should run corect script', function () {
      testMe.cache['./test.js'] = 'content';
      loadModule('./test');
      expect(mockVm.ranWith.script).to.be.equal('content');
    });

    it('should use mocks provided', function () {
      var mocks = { foo: 'bar' };
      loadModule('./test', mocks);
      expect(mockVm.ranWith.context.require('foo')).to.be.equal('bar');
    });

    it('should globals provided', function () {
      var globals = { __dirname: 'bar' };
      loadModule('./test', {}, globals);
      expect(mockVm.ranWith.context.__dirname).to.be.equal('bar');
    });
  });
});
