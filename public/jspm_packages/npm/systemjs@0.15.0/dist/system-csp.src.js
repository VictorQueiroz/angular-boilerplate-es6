/* */ 
"format cjs";
(function(process) {
  (function($__global) {
    $__global.upgradeSystemLoader = function() {
      $__global.upgradeSystemLoader = undefined;
      var indexOf = Array.prototype.indexOf || function(item) {
        for (var i = 0,
            l = this.length; i < l; i++)
          if (this[i] === item)
            return i;
        return -1;
      };
      function parseURI(url) {
        var m = String(url).replace(/^\s+|\s+$/g, '').match(/^([^:\/?#]+:)?(\/\/(?:[^:@\/?#]*(?::[^:@\/?#]*)?@)?(([^:\/?#]*)(?::(\d*))?))?([^?#]*)(\?[^#]*)?(#[\s\S]*)?/);
        return (m ? {
          href: m[0] || '',
          protocol: m[1] || '',
          authority: m[2] || '',
          host: m[3] || '',
          hostname: m[4] || '',
          port: m[5] || '',
          pathname: m[6] || '',
          search: m[7] || '',
          hash: m[8] || ''
        } : null);
      }
      function toAbsoluteURL(base, href) {
        function removeDotSegments(input) {
          var output = [];
          input.replace(/^(\.\.?(\/|$))+/, '').replace(/\/(\.(\/|$))+/g, '/').replace(/\/\.\.$/, '/../').replace(/\/?[^\/]*/g, function(p) {
            if (p === '/..')
              output.pop();
            else
              output.push(p);
          });
          return output.join('').replace(/^\//, input.charAt(0) === '/' ? '/' : '');
        }
        href = parseURI(href || '');
        base = parseURI(base || '');
        return !href || !base ? null : (href.protocol || base.protocol) + (href.protocol || href.authority ? href.authority : base.authority) + removeDotSegments(href.protocol || href.authority || href.pathname.charAt(0) === '/' ? href.pathname : (href.pathname ? ((base.authority && !base.pathname ? '/' : '') + base.pathname.slice(0, base.pathname.lastIndexOf('/') + 1) + href.pathname) : base.pathname)) + (href.protocol || href.authority || href.pathname ? href.search : (href.search || base.search)) + href.hash;
      }
      var System;
      (function() {
        var originalSystem = $__global.System;
        System = $__global.System = new LoaderPolyfill(originalSystem);
        System.baseURL = originalSystem.baseURL;
        System.paths = {'*': '*.js'};
        System.originalSystem = originalSystem;
      })();
      System.noConflict = function() {
        $__global.SystemJS = System;
        $__global.System = System.originalSystem;
      };
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
      function scriptLoader(loader) {
        if (typeof indexOf == 'undefined')
          indexOf = Array.prototype.indexOf;
        loader._extensions.push(scriptLoader);
        var head = document.getElementsByTagName('head')[0];
        loader.onScriptLoad = function() {};
        loader.fetch = function(load) {
          return new Promise(function(resolve, reject) {
            var s = document.createElement('script');
            s.async = true;
            function complete(evt) {
              if (s.readyState && s.readyState != 'loaded' && s.readyState != 'complete')
                return ;
              cleanup();
              loader.onScriptLoad(load);
              if (!load.metadata.registered)
                reject(load.address + ' did not call System.register or AMD define');
              resolve('');
            }
            function error(evt) {
              cleanup();
              reject(evt);
            }
            if (s.attachEvent) {
              s.attachEvent('onreadystatechange', complete);
            } else {
              s.addEventListener('load', complete, false);
              s.addEventListener('error', error, false);
            }
            s.src = load.address;
            head.appendChild(s);
            function cleanup() {
              if (s.detachEvent)
                s.detachEvent('onreadystatechange', complete);
              else {
                s.removeEventListener('load', complete, false);
                s.removeEventListener('error', error, false);
              }
              head.removeChild(s);
            }
          });
        };
        loader.scriptLoader = true;
      }
      function meta(loader) {
        var metaRegEx = /^(\s*\/\*.*\*\/|\s*\/\/[^\n]*|\s*"[^"]+"\s*;?|\s*'[^']+'\s*;?)+/;
        var metaPartRegEx = /\/\*.*\*\/|\/\/[^\n]*|"[^"]+"\s*;?|'[^']+'\s*;?/g;
        loader.meta = {};
        loader._extensions = loader._extensions || [];
        loader._extensions.push(meta);
        function setConfigMeta(loader, load) {
          var meta = loader.meta && loader.meta[load.name];
          if (meta) {
            for (var p in meta)
              load.metadata[p] = load.metadata[p] || meta[p];
          }
        }
        var loaderLocate = loader.locate;
        loader.locate = function(load) {
          setConfigMeta(this, load);
          return loaderLocate.call(this, load);
        };
        var loaderTranslate = loader.translate;
        loader.translate = function(load) {
          var meta = load.source.match(metaRegEx);
          if (meta) {
            var metaParts = meta[0].match(metaPartRegEx);
            for (var i = 0; i < metaParts.length; i++) {
              var len = metaParts[i].length;
              var firstChar = metaParts[i].substr(0, 1);
              if (metaParts[i].substr(len - 1, 1) == ';')
                len--;
              if (firstChar != '"' && firstChar != "'")
                continue;
              var metaString = metaParts[i].substr(1, metaParts[i].length - 3);
              var metaName = metaString.substr(0, metaString.indexOf(' '));
              if (metaName) {
                var metaValue = metaString.substr(metaName.length + 1, metaString.length - metaName.length - 1);
                if (load.metadata[metaName] instanceof Array)
                  load.metadata[metaName].push(metaValue);
                else if (!load.metadata[metaName])
                  load.metadata[metaName] = metaValue;
              }
            }
          }
          setConfigMeta(this, load);
          return loaderTranslate.call(this, load);
        };
      }
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
      function global(loader) {
        loader._extensions.push(global);
        function readGlobalProperty(p, value) {
          var pParts = p.split('.');
          while (pParts.length)
            value = value[pParts.shift()];
          return value;
        }
        function createHelpers(loader) {
          if (loader.has('@@global-helpers'))
            return ;
          var hasOwnProperty = loader.global.hasOwnProperty;
          var moduleGlobals = {};
          var curGlobalObj;
          var ignoredGlobalProps;
          loader.set('@@global-helpers', loader.newModule({
            prepareGlobal: function(moduleName, deps) {
              for (var i = 0; i < deps.length; i++) {
                var moduleGlobal = moduleGlobals[deps[i]];
                if (moduleGlobal)
                  for (var m in moduleGlobal)
                    loader.global[m] = moduleGlobal[m];
              }
              curGlobalObj = {};
              ignoredGlobalProps = ['indexedDB', 'sessionStorage', 'localStorage', 'clipboardData', 'frames', 'webkitStorageInfo', 'toolbar', 'statusbar', 'scrollbars', 'personalbar', 'menubar', 'locationbar', 'webkitIndexedDB', 'screenTop', 'screenLeft'];
              for (var g in loader.global) {
                if (indexOf.call(ignoredGlobalProps, g) != -1) {
                  continue;
                }
                if (!hasOwnProperty || loader.global.hasOwnProperty(g)) {
                  try {
                    curGlobalObj[g] = loader.global[g];
                  } catch (e) {
                    ignoredGlobalProps.push(g);
                  }
                }
              }
            },
            retrieveGlobal: function(moduleName, exportName, init) {
              var singleGlobal;
              var multipleExports;
              var exports = {};
              if (init)
                singleGlobal = init.call(loader.global);
              else if (exportName) {
                var firstPart = exportName.split('.')[0];
                singleGlobal = readGlobalProperty(exportName, loader.global);
                exports[firstPart] = loader.global[firstPart];
              } else {
                for (var g in loader.global) {
                  if (indexOf.call(ignoredGlobalProps, g) != -1)
                    continue;
                  if ((!hasOwnProperty || loader.global.hasOwnProperty(g)) && g != loader.global && curGlobalObj[g] != loader.global[g]) {
                    exports[g] = loader.global[g];
                    if (singleGlobal) {
                      if (singleGlobal !== loader.global[g])
                        multipleExports = true;
                    } else if (singleGlobal !== false) {
                      singleGlobal = loader.global[g];
                    }
                  }
                }
              }
              moduleGlobals[moduleName] = exports;
              return multipleExports ? exports : singleGlobal;
            }
          }));
        }
        createHelpers(loader);
        var loaderInstantiate = loader.instantiate;
        loader.instantiate = function(load) {
          var loader = this;
          createHelpers(loader);
          var exportName = load.metadata.exports;
          if (!load.metadata.format)
            load.metadata.format = 'global';
          if (load.metadata.format == 'global') {
            load.metadata.execute = function(require, exports, module) {
              loader.get('@@global-helpers').prepareGlobal(module.id, load.metadata.deps);
              if (exportName)
                load.source += '\nthis["' + exportName + '"] = ' + exportName + ';';
              var define = loader.global.define;
              loader.global.define = undefined;
              loader.global.module = undefined;
              loader.global.exports = undefined;
              loader.__exec(load);
              loader.global.define = define;
              return loader.get('@@global-helpers').retrieveGlobal(module.id, exportName, load.metadata.init);
            };
          }
          return loaderInstantiate.call(loader, load);
        };
      }
      function cjs(loader) {
        loader._extensions.push(cjs);
        var cjsExportsRegEx = /(?:^\uFEFF?|[^$_a-zA-Z\xA0-\uFFFF.]|module\.)(exports\s*\[['"]|\exports\s*\.)|(?:^\uFEFF?|[^$_a-zA-Z\xA0-\uFFFF.])module\.exports\s*\=/;
        var cjsRequireRegEx = /(?:^\uFEFF?|[^$_a-zA-Z\xA0-\uFFFF."'])require\s*\(\s*("[^"\\]*(?:\\.[^"\\]*)*"|'[^'\\]*(?:\\.[^'\\]*)*')\s*\)/g;
        var commentRegEx = /(\/\*([\s\S]*?)\*\/|([^:]|^)\/\/(.*)$)/mg;
        function getCJSDeps(source) {
          cjsRequireRegEx.lastIndex = 0;
          var deps = [];
          if (source.length / source.split('\n').length < 200)
            source = source.replace(commentRegEx, '');
          var match;
          while (match = cjsRequireRegEx.exec(source))
            deps.push(match[1].substr(1, match[1].length - 2));
          return deps;
        }
        var loaderInstantiate = loader.instantiate;
        loader.instantiate = function(load) {
          if (!load.metadata.format) {
            cjsExportsRegEx.lastIndex = 0;
            cjsRequireRegEx.lastIndex = 0;
            if (cjsRequireRegEx.exec(load.source) || cjsExportsRegEx.exec(load.source))
              load.metadata.format = 'cjs';
          }
          if (load.metadata.format == 'cjs') {
            load.metadata.deps = load.metadata.deps ? load.metadata.deps.concat(getCJSDeps(load.source)) : getCJSDeps(load.source);
            load.metadata.executingRequire = true;
            load.metadata.execute = function(require, exports, module) {
              var dirname = (load.address || '').split('/');
              dirname.pop();
              dirname = dirname.join('/');
              if (System._nodeRequire)
                dirname = dirname.substr(5);
              var globals = loader.global._g = {
                global: loader.global,
                exports: exports,
                module: module,
                require: require,
                __filename: System._nodeRequire ? load.address.substr(5) : load.address,
                __dirname: dirname
              };
              var source = '(function(global, exports, module, require, __filename, __dirname) { ' + load.source + '\n}).call(_g.exports, _g.global, _g.exports, _g.module, _g.require, _g.__filename, _g.__dirname);';
              var define = loader.global.define;
              loader.global.define = undefined;
              loader.__exec({
                name: load.name,
                address: load.address,
                source: source
              });
              loader.global.define = define;
              loader.global._g = undefined;
            };
          }
          return loaderInstantiate.call(this, load);
        };
      }
      function amd(loader) {
        var isNode = typeof module != 'undefined' && module.exports;
        loader._extensions.push(amd);
        var amdRegEx = /(?:^\uFEFF?|[^$_a-zA-Z\xA0-\uFFFF.])define\s*\(\s*("[^"]+"\s*,\s*|'[^']+'\s*,\s*)?\s*(\[(\s*(("[^"]+"|'[^']+')\s*,|\/\/.*\r?\n|\/\*(.|\s)*?\*\/))*(\s*("[^"]+"|'[^']+')\s*,?)?(\s*(\/\/.*\r?\n|\/\*(.|\s)*?\*\/))*\s*\]|function\s*|{|[_$a-zA-Z\xA0-\uFFFF][_$a-zA-Z0-9\xA0-\uFFFF]*\))/;
        var commentRegEx = /(\/\*([\s\S]*?)\*\/|([^:]|^)\/\/(.*)$)/mg;
        var cjsRequirePre = "(?:^|[^$_a-zA-Z\\xA0-\\uFFFF.])";
        var cjsRequirePost = "\\s*\\(\\s*(\"([^\"]+)\"|'([^']+)')\\s*\\)";
        var fnBracketRegEx = /\(([^\)]*)\)/;
        var wsRegEx = /^\s+|\s+$/g;
        var requireRegExs = {};
        function getCJSDeps(source, requireIndex) {
          source = source.replace(commentRegEx, '');
          var params = source.match(fnBracketRegEx);
          var requireAlias = (params[1].split(',')[requireIndex] || 'require').replace(wsRegEx, '');
          var requireRegEx = requireRegExs[requireAlias] || (requireRegExs[requireAlias] = new RegExp(cjsRequirePre + requireAlias + cjsRequirePost, 'g'));
          requireRegEx.lastIndex = 0;
          var deps = [];
          var match;
          while (match = requireRegEx.exec(source))
            deps.push(match[2] || match[3]);
          return deps;
        }
        function require(names, callback, errback, referer) {
          var loader = this;
          if (typeof names == 'object' && !(names instanceof Array))
            return require.apply(null, Array.prototype.splice.call(arguments, 1, arguments.length - 1));
          if (names instanceof Array)
            Promise.all(names.map(function(name) {
              return loader['import'](name, referer);
            })).then(function(modules) {
              if (callback) {
                callback.apply(null, modules);
              }
            }, errback);
          else if (typeof names == 'string') {
            var module = loader.get(names);
            return module.__useDefault ? module['default'] : module;
          } else
            throw new TypeError('Invalid require');
        }
        ;
        loader.amdRequire = require;
        function makeRequire(parentName, staticRequire, loader) {
          return function(names, callback, errback) {
            if (typeof names == 'string')
              return staticRequire(names);
            return require.call(loader, names, callback, errback, {name: parentName});
          };
        }
        function generateDefine(loader) {
          var onScriptLoad = loader.onScriptLoad;
          loader.onScriptLoad = function(load) {
            onScriptLoad(load);
            if (anonDefine || defineBundle) {
              load.metadata.format = 'defined';
              load.metadata.registered = true;
            }
            if (anonDefine) {
              load.metadata.deps = load.metadata.deps ? load.metadata.deps.concat(anonDefine.deps) : anonDefine.deps;
              load.metadata.execute = anonDefine.execute;
            }
          };
          function define(name, deps, factory) {
            if (typeof name != 'string') {
              factory = deps;
              deps = name;
              name = null;
            }
            if (!(deps instanceof Array)) {
              factory = deps;
              deps = ['require', 'exports', 'module'];
            }
            if (typeof factory != 'function')
              factory = (function(factory) {
                return function() {
                  return factory;
                };
              })(factory);
            if (deps[deps.length - 1] === undefined)
              deps.pop();
            var requireIndex,
                exportsIndex,
                moduleIndex;
            if ((requireIndex = indexOf.call(deps, 'require')) != -1) {
              deps.splice(requireIndex, 1);
              var factoryText = factory.toString();
              deps = deps.concat(getCJSDeps(factoryText, requireIndex));
            }
            if ((exportsIndex = indexOf.call(deps, 'exports')) != -1)
              deps.splice(exportsIndex, 1);
            if ((moduleIndex = indexOf.call(deps, 'module')) != -1)
              deps.splice(moduleIndex, 1);
            var define = {
              deps: deps,
              execute: function(require, exports, module) {
                var depValues = [];
                for (var i = 0; i < deps.length; i++)
                  depValues.push(require(deps[i]));
                module.uri = loader.baseURL + module.id;
                module.config = function() {};
                if (moduleIndex != -1)
                  depValues.splice(moduleIndex, 0, module);
                if (exportsIndex != -1)
                  depValues.splice(exportsIndex, 0, exports);
                if (requireIndex != -1)
                  depValues.splice(requireIndex, 0, makeRequire(module.id, require, loader));
                var output = factory.apply(global, depValues);
                if (typeof output == 'undefined' && module)
                  output = module.exports;
                if (typeof output != 'undefined')
                  return output;
              }
            };
            if (!name) {
              if (anonDefine)
                throw new TypeError('Multiple defines for anonymous module');
              anonDefine = define;
            } else {
              if (deps.length == 0 && !anonDefine && !defineBundle)
                anonDefine = define;
              else
                anonDefine = null;
              defineBundle = true;
              loader.register(name, define.deps, false, define.execute);
            }
          }
          ;
          define.amd = {};
          loader.amdDefine = define;
        }
        var anonDefine;
        var defineBundle;
        var oldModule,
            oldExports,
            oldDefine;
        function createDefine(loader) {
          if (!loader.amdDefine)
            generateDefine(loader);
          anonDefine = null;
          defineBundle = null;
          var global = loader.global;
          oldModule = global.module;
          oldExports = global.exports;
          oldDefine = global.define;
          global.module = undefined;
          global.exports = undefined;
          if (global.define && global.define === loader.amdDefine)
            return ;
          global.define = loader.amdDefine;
        }
        function removeDefine(loader) {
          var global = loader.global;
          global.define = oldDefine;
          global.module = oldModule;
          global.exports = oldExports;
        }
        generateDefine(loader);
        if (loader.scriptLoader) {
          var loaderFetch = loader.fetch;
          loader.fetch = function(load) {
            createDefine(this);
            return loaderFetch.call(this, load);
          };
        }
        var loaderInstantiate = loader.instantiate;
        loader.instantiate = function(load) {
          var loader = this;
          if (load.metadata.format == 'amd' || !load.metadata.format && load.source.match(amdRegEx)) {
            load.metadata.format = 'amd';
            if (loader.execute !== false) {
              createDefine(loader);
              loader.__exec(load);
              removeDefine(loader);
              if (!anonDefine && !defineBundle && !isNode)
                throw new TypeError('AMD module ' + load.name + ' did not define');
            }
            if (anonDefine) {
              load.metadata.deps = load.metadata.deps ? load.metadata.deps.concat(anonDefine.deps) : anonDefine.deps;
              load.metadata.execute = anonDefine.execute;
            }
          }
          return loaderInstantiate.call(loader, load);
        };
      }
      function map(loader) {
        loader.map = loader.map || {};
        loader._extensions.push(map);
        function prefixMatch(name, prefix) {
          if (name.length < prefix.length)
            return false;
          if (name.substr(0, prefix.length) != prefix)
            return false;
          if (name[prefix.length] && name[prefix.length] != '/')
            return false;
          return true;
        }
        function pathLen(name) {
          var len = 1;
          for (var i = 0,
              l = name.length; i < l; i++)
            if (name[i] === '/')
              len++;
          return len;
        }
        function doMap(name, matchLen, map) {
          return map + name.substr(matchLen);
        }
        function applyMap(name, parentName, loader) {
          var curMatch,
              curMatchLength = 0;
          var curParent,
              curParentMatchLength = 0;
          var tmpParentLength,
              tmpPrefixLength;
          var subPath;
          var nameParts;
          if (parentName) {
            for (var p in loader.map) {
              var curMap = loader.map[p];
              if (typeof curMap != 'object')
                continue;
              if (!prefixMatch(parentName, p))
                continue;
              tmpParentLength = pathLen(p);
              if (tmpParentLength <= curParentMatchLength)
                continue;
              for (var q in curMap) {
                if (!prefixMatch(name, q))
                  continue;
                tmpPrefixLength = pathLen(q);
                if (tmpPrefixLength <= curMatchLength)
                  continue;
                curMatch = q;
                curMatchLength = tmpPrefixLength;
                curParent = p;
                curParentMatchLength = tmpParentLength;
              }
            }
          }
          if (curMatch)
            return doMap(name, curMatch.length, loader.map[curParent][curMatch]);
          for (var p in loader.map) {
            var curMap = loader.map[p];
            if (typeof curMap != 'string')
              continue;
            if (!prefixMatch(name, p))
              continue;
            var tmpPrefixLength = pathLen(p);
            if (tmpPrefixLength <= curMatchLength)
              continue;
            curMatch = p;
            curMatchLength = tmpPrefixLength;
          }
          if (curMatch)
            return doMap(name, curMatch.length, loader.map[curMatch]);
          return name;
        }
        var loaderNormalize = loader.normalize;
        loader.normalize = function(name, parentName, parentAddress) {
          var loader = this;
          if (!loader.map)
            loader.map = {};
          var isPackage = false;
          if (name.substr(name.length - 1, 1) == '/') {
            isPackage = true;
            name += '#';
          }
          return Promise.resolve(loaderNormalize.call(loader, name, parentName, parentAddress)).then(function(name) {
            name = applyMap(name, parentName, loader);
            if (isPackage) {
              var nameParts = name.split('/');
              nameParts.pop();
              var pkgName = nameParts.pop();
              nameParts.push(pkgName);
              nameParts.push(pkgName);
              name = nameParts.join('/');
            }
            return name;
          });
        };
      }
      function plugins(loader) {
        if (typeof indexOf == 'undefined')
          indexOf = Array.prototype.indexOf;
        loader._extensions.push(plugins);
        var loaderNormalize = loader.normalize;
        loader.normalize = function(name, parentName, parentAddress) {
          var loader = this;
          var parentPluginIndex;
          if (parentName && (parentPluginIndex = parentName.indexOf('!')) != -1)
            parentName = parentName.substr(0, parentPluginIndex);
          return Promise.resolve(loaderNormalize.call(loader, name, parentName, parentAddress)).then(function(name) {
            var pluginIndex = name.lastIndexOf('!');
            if (pluginIndex != -1) {
              var argumentName = name.substr(0, pluginIndex);
              var pluginName = name.substr(pluginIndex + 1) || argumentName.substr(argumentName.lastIndexOf('.') + 1);
              return new Promise(function(resolve) {
                resolve(loader.normalize(pluginName, parentName, parentAddress));
              }).then(function(_pluginName) {
                pluginName = _pluginName;
                return loader.normalize(argumentName, parentName, parentAddress);
              }).then(function(argumentName) {
                return argumentName + '!' + pluginName;
              });
            }
            return name;
          });
        };
        var loaderLocate = loader.locate;
        loader.locate = function(load) {
          var loader = this;
          var name = load.name;
          if (this.defined && this.defined[name])
            return loaderLocate.call(this, load);
          var pluginIndex = name.lastIndexOf('!');
          if (pluginIndex != -1) {
            var pluginName = name.substr(pluginIndex + 1);
            load.name = name.substr(0, pluginIndex);
            var pluginLoader = loader.pluginLoader || loader;
            return pluginLoader['import'](pluginName).then(function() {
              var plugin = pluginLoader.get(pluginName);
              plugin = plugin['default'] || plugin;
              if (plugin.build === false && loader.pluginLoader)
                load.metadata.build = false;
              load.metadata.plugin = plugin;
              load.metadata.pluginName = pluginName;
              load.metadata.pluginArgument = load.name;
              if (plugin.locate)
                return plugin.locate.call(loader, load);
              else
                return Promise.resolve(loader.locate(load)).then(function(address) {
                  return address.replace(/\.js$/, '');
                });
            });
          }
          return loaderLocate.call(this, load);
        };
        var loaderFetch = loader.fetch;
        loader.fetch = function(load) {
          var loader = this;
          if (load.metadata.build === false)
            return '';
          else if (load.metadata.plugin && load.metadata.plugin.fetch && !load.metadata.pluginFetchCalled) {
            load.metadata.pluginFetchCalled = true;
            return load.metadata.plugin.fetch.call(loader, load, loaderFetch);
          } else
            return loaderFetch.call(loader, load);
        };
        var loaderTranslate = loader.translate;
        loader.translate = function(load) {
          var loader = this;
          if (load.metadata.plugin && load.metadata.plugin.translate)
            return Promise.resolve(load.metadata.plugin.translate.call(loader, load)).then(function(result) {
              if (typeof result == 'string')
                load.source = result;
              return loaderTranslate.call(loader, load);
            });
          else
            return loaderTranslate.call(loader, load);
        };
        var loaderInstantiate = loader.instantiate;
        loader.instantiate = function(load) {
          var loader = this;
          if (load.metadata.plugin && load.metadata.plugin.instantiate)
            return Promise.resolve(load.metadata.plugin.instantiate.call(loader, load)).then(function(result) {
              load.metadata.format = 'defined';
              load.metadata.execute = function() {
                return result;
              };
              return loaderInstantiate.call(loader, load);
            });
          else if (load.metadata.plugin && load.metadata.plugin.build === false) {
            load.metadata.format = 'defined';
            load.metadata.deps.push(load.metadata.pluginName);
            load.metadata.execute = function() {
              return loader.newModule({});
            };
            return loaderInstantiate.call(loader, load);
          } else
            return loaderInstantiate.call(loader, load);
        };
      }
      function bundles(loader) {
        if (typeof indexOf == 'undefined')
          indexOf = Array.prototype.indexOf;
        loader._extensions.push(bundles);
        loader.bundles = loader.bundles || {};
        var loaderFetch = loader.fetch;
        loader.fetch = function(load) {
          var loader = this;
          if (loader.trace)
            return loaderFetch.call(this, load);
          if (!loader.bundles)
            loader.bundles = {};
          for (var b in loader.bundles) {
            if (indexOf.call(loader.bundles[b], load.name) == -1)
              continue;
            return Promise.resolve(loader.normalize(b)).then(function(normalized) {
              loader.bundles[normalized] = loader.bundles[normalized] || loader.bundles[b];
              loader.meta = loader.meta || {};
              loader.meta[normalized] = loader.meta[normalized] || {};
              loader.meta[normalized].bundle = true;
              return loader.load(normalized);
            }).then(function() {
              return '';
            });
          }
          return loaderFetch.call(this, load);
        };
      }
      function versions(loader) {
        if (typeof indexOf == 'undefined')
          indexOf = Array.prototype.indexOf;
        loader._extensions.push(versions);
        var semverRegEx = /^(\d+)(?:\.(\d+)(?:\.(\d+)(?:-([\da-z-]+(?:\.[\da-z-]+)*)(?:\+([\da-z-]+(?:\.[\da-z-]+)*))?)?)?)?$/i;
        var numRegEx = /^\d+$/;
        function toInt(num) {
          return parseInt(num, 10);
        }
        function parseSemver(v) {
          var semver = v.match(semverRegEx);
          if (!semver)
            return {tag: v};
          else
            return {
              major: toInt(semver[1]),
              minor: toInt(semver[2]),
              patch: toInt(semver[3]),
              pre: semver[4] && semver[4].split('.')
            };
        }
        var parts = ['major', 'minor', 'patch'];
        function semverCompareParsed(v1, v2) {
          if (v1.tag && v2.tag)
            return 0;
          if (v1.tag)
            return -1;
          if (v2.tag)
            return 1;
          for (var i = 0; i < parts.length; i++) {
            var part = parts[i];
            var part1 = v1[part];
            var part2 = v2[part];
            if (part1 == part2)
              continue;
            if (isNaN(part1))
              return -1;
            if (isNaN(part2))
              return 1;
            return part1 > part2 ? 1 : -1;
          }
          if (!v1.pre && !v2.pre)
            return 0;
          if (!v1.pre)
            return 1;
          if (!v2.pre)
            return -1;
          for (var i = 0,
              l = Math.min(v1.pre.length, v2.pre.length); i < l; i++) {
            if (v1.pre[i] == v2.pre[i])
              continue;
            var isNum1 = v1.pre[i].match(numRegEx);
            var isNum2 = v2.pre[i].match(numRegEx);
            if (isNum1 && !isNum2)
              return -1;
            if (isNum2 && !isNum1)
              return 1;
            if (isNum1 && isNum2)
              return toInt(v1.pre[i]) > toInt(v2.pre[i]) ? 1 : -1;
            else
              return v1.pre[i] > v2.pre[i] ? 1 : -1;
          }
          if (v1.pre.length == v2.pre.length)
            return 0;
          return v1.pre.length > v2.pre.length ? 1 : -1;
        }
        function matchParsed(range, version) {
          var rangeVersion = range.version;
          if (rangeVersion.tag)
            return rangeVersion.tag == version.tag;
          if (semverCompareParsed(rangeVersion, version) == 1)
            return false;
          if (isNaN(version.minor) || isNaN(version.patch))
            return false;
          if (version.pre) {
            if (!(rangeVersion.major == version.major && rangeVersion.minor == version.minor && rangeVersion.patch == version.patch))
              return false;
            return range.semver || range.fuzzy || rangeVersion.pre.join('.') == version.pre.join('.');
          }
          if (range.semver) {
            if (rangeVersion.major == 0 && isNaN(rangeVersion.minor))
              return version.major < 1;
            else if (rangeVersion.major >= 1)
              return rangeVersion.major == version.major;
            else if (rangeVersion.minor >= 1)
              return rangeVersion.minor == version.minor;
            else
              return (rangeVersion.patch || 0) == version.patch;
          }
          if (range.fuzzy)
            return version.major == rangeVersion.major && version.minor < (rangeVersion.minor || 0) + 1;
          return !rangeVersion.pre && rangeVersion.major == version.major && rangeVersion.minor == version.minor && rangeVersion.patch == version.patch;
        }
        function parseRange(range) {
          var rangeObj = {};
          ((rangeObj.semver = range.substr(0, 1) == '^') || (rangeObj.fuzzy = range.substr(0, 1) == '~')) && (range = range.substr(1));
          var rangeVersion = rangeObj.version = parseSemver(range);
          if (rangeVersion.tag)
            return rangeObj;
          if (!rangeObj.fuzzy && !rangeObj.semver && (isNaN(rangeVersion.minor) || isNaN(rangeVersion.patch)))
            rangeObj.fuzzy = true;
          if (rangeObj.fuzzy && isNaN(rangeVersion.minor)) {
            rangeObj.semver = true;
            rangeObj.fuzzy = false;
          }
          if (rangeObj.semver && !isNaN(rangeVersion.minor) && isNaN(rangeVersion.patch)) {
            rangeObj.semver = false;
            rangeObj.fuzzy = true;
          }
          return rangeObj;
        }
        function semverCompare(v1, v2) {
          return semverCompareParsed(parseSemver(v1), parseSemver(v2));
        }
        loader.versions = loader.versions || {};
        var loaderNormalize = loader.normalize;
        loader.normalize = function(name, parentName, parentAddress) {
          if (!this.versions)
            this.versions = {};
          var packageVersions = this.versions;
          var stripVersion,
              stripSubPathLength;
          var versionIndex = name.indexOf('!') != -1 ? 0 : name.lastIndexOf('@');
          if (versionIndex > 0) {
            var parts = name.substr(versionIndex + 1, name.length - versionIndex - 1).split('/');
            stripVersion = parts[0];
            stripSubPathLength = parts.length;
            name = name.substr(0, versionIndex) + name.substr(versionIndex + stripVersion.length + 1, name.length - versionIndex - stripVersion.length - 1);
          }
          return Promise.resolve(loaderNormalize.call(this, name, parentName, parentAddress)).then(function(normalized) {
            var index = normalized.indexOf('!') != -1 ? 0 : normalized.indexOf('@');
            if (stripVersion && (index == -1 || index == 0)) {
              var parts = normalized.split('/');
              parts[parts.length - stripSubPathLength] += '@' + stripVersion;
              normalized = parts.join('/');
              index = normalized.indexOf('@');
            }
            var nextChar,
                versions;
            if (index == -1 || index == 0) {
              for (var p in packageVersions) {
                versions = packageVersions[p];
                if (normalized.substr(0, p.length) != p)
                  continue;
                nextChar = normalized.substr(p.length, 1);
                if (nextChar && nextChar != '/')
                  continue;
                return p + '@' + (typeof versions == 'string' ? versions : versions[versions.length - 1]) + normalized.substr(p.length);
              }
              return normalized;
            }
            var packageName = normalized.substr(0, index);
            var range = normalized.substr(index + 1).split('/')[0];
            var rangeLength = range.length;
            var parsedRange = parseRange(normalized.substr(index + 1).split('/')[0]);
            versions = packageVersions[normalized.substr(0, index)] || [];
            if (typeof versions == 'string')
              versions = [versions];
            for (var i = versions.length - 1; i >= 0; i--) {
              if (matchParsed(parsedRange, parseSemver(versions[i])))
                return packageName + '@' + versions[i] + normalized.substr(index + rangeLength + 1);
            }
            var versionRequest;
            if (parsedRange.semver) {
              versionRequest = parsedRange.version.major == 0 && !isNaN(parsedRange.version.minor) ? '0.' + parsedRange.version.minor : parsedRange.version.major;
            } else if (parsedRange.fuzzy) {
              versionRequest = parsedRange.version.major + '.' + parsedRange.version.minor;
            } else {
              versionRequest = range;
              versions.push(range);
              versions.sort(semverCompare);
              packageVersions[packageName] = versions.length == 1 ? versions[0] : versions;
            }
            return packageName + '@' + versionRequest + normalized.substr(index + rangeLength + 1);
          });
        };
      }
      function depCache(loader) {
        loader.depCache = loader.depCache || {};
        loader._extensions.push(depCache);
        loaderLocate = loader.locate;
        loader.locate = function(load) {
          var loader = this;
          if (!loader.depCache)
            loader.depCache = {};
          var deps = loader.depCache[load.name];
          if (deps)
            for (var i = 0; i < deps.length; i++)
              loader.load(deps[i]);
          return loaderLocate.call(loader, load);
        };
      }
      core(System);
      scriptLoader(System);
      meta(System);
      register(System);
      es6(System);
      global(System);
      cjs(System);
      amd(System);
      map(System);
      plugins(System);
      bundles(System);
      versions(System);
      depCache(System);
    };
    var $__curScript,
        __eval;
    (function() {
      var doEval;
      __eval = function(source, address, sourceMap) {
        source += '\n//# sourceURL=' + address + (sourceMap ? '\n//# sourceMappingURL=' + sourceMap : '');
        try {
          doEval(source);
        } catch (e) {
          var msg = 'Error evaluating ' + address + '\n';
          if (e instanceof Error)
            e.message = msg + e.message;
          else
            e = msg + e;
          throw e;
        }
      };
      var isWorker = typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope;
      var isBrowser = typeof window != 'undefined';
      if (isBrowser) {
        var head;
        var scripts = document.getElementsByTagName('script');
        $__curScript = scripts[scripts.length - 1];
        doEval = function(source) {
          if (!head)
            head = document.head || document.body || document.documentElement;
          var script = document.createElement('script');
          script.text = source;
          var onerror = window.onerror;
          var e;
          window.onerror = function(_e) {
            e = _e;
          };
          head.appendChild(script);
          head.removeChild(script);
          window.onerror = onerror;
          if (e)
            throw e;
        };
        if (!$__global.System || !$__global.LoaderPolyfill) {
          var curPath = $__curScript.src;
          var basePath = curPath.substr(0, curPath.lastIndexOf('/') + 1);
          document.write('<' + 'script type="text/javascript" src="' + basePath + 'es6-module-loader.js" data-init="upgradeSystemLoader">' + '<' + '/script>');
        } else {
          $__global.upgradeSystemLoader();
        }
      } else if (isWorker) {
        doEval = function(source) {
          try {
            eval(source);
          } catch (e) {
            throw e;
          }
        };
        if (!$__global.System || !$__global.LoaderPolyfill) {
          var basePath = '';
          try {
            throw new TypeError('Unable to get Worker base path.');
          } catch (err) {
            var idx = err.stack.indexOf('at ') + 3;
            var withSystem = err.stack.substr(idx, err.stack.substr(idx).indexOf('\n'));
            basePath = withSystem.substr(0, withSystem.lastIndexOf('/') + 1);
          }
          importScripts(basePath + 'es6-module-loader.js');
        } else {
          $__global.upgradeSystemLoader();
        }
      } else {
        var es6ModuleLoader = require("es6-module-loader");
        $__global.System = es6ModuleLoader.System;
        $__global.Loader = es6ModuleLoader.Loader;
        $__global.upgradeSystemLoader();
        module.exports = $__global.System;
        var vm = require("vm");
        doEval = function(source, address, sourceMap) {
          vm.runInThisContext(source);
        };
      }
    })();
  })(typeof window != 'undefined' ? window : (typeof WorkerGlobalScope != 'undefined' ? self : global));
})(require("process"));
