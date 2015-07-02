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

function createContext(fileName, mocks, requireFn, globals) {
  var exports = {}, context = {};

    Object.keys(globals || {}).forEach(function(key) {
      context[key] = globals[key];
    });

    context.module = {
      exports: exports
    };
    context.exports = exports;
    context.require = function (name) {
      return requireFn(name, fileName, mocks);
    };
    context.console = console;

    return context;
}

function loadModule(fileName, mocks, globals) {
  var context;
  fileName = appendJs(fileName);
  context = createContext(fileName, mocks, requireMock, globals);
  vm.runInNewContext(fromCache(fileName), context);
  return context;
}

module.exports = loadModule;
