/* */ 
"format cjs";
(function(process) {
  !function(a) {
    "object" == typeof exports ? module.exports = a() : "function" == typeof define && define.amd ? define(a) : "undefined" != typeof window ? window.Promise = a() : "undefined" != typeof global ? global.Promise = a() : "undefined" != typeof self && (self.Promise = a());
  }(function() {
    var a;
    return function b(a, c, d) {
      function e(g, h) {
        if (!c[g]) {
          if (!a[g]) {
            var i = "function" == typeof require && require;
            if (!h && i)
              return i(g, !0);
            if (f)
              return f(g, !0);
            throw new Error("Cannot find module '" + g + "'");
          }
          var j = c[g] = {exports: {}};
          a[g][0].call(j.exports, function(b) {
            var c = a[g][1][b];
            return e(c ? c : b);
          }, j, j.exports, b, a, c, d);
        }
        return c[g].exports;
      }
      for (var f = "function" == typeof require && require,
          g = 0; g < d.length; g++)
        e(d[g]);
      return e;
    }({
      1: [function(a, b) {
        var c = a("../lib/decorators/unhandledRejection"),
            d = c(a("../lib/Promise"));
        b.exports = "undefined" != typeof global ? global.Promise = d : "undefined" != typeof self ? self.Promise = d : d;
      }, {
        "../lib/Promise": 2,
        "../lib/decorators/unhandledRejection": 4
      }],
      2: [function(b, c) {
        !function(a) {
          "use strict";
          a(function(a) {
            var b = a("./makePromise"),
                c = a("./Scheduler"),
                d = a("./env").asap;
            return b({scheduler: new c(d)});
          });
        }("function" == typeof a && a.amd ? a : function(a) {
          c.exports = a(b);
        });
      }, {
        "./Scheduler": 3,
        "./env": 5,
        "./makePromise": 7
      }],
      3: [function(b, c) {
        !function(a) {
          "use strict";
          a(function() {
            function a(a) {
              this._async = a, this._running = !1, this._queue = this, this._queueLen = 0, this._afterQueue = {}, this._afterQueueLen = 0;
              var b = this;
              this.drain = function() {
                b._drain();
              };
            }
            return a.prototype.enqueue = function(a) {
              this._queue[this._queueLen++] = a, this.run();
            }, a.prototype.afterQueue = function(a) {
              this._afterQueue[this._afterQueueLen++] = a, this.run();
            }, a.prototype.run = function() {
              this._running || (this._running = !0, this._async(this.drain));
            }, a.prototype._drain = function() {
              for (var a = 0; a < this._queueLen; ++a)
                this._queue[a].run(), this._queue[a] = void 0;
              for (this._queueLen = 0, this._running = !1, a = 0; a < this._afterQueueLen; ++a)
                this._afterQueue[a].run(), this._afterQueue[a] = void 0;
              this._afterQueueLen = 0;
            }, a;
          });
        }("function" == typeof a && a.amd ? a : function(a) {
          c.exports = a();
        });
      }, {}],
      4: [function(b, c) {
        !function(a) {
          "use strict";
          a(function(a) {
            function b(a) {
              throw a;
            }
            function c() {}
            var d = a("../env").setTimer,
                e = a("../format");
            return function(a) {
              function f(a) {
                a.handled || (n.push(a), k("Potentially unhandled rejection [" + a.id + "] " + e.formatError(a.value)));
              }
              function g(a) {
                var b = n.indexOf(a);
                b >= 0 && (n.splice(b, 1), l("Handled previous rejection [" + a.id + "] " + e.formatObject(a.value)));
              }
              function h(a, b) {
                m.push(a, b), null === o && (o = d(i, 0));
              }
              function i() {
                for (o = null; m.length > 0; )
                  m.shift()(m.shift());
              }
              var j,
                  k = c,
                  l = c;
              "undefined" != typeof console && (j = console, k = "undefined" != typeof j.error ? function(a) {
                j.error(a);
              } : function(a) {
                j.log(a);
              }, l = "undefined" != typeof j.info ? function(a) {
                j.info(a);
              } : function(a) {
                j.log(a);
              }), a.onPotentiallyUnhandledRejection = function(a) {
                h(f, a);
              }, a.onPotentiallyUnhandledRejectionHandled = function(a) {
                h(g, a);
              }, a.onFatalRejection = function(a) {
                h(b, a.value);
              };
              var m = [],
                  n = [],
                  o = null;
              return a;
            };
          });
        }("function" == typeof a && a.amd ? a : function(a) {
          c.exports = a(b);
        });
      }, {
        "../env": 5,
        "../format": 6
      }],
      5: [function(b, c) {
        !function(a) {
          "use strict";
          a(function(a) {
            function b() {
              return "undefined" != typeof process && null !== process && "function" == typeof process.nextTick;
            }
            function c() {
              return "function" == typeof MutationObserver && MutationObserver || "function" == typeof WebKitMutationObserver && WebKitMutationObserver;
            }
            function d(a) {
              function b() {
                var a = c;
                c = void 0, a();
              }
              var c,
                  d = document.createTextNode(""),
                  e = new a(b);
              e.observe(d, {characterData: !0});
              var f = 0;
              return function(a) {
                c = a, d.data = f ^= 1;
              };
            }
            var e,
                f = "undefined" != typeof setTimeout && setTimeout,
                g = function(a, b) {
                  return setTimeout(a, b);
                },
                h = function(a) {
                  return clearTimeout(a);
                },
                i = function(a) {
                  return f(a, 0);
                };
            if (b())
              i = function(a) {
                return process.nextTick(a);
              };
            else if (e = c())
              i = d(e);
            else if (!f) {
              var j = a,
                  k = j("vertx");
              g = function(a, b) {
                return k.setTimer(b, a);
              }, h = k.cancelTimer, i = k.runOnLoop || k.runOnContext;
            }
            return {
              setTimer: g,
              clearTimer: h,
              asap: i
            };
          });
        }("function" == typeof a && a.amd ? a : function(a) {
          c.exports = a(b);
        });
      }, {}],
      6: [function(b, c) {
        !function(a) {
          "use strict";
          a(function() {
            function a(a) {
              var c = "object" == typeof a && null !== a && a.stack ? a.stack : b(a);
              return a instanceof Error ? c : c + " (WARNING: non-Error used)";
            }
            function b(a) {
              var b = String(a);
              return "[object Object]" === b && "undefined" != typeof JSON && (b = c(a, b)), b;
            }
            function c(a, b) {
              try {
                return JSON.stringify(a);
              } catch (c) {
                return b;
              }
            }
            return {
              formatError: a,
              formatObject: b,
              tryStringify: c
            };
          });
        }("function" == typeof a && a.amd ? a : function(a) {
          c.exports = a();
        });
      }, {}],
      7: [function(b, c) {
        !function(a) {
          "use strict";
          a(function() {
            return function(a) {
              function b(a, b) {
                this._handler = a === t ? b : c(a);
              }
              function c(a) {
                function b(a) {
                  e.resolve(a);
                }
                function c(a) {
                  e.reject(a);
                }
                function d(a) {
                  e.notify(a);
                }
                var e = new v;
                try {
                  a(b, c, d);
                } catch (f) {
                  c(f);
                }
                return e;
              }
              function d(a) {
                return I(a) ? a : new b(t, new w(q(a)));
              }
              function e(a) {
                return new b(t, new w(new z(a)));
              }
              function f() {
                return _;
              }
              function g() {
                return new b(t, new v);
              }
              function h(a, b) {
                var c = new v(a.receiver, a.join().context);
                return new b(t, c);
              }
              function i(a) {
                return k(S, null, a);
              }
              function j(a, b) {
                return k(N, a, b);
              }
              function k(a, c, d) {
                function e(b, e, g) {
                  g.resolved || l(d, f, b, a(c, e, b), g);
                }
                function f(a, b, c) {
                  k[a] = b, 0 === --j && c.become(new y(k));
                }
                for (var g,
                    h = "function" == typeof c ? e : f,
                    i = new v,
                    j = d.length >>> 0,
                    k = new Array(j),
                    m = 0; m < d.length && !i.resolved; ++m)
                  g = d[m], void 0 !== g || m in d ? l(d, h, m, g, i) : --j;
                return 0 === j && i.become(new y(k)), new b(t, i);
              }
              function l(a, b, c, d, e) {
                if (J(d)) {
                  var f = r(d),
                      g = f.state();
                  0 === g ? f.fold(b, c, void 0, e) : g > 0 ? b(c, f.value, e) : (e.become(f), m(a, c + 1, f));
                } else
                  b(c, d, e);
              }
              function m(a, b, c) {
                for (var d = b; d < a.length; ++d)
                  n(q(a[d]), c);
              }
              function n(a, b) {
                if (a !== b) {
                  var c = a.state();
                  0 === c ? a.visit(a, void 0, a._unreport) : 0 > c && a._unreport();
                }
              }
              function o(a) {
                return "object" != typeof a || null === a ? e(new TypeError("non-iterable passed to race()")) : 0 === a.length ? f() : 1 === a.length ? d(a[0]) : p(a);
              }
              function p(a) {
                var c,
                    d,
                    e,
                    f = new v;
                for (c = 0; c < a.length; ++c)
                  if (d = a[c], void 0 !== d || c in a) {
                    if (e = q(d), 0 !== e.state()) {
                      f.become(e), m(a, c + 1, e);
                      break;
                    }
                    e.visit(f, f.resolve, f.reject);
                  }
                return new b(t, f);
              }
              function q(a) {
                return I(a) ? a._handler.join() : J(a) ? s(a) : new y(a);
              }
              function r(a) {
                return I(a) ? a._handler.join() : s(a);
              }
              function s(a) {
                try {
                  var b = a.then;
                  return "function" == typeof b ? new x(b, a) : new y(a);
                } catch (c) {
                  return new z(c);
                }
              }
              function t() {}
              function u() {}
              function v(a, c) {
                b.createContext(this, c), this.consumers = void 0, this.receiver = a, this.handler = void 0, this.resolved = !1;
              }
              function w(a) {
                this.handler = a;
              }
              function x(a, b) {
                v.call(this), V.enqueue(new F(a, b, this));
              }
              function y(a) {
                b.createContext(this), this.value = a;
              }
              function z(a) {
                b.createContext(this), this.id = ++Z, this.value = a, this.handled = !1, this.reported = !1, this._report();
              }
              function A(a, b) {
                this.rejection = a, this.context = b;
              }
              function B(a) {
                this.rejection = a;
              }
              function C() {
                return new z(new TypeError("Promise cycle"));
              }
              function D(a, b) {
                this.continuation = a, this.handler = b;
              }
              function E(a, b) {
                this.handler = b, this.value = a;
              }
              function F(a, b, c) {
                this._then = a, this.thenable = b, this.resolver = c;
              }
              function G(a, b, c, d, e) {
                try {
                  a.call(b, c, d, e);
                } catch (f) {
                  d(f);
                }
              }
              function H(a, b, c, d) {
                this.f = a, this.z = b, this.c = c, this.to = d, this.resolver = Y, this.receiver = this;
              }
              function I(a) {
                return a instanceof b;
              }
              function J(a) {
                return ("object" == typeof a || "function" == typeof a) && null !== a;
              }
              function K(a, c, d, e) {
                return "function" != typeof a ? e.become(c) : (b.enterContext(c), O(a, c.value, d, e), void b.exitContext());
              }
              function L(a, c, d, e, f) {
                return "function" != typeof a ? f.become(d) : (b.enterContext(d), P(a, c, d.value, e, f), void b.exitContext());
              }
              function M(a, c, d, e, f) {
                return "function" != typeof a ? f.notify(c) : (b.enterContext(d), Q(a, c, e, f), void b.exitContext());
              }
              function N(a, b, c) {
                try {
                  return a(b, c);
                } catch (d) {
                  return e(d);
                }
              }
              function O(a, b, c, d) {
                try {
                  d.become(q(a.call(c, b)));
                } catch (e) {
                  d.become(new z(e));
                }
              }
              function P(a, b, c, d, e) {
                try {
                  a.call(d, b, c, e);
                } catch (f) {
                  e.become(new z(f));
                }
              }
              function Q(a, b, c, d) {
                try {
                  d.notify(a.call(c, b));
                } catch (e) {
                  d.notify(e);
                }
              }
              function R(a, b) {
                b.prototype = X(a.prototype), b.prototype.constructor = b;
              }
              function S(a, b) {
                return b;
              }
              function T() {}
              function U() {
                return "undefined" != typeof process && null !== process && "function" == typeof process.emit ? function(a, b) {
                  return "unhandledRejection" === a ? process.emit(a, b.value, b) : process.emit(a, b);
                } : "undefined" != typeof self && "function" == typeof CustomEvent ? function(a, b, c) {
                  var d = !1;
                  try {
                    var e = new c("unhandledRejection");
                    d = e instanceof c;
                  } catch (f) {}
                  return d ? function(a, d) {
                    var e = new c(a, {
                      detail: {
                        reason: d.value,
                        key: d
                      },
                      bubbles: !1,
                      cancelable: !0
                    });
                    return !b.dispatchEvent(e);
                  } : a;
                }(T, self, CustomEvent) : T;
              }
              var V = a.scheduler,
                  W = U(),
                  X = Object.create || function(a) {
                    function b() {}
                    return b.prototype = a, new b;
                  };
              b.resolve = d, b.reject = e, b.never = f, b._defer = g, b._handler = q, b.prototype.then = function(a, b, c) {
                var d = this._handler,
                    e = d.join().state();
                if ("function" != typeof a && e > 0 || "function" != typeof b && 0 > e)
                  return new this.constructor(t, d);
                var f = this._beget(),
                    g = f._handler;
                return d.chain(g, d.receiver, a, b, c), f;
              }, b.prototype["catch"] = function(a) {
                return this.then(void 0, a);
              }, b.prototype._beget = function() {
                return h(this._handler, this.constructor);
              }, b.all = i, b.race = o, b._traverse = j, b._visitRemaining = m, t.prototype.when = t.prototype.become = t.prototype.notify = t.prototype.fail = t.prototype._unreport = t.prototype._report = T, t.prototype._state = 0, t.prototype.state = function() {
                return this._state;
              }, t.prototype.join = function() {
                for (var a = this; void 0 !== a.handler; )
                  a = a.handler;
                return a;
              }, t.prototype.chain = function(a, b, c, d, e) {
                this.when({
                  resolver: a,
                  receiver: b,
                  fulfilled: c,
                  rejected: d,
                  progress: e
                });
              }, t.prototype.visit = function(a, b, c, d) {
                this.chain(Y, a, b, c, d);
              }, t.prototype.fold = function(a, b, c, d) {
                this.when(new H(a, b, c, d));
              }, R(t, u), u.prototype.become = function(a) {
                a.fail();
              };
              var Y = new u;
              R(t, v), v.prototype._state = 0, v.prototype.resolve = function(a) {
                this.become(q(a));
              }, v.prototype.reject = function(a) {
                this.resolved || this.become(new z(a));
              }, v.prototype.join = function() {
                if (!this.resolved)
                  return this;
                for (var a = this; void 0 !== a.handler; )
                  if (a = a.handler, a === this)
                    return this.handler = C();
                return a;
              }, v.prototype.run = function() {
                var a = this.consumers,
                    b = this.handler;
                this.handler = this.handler.join(), this.consumers = void 0;
                for (var c = 0; c < a.length; ++c)
                  b.when(a[c]);
              }, v.prototype.become = function(a) {
                this.resolved || (this.resolved = !0, this.handler = a, void 0 !== this.consumers && V.enqueue(this), void 0 !== this.context && a._report(this.context));
              }, v.prototype.when = function(a) {
                this.resolved ? V.enqueue(new D(a, this.handler)) : void 0 === this.consumers ? this.consumers = [a] : this.consumers.push(a);
              }, v.prototype.notify = function(a) {
                this.resolved || V.enqueue(new E(a, this));
              }, v.prototype.fail = function(a) {
                var b = "undefined" == typeof a ? this.context : a;
                this.resolved && this.handler.join().fail(b);
              }, v.prototype._report = function(a) {
                this.resolved && this.handler.join()._report(a);
              }, v.prototype._unreport = function() {
                this.resolved && this.handler.join()._unreport();
              }, R(t, w), w.prototype.when = function(a) {
                V.enqueue(new D(a, this));
              }, w.prototype._report = function(a) {
                this.join()._report(a);
              }, w.prototype._unreport = function() {
                this.join()._unreport();
              }, R(v, x), R(t, y), y.prototype._state = 1, y.prototype.fold = function(a, b, c, d) {
                L(a, b, this, c, d);
              }, y.prototype.when = function(a) {
                K(a.fulfilled, this, a.receiver, a.resolver);
              };
              var Z = 0;
              R(t, z), z.prototype._state = -1, z.prototype.fold = function(a, b, c, d) {
                d.become(this);
              }, z.prototype.when = function(a) {
                "function" == typeof a.rejected && this._unreport(), K(a.rejected, this, a.receiver, a.resolver);
              }, z.prototype._report = function(a) {
                V.afterQueue(new A(this, a));
              }, z.prototype._unreport = function() {
                this.handled || (this.handled = !0, V.afterQueue(new B(this)));
              }, z.prototype.fail = function(a) {
                this.reported = !0, W("unhandledRejection", this), b.onFatalRejection(this, void 0 === a ? this.context : a);
              }, A.prototype.run = function() {
                this.rejection.handled || this.rejection.reported || (this.rejection.reported = !0, W("unhandledRejection", this.rejection) || b.onPotentiallyUnhandledRejection(this.rejection, this.context));
              }, B.prototype.run = function() {
                this.rejection.reported && (W("rejectionHandled", this.rejection) || b.onPotentiallyUnhandledRejectionHandled(this.rejection));
              }, b.createContext = b.enterContext = b.exitContext = b.onPotentiallyUnhandledRejection = b.onPotentiallyUnhandledRejectionHandled = b.onFatalRejection = T;
              var $ = new t,
                  _ = new b(t, $);
              return D.prototype.run = function() {
                this.handler.join().when(this.continuation);
              }, E.prototype.run = function() {
                var a = this.handler.consumers;
                if (void 0 !== a)
                  for (var b,
                      c = 0; c < a.length; ++c)
                    b = a[c], M(b.progress, this.value, this.handler, b.receiver, b.resolver);
              }, F.prototype.run = function() {
                function a(a) {
                  d.resolve(a);
                }
                function b(a) {
                  d.reject(a);
                }
                function c(a) {
                  d.notify(a);
                }
                var d = this.resolver;
                G(this._then, this.thenable, a, b, c);
              }, H.prototype.fulfilled = function(a) {
                this.f.call(this.c, this.z, a, this.to);
              }, H.prototype.rejected = function(a) {
                this.to.reject(a);
              }, H.prototype.progress = function(a) {
                this.to.notify(a);
              }, b;
            };
          });
        }("function" == typeof a && a.amd ? a : function(a) {
          c.exports = a();
        });
      }, {}]
    }, {}, [1])(1);
  }), function(__global) {
    function __eval(__source, __global, load) {
      var __curRegister = System.register;
      System.register = function(a, b, c) {
        "string" != typeof a && (c = b, b = a), load.declare = c, load.depsList = b;
      };
      try {
        eval('(function() { var __moduleName = "' + (load.name || "").replace('"', '"') + '"; ' + __source + " \n }).call(__global);");
      } catch (e) {
        throw ("SyntaxError" == e.name || "TypeError" == e.name) && (e.message = "Evaluating " + (load.name || load.address) + "\n	" + e.message), e;
      }
      System.register = __curRegister;
    }
    $__Object$getPrototypeOf = Object.getPrototypeOf || function(a) {
      return a.__proto__;
    };
    var $__Object$defineProperty;
    !function() {
      try {
        Object.defineProperty({}, "a", {}) && ($__Object$defineProperty = Object.defineProperty);
      } catch (a) {
        $__Object$defineProperty = function(a, b, c) {
          try {
            a[b] = c.value || c.get.call(a);
          } catch (d) {}
        };
      }
    }(), $__Object$create = Object.create || function(a, b) {
      function c() {}
      if (c.prototype = a, "object" == typeof b)
        for (prop in b)
          b.hasOwnProperty(prop) && (c[prop] = b[prop]);
      return new c;
    }, function() {
      function a(a) {
        return {
          status: "loading",
          name: a,
          linkSets: [],
          dependencies: [],
          metadata: {}
        };
      }
      function b(a, b, c) {
        return new A(g({
          step: c.address ? "fetch" : "locate",
          loader: a,
          moduleName: b,
          moduleMetadata: c && c.metadata || {},
          moduleSource: c.source,
          moduleAddress: c.address
        }));
      }
      function c(b, c, e, f) {
        return new A(function(a) {
          a(b.loaderObj.normalize(c, e, f));
        }).then(function(c) {
          var e;
          if (b.modules[c])
            return e = a(c), e.status = "linked", e.module = b.modules[c], e;
          for (var f = 0,
              g = b.loads.length; g > f; f++)
            if (e = b.loads[f], e.name == c)
              return e;
          return e = a(c), b.loads.push(e), d(b, e), e;
        });
      }
      function d(a, b) {
        e(a, b, A.resolve().then(function() {
          return a.loaderObj.locate({
            name: b.name,
            metadata: b.metadata
          });
        }));
      }
      function e(a, b, c) {
        f(a, b, c.then(function(c) {
          return "loading" == b.status ? (b.address = c, a.loaderObj.fetch({
            name: b.name,
            metadata: b.metadata,
            address: c
          })) : void 0;
        }));
      }
      function f(a, b, d) {
        d.then(function(c) {
          return "loading" == b.status ? a.loaderObj.translate({
            name: b.name,
            metadata: b.metadata,
            address: b.address,
            source: c
          }) : void 0;
        }).then(function(c) {
          return "loading" == b.status ? (b.source = c, a.loaderObj.instantiate({
            name: b.name,
            metadata: b.metadata,
            address: b.address,
            source: c
          })) : void 0;
        }).then(function(d) {
          if ("loading" == b.status) {
            if (void 0 === d)
              b.address = b.address || "<Anonymous Module " + ++D + ">", b.isDeclarative = !0, __eval(a.loaderObj.transpile(b), __global, b);
            else {
              if ("object" != typeof d)
                throw TypeError("Invalid instantiate return value");
              b.depsList = d.deps || [], b.execute = d.execute, b.isDeclarative = !1;
            }
            b.dependencies = [];
            for (var e = b.depsList,
                f = [],
                g = 0,
                h = e.length; h > g; g++)
              (function(d, e) {
                f.push(c(a, d, b.name, b.address).then(function(a) {
                  if (b.dependencies[e] = {
                    key: d,
                    value: a.name
                  }, "linked" != a.status)
                    for (var c = b.linkSets.concat([]),
                        f = 0,
                        g = c.length; g > f; f++)
                      i(c[f], a);
                }));
              })(e[g], g);
            return A.all(f);
          }
        }).then(function() {
          b.status = "loaded";
          for (var a = b.linkSets.concat([]),
              c = 0,
              d = a.length; d > c; c++)
            k(a[c], b);
        })["catch"](function(a) {
          b.status = "failed", b.exception = a;
          for (var c = b.linkSets.concat([]),
              d = 0,
              e = c.length; e > d; d++)
            l(c[d], b, a);
        });
      }
      function g(b) {
        return function(c) {
          var g = b.loader,
              i = b.moduleName,
              j = b.step;
          if (g.modules[i])
            throw new TypeError('"' + i + '" already exists in the module table');
          for (var k,
              l = 0,
              m = g.loads.length; m > l; l++)
            if (g.loads[l].name == i)
              return k = g.loads[l], "translate" != j || k.source || (k.address = b.moduleAddress, f(g, k, A.resolve(b.moduleSource))), k.linkSets[0].done.then(function() {
                c(k);
              });
          var n = a(i);
          n.metadata = b.moduleMetadata;
          var o = h(g, n);
          g.loads.push(n), c(o.done), "locate" == j ? d(g, n) : "fetch" == j ? e(g, n, A.resolve(b.moduleAddress)) : (n.address = b.moduleAddress, f(g, n, A.resolve(b.moduleSource)));
        };
      }
      function h(a, b) {
        var c = {
          loader: a,
          loads: [],
          startingLoad: b,
          loadingCount: 0
        };
        return c.done = new A(function(a, b) {
          c.resolve = a, c.reject = b;
        }), i(c, b), c;
      }
      function i(a, b) {
        for (var c = 0,
            d = a.loads.length; d > c; c++)
          if (a.loads[c] == b)
            return ;
        a.loads.push(b), b.linkSets.push(a), "loaded" != b.status && a.loadingCount++;
        for (var e = a.loader,
            c = 0,
            d = b.dependencies.length; d > c; c++) {
          var f = b.dependencies[c].value;
          if (!e.modules[f])
            for (var g = 0,
                h = e.loads.length; h > g; g++)
              if (e.loads[g].name == f) {
                i(a, e.loads[g]);
                break;
              }
        }
      }
      function j(a) {
        var b = !1;
        try {
          p(a, function(c, d) {
            l(a, c, d), b = !0;
          });
        } catch (c) {
          l(a, null, c), b = !0;
        }
        return b;
      }
      function k(a, b) {
        if (a.loadingCount--, !(a.loadingCount > 0)) {
          var c = a.startingLoad;
          if (a.loader.loaderObj.execute === !1) {
            for (var d = [].concat(a.loads),
                e = 0,
                f = d.length; f > e; e++) {
              var b = d[e];
              b.module = b.isDeclarative ? {
                name: b.name,
                module: E({}),
                evaluated: !0
              } : {module: E({})}, b.status = "linked", m(a.loader, b);
            }
            return a.resolve(c);
          }
          var g = j(a);
          g || a.resolve(c);
        }
      }
      function l(a, b, c) {
        var d = a.loader;
        a.loads[0].name != b.name && (c = w(c, 'Error loading "' + b.name + '" from "' + a.loads[0].name + '" at ' + (a.loads[0].address || "<unknown>") + "\n")), c = w(c, 'Error loading "' + b.name + '" at ' + (b.address || "<unknown>") + "\n");
        for (var e = a.loads.concat([]),
            f = 0,
            g = e.length; g > f; f++) {
          var b = e[f];
          d.loaderObj.failed = d.loaderObj.failed || [], -1 == B.call(d.loaderObj.failed, b) && d.loaderObj.failed.push(b);
          var h = B.call(b.linkSets, a);
          if (b.linkSets.splice(h, 1), 0 == b.linkSets.length) {
            var i = B.call(a.loader.loads, b);
            -1 != i && a.loader.loads.splice(i, 1);
          }
        }
        a.reject(c);
      }
      function m(a, b) {
        if (a.loaderObj.trace) {
          a.loaderObj.loads || (a.loaderObj.loads = {});
          var c = {};
          b.dependencies.forEach(function(a) {
            c[a.key] = a.value;
          }), a.loaderObj.loads[b.name] = {
            name: b.name,
            deps: b.dependencies.map(function(a) {
              return a.key;
            }),
            depMap: c,
            address: b.address,
            metadata: b.metadata,
            source: b.source,
            kind: b.isDeclarative ? "declarative" : "dynamic"
          };
        }
        b.name && (a.modules[b.name] = b.module);
        var d = B.call(a.loads, b);
        -1 != d && a.loads.splice(d, 1);
        for (var e = 0,
            f = b.linkSets.length; f > e; e++)
          d = B.call(b.linkSets[e].loads, b), -1 != d && b.linkSets[e].loads.splice(d, 1);
        b.linkSets.splice(0, b.linkSets.length);
      }
      function n(a, b, c) {
        if (c[a.groupIndex] = c[a.groupIndex] || [], -1 == B.call(c[a.groupIndex], a)) {
          c[a.groupIndex].push(a);
          for (var d = 0,
              e = b.length; e > d; d++)
            for (var f = b[d],
                g = 0; g < a.dependencies.length; g++)
              if (f.name == a.dependencies[g].value) {
                var h = a.groupIndex + (f.isDeclarative != a.isDeclarative);
                if (void 0 === f.groupIndex || f.groupIndex < h) {
                  if (void 0 !== f.groupIndex && (c[f.groupIndex].splice(B.call(c[f.groupIndex], f), 1), 0 == c[f.groupIndex].length))
                    throw new TypeError("Mixed dependency cycle detected");
                  f.groupIndex = h;
                }
                n(f, b, c);
              }
        }
      }
      function o(a, b, c) {
        try {
          var d = b.execute();
        } catch (e) {
          return void c(b, e);
        }
        return d && d instanceof y ? d : void c(b, new TypeError("Execution must define a Module instance"));
      }
      function p(a, b) {
        var c = a.loader;
        if (a.loads.length) {
          var d = [],
              e = a.loads[0];
          e.groupIndex = 0, n(e, a.loads, d);
          for (var f = e.isDeclarative == d.length % 2,
              g = d.length - 1; g >= 0; g--) {
            for (var h = d[g],
                i = 0; i < h.length; i++) {
              var j = h[i];
              if (f)
                r(j, a.loads, c);
              else {
                var k = o(a, j, b);
                if (!k)
                  return ;
                j.module = {
                  name: j.name,
                  module: k
                }, j.status = "linked";
              }
              m(c, j);
            }
            f = !f;
          }
        }
      }
      function q(a, b) {
        var c = b.moduleRecords;
        return c[a] || (c[a] = {
          name: a,
          dependencies: [],
          module: new y,
          importers: []
        });
      }
      function r(a, b, c) {
        if (!a.module) {
          var d = a.module = q(a.name, c),
              e = a.module.module,
              f = a.declare.call(__global, function(a, b) {
                d.locked = !0, e[a] = b;
                for (var c = 0,
                    f = d.importers.length; f > c; c++) {
                  var g = d.importers[c];
                  if (!g.locked) {
                    var h = B.call(g.dependencies, d);
                    g.setters[h](e);
                  }
                }
                return d.locked = !1, b;
              });
          d.setters = f.setters, d.execute = f.execute;
          for (var g = 0,
              h = a.dependencies.length; h > g; g++) {
            var i = a.dependencies[g].value,
                j = c.modules[i];
            if (!j)
              for (var k = 0; k < b.length; k++)
                b[k].name == i && (b[k].module ? j = q(i, c) : (r(b[k], b, c), j = b[k].module));
            j.importers ? (d.dependencies.push(j), j.importers.push(d)) : d.dependencies.push(null), d.setters[g] && d.setters[g](j.module);
          }
          a.status = "linked";
        }
      }
      function s(a, b) {
        return u(b.module, [], a), b.module.module;
      }
      function t(a) {
        try {
          a.execute.call(__global);
        } catch (b) {
          return b;
        }
      }
      function u(a, b, c) {
        var d = v(a, b, c);
        if (d)
          throw d;
      }
      function v(a, b, c) {
        if (!a.evaluated && a.dependencies) {
          b.push(a);
          for (var d,
              e = a.dependencies,
              f = 0,
              g = e.length; g > f; f++) {
            var h = e[f];
            if (h && -1 == B.call(b, h) && (d = v(h, b, c)))
              return d = w(d, "Error evaluating " + h.name + "\n");
          }
          if (a.failed)
            return new Error("Module failed execution.");
          if (!a.evaluated)
            return a.evaluated = !0, d = t(a), d ? a.failed = !0 : Object.preventExtensions && Object.preventExtensions(a.module), a.execute = void 0, d;
        }
      }
      function w(a, b) {
        return a instanceof Error ? a.message = b + a.message : a = b + a, a;
      }
      function x(a) {
        if ("object" != typeof a)
          throw new TypeError("Options must be an object");
        a.normalize && (this.normalize = a.normalize), a.locate && (this.locate = a.locate), a.fetch && (this.fetch = a.fetch), a.translate && (this.translate = a.translate), a.instantiate && (this.instantiate = a.instantiate), this._loader = {
          loaderObj: this,
          loads: [],
          modules: {},
          importPromises: {},
          moduleRecords: {}
        }, C(this, "global", {get: function() {
            return __global;
          }});
      }
      function y() {}
      function z(a, b, c) {
        var d = a._loader.importPromises;
        return d[b] = c.then(function(a) {
          return d[b] = void 0, a;
        }, function(a) {
          throw d[b] = void 0, a;
        });
      }
      var A = __global.Promise || require("when/es6-shim/Promise");
      __global.console && (console.assert = console.assert || function() {});
      var B = Array.prototype.indexOf || function(a) {
        for (var b = 0,
            c = this.length; c > b; b++)
          if (this[b] === a)
            return b;
        return -1;
      },
          C = $__Object$defineProperty,
          D = 0;
      x.prototype = {
        constructor: x,
        define: function(a, b, c) {
          if (this._loader.importPromises[a])
            throw new TypeError("Module is already loading.");
          return z(this, a, new A(g({
            step: "translate",
            loader: this._loader,
            moduleName: a,
            moduleMetadata: c && c.metadata || {},
            moduleSource: b,
            moduleAddress: c && c.address
          })));
        },
        "delete": function(a) {
          var b = this._loader;
          return delete b.importPromises[a], delete b.moduleRecords[a], b.modules[a] ? delete b.modules[a] : !1;
        },
        get: function(a) {
          return this._loader.modules[a] ? (u(this._loader.modules[a], [], this), this._loader.modules[a].module) : void 0;
        },
        has: function(a) {
          return !!this._loader.modules[a];
        },
        "import": function(a, c) {
          var d = this;
          return A.resolve(d.normalize(a, c && c.name, c && c.address)).then(function(a) {
            var e = d._loader;
            return e.modules[a] ? (u(e.modules[a], [], e._loader), e.modules[a].module) : e.importPromises[a] || z(d, a, b(e, a, c || {}).then(function(b) {
              return delete e.importPromises[a], s(e, b);
            }));
          });
        },
        load: function(a) {
          return this._loader.modules[a] ? (u(this._loader.modules[a], [], this._loader), A.resolve(this._loader.modules[a].module)) : this._loader.importPromises[a] || z(this, a, b(this._loader, a, {}));
        },
        module: function(b, c) {
          var d = a();
          d.address = c && c.address;
          var e = h(this._loader, d),
              g = A.resolve(b),
              i = this._loader,
              j = e.done.then(function() {
                return s(i, d);
              });
          return f(i, d, g), j;
        },
        newModule: function(a) {
          if ("object" != typeof a)
            throw new TypeError("Expected object");
          var b = new y;
          for (var c in a)
            !function(c) {
              C(b, c, {
                configurable: !1,
                enumerable: !0,
                get: function() {
                  return a[c];
                }
              });
            }(c);
          return Object.preventExtensions && Object.preventExtensions(b), b;
        },
        set: function(a, b) {
          if (!(b instanceof y))
            throw new TypeError("Loader.set(" + a + ", module) must be a module");
          this._loader.modules[a] = {module: b};
        },
        normalize: function(a) {
          return a;
        },
        locate: function(a) {
          return a.name;
        },
        fetch: function() {
          throw new TypeError("Fetch not implemented");
        },
        translate: function(a) {
          return a.source;
        },
        instantiate: function() {}
      };
      var E = x.prototype.newModule;
      "object" == typeof exports && (module.exports = x), __global.Reflect = __global.Reflect || {}, __global.Reflect.Loader = __global.Reflect.Loader || x, __global.Reflect.global = __global.Reflect.global || __global, __global.LoaderPolyfill = x;
    }(), function(a) {
      function b(a) {
        var b = this.traceurOptions || {};
        b.modules = "instantiate", b.script = !1, b.sourceMaps = "inline", b.filename = a.address, b.inputSourceMap = a.metadata.sourceMap;
        var d = new f.Compiler(b),
            e = c(a.source, d, b.filename);
        return e += "!eval";
      }
      function c(a, b, c) {
        try {
          return b.compile(a, c);
        } catch (d) {
          throw d[0];
        }
      }
      function d(a) {
        var b = this.babelOptions || {};
        b.modules = "system", b.sourceMap = "inline", b.filename = a.address, b.code = !0, b.ast = !1, b.blacklist = b.blacklist || [], b.blacklist.push("react");
        var c = f.transform(a.source, b).code;
        return c + "\n//# sourceURL=" + a.address + "!eval";
      }
      var e,
          f,
          g = "undefined" == typeof window && "undefined" == typeof WorkerGlobalScope;
      a.prototype.transpiler = "traceur", a.prototype.transpile = function(a) {
        if (!e && ("babel" == this.transpiler ? (e = d, f = g ? require("babel-core") : __global.babel) : (e = b, f = g ? require("traceur") : __global.traceur), !f))
          throw new TypeError("Include Traceur or Babel for module syntax support.");
        return 'var __moduleAddress = "' + a.address + '";' + e.call(this, a);
      };
    }(__global.LoaderPolyfill), function() {
      function a(a) {
        var b = String(a).replace(/^\s+|\s+$/g, "").match(/^([^:\/?#]+:)?(\/\/(?:[^:@\/?#]*(?::[^:@\/?#]*)?@)?(([^:\/?#]*)(?::(\d*))?))?([^?#]*)(\?[^#]*)?(#[\s\S]*)?/);
        return b ? {
          href: b[0] || "",
          protocol: b[1] || "",
          authority: b[2] || "",
          host: b[3] || "",
          hostname: b[4] || "",
          port: b[5] || "",
          pathname: b[6] || "",
          search: b[7] || "",
          hash: b[8] || ""
        } : null;
      }
      function b(a) {
        var b = [];
        return a.replace(/^(\.\.?(\/|$))+/, "").replace(/\/(\.(\/|$))+/g, "/").replace(/\/\.\.$/, "/../").replace(/\/?[^\/]*/g, function(a) {
          "/.." === a ? b.pop() : b.push(a);
        }), b.join("").replace(/^\//, "/" === a.charAt(0) ? "/" : "");
      }
      function c(c, d) {
        return d = a(d || ""), c = a(c || ""), d && c ? (d.protocol || c.protocol) + (d.protocol || d.authority ? d.authority : c.authority) + b(d.protocol || d.authority || "/" === d.pathname.charAt(0) ? d.pathname : d.pathname ? (c.authority && !c.pathname ? "/" : "") + c.pathname.slice(0, c.pathname.lastIndexOf("/") + 1) + d.pathname : c.pathname) + (d.protocol || d.authority || d.pathname ? d.search : d.search || c.search) + d.hash : null;
      }
      function d() {
        document.removeEventListener("DOMContentLoaded", d, !1), window.removeEventListener("load", d, !1), e();
      }
      function e() {
        for (var a = document.getElementsByTagName("script"),
            b = 0; b < a.length; b++) {
          var c = a[b];
          if ("module" == c.type) {
            var d = c.innerHTML.substr(1);
            __global.System.module(d)["catch"](function(a) {
              setTimeout(function() {
                throw a;
              });
            });
          }
        }
      }
      var f,
          g = "undefined" != typeof self && "undefined" != typeof WorkerGlobalScope && self instanceof WorkerGlobalScope,
          h = "undefined" != typeof window && !g,
          i = "undefined" != typeof process && !!process.platform.match(/^win/),
          j = __global.Promise || require("when/es6-shim/Promise");
      if ("undefined" != typeof XMLHttpRequest)
        f = function(a, b, c) {
          function d() {
            b(f.responseText);
          }
          function e() {
            c(f.statusText + ": " + a || "XHR error");
          }
          var f = new XMLHttpRequest,
              g = !0,
              h = !1;
          if (!("withCredentials" in f)) {
            var i = /^(\w+:)?\/\/([^\/]+)/.exec(a);
            i && (g = i[2] === window.location.host, i[1] && (g &= i[1] === window.location.protocol));
          }
          g || "undefined" == typeof XDomainRequest || (f = new XDomainRequest, f.onload = d, f.onerror = e, f.ontimeout = e, f.onprogress = function() {}, f.timeout = 0, h = !0), f.onreadystatechange = function() {
            4 === f.readyState && (200 === f.status || 0 == f.status && f.responseText ? d() : e());
          }, f.open("GET", a, !0), h && setTimeout(function() {
            f.send();
          }, 0), f.send(null);
        };
      else {
        if ("undefined" == typeof require)
          throw new TypeError("No environment fetch API available.");
        var k;
        f = function(a, b, c) {
          if ("file:" != a.substr(0, 5))
            throw "Only file URLs of the form file: allowed running in Node.";
          return k = k || require("fs"), a = a.substr(5), i && (a = a.replace(/\//g, "\\")), k.readFile(a, function(a, d) {
            return a ? c(a) : void b(d + "");
          });
        };
      }
      var l = function(a) {
        function b(b) {
          if (a.call(this, b || {}), "undefined" != typeof location && location.href) {
            var c = __global.location.href.split("#")[0].split("?")[0];
            this.baseURL = c.substring(0, c.lastIndexOf("/") + 1);
          } else {
            if ("undefined" == typeof process || !process.cwd)
              throw new TypeError("No environment baseURL");
            this.baseURL = "file:" + process.cwd() + "/", i && (this.baseURL = this.baseURL.replace(/\\/g, "/"));
          }
          this.paths = {"*": "*.js"};
        }
        return b.__proto__ = null !== a ? a : Function.prototype, b.prototype = $__Object$create(null !== a ? a.prototype : null), $__Object$defineProperty(b.prototype, "constructor", {value: b}), $__Object$defineProperty(b.prototype, "global", {
          get: function() {
            return h ? window : g ? self : __global;
          },
          enumerable: !1
        }), $__Object$defineProperty(b.prototype, "strict", {
          get: function() {
            return !0;
          },
          enumerable: !1
        }), $__Object$defineProperty(b.prototype, "normalize", {
          value: function(a, b) {
            if ("string" != typeof a)
              throw new TypeError("Module name must be a string");
            var c = a.split("/");
            if (0 == c.length)
              throw new TypeError("No module name provided");
            var d = 0,
                e = !1,
                f = 0;
            if ("." == c[0]) {
              if (d++, d == c.length)
                throw new TypeError('Illegal module name "' + a + '"');
              e = !0;
            } else {
              for (; ".." == c[d]; )
                if (d++, d == c.length)
                  throw new TypeError('Illegal module name "' + a + '"');
              d && (e = !0), f = d;
            }
            for (var g = d; g < c.length; g++) {
              var h = c[g];
              if ("" == h || "." == h || ".." == h)
                throw new TypeError('Illegal module name "' + a + '"');
            }
            if (!e)
              return a;
            {
              var i = [],
                  j = (b || "").split("/");
              j.length - 1 - f;
            }
            return i = i.concat(j.splice(0, j.length - 1 - f)), i = i.concat(c.splice(d, c.length - d)), i.join("/");
          },
          enumerable: !1,
          writable: !0
        }), $__Object$defineProperty(b.prototype, "locate", {
          value: function(a) {
            var b,
                d = a.name,
                e = "";
            for (var f in this.paths) {
              var g = f.split("*");
              if (g.length > 2)
                throw new TypeError("Only one wildcard in a path is permitted");
              if (1 == g.length) {
                if (d == f && f.length > e.length) {
                  e = f;
                  break;
                }
              } else
                d.substr(0, g[0].length) == g[0] && d.substr(d.length - g[1].length) == g[1] && (e = f, b = d.substr(g[0].length, d.length - g[1].length - g[0].length));
            }
            var i = this.paths[e];
            return b && (i = i.replace("*", b)), h && (i = i.replace(/#/g, "%23")), c(this.baseURL, i);
          },
          enumerable: !1,
          writable: !0
        }), $__Object$defineProperty(b.prototype, "fetch", {
          value: function(a) {
            var b = this;
            return new j(function(d, e) {
              f(c(b.baseURL, a.address), function(a) {
                d(a);
              }, e);
            });
          },
          enumerable: !1,
          writable: !0
        }), b;
      }(__global.LoaderPolyfill),
          m = new l;
      if ("object" == typeof exports && (module.exports = m), __global.System = m, h && "undefined" != typeof document.getElementsByTagName) {
        var n = document.getElementsByTagName("script");
        n = n[n.length - 1], "complete" === document.readyState ? setTimeout(e) : document.addEventListener && (document.addEventListener("DOMContentLoaded", d, !1), window.addEventListener("load", d, !1)), n.getAttribute("data-init") && window[n.getAttribute("data-init")]();
      }
    }();
  }("undefined" != typeof window ? window : "undefined" != typeof WorkerGlobalScope ? self : global);
})(require("process"));