/* */ 
"format cjs";
(function(process) {
  function register(loader) {
    if (typeof indexOf == 'undefined')
      indexOf = Array.prototype.indexOf;
    if (typeof __eval == 'undefined' || typeof document != 'undefined' && !document.addEventListener)
      __eval = 0 || eval;
    loader._extensions = loader._extensions || [];
    loader._extensions.push(register);
    var curSystem;
    function exec(load) {
      var loader = this;
      if (load.name == '@traceur') {
        curSystem = System;
      }
      var sourceMappingURL;
      var lastLineIndex = load.source.lastIndexOf('\n');
      if (lastLineIndex != -1) {
        if (load.source.substr(lastLineIndex + 1, 21) == '//# sourceMappingURL=') {
          sourceMappingURL = load.source.substr(lastLineIndex + 22, load.source.length - lastLineIndex - 22);
          if (typeof toAbsoluteURL != 'undefined')
            sourceMappingURL = toAbsoluteURL(load.address, sourceMappingURL);
        }
      }
      __eval(load.source, load.address, sourceMappingURL);
      if (load.name == '@traceur') {
        loader.global.traceurSystem = loader.global.System;
        loader.global.System = curSystem;
      }
    }
    loader.__exec = exec;
    function dedupe(deps) {
      var newDeps = [];
      for (var i = 0,
          l = deps.length; i < l; i++)
        if (indexOf.call(newDeps, deps[i]) == -1)
          newDeps.push(deps[i]);
      return newDeps;
    }
    var anonRegister;
    var calledRegister;
    function registerModule(name, deps, declare, execute) {
      if (typeof name != 'string') {
        execute = declare;
        declare = deps;
        deps = name;
        name = null;
      }
      calledRegister = true;
      var register;
      if (typeof declare == 'boolean') {
        register = {
          declarative: false,
          deps: deps,
          execute: execute,
          executingRequire: declare
        };
      } else {
        register = {
          declarative: true,
          deps: deps,
          declare: declare
        };
      }
      if (name) {
        register.name = name;
        if (!(name in loader.defined))
          loader.defined[name] = register;
      } else if (register.declarative) {
        if (anonRegister)
          throw new TypeError('Multiple anonymous System.register calls in the same module file.');
        anonRegister = register;
      }
    }
    function defineRegister(loader) {
      if (loader.register)
        return ;
      loader.register = registerModule;
      if (!loader.defined)
        loader.defined = {};
      var onScriptLoad = loader.onScriptLoad;
      loader.onScriptLoad = function(load) {
        onScriptLoad(load);
        if (anonRegister)
          load.metadata.entry = anonRegister;
        if (calledRegister) {
          load.metadata.format = load.metadata.format || 'register';
          load.metadata.registered = true;
        }
      };
    }
    defineRegister(loader);
    function buildGroups(entry, loader, groups) {
      groups[entry.groupIndex] = groups[entry.groupIndex] || [];
      if (indexOf.call(groups[entry.groupIndex], entry) != -1)
        return ;
      groups[entry.groupIndex].push(entry);
      for (var i = 0,
          l = entry.normalizedDeps.length; i < l; i++) {
        var depName = entry.normalizedDeps[i];
        var depEntry = loader.defined[depName];
        if (!depEntry || depEntry.evaluated)
          continue;
        var depGroupIndex = entry.groupIndex + (depEntry.declarative != entry.declarative);
        if (depEntry.groupIndex === undefined || depEntry.groupIndex < depGroupIndex) {
          if (depEntry.groupIndex !== undefined) {
            groups[depEntry.groupIndex].splice(indexOf.call(groups[depEntry.groupIndex], depEntry), 1);
            if (groups[depEntry.groupIndex].length == 0)
              throw new TypeError("Mixed dependency cycle detected");
          }
          depEntry.groupIndex = depGroupIndex;
        }
        buildGroups(depEntry, loader, groups);
      }
    }
    function link(name, loader) {
      var startEntry = loader.defined[name];
      if (startEntry.module)
        return ;
      startEntry.groupIndex = 0;
      var groups = [];
      buildGroups(startEntry, loader, groups);
      var curGroupDeclarative = !!startEntry.declarative == groups.length % 2;
      for (var i = groups.length - 1; i >= 0; i--) {
        var group = groups[i];
        for (var j = 0; j < group.length; j++) {
          var entry = group[j];
          if (curGroupDeclarative)
            linkDeclarativeModule(entry, loader);
          else
            linkDynamicModule(entry, loader);
        }
        curGroupDeclarative = !curGroupDeclarative;
      }
    }
    var moduleRecords = {};
    function getOrCreateModuleRecord(name) {
      return moduleRecords[name] || (moduleRecords[name] = {
        name: name,
        dependencies: [],
        exports: {},
        importers: []
      });
    }
    function linkDeclarativeModule(entry, loader) {
      if (entry.module)
        return ;
      var module = entry.module = getOrCreateModuleRecord(entry.name);
      var exports = entry.module.exports;
      var declaration = entry.declare.call(loader.global, function(name, value) {
        module.locked = true;
        exports[name] = value;
        for (var i = 0,
            l = module.importers.length; i < l; i++) {
          var importerModule = module.importers[i];
          if (!importerModule.locked) {
            var importerIndex = indexOf.call(importerModule.dependencies, module);
            importerModule.setters[importerIndex](exports);
          }
        }
        module.locked = false;
        return value;
      });
      module.setters = declaration.setters;
      module.execute = declaration.execute;
      if (!module.setters || !module.execute) {
        throw new TypeError('Invalid System.register form for ' + entry.name);
      }
      for (var i = 0,
          l = entry.normalizedDeps.length; i < l; i++) {
        var depName = entry.normalizedDeps[i];
        var depEntry = loader.defined[depName];
        var depModule = moduleRecords[depName];
        var depExports;
        if (depModule) {
          depExports = depModule.exports;
        } else if (depEntry && !depEntry.declarative) {
          depExports = {
            'default': depEntry.module.exports,
            '__useDefault': true
          };
        } else if (!depEntry) {
          depExports = loader.get(depName);
        } else {
          linkDeclarativeModule(depEntry, loader);
          depModule = depEntry.module;
          depExports = depModule.exports;
        }
        if (depModule && depModule.importers) {
          depModule.importers.push(module);
          module.dependencies.push(depModule);
        } else {
          module.dependencies.push(null);
        }
        if (module.setters[i])
          module.setters[i](depExports);
      }
    }
    function getModule(name, loader) {
      var exports;
      var entry = loader.defined[name];
      if (!entry) {
        exports = loader.get(name);
        if (!exports)
          throw new Error('Unable to load dependency ' + name + '.');
      } else {
        if (entry.declarative)
          ensureEvaluated(name, [], loader);
        else if (!entry.evaluated)
          linkDynamicModule(entry, loader);
        exports = entry.module.exports;
      }
      if ((!entry || entry.declarative) && exports && exports.__useDefault)
        return exports['default'];
      return exports;
    }
    function linkDynamicModule(entry, loader) {
      if (entry.module)
        return ;
      var exports = {};
      var module = entry.module = {
        exports: exports,
        id: entry.name
      };
      if (!entry.executingRequire) {
        for (var i = 0,
            l = entry.normalizedDeps.length; i < l; i++) {
          var depName = entry.normalizedDeps[i];
          var depEntry = loader.defined[depName];
          if (depEntry)
            linkDynamicModule(depEntry, loader);
        }
      }
      entry.evaluated = true;
      var output = entry.execute.call(loader.global, function(name) {
        for (var i = 0,
            l = entry.deps.length; i < l; i++) {
          if (entry.deps[i] != name)
            continue;
          return getModule(entry.normalizedDeps[i], loader);
        }
        throw new TypeError('Module ' + name + ' not declared as a dependency.');
      }, exports, module);
      if (output)
        module.exports = output;
    }
    function ensureEvaluated(moduleName, seen, loader) {
      var entry = loader.defined[moduleName];
      if (!entry || entry.evaluated || !entry.declarative)
        return ;
      seen.push(moduleName);
      for (var i = 0,
          l = entry.normalizedDeps.length; i < l; i++) {
        var depName = entry.normalizedDeps[i];
        if (indexOf.call(seen, depName) == -1) {
          if (!loader.defined[depName])
            loader.get(depName);
          else
            ensureEvaluated(depName, seen, loader);
        }
      }
      if (entry.evaluated)
        return ;
      entry.evaluated = true;
      entry.module.execute.call(loader.global);
    }
    var registerRegEx = /System\.register/;
    var loaderFetch = loader.fetch;
    loader.fetch = function(load) {
      var loader = this;
      defineRegister(loader);
      if (loader.defined[load.name]) {
        load.metadata.format = 'defined';
        return '';
      }
      anonRegister = null;
      calledRegister = false;
      return loaderFetch.call(loader, load);
    };
    var loaderTranslate = loader.translate;
    loader.translate = function(load) {
      this.register = registerModule;
      this.__exec = exec;
      load.metadata.deps = load.metadata.deps || [];
      return Promise.resolve(loaderTranslate.call(this, load)).then(function(source) {
        if (load.metadata.init || load.metadata.exports)
          load.metadata.format = load.metadata.format || 'global';
        if (load.metadata.format == 'register' || !load.metadata.format && load.source.match(registerRegEx))
          load.metadata.format = 'register';
        return source;
      });
    };
    var loaderInstantiate = loader.instantiate;
    loader.instantiate = function(load) {
      var loader = this;
      var entry;
      if (loader.defined[load.name]) {
        entry = loader.defined[load.name];
        entry.deps = entry.deps.concat(load.metadata.deps);
      } else if (load.metadata.entry)
        entry = load.metadata.entry;
      else if (load.metadata.execute) {
        entry = {
          declarative: false,
          deps: load.metadata.deps || [],
          execute: load.metadata.execute,
          executingRequire: load.metadata.executingRequire
        };
      } else if (load.metadata.format == 'register') {
        anonRegister = null;
        calledRegister = false;
        var curSystem = loader.global.System;
        loader.global.System = loader;
        loader.__exec(load);
        loader.global.System = curSystem;
        if (anonRegister)
          entry = anonRegister;
        if (!entry && System.defined[load.name])
          entry = System.defined[load.name];
        if (!calledRegister && !load.metadata.registered)
          throw new TypeError(load.name + ' detected as System.register but didn\'t execute.');
      }
      if (!entry && load.metadata.format != 'es6')
        return {
          deps: [],
          execute: function() {
            return loader.newModule({});
          }
        };
      if (entry)
        loader.defined[load.name] = entry;
      else
        return loaderInstantiate.call(this, load);
      entry.deps = dedupe(entry.deps);
      entry.name = load.name;
      var normalizePromises = [];
      for (var i = 0,
          l = entry.deps.length; i < l; i++)
        normalizePromises.push(Promise.resolve(loader.normalize(entry.deps[i], load.name)));
      return Promise.all(normalizePromises).then(function(normalizedDeps) {
        entry.normalizedDeps = normalizedDeps;
        return {
          deps: entry.deps,
          execute: function() {
            link(load.name, loader);
            ensureEvaluated(load.name, [], loader);
            loader.defined[load.name] = undefined;
            var module = entry.module.exports;
            if (!entry.declarative && module.__esModule !== true)
              module = {
                'default': module,
                __useDefault: true
              };
            return loader.newModule(module);
          }
        };
      });
    };
  }
})(require("process"));
