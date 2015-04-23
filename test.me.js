'use strict';

var vm = require('vm');
var fs = require('fs');
var path = require('path');

// Is it really necessary?
var cache = {};

function fromCache(fileName) {
  if (!cache.hasOwnProperty(fileName)) {
    cache[fileName] = fs.readFileSync(fileName);
  }
  return cache[fileName];
}

function modulePath(module, relativeTo) {
  return module.charAt(0) === '.'
    ? path.resolve(path.dirname(relativeTo), module)
    : module;
}

function appendJs(fileName) {
  return fileName.lastIndexOf('.js') === fileName.length - 3
    ? fileName
    : fileName + '.js';
}

function requireMock(moduleName, relativeTo, mocks) {
  mocks = mocks || {};
  return mocks[moduleName] || require(modulePath(moduleName, relativeTo));
}

function createContext(fileName, mocks, requireFn) {
  var exports = {};
  return {
    module: {
      exports: exports
    },
    exports: exports,
    require: function (name) {
      return requireFn(name, fileName, mocks);
    },
    console: console
  };
}

function loadModule(fileName, mocks) {
  var context;
  fileName = appendJs(fileName);
  context = createContext(fileName, mocks, requireMock);
  vm.runInNewContext(fromCache(fileName), context);
  return context;
}

module.exports = loadModule;
