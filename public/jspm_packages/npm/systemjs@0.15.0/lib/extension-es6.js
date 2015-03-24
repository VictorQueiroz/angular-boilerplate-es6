/* */ 
(function(process) {
  function es6(loader) {
    loader._extensions.push(es6);
    var transpiler,
        transpilerModule,
        transpilerRuntimeModule,
        transpilerRuntimeGlobal;
    var isBrowser = typeof window != 'undefined';
    function setTranspiler(name) {
      transpiler = name;
      transpilerModule = '@' + transpiler;
      transpilerRuntimeModule = transpilerModule + (transpiler == 'babel' ? '-helpers' : '-runtime');
      transpilerRuntimeGlobal = transpiler == 'babel' ? transpiler + 'Helpers' : '$' + transpiler + 'Runtime';
      var scriptBase;
      if ($__curScript && $__curScript.src)
        scriptBase = $__curScript.src.substr(0, $__curScript.src.lastIndexOf('/') + 1);
      else
        scriptBase = loader.baseURL + (loader.baseURL.lastIndexOf('/') == loader.baseURL.length - 1 ? '' : '/');
      if (!loader.paths[transpilerModule])
        loader.paths[transpilerModule] = $__curScript && $__curScript.getAttribute('data-' + loader.transpiler + '-src') || scriptBase + loader.transpiler + '.js';
      if (!loader.paths[transpilerRuntimeModule])
        loader.paths[transpilerRuntimeModule] = $__curScript && $__curScript.getAttribute('data-' + transpilerRuntimeModule.substr(1) + '-src') || scriptBase + transpilerRuntimeModule.substr(1) + '.js';
    }
    var es6RegEx = /(^\s*|[}\);\n]\s*)(import\s+(['"]|(\*\s+as\s+)?[^"'\(\)\n;]+\s+from\s+['"]|\{)|export\s+\*\s+from\s+["']|export\s+(\{|default|function|class|var|const|let|async\s+function))/;
    var loaderTranslate = loader.translate;
    loader.translate = function(load) {
      var self = this;
      return loaderTranslate.call(loader, load).then(function(source) {
        if (self.transpiler !== transpiler)
          setTranspiler(self.transpiler);
        var loader = self;
        if (load.name == transpilerModule || load.name == transpilerRuntimeModule)
          return loaderTranslate.call(loader, load);
        else if (load.metadata.format == 'es6' || !load.metadata.format && source.match(es6RegEx)) {
          load.metadata.format = 'es6';
          if (isBrowser && !loader.global[transpiler])
            return loader['import'](transpilerModule).then(function() {
              return source;
            });
        }
        if (isBrowser && !loader.global[transpilerRuntimeGlobal] && source.indexOf(transpilerRuntimeGlobal) != -1) {
          var System = $__global.System;
          return loader['import'](transpilerRuntimeModule).then(function() {
            $__global.System = System;
            return source;
          });
        }
        return source;
      });
    };
    var loaderInstantiate = loader.instantiate;
    loader.instantiate = function(load) {
      var loader = this;
      if (isBrowser && (load.name == transpilerModule || load.name == transpilerRuntimeModule)) {
        loader.__exec(load);
        return {
          deps: [],
          execute: function() {
            return loader.newModule({});
          }
        };
      }
      return loaderInstantiate.call(loader, load);
    };
  }
})(require("process"));
