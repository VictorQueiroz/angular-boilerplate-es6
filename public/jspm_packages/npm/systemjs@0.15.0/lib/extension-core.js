/* */ 
(function(process) {
  var originalSystem = $__global.System.originalSystem;
  function core(loader) {
    var loaderImport = loader['import'];
    loader['import'] = function(name, options) {
      return loaderImport.call(this, name, options).then(function(module) {
        return module.__useDefault ? module['default'] : module;
      });
    };
    loader.set('@empty', loader.newModule({}));
    if (typeof require != 'undefined')
      loader._nodeRequire = require;
    loader.config = function(cfg) {
      for (var c in cfg) {
        var v = cfg[c];
        if (typeof v == 'object' && !(v instanceof Array)) {
          this[c] = this[c] || {};
          for (var p in v)
            this[c][p] = v[p];
        } else
          this[c] = v;
      }
    };
    var baseURI;
    if (typeof window == 'undefined' && typeof WorkerGlobalScope == 'undefined') {
      baseURI = 'file:' + process.cwd() + '/';
    } else if (typeof window == 'undefined') {
      baseURI = loader.global.location.href;
    } else {
      baseURI = document.baseURI;
      if (!baseURI) {
        var bases = document.getElementsByTagName('base');
        baseURI = bases[0] && bases[0].href || window.location.href;
      }
    }
    var loaderLocate = loader.locate;
    var normalizedBaseURL;
    loader.locate = function(load) {
      if (this.baseURL != normalizedBaseURL) {
        normalizedBaseURL = toAbsoluteURL(baseURI, this.baseURL);
        if (normalizedBaseURL.substr(normalizedBaseURL.length - 1, 1) != '/')
          normalizedBaseURL += '/';
        this.baseURL = normalizedBaseURL;
      }
      return Promise.resolve(loaderLocate.call(this, load));
    };
    function applyExtensions(extensions, loader) {
      loader._extensions = [];
      for (var i = 0,
          len = extensions.length; i < len; i++) {
        extensions[i](loader);
      }
    }
    loader._extensions = loader._extensions || [];
    loader._extensions.push(core);
    loader.clone = function() {
      var originalLoader = this;
      var loader = new LoaderPolyfill(originalSystem);
      loader.baseURL = originalLoader.baseURL;
      loader.paths = {'*': '*.js'};
      applyExtensions(originalLoader._extensions, loader);
      return loader;
    };
  }
})(require("process"));
