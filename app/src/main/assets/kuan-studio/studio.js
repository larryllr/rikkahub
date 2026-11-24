var Bf = { exports: {} }, Su = {};
var jg;
function uv() {
  if (jg) return Su;
  jg = 1;
  var o = Symbol.for("react.transitional.element"), l = Symbol.for("react.fragment");
  function i(r, u, f) {
    var h = null;
    if (f !== void 0 && (h = "" + f), u.key !== void 0 && (h = "" + u.key), "key" in u) {
      f = {};
      for (var p in u)
        p !== "key" && (f[p] = u[p]);
    } else f = u;
    return u = f.ref, {
      $$typeof: o,
      type: r,
      key: h,
      ref: u !== void 0 ? u : null,
      props: f
    };
  }
  return Su.Fragment = l, Su.jsx = i, Su.jsxs = i, Su;
}
var Ug;
function sv() {
  return Ug || (Ug = 1, Bf.exports = uv()), Bf.exports;
}
var v = sv(), qf = { exports: {} }, Te = {};
var Lg;
function cv() {
  if (Lg) return Te;
  Lg = 1;
  var o = Symbol.for("react.transitional.element"), l = Symbol.for("react.portal"), i = Symbol.for("react.fragment"), r = Symbol.for("react.strict_mode"), u = Symbol.for("react.profiler"), f = Symbol.for("react.consumer"), h = Symbol.for("react.context"), p = Symbol.for("react.forward_ref"), d = Symbol.for("react.suspense"), g = Symbol.for("react.memo"), y = Symbol.for("react.lazy"), S = Symbol.for("react.activity"), E = Symbol.iterator;
  function b(z) {
    return z === null || typeof z != "object" ? null : (z = E && z[E] || z["@@iterator"], typeof z == "function" ? z : null);
  }
  var R = {
    isMounted: function() {
      return !1;
    },
    enqueueForceUpdate: function() {
    },
    enqueueReplaceState: function() {
    },
    enqueueSetState: function() {
    }
  }, A = Object.assign, C = {};
  function j(z, V, te) {
    this.props = z, this.context = V, this.refs = C, this.updater = te || R;
  }
  j.prototype.isReactComponent = {}, j.prototype.setState = function(z, V) {
    if (typeof z != "object" && typeof z != "function" && z != null)
      throw Error(
        "takes an object of state variables to update or a function which returns an object of state variables."
      );
    this.updater.enqueueSetState(this, z, V, "setState");
  }, j.prototype.forceUpdate = function(z) {
    this.updater.enqueueForceUpdate(this, z, "forceUpdate");
  };
  function K() {
  }
  K.prototype = j.prototype;
  function H(z, V, te) {
    this.props = z, this.context = V, this.refs = C, this.updater = te || R;
  }
  var F = H.prototype = new K();
  F.constructor = H, A(F, j.prototype), F.isPureReactComponent = !0;
  var q = Array.isArray;
  function le() {
  }
  var X = { H: null, A: null, T: null, S: null }, I = Object.prototype.hasOwnProperty;
  function G(z, V, te) {
    var P = te.ref;
    return {
      $$typeof: o,
      type: z,
      key: V,
      ref: P !== void 0 ? P : null,
      props: te
    };
  }
  function ce(z, V) {
    return G(z.type, V, z.props);
  }
  function be(z) {
    return typeof z == "object" && z !== null && z.$$typeof === o;
  }
  function ve(z) {
    var V = { "=": "=0", ":": "=2" };
    return "$" + z.replace(/[=:]/g, function(te) {
      return V[te];
    });
  }
  var _e = /\/+/g;
  function ue(z, V) {
    return typeof z == "object" && z !== null && z.key != null ? ve("" + z.key) : V.toString(36);
  }
  function Se(z) {
    switch (z.status) {
      case "fulfilled":
        return z.value;
      case "rejected":
        throw z.reason;
      default:
        switch (typeof z.status == "string" ? z.then(le, le) : (z.status = "pending", z.then(
          function(V) {
            z.status === "pending" && (z.status = "fulfilled", z.value = V);
          },
          function(V) {
            z.status === "pending" && (z.status = "rejected", z.reason = V);
          }
        )), z.status) {
          case "fulfilled":
            return z.value;
          case "rejected":
            throw z.reason;
        }
    }
    throw z;
  }
  function L(z, V, te, P, pe) {
    var Ae = typeof z;
    (Ae === "undefined" || Ae === "boolean") && (z = null);
    var de = !1;
    if (z === null) de = !0;
    else
      switch (Ae) {
        case "bigint":
        case "string":
        case "number":
          de = !0;
          break;
        case "object":
          switch (z.$$typeof) {
            case o:
            case l:
              de = !0;
              break;
            case y:
              return de = z._init, L(
                de(z._payload),
                V,
                te,
                P,
                pe
              );
          }
      }
    if (de)
      return pe = pe(z), de = P === "" ? "." + ue(z, 0) : P, q(pe) ? (te = "", de != null && (te = de.replace(_e, "$&/") + "/"), L(pe, V, te, "", function(Hl) {
        return Hl;
      })) : pe != null && (be(pe) && (pe = ce(
        pe,
        te + (pe.key == null || z && z.key === pe.key ? "" : ("" + pe.key).replace(
          _e,
          "$&/"
        ) + "/") + de
      )), V.push(pe)), 1;
    de = 0;
    var at = P === "" ? "." : P + ":";
    if (q(z))
      for (var Qe = 0; Qe < z.length; Qe++)
        P = z[Qe], Ae = at + ue(P, Qe), de += L(
          P,
          V,
          te,
          Ae,
          pe
        );
    else if (Qe = b(z), typeof Qe == "function")
      for (z = Qe.call(z), Qe = 0; !(P = z.next()).done; )
        P = P.value, Ae = at + ue(P, Qe++), de += L(
          P,
          V,
          te,
          Ae,
          pe
        );
    else if (Ae === "object") {
      if (typeof z.then == "function")
        return L(
          Se(z),
          V,
          te,
          P,
          pe
        );
      throw V = String(z), Error(
        "Objects are not valid as a React child (found: " + (V === "[object Object]" ? "object with keys {" + Object.keys(z).join(", ") + "}" : V) + "). If you meant to render a collection of children, use an array instead."
      );
    }
    return de;
  }
  function Y(z, V, te) {
    if (z == null) return z;
    var P = [], pe = 0;
    return L(z, P, "", "", function(Ae) {
      return V.call(te, Ae, pe++);
    }), P;
  }
  function ie(z) {
    if (z._status === -1) {
      var V = z._result;
      V = V(), V.then(
        function(te) {
          (z._status === 0 || z._status === -1) && (z._status = 1, z._result = te);
        },
        function(te) {
          (z._status === 0 || z._status === -1) && (z._status = 2, z._result = te);
        }
      ), z._status === -1 && (z._status = 0, z._result = V);
    }
    if (z._status === 1) return z._result.default;
    throw z._result;
  }
  var se = typeof reportError == "function" ? reportError : function(z) {
    if (typeof window == "object" && typeof window.ErrorEvent == "function") {
      var V = new window.ErrorEvent("error", {
        bubbles: !0,
        cancelable: !0,
        message: typeof z == "object" && z !== null && typeof z.message == "string" ? String(z.message) : String(z),
        error: z
      });
      if (!window.dispatchEvent(V)) return;
    } else if (typeof process == "object" && typeof process.emit == "function") {
      process.emit("uncaughtException", z);
      return;
    }
    console.error(z);
  }, ze = {
    map: Y,
    forEach: function(z, V, te) {
      Y(
        z,
        function() {
          V.apply(this, arguments);
        },
        te
      );
    },
    count: function(z) {
      var V = 0;
      return Y(z, function() {
        V++;
      }), V;
    },
    toArray: function(z) {
      return Y(z, function(V) {
        return V;
      }) || [];
    },
    only: function(z) {
      if (!be(z))
        throw Error(
          "React.Children.only expected to receive a single React element child."
        );
      return z;
    }
  };
  return Te.Activity = S, Te.Children = ze, Te.Component = j, Te.Fragment = i, Te.Profiler = u, Te.PureComponent = H, Te.StrictMode = r, Te.Suspense = d, Te.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = X, Te.__COMPILER_RUNTIME = {
    __proto__: null,
    c: function(z) {
      return X.H.useMemoCache(z);
    }
  }, Te.cache = function(z) {
    return function() {
      return z.apply(null, arguments);
    };
  }, Te.cacheSignal = function() {
    return null;
  }, Te.cloneElement = function(z, V, te) {
    if (z == null)
      throw Error(
        "The argument must be a React element, but you passed " + z + "."
      );
    var P = A({}, z.props), pe = z.key;
    if (V != null)
      for (Ae in V.key !== void 0 && (pe = "" + V.key), V)
        !I.call(V, Ae) || Ae === "key" || Ae === "__self" || Ae === "__source" || Ae === "ref" && V.ref === void 0 || (P[Ae] = V[Ae]);
    var Ae = arguments.length - 2;
    if (Ae === 1) P.children = te;
    else if (1 < Ae) {
      for (var de = Array(Ae), at = 0; at < Ae; at++)
        de[at] = arguments[at + 2];
      P.children = de;
    }
    return G(z.type, pe, P);
  }, Te.createContext = function(z) {
    return z = {
      $$typeof: h,
      _currentValue: z,
      _currentValue2: z,
      _threadCount: 0,
      Provider: null,
      Consumer: null
    }, z.Provider = z, z.Consumer = {
      $$typeof: f,
      _context: z
    }, z;
  }, Te.createElement = function(z, V, te) {
    var P, pe = {}, Ae = null;
    if (V != null)
      for (P in V.key !== void 0 && (Ae = "" + V.key), V)
        I.call(V, P) && P !== "key" && P !== "__self" && P !== "__source" && (pe[P] = V[P]);
    var de = arguments.length - 2;
    if (de === 1) pe.children = te;
    else if (1 < de) {
      for (var at = Array(de), Qe = 0; Qe < de; Qe++)
        at[Qe] = arguments[Qe + 2];
      pe.children = at;
    }
    if (z && z.defaultProps)
      for (P in de = z.defaultProps, de)
        pe[P] === void 0 && (pe[P] = de[P]);
    return G(z, Ae, pe);
  }, Te.createRef = function() {
    return { current: null };
  }, Te.forwardRef = function(z) {
    return { $$typeof: p, render: z };
  }, Te.isValidElement = be, Te.lazy = function(z) {
    return {
      $$typeof: y,
      _payload: { _status: -1, _result: z },
      _init: ie
    };
  }, Te.memo = function(z, V) {
    return {
      $$typeof: g,
      type: z,
      compare: V === void 0 ? null : V
    };
  }, Te.startTransition = function(z) {
    var V = X.T, te = {};
    X.T = te;
    try {
      var P = z(), pe = X.S;
      pe !== null && pe(te, P), typeof P == "object" && P !== null && typeof P.then == "function" && P.then(le, se);
    } catch (Ae) {
      se(Ae);
    } finally {
      V !== null && te.types !== null && (V.types = te.types), X.T = V;
    }
  }, Te.unstable_useCacheRefresh = function() {
    return X.H.useCacheRefresh();
  }, Te.use = function(z) {
    return X.H.use(z);
  }, Te.useActionState = function(z, V, te) {
    return X.H.useActionState(z, V, te);
  }, Te.useCallback = function(z, V) {
    return X.H.useCallback(z, V);
  }, Te.useContext = function(z) {
    return X.H.useContext(z);
  }, Te.useDebugValue = function() {
  }, Te.useDeferredValue = function(z, V) {
    return X.H.useDeferredValue(z, V);
  }, Te.useEffect = function(z, V) {
    return X.H.useEffect(z, V);
  }, Te.useEffectEvent = function(z) {
    return X.H.useEffectEvent(z);
  }, Te.useId = function() {
    return X.H.useId();
  }, Te.useImperativeHandle = function(z, V, te) {
    return X.H.useImperativeHandle(z, V, te);
  }, Te.useInsertionEffect = function(z, V) {
    return X.H.useInsertionEffect(z, V);
  }, Te.useLayoutEffect = function(z, V) {
    return X.H.useLayoutEffect(z, V);
  }, Te.useMemo = function(z, V) {
    return X.H.useMemo(z, V);
  }, Te.useOptimistic = function(z, V) {
    return X.H.useOptimistic(z, V);
  }, Te.useReducer = function(z, V, te) {
    return X.H.useReducer(z, V, te);
  }, Te.useRef = function(z) {
    return X.H.useRef(z);
  }, Te.useState = function(z) {
    return X.H.useState(z);
  }, Te.useSyncExternalStore = function(z, V, te) {
    return X.H.useSyncExternalStore(
      z,
      V,
      te
    );
  }, Te.useTransition = function() {
    return X.H.useTransition();
  }, Te.version = "19.2.1", Te;
}
var Hg;
function Mh() {
  return Hg || (Hg = 1, qf.exports = cv()), qf.exports;
}
var re = Mh(), Yf = { exports: {} }, xu = {}, Gf = { exports: {} }, Xf = {};
var Bg;
function ov() {
  return Bg || (Bg = 1, (function(o) {
    function l(L, Y) {
      var ie = L.length;
      L.push(Y);
      e: for (; 0 < ie; ) {
        var se = ie - 1 >>> 1, ze = L[se];
        if (0 < u(ze, Y))
          L[se] = Y, L[ie] = ze, ie = se;
        else break e;
      }
    }
    function i(L) {
      return L.length === 0 ? null : L[0];
    }
    function r(L) {
      if (L.length === 0) return null;
      var Y = L[0], ie = L.pop();
      if (ie !== Y) {
        L[0] = ie;
        e: for (var se = 0, ze = L.length, z = ze >>> 1; se < z; ) {
          var V = 2 * (se + 1) - 1, te = L[V], P = V + 1, pe = L[P];
          if (0 > u(te, ie))
            P < ze && 0 > u(pe, te) ? (L[se] = pe, L[P] = ie, se = P) : (L[se] = te, L[V] = ie, se = V);
          else if (P < ze && 0 > u(pe, ie))
            L[se] = pe, L[P] = ie, se = P;
          else break e;
        }
      }
      return Y;
    }
    function u(L, Y) {
      var ie = L.sortIndex - Y.sortIndex;
      return ie !== 0 ? ie : L.id - Y.id;
    }
    if (o.unstable_now = void 0, typeof performance == "object" && typeof performance.now == "function") {
      var f = performance;
      o.unstable_now = function() {
        return f.now();
      };
    } else {
      var h = Date, p = h.now();
      o.unstable_now = function() {
        return h.now() - p;
      };
    }
    var d = [], g = [], y = 1, S = null, E = 3, b = !1, R = !1, A = !1, C = !1, j = typeof setTimeout == "function" ? setTimeout : null, K = typeof clearTimeout == "function" ? clearTimeout : null, H = typeof setImmediate < "u" ? setImmediate : null;
    function F(L) {
      for (var Y = i(g); Y !== null; ) {
        if (Y.callback === null) r(g);
        else if (Y.startTime <= L)
          r(g), Y.sortIndex = Y.expirationTime, l(d, Y);
        else break;
        Y = i(g);
      }
    }
    function q(L) {
      if (A = !1, F(L), !R)
        if (i(d) !== null)
          R = !0, le || (le = !0, ve());
        else {
          var Y = i(g);
          Y !== null && Se(q, Y.startTime - L);
        }
    }
    var le = !1, X = -1, I = 5, G = -1;
    function ce() {
      return C ? !0 : !(o.unstable_now() - G < I);
    }
    function be() {
      if (C = !1, le) {
        var L = o.unstable_now();
        G = L;
        var Y = !0;
        try {
          e: {
            R = !1, A && (A = !1, K(X), X = -1), b = !0;
            var ie = E;
            try {
              t: {
                for (F(L), S = i(d); S !== null && !(S.expirationTime > L && ce()); ) {
                  var se = S.callback;
                  if (typeof se == "function") {
                    S.callback = null, E = S.priorityLevel;
                    var ze = se(
                      S.expirationTime <= L
                    );
                    if (L = o.unstable_now(), typeof ze == "function") {
                      S.callback = ze, F(L), Y = !0;
                      break t;
                    }
                    S === i(d) && r(d), F(L);
                  } else r(d);
                  S = i(d);
                }
                if (S !== null) Y = !0;
                else {
                  var z = i(g);
                  z !== null && Se(
                    q,
                    z.startTime - L
                  ), Y = !1;
                }
              }
              break e;
            } finally {
              S = null, E = ie, b = !1;
            }
            Y = void 0;
          }
        } finally {
          Y ? ve() : le = !1;
        }
      }
    }
    var ve;
    if (typeof H == "function")
      ve = function() {
        H(be);
      };
    else if (typeof MessageChannel < "u") {
      var _e = new MessageChannel(), ue = _e.port2;
      _e.port1.onmessage = be, ve = function() {
        ue.postMessage(null);
      };
    } else
      ve = function() {
        j(be, 0);
      };
    function Se(L, Y) {
      X = j(function() {
        L(o.unstable_now());
      }, Y);
    }
    o.unstable_IdlePriority = 5, o.unstable_ImmediatePriority = 1, o.unstable_LowPriority = 4, o.unstable_NormalPriority = 3, o.unstable_Profiling = null, o.unstable_UserBlockingPriority = 2, o.unstable_cancelCallback = function(L) {
      L.callback = null;
    }, o.unstable_forceFrameRate = function(L) {
      0 > L || 125 < L ? console.error(
        "forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported"
      ) : I = 0 < L ? Math.floor(1e3 / L) : 5;
    }, o.unstable_getCurrentPriorityLevel = function() {
      return E;
    }, o.unstable_next = function(L) {
      switch (E) {
        case 1:
        case 2:
        case 3:
          var Y = 3;
          break;
        default:
          Y = E;
      }
      var ie = E;
      E = Y;
      try {
        return L();
      } finally {
        E = ie;
      }
    }, o.unstable_requestPaint = function() {
      C = !0;
    }, o.unstable_runWithPriority = function(L, Y) {
      switch (L) {
        case 1:
        case 2:
        case 3:
        case 4:
        case 5:
          break;
        default:
          L = 3;
      }
      var ie = E;
      E = L;
      try {
        return Y();
      } finally {
        E = ie;
      }
    }, o.unstable_scheduleCallback = function(L, Y, ie) {
      var se = o.unstable_now();
      switch (typeof ie == "object" && ie !== null ? (ie = ie.delay, ie = typeof ie == "number" && 0 < ie ? se + ie : se) : ie = se, L) {
        case 1:
          var ze = -1;
          break;
        case 2:
          ze = 250;
          break;
        case 5:
          ze = 1073741823;
          break;
        case 4:
          ze = 1e4;
          break;
        default:
          ze = 5e3;
      }
      return ze = ie + ze, L = {
        id: y++,
        callback: Y,
        priorityLevel: L,
        startTime: ie,
        expirationTime: ze,
        sortIndex: -1
      }, ie > se ? (L.sortIndex = ie, l(g, L), i(d) === null && L === i(g) && (A ? (K(X), X = -1) : A = !0, Se(q, ie - se))) : (L.sortIndex = ze, l(d, L), R || b || (R = !0, le || (le = !0, ve()))), L;
    }, o.unstable_shouldYield = ce, o.unstable_wrapCallback = function(L) {
      var Y = E;
      return function() {
        var ie = E;
        E = Y;
        try {
          return L.apply(this, arguments);
        } finally {
          E = ie;
        }
      };
    };
  })(Xf)), Xf;
}
var qg;
function fv() {
  return qg || (qg = 1, Gf.exports = ov()), Gf.exports;
}
var Qf = { exports: {} }, nn = {};
var Yg;
function hv() {
  if (Yg) return nn;
  Yg = 1;
  var o = Mh();
  function l(d) {
    var g = "https://react.dev/errors/" + d;
    if (1 < arguments.length) {
      g += "?args[]=" + encodeURIComponent(arguments[1]);
      for (var y = 2; y < arguments.length; y++)
        g += "&args[]=" + encodeURIComponent(arguments[y]);
    }
    return "Minified React error #" + d + "; visit " + g + " for the full message or use the non-minified dev environment for full errors and additional helpful warnings.";
  }
  function i() {
  }
  var r = {
    d: {
      f: i,
      r: function() {
        throw Error(l(522));
      },
      D: i,
      C: i,
      L: i,
      m: i,
      X: i,
      S: i,
      M: i
    },
    p: 0,
    findDOMNode: null
  }, u = Symbol.for("react.portal");
  function f(d, g, y) {
    var S = 3 < arguments.length && arguments[3] !== void 0 ? arguments[3] : null;
    return {
      $$typeof: u,
      key: S == null ? null : "" + S,
      children: d,
      containerInfo: g,
      implementation: y
    };
  }
  var h = o.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;
  function p(d, g) {
    if (d === "font") return "";
    if (typeof g == "string")
      return g === "use-credentials" ? g : "";
  }
  return nn.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = r, nn.createPortal = function(d, g) {
    var y = 2 < arguments.length && arguments[2] !== void 0 ? arguments[2] : null;
    if (!g || g.nodeType !== 1 && g.nodeType !== 9 && g.nodeType !== 11)
      throw Error(l(299));
    return f(d, g, null, y);
  }, nn.flushSync = function(d) {
    var g = h.T, y = r.p;
    try {
      if (h.T = null, r.p = 2, d) return d();
    } finally {
      h.T = g, r.p = y, r.d.f();
    }
  }, nn.preconnect = function(d, g) {
    typeof d == "string" && (g ? (g = g.crossOrigin, g = typeof g == "string" ? g === "use-credentials" ? g : "" : void 0) : g = null, r.d.C(d, g));
  }, nn.prefetchDNS = function(d) {
    typeof d == "string" && r.d.D(d);
  }, nn.preinit = function(d, g) {
    if (typeof d == "string" && g && typeof g.as == "string") {
      var y = g.as, S = p(y, g.crossOrigin), E = typeof g.integrity == "string" ? g.integrity : void 0, b = typeof g.fetchPriority == "string" ? g.fetchPriority : void 0;
      y === "style" ? r.d.S(
        d,
        typeof g.precedence == "string" ? g.precedence : void 0,
        {
          crossOrigin: S,
          integrity: E,
          fetchPriority: b
        }
      ) : y === "script" && r.d.X(d, {
        crossOrigin: S,
        integrity: E,
        fetchPriority: b,
        nonce: typeof g.nonce == "string" ? g.nonce : void 0
      });
    }
  }, nn.preinitModule = function(d, g) {
    if (typeof d == "string")
      if (typeof g == "object" && g !== null) {
        if (g.as == null || g.as === "script") {
          var y = p(
            g.as,
            g.crossOrigin
          );
          r.d.M(d, {
            crossOrigin: y,
            integrity: typeof g.integrity == "string" ? g.integrity : void 0,
            nonce: typeof g.nonce == "string" ? g.nonce : void 0
          });
        }
      } else g == null && r.d.M(d);
  }, nn.preload = function(d, g) {
    if (typeof d == "string" && typeof g == "object" && g !== null && typeof g.as == "string") {
      var y = g.as, S = p(y, g.crossOrigin);
      r.d.L(d, y, {
        crossOrigin: S,
        integrity: typeof g.integrity == "string" ? g.integrity : void 0,
        nonce: typeof g.nonce == "string" ? g.nonce : void 0,
        type: typeof g.type == "string" ? g.type : void 0,
        fetchPriority: typeof g.fetchPriority == "string" ? g.fetchPriority : void 0,
        referrerPolicy: typeof g.referrerPolicy == "string" ? g.referrerPolicy : void 0,
        imageSrcSet: typeof g.imageSrcSet == "string" ? g.imageSrcSet : void 0,
        imageSizes: typeof g.imageSizes == "string" ? g.imageSizes : void 0,
        media: typeof g.media == "string" ? g.media : void 0
      });
    }
  }, nn.preloadModule = function(d, g) {
    if (typeof d == "string")
      if (g) {
        var y = p(g.as, g.crossOrigin);
        r.d.m(d, {
          as: typeof g.as == "string" && g.as !== "script" ? g.as : void 0,
          crossOrigin: y,
          integrity: typeof g.integrity == "string" ? g.integrity : void 0
        });
      } else r.d.m(d);
  }, nn.requestFormReset = function(d) {
    r.d.r(d);
  }, nn.unstable_batchedUpdates = function(d, g) {
    return d(g);
  }, nn.useFormState = function(d, g, y) {
    return h.H.useFormState(d, g, y);
  }, nn.useFormStatus = function() {
    return h.H.useHostTransitionStatus();
  }, nn.version = "19.2.1", nn;
}
var Gg;
function dv() {
  if (Gg) return Qf.exports;
  Gg = 1;
  function o() {
    if (!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ > "u" || typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE != "function"))
      try {
        __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(o);
      } catch (l) {
        console.error(l);
      }
  }
  return o(), Qf.exports = hv(), Qf.exports;
}
var Xg;
function pv() {
  if (Xg) return xu;
  Xg = 1;
  var o = fv(), l = Mh(), i = dv();
  function r(e) {
    var t = "https://react.dev/errors/" + e;
    if (1 < arguments.length) {
      t += "?args[]=" + encodeURIComponent(arguments[1]);
      for (var n = 2; n < arguments.length; n++)
        t += "&args[]=" + encodeURIComponent(arguments[n]);
    }
    return "Minified React error #" + e + "; visit " + t + " for the full message or use the non-minified dev environment for full errors and additional helpful warnings.";
  }
  function u(e) {
    return !(!e || e.nodeType !== 1 && e.nodeType !== 9 && e.nodeType !== 11);
  }
  function f(e) {
    var t = e, n = e;
    if (e.alternate) for (; t.return; ) t = t.return;
    else {
      e = t;
      do
        t = e, (t.flags & 4098) !== 0 && (n = t.return), e = t.return;
      while (e);
    }
    return t.tag === 3 ? n : null;
  }
  function h(e) {
    if (e.tag === 13) {
      var t = e.memoizedState;
      if (t === null && (e = e.alternate, e !== null && (t = e.memoizedState)), t !== null) return t.dehydrated;
    }
    return null;
  }
  function p(e) {
    if (e.tag === 31) {
      var t = e.memoizedState;
      if (t === null && (e = e.alternate, e !== null && (t = e.memoizedState)), t !== null) return t.dehydrated;
    }
    return null;
  }
  function d(e) {
    if (f(e) !== e)
      throw Error(r(188));
  }
  function g(e) {
    var t = e.alternate;
    if (!t) {
      if (t = f(e), t === null) throw Error(r(188));
      return t !== e ? null : e;
    }
    for (var n = e, a = t; ; ) {
      var s = n.return;
      if (s === null) break;
      var c = s.alternate;
      if (c === null) {
        if (a = s.return, a !== null) {
          n = a;
          continue;
        }
        break;
      }
      if (s.child === c.child) {
        for (c = s.child; c; ) {
          if (c === n) return d(s), e;
          if (c === a) return d(s), t;
          c = c.sibling;
        }
        throw Error(r(188));
      }
      if (n.return !== a.return) n = s, a = c;
      else {
        for (var m = !1, _ = s.child; _; ) {
          if (_ === n) {
            m = !0, n = s, a = c;
            break;
          }
          if (_ === a) {
            m = !0, a = s, n = c;
            break;
          }
          _ = _.sibling;
        }
        if (!m) {
          for (_ = c.child; _; ) {
            if (_ === n) {
              m = !0, n = c, a = s;
              break;
            }
            if (_ === a) {
              m = !0, a = c, n = s;
              break;
            }
            _ = _.sibling;
          }
          if (!m) throw Error(r(189));
        }
      }
      if (n.alternate !== a) throw Error(r(190));
    }
    if (n.tag !== 3) throw Error(r(188));
    return n.stateNode.current === n ? e : t;
  }
  function y(e) {
    var t = e.tag;
    if (t === 5 || t === 26 || t === 27 || t === 6) return e;
    for (e = e.child; e !== null; ) {
      if (t = y(e), t !== null) return t;
      e = e.sibling;
    }
    return null;
  }
  var S = Object.assign, E = Symbol.for("react.element"), b = Symbol.for("react.transitional.element"), R = Symbol.for("react.portal"), A = Symbol.for("react.fragment"), C = Symbol.for("react.strict_mode"), j = Symbol.for("react.profiler"), K = Symbol.for("react.consumer"), H = Symbol.for("react.context"), F = Symbol.for("react.forward_ref"), q = Symbol.for("react.suspense"), le = Symbol.for("react.suspense_list"), X = Symbol.for("react.memo"), I = Symbol.for("react.lazy"), G = Symbol.for("react.activity"), ce = Symbol.for("react.memo_cache_sentinel"), be = Symbol.iterator;
  function ve(e) {
    return e === null || typeof e != "object" ? null : (e = be && e[be] || e["@@iterator"], typeof e == "function" ? e : null);
  }
  var _e = Symbol.for("react.client.reference");
  function ue(e) {
    if (e == null) return null;
    if (typeof e == "function")
      return e.$$typeof === _e ? null : e.displayName || e.name || null;
    if (typeof e == "string") return e;
    switch (e) {
      case A:
        return "Fragment";
      case j:
        return "Profiler";
      case C:
        return "StrictMode";
      case q:
        return "Suspense";
      case le:
        return "SuspenseList";
      case G:
        return "Activity";
    }
    if (typeof e == "object")
      switch (e.$$typeof) {
        case R:
          return "Portal";
        case H:
          return e.displayName || "Context";
        case K:
          return (e._context.displayName || "Context") + ".Consumer";
        case F:
          var t = e.render;
          return e = e.displayName, e || (e = t.displayName || t.name || "", e = e !== "" ? "ForwardRef(" + e + ")" : "ForwardRef"), e;
        case X:
          return t = e.displayName || null, t !== null ? t : ue(e.type) || "Memo";
        case I:
          t = e._payload, e = e._init;
          try {
            return ue(e(t));
          } catch {
          }
      }
    return null;
  }
  var Se = Array.isArray, L = l.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, Y = i.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, ie = {
    pending: !1,
    data: null,
    method: null,
    action: null
  }, se = [], ze = -1;
  function z(e) {
    return { current: e };
  }
  function V(e) {
    0 > ze || (e.current = se[ze], se[ze] = null, ze--);
  }
  function te(e, t) {
    ze++, se[ze] = e.current, e.current = t;
  }
  var P = z(null), pe = z(null), Ae = z(null), de = z(null);
  function at(e, t) {
    switch (te(Ae, t), te(pe, e), te(P, null), t.nodeType) {
      case 9:
      case 11:
        e = (e = t.documentElement) && (e = e.namespaceURI) ? ag(e) : 0;
        break;
      default:
        if (e = t.tagName, t = t.namespaceURI)
          t = ag(t), e = ig(t, e);
        else
          switch (e) {
            case "svg":
              e = 1;
              break;
            case "math":
              e = 2;
              break;
            default:
              e = 0;
          }
    }
    V(P), te(P, e);
  }
  function Qe() {
    V(P), V(pe), V(Ae);
  }
  function Hl(e) {
    e.memoizedState !== null && te(de, e);
    var t = P.current, n = ig(t, e.type);
    t !== n && (te(pe, e), te(P, n));
  }
  function dl(e) {
    pe.current === e && (V(P), V(pe)), de.current === e && (V(de), yu._currentValue = ie);
  }
  var Bl, ke;
  function Oe(e) {
    if (Bl === void 0)
      try {
        throw Error();
      } catch (n) {
        var t = n.stack.trim().match(/\n( *(at )?)/);
        Bl = t && t[1] || "", ke = -1 < n.stack.indexOf(`
    at`) ? " (<anonymous>)" : -1 < n.stack.indexOf("@") ? "@unknown:0:0" : "";
      }
    return `
` + Bl + e + ke;
  }
  var El = !1;
  function Ge(e, t) {
    if (!e || El) return "";
    El = !0;
    var n = Error.prepareStackTrace;
    Error.prepareStackTrace = void 0;
    try {
      var a = {
        DetermineComponentFrameRoot: function() {
          try {
            if (t) {
              var J = function() {
                throw Error();
              };
              if (Object.defineProperty(J.prototype, "props", {
                set: function() {
                  throw Error();
                }
              }), typeof Reflect == "object" && Reflect.construct) {
                try {
                  Reflect.construct(J, []);
                } catch (B) {
                  var U = B;
                }
                Reflect.construct(e, [], J);
              } else {
                try {
                  J.call();
                } catch (B) {
                  U = B;
                }
                e.call(J.prototype);
              }
            } else {
              try {
                throw Error();
              } catch (B) {
                U = B;
              }
              (J = e()) && typeof J.catch == "function" && J.catch(function() {
              });
            }
          } catch (B) {
            if (B && U && typeof B.stack == "string")
              return [B.stack, U.stack];
          }
          return [null, null];
        }
      };
      a.DetermineComponentFrameRoot.displayName = "DetermineComponentFrameRoot";
      var s = Object.getOwnPropertyDescriptor(
        a.DetermineComponentFrameRoot,
        "name"
      );
      s && s.configurable && Object.defineProperty(
        a.DetermineComponentFrameRoot,
        "name",
        { value: "DetermineComponentFrameRoot" }
      );
      var c = a.DetermineComponentFrameRoot(), m = c[0], _ = c[1];
      if (m && _) {
        var w = m.split(`
`), N = _.split(`
`);
        for (s = a = 0; a < w.length && !w[a].includes("DetermineComponentFrameRoot"); )
          a++;
        for (; s < N.length && !N[s].includes(
          "DetermineComponentFrameRoot"
        ); )
          s++;
        if (a === w.length || s === N.length)
          for (a = w.length - 1, s = N.length - 1; 1 <= a && 0 <= s && w[a] !== N[s]; )
            s--;
        for (; 1 <= a && 0 <= s; a--, s--)
          if (w[a] !== N[s]) {
            if (a !== 1 || s !== 1)
              do
                if (a--, s--, 0 > s || w[a] !== N[s]) {
                  var Z = `
` + w[a].replace(" at new ", " at ");
                  return e.displayName && Z.includes("<anonymous>") && (Z = Z.replace("<anonymous>", e.displayName)), Z;
                }
              while (1 <= a && 0 <= s);
            break;
          }
      }
    } finally {
      El = !1, Error.prepareStackTrace = n;
    }
    return (n = e ? e.displayName || e.name : "") ? Oe(n) : "";
  }
  function pa(e, t) {
    switch (e.tag) {
      case 26:
      case 27:
      case 5:
        return Oe(e.type);
      case 16:
        return Oe("Lazy");
      case 13:
        return e.child !== t && t !== null ? Oe("Suspense Fallback") : Oe("Suspense");
      case 19:
        return Oe("SuspenseList");
      case 0:
      case 15:
        return Ge(e.type, !1);
      case 11:
        return Ge(e.type.render, !1);
      case 1:
        return Ge(e.type, !0);
      case 31:
        return Oe("Activity");
      default:
        return "";
    }
  }
  function Xt(e) {
    try {
      var t = "", n = null;
      do
        t += pa(e, n), n = e, e = e.return;
      while (e);
      return t;
    } catch (a) {
      return `
Error generating stack: ` + a.message + `
` + a.stack;
    }
  }
  var Dn = Object.prototype.hasOwnProperty, pl = o.unstable_scheduleCallback, Qt = o.unstable_cancelCallback, li = o.unstable_shouldYield, Nn = o.unstable_requestPaint, vt = o.unstable_now, ma = o.unstable_getCurrentPriorityLevel, jn = o.unstable_ImmediatePriority, mn = o.unstable_UserBlockingPriority, gn = o.unstable_NormalPriority, Ut = o.unstable_LowPriority, yn = o.unstable_IdlePriority, wl = o.log, ql = o.unstable_setDisableYieldValue, _n = null, bt = null;
  function Vt(e) {
    if (typeof wl == "function" && ql(e), bt && typeof bt.setStrictMode == "function")
      try {
        bt.setStrictMode(_n, e);
      } catch {
      }
  }
  var St = Math.clz32 ? Math.clz32 : Et, ga = Math.log, Ui = Math.LN2;
  function Et(e) {
    return e >>>= 0, e === 0 ? 32 : 31 - (ga(e) / Ui | 0) | 0;
  }
  var vn = 256, Lt = 262144, tn = 4194304;
  function un(e) {
    var t = e & 42;
    if (t !== 0) return t;
    switch (e & -e) {
      case 1:
        return 1;
      case 2:
        return 2;
      case 4:
        return 4;
      case 8:
        return 8;
      case 16:
        return 16;
      case 32:
        return 32;
      case 64:
        return 64;
      case 128:
        return 128;
      case 256:
      case 512:
      case 1024:
      case 2048:
      case 4096:
      case 8192:
      case 16384:
      case 32768:
      case 65536:
      case 131072:
        return e & 261888;
      case 262144:
      case 524288:
      case 1048576:
      case 2097152:
        return e & 3932160;
      case 4194304:
      case 8388608:
      case 16777216:
      case 33554432:
        return e & 62914560;
      case 67108864:
        return 67108864;
      case 134217728:
        return 134217728;
      case 268435456:
        return 268435456;
      case 536870912:
        return 536870912;
      case 1073741824:
        return 0;
      default:
        return e;
    }
  }
  function ml(e, t, n) {
    var a = e.pendingLanes;
    if (a === 0) return 0;
    var s = 0, c = e.suspendedLanes, m = e.pingedLanes;
    e = e.warmLanes;
    var _ = a & 134217727;
    return _ !== 0 ? (a = _ & ~c, a !== 0 ? s = un(a) : (m &= _, m !== 0 ? s = un(m) : n || (n = _ & ~e, n !== 0 && (s = un(n))))) : (_ = a & ~c, _ !== 0 ? s = un(_) : m !== 0 ? s = un(m) : n || (n = a & ~e, n !== 0 && (s = un(n)))), s === 0 ? 0 : t !== 0 && t !== s && (t & c) === 0 && (c = s & -s, n = t & -t, c >= n || c === 32 && (n & 4194048) !== 0) ? t : s;
  }
  function Un(e, t) {
    return (e.pendingLanes & ~(e.suspendedLanes & ~e.pingedLanes) & t) === 0;
  }
  function ai(e, t) {
    switch (e) {
      case 1:
      case 2:
      case 4:
      case 8:
      case 64:
        return t + 250;
      case 16:
      case 32:
      case 128:
      case 256:
      case 512:
      case 1024:
      case 2048:
      case 4096:
      case 8192:
      case 16384:
      case 32768:
      case 65536:
      case 131072:
      case 262144:
      case 524288:
      case 1048576:
      case 2097152:
        return t + 5e3;
      case 4194304:
      case 8388608:
      case 16777216:
      case 33554432:
        return -1;
      case 67108864:
      case 134217728:
      case 268435456:
      case 536870912:
      case 1073741824:
        return -1;
      default:
        return -1;
    }
  }
  function ya() {
    var e = tn;
    return tn <<= 1, (tn & 62914560) === 0 && (tn = 4194304), e;
  }
  function zl(e) {
    for (var t = [], n = 0; 31 > n; n++) t.push(e);
    return t;
  }
  function sn(e, t) {
    e.pendingLanes |= t, t !== 268435456 && (e.suspendedLanes = 0, e.pingedLanes = 0, e.warmLanes = 0);
  }
  function Zt(e, t, n, a, s, c) {
    var m = e.pendingLanes;
    e.pendingLanes = n, e.suspendedLanes = 0, e.pingedLanes = 0, e.warmLanes = 0, e.expiredLanes &= n, e.entangledLanes &= n, e.errorRecoveryDisabledLanes &= n, e.shellSuspendCounter = 0;
    var _ = e.entanglements, w = e.expirationTimes, N = e.hiddenUpdates;
    for (n = m & ~n; 0 < n; ) {
      var Z = 31 - St(n), J = 1 << Z;
      _[Z] = 0, w[Z] = -1;
      var U = N[Z];
      if (U !== null)
        for (N[Z] = null, Z = 0; Z < U.length; Z++) {
          var B = U[Z];
          B !== null && (B.lane &= -536870913);
        }
      n &= ~J;
    }
    a !== 0 && cn(e, a, 0), c !== 0 && s === 0 && e.tag !== 0 && (e.suspendedLanes |= c & ~(m & ~t));
  }
  function cn(e, t, n) {
    e.pendingLanes |= t, e.suspendedLanes &= ~t;
    var a = 31 - St(t);
    e.entangledLanes |= t, e.entanglements[a] = e.entanglements[a] | 1073741824 | n & 261930;
  }
  function Yl(e, t) {
    var n = e.entangledLanes |= t;
    for (e = e.entanglements; n; ) {
      var a = 31 - St(n), s = 1 << a;
      s & t | e[a] & t && (e[a] |= t), n &= ~s;
    }
  }
  function Gl(e, t) {
    var n = t & -t;
    return n = (n & 42) !== 0 ? 1 : Xl(n), (n & (e.suspendedLanes | t)) !== 0 ? 0 : n;
  }
  function Xl(e) {
    switch (e) {
      case 2:
        e = 1;
        break;
      case 8:
        e = 4;
        break;
      case 32:
        e = 16;
        break;
      case 256:
      case 512:
      case 1024:
      case 2048:
      case 4096:
      case 8192:
      case 16384:
      case 32768:
      case 65536:
      case 131072:
      case 262144:
      case 524288:
      case 1048576:
      case 2097152:
      case 4194304:
      case 8388608:
      case 16777216:
      case 33554432:
        e = 128;
        break;
      case 268435456:
        e = 134217728;
        break;
      default:
        e = 0;
    }
    return e;
  }
  function _a(e) {
    return e &= -e, 2 < e ? 8 < e ? (e & 134217727) !== 0 ? 32 : 268435456 : 8 : 2;
  }
  function va() {
    var e = Y.p;
    return e !== 0 ? e : (e = window.event, e === void 0 ? 32 : kg(e.type));
  }
  function gl(e, t) {
    var n = Y.p;
    try {
      return Y.p = e, t();
    } finally {
      Y.p = n;
    }
  }
  var on = Math.random().toString(36).slice(2), dt = "__reactFiber$" + on, pt = "__reactProps$" + on, el = "__reactContainer$" + on, Ql = "__reactEvents$" + on, Pe = "__reactListeners$" + on, x = "__reactHandles$" + on, Q = "__reactResources$" + on, ne = "__reactMarker$" + on;
  function Me(e) {
    delete e[dt], delete e[pt], delete e[Ql], delete e[Pe], delete e[x];
  }
  function xe(e) {
    var t = e[dt];
    if (t) return t;
    for (var n = e.parentNode; n; ) {
      if (t = n[el] || n[dt]) {
        if (n = t.alternate, t.child !== null || n !== null && n.child !== null)
          for (e = hg(e); e !== null; ) {
            if (n = e[dt]) return n;
            e = hg(e);
          }
        return t;
      }
      e = n, n = e.parentNode;
    }
    return null;
  }
  function Ve(e) {
    if (e = e[dt] || e[el]) {
      var t = e.tag;
      if (t === 5 || t === 6 || t === 13 || t === 31 || t === 26 || t === 27 || t === 3)
        return e;
    }
    return null;
  }
  function Ht(e) {
    var t = e.tag;
    if (t === 5 || t === 26 || t === 27 || t === 6) return e.stateNode;
    throw Error(r(33));
  }
  function fn(e) {
    var t = e[Q];
    return t || (t = e[Q] = { hoistableStyles: /* @__PURE__ */ new Map(), hoistableScripts: /* @__PURE__ */ new Map() }), t;
  }
  function ut(e) {
    e[ne] = !0;
  }
  var ba = /* @__PURE__ */ new Set(), yl = {};
  function kl(e, t) {
    _l(e, t), _l(e + "Capture", t);
  }
  function _l(e, t) {
    for (yl[e] = t, e = 0; e < t.length; e++)
      ba.add(t[e]);
  }
  var Vl = RegExp(
    "^[:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD][:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040]*$"
  ), Iu = {}, ii = {};
  function Pu(e) {
    return Dn.call(ii, e) ? !0 : Dn.call(Iu, e) ? !1 : Vl.test(e) ? ii[e] = !0 : (Iu[e] = !0, !1);
  }
  function Li(e, t, n) {
    if (Pu(t))
      if (n === null) e.removeAttribute(t);
      else {
        switch (typeof n) {
          case "undefined":
          case "function":
          case "symbol":
            e.removeAttribute(t);
            return;
          case "boolean":
            var a = t.toLowerCase().slice(0, 5);
            if (a !== "data-" && a !== "aria-") {
              e.removeAttribute(t);
              return;
            }
        }
        e.setAttribute(t, "" + n);
      }
  }
  function ri(e, t, n) {
    if (n === null) e.removeAttribute(t);
    else {
      switch (typeof n) {
        case "undefined":
        case "function":
        case "symbol":
        case "boolean":
          e.removeAttribute(t);
          return;
      }
      e.setAttribute(t, "" + n);
    }
  }
  function tl(e, t, n, a) {
    if (a === null) e.removeAttribute(n);
    else {
      switch (typeof a) {
        case "undefined":
        case "function":
        case "symbol":
        case "boolean":
          e.removeAttribute(n);
          return;
      }
      e.setAttributeNS(t, n, "" + a);
    }
  }
  function Kt(e) {
    switch (typeof e) {
      case "bigint":
      case "boolean":
      case "number":
      case "string":
      case "undefined":
        return e;
      case "object":
        return e;
      default:
        return "";
    }
  }
  function Hi(e) {
    var t = e.type;
    return (e = e.nodeName) && e.toLowerCase() === "input" && (t === "checkbox" || t === "radio");
  }
  function Bi(e, t, n) {
    var a = Object.getOwnPropertyDescriptor(
      e.constructor.prototype,
      t
    );
    if (!e.hasOwnProperty(t) && typeof a < "u" && typeof a.get == "function" && typeof a.set == "function") {
      var s = a.get, c = a.set;
      return Object.defineProperty(e, t, {
        configurable: !0,
        get: function() {
          return s.call(this);
        },
        set: function(m) {
          n = "" + m, c.call(this, m);
        }
      }), Object.defineProperty(e, t, {
        enumerable: a.enumerable
      }), {
        getValue: function() {
          return n;
        },
        setValue: function(m) {
          n = "" + m;
        },
        stopTracking: function() {
          e._valueTracker = null, delete e[t];
        }
      };
    }
  }
  function Ol(e) {
    if (!e._valueTracker) {
      var t = Hi(e) ? "checked" : "value";
      e._valueTracker = Bi(
        e,
        t,
        "" + e[t]
      );
    }
  }
  function Sa(e) {
    if (!e) return !1;
    var t = e._valueTracker;
    if (!t) return !0;
    var n = t.getValue(), a = "";
    return e && (a = Hi(e) ? e.checked ? "true" : "false" : e.value), e = a, e !== n ? (t.setValue(e), !0) : !1;
  }
  function hn(e) {
    if (e = e || (typeof document < "u" ? document : void 0), typeof e > "u") return null;
    try {
      return e.activeElement || e.body;
    } catch {
      return e.body;
    }
  }
  var Uc = /[\n"\\]/g;
  function $t(e) {
    return e.replace(
      Uc,
      function(t) {
        return "\\" + t.charCodeAt(0).toString(16) + " ";
      }
    );
  }
  function Mr(e, t, n, a, s, c, m, _) {
    e.name = "", m != null && typeof m != "function" && typeof m != "symbol" && typeof m != "boolean" ? e.type = m : e.removeAttribute("type"), t != null ? m === "number" ? (t === 0 && e.value === "" || e.value != t) && (e.value = "" + Kt(t)) : e.value !== "" + Kt(t) && (e.value = "" + Kt(t)) : m !== "submit" && m !== "reset" || e.removeAttribute("value"), t != null ? qi(e, m, Kt(t)) : n != null ? qi(e, m, Kt(n)) : a != null && e.removeAttribute("value"), s == null && c != null && (e.defaultChecked = !!c), s != null && (e.checked = s && typeof s != "function" && typeof s != "symbol"), _ != null && typeof _ != "function" && typeof _ != "symbol" && typeof _ != "boolean" ? e.name = "" + Kt(_) : e.removeAttribute("name");
  }
  function Rr(e, t, n, a, s, c, m, _) {
    if (c != null && typeof c != "function" && typeof c != "symbol" && typeof c != "boolean" && (e.type = c), t != null || n != null) {
      if (!(c !== "submit" && c !== "reset" || t != null)) {
        Ol(e);
        return;
      }
      n = n != null ? "" + Kt(n) : "", t = t != null ? "" + Kt(t) : n, _ || t === e.value || (e.value = t), e.defaultValue = t;
    }
    a = a ?? s, a = typeof a != "function" && typeof a != "symbol" && !!a, e.checked = _ ? e.checked : !!a, e.defaultChecked = !!a, m != null && typeof m != "function" && typeof m != "symbol" && typeof m != "boolean" && (e.name = m), Ol(e);
  }
  function qi(e, t, n) {
    t === "number" && hn(e.ownerDocument) === e || e.defaultValue === "" + n || (e.defaultValue = "" + n);
  }
  function Zl(e, t, n, a) {
    if (e = e.options, t) {
      t = {};
      for (var s = 0; s < n.length; s++)
        t["$" + n[s]] = !0;
      for (n = 0; n < e.length; n++)
        s = t.hasOwnProperty("$" + e[n].value), e[n].selected !== s && (e[n].selected = s), s && a && (e[n].defaultSelected = !0);
    } else {
      for (n = "" + Kt(n), t = null, s = 0; s < e.length; s++) {
        if (e[s].value === n) {
          e[s].selected = !0, a && (e[s].defaultSelected = !0);
          return;
        }
        t !== null || e[s].disabled || (t = e[s]);
      }
      t !== null && (t.selected = !0);
    }
  }
  function Cr(e, t, n) {
    if (t != null && (t = "" + Kt(t), t !== e.value && (e.value = t), n == null)) {
      e.defaultValue !== t && (e.defaultValue = t);
      return;
    }
    e.defaultValue = n != null ? "" + Kt(n) : "";
  }
  function es(e, t, n, a) {
    if (t == null) {
      if (a != null) {
        if (n != null) throw Error(r(92));
        if (Se(a)) {
          if (1 < a.length) throw Error(r(93));
          a = a[0];
        }
        n = a;
      }
      n == null && (n = ""), t = n;
    }
    n = Kt(t), e.defaultValue = n, a = e.textContent, a === n && a !== "" && a !== null && (e.value = a), Ol(e);
  }
  function Kl(e, t) {
    if (t) {
      var n = e.firstChild;
      if (n && n === e.lastChild && n.nodeType === 3) {
        n.nodeValue = t;
        return;
      }
    }
    e.textContent = t;
  }
  var Lc = new Set(
    "animationIterationCount aspectRatio borderImageOutset borderImageSlice borderImageWidth boxFlex boxFlexGroup boxOrdinalGroup columnCount columns flex flexGrow flexPositive flexShrink flexNegative flexOrder gridArea gridRow gridRowEnd gridRowSpan gridRowStart gridColumn gridColumnEnd gridColumnSpan gridColumnStart fontWeight lineClamp lineHeight opacity order orphans scale tabSize widows zIndex zoom fillOpacity floodOpacity stopOpacity strokeDasharray strokeDashoffset strokeMiterlimit strokeOpacity strokeWidth MozAnimationIterationCount MozBoxFlex MozBoxFlexGroup MozLineClamp msAnimationIterationCount msFlex msZoom msFlexGrow msFlexNegative msFlexOrder msFlexPositive msFlexShrink msGridColumn msGridColumnSpan msGridRow msGridRowSpan WebkitAnimationIterationCount WebkitBoxFlex WebKitBoxFlexGroup WebkitBoxOrdinalGroup WebkitColumnCount WebkitColumns WebkitFlex WebkitFlexGrow WebkitFlexPositive WebkitFlexShrink WebkitLineClamp".split(
      " "
    )
  );
  function ts(e, t, n) {
    var a = t.indexOf("--") === 0;
    n == null || typeof n == "boolean" || n === "" ? a ? e.setProperty(t, "") : t === "float" ? e.cssFloat = "" : e[t] = "" : a ? e.setProperty(t, n) : typeof n != "number" || n === 0 || Lc.has(t) ? t === "float" ? e.cssFloat = n : e[t] = ("" + n).trim() : e[t] = n + "px";
  }
  function Dr(e, t, n) {
    if (t != null && typeof t != "object")
      throw Error(r(62));
    if (e = e.style, n != null) {
      for (var a in n)
        !n.hasOwnProperty(a) || t != null && t.hasOwnProperty(a) || (a.indexOf("--") === 0 ? e.setProperty(a, "") : a === "float" ? e.cssFloat = "" : e[a] = "");
      for (var s in t)
        a = t[s], t.hasOwnProperty(s) && n[s] !== a && ts(e, s, a);
    } else
      for (var c in t)
        t.hasOwnProperty(c) && ts(e, c, t[c]);
  }
  function xa(e) {
    if (e.indexOf("-") === -1) return !1;
    switch (e) {
      case "annotation-xml":
      case "color-profile":
      case "font-face":
      case "font-face-src":
      case "font-face-uri":
      case "font-face-format":
      case "font-face-name":
      case "missing-glyph":
        return !1;
      default:
        return !0;
    }
  }
  var Nr = /* @__PURE__ */ new Map([
    ["acceptCharset", "accept-charset"],
    ["htmlFor", "for"],
    ["httpEquiv", "http-equiv"],
    ["crossOrigin", "crossorigin"],
    ["accentHeight", "accent-height"],
    ["alignmentBaseline", "alignment-baseline"],
    ["arabicForm", "arabic-form"],
    ["baselineShift", "baseline-shift"],
    ["capHeight", "cap-height"],
    ["clipPath", "clip-path"],
    ["clipRule", "clip-rule"],
    ["colorInterpolation", "color-interpolation"],
    ["colorInterpolationFilters", "color-interpolation-filters"],
    ["colorProfile", "color-profile"],
    ["colorRendering", "color-rendering"],
    ["dominantBaseline", "dominant-baseline"],
    ["enableBackground", "enable-background"],
    ["fillOpacity", "fill-opacity"],
    ["fillRule", "fill-rule"],
    ["floodColor", "flood-color"],
    ["floodOpacity", "flood-opacity"],
    ["fontFamily", "font-family"],
    ["fontSize", "font-size"],
    ["fontSizeAdjust", "font-size-adjust"],
    ["fontStretch", "font-stretch"],
    ["fontStyle", "font-style"],
    ["fontVariant", "font-variant"],
    ["fontWeight", "font-weight"],
    ["glyphName", "glyph-name"],
    ["glyphOrientationHorizontal", "glyph-orientation-horizontal"],
    ["glyphOrientationVertical", "glyph-orientation-vertical"],
    ["horizAdvX", "horiz-adv-x"],
    ["horizOriginX", "horiz-origin-x"],
    ["imageRendering", "image-rendering"],
    ["letterSpacing", "letter-spacing"],
    ["lightingColor", "lighting-color"],
    ["markerEnd", "marker-end"],
    ["markerMid", "marker-mid"],
    ["markerStart", "marker-start"],
    ["overlinePosition", "overline-position"],
    ["overlineThickness", "overline-thickness"],
    ["paintOrder", "paint-order"],
    ["panose-1", "panose-1"],
    ["pointerEvents", "pointer-events"],
    ["renderingIntent", "rendering-intent"],
    ["shapeRendering", "shape-rendering"],
    ["stopColor", "stop-color"],
    ["stopOpacity", "stop-opacity"],
    ["strikethroughPosition", "strikethrough-position"],
    ["strikethroughThickness", "strikethrough-thickness"],
    ["strokeDasharray", "stroke-dasharray"],
    ["strokeDashoffset", "stroke-dashoffset"],
    ["strokeLinecap", "stroke-linecap"],
    ["strokeLinejoin", "stroke-linejoin"],
    ["strokeMiterlimit", "stroke-miterlimit"],
    ["strokeOpacity", "stroke-opacity"],
    ["strokeWidth", "stroke-width"],
    ["textAnchor", "text-anchor"],
    ["textDecoration", "text-decoration"],
    ["textRendering", "text-rendering"],
    ["transformOrigin", "transform-origin"],
    ["underlinePosition", "underline-position"],
    ["underlineThickness", "underline-thickness"],
    ["unicodeBidi", "unicode-bidi"],
    ["unicodeRange", "unicode-range"],
    ["unitsPerEm", "units-per-em"],
    ["vAlphabetic", "v-alphabetic"],
    ["vHanging", "v-hanging"],
    ["vIdeographic", "v-ideographic"],
    ["vMathematical", "v-mathematical"],
    ["vectorEffect", "vector-effect"],
    ["vertAdvY", "vert-adv-y"],
    ["vertOriginX", "vert-origin-x"],
    ["vertOriginY", "vert-origin-y"],
    ["wordSpacing", "word-spacing"],
    ["writingMode", "writing-mode"],
    ["xmlnsXlink", "xmlns:xlink"],
    ["xHeight", "x-height"]
  ]), ee = /^[\u0000-\u001F ]*j[\r\n\t]*a[\r\n\t]*v[\r\n\t]*a[\r\n\t]*s[\r\n\t]*c[\r\n\t]*r[\r\n\t]*i[\r\n\t]*p[\r\n\t]*t[\r\n\t]*:/i;
  function T(e) {
    return ee.test("" + e) ? "javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')" : e;
  }
  function O() {
  }
  var W = null;
  function ae(e) {
    return e = e.target || e.srcElement || window, e.correspondingUseElement && (e = e.correspondingUseElement), e.nodeType === 3 ? e.parentNode : e;
  }
  var oe = null, ge = null;
  function Ze(e) {
    var t = Ve(e);
    if (t && (e = t.stateNode)) {
      var n = e[pt] || null;
      e: switch (e = t.stateNode, t.type) {
        case "input":
          if (Mr(
            e,
            n.value,
            n.defaultValue,
            n.defaultValue,
            n.checked,
            n.defaultChecked,
            n.type,
            n.name
          ), t = n.name, n.type === "radio" && t != null) {
            for (n = e; n.parentNode; ) n = n.parentNode;
            for (n = n.querySelectorAll(
              'input[name="' + $t(
                "" + t
              ) + '"][type="radio"]'
            ), t = 0; t < n.length; t++) {
              var a = n[t];
              if (a !== e && a.form === e.form) {
                var s = a[pt] || null;
                if (!s) throw Error(r(90));
                Mr(
                  a,
                  s.value,
                  s.defaultValue,
                  s.defaultValue,
                  s.checked,
                  s.defaultChecked,
                  s.type,
                  s.name
                );
              }
            }
            for (t = 0; t < n.length; t++)
              a = n[t], a.form === e.form && Sa(a);
          }
          break e;
        case "textarea":
          Cr(e, n.value, n.defaultValue);
          break e;
        case "select":
          t = n.value, t != null && Zl(e, !!n.multiple, t, !1);
      }
    }
  }
  var et = !1;
  function Jt(e, t, n) {
    if (et) return e(t, n);
    et = !0;
    try {
      var a = e(t);
      return a;
    } finally {
      if (et = !1, (oe !== null || ge !== null) && (Gs(), oe && (t = oe, e = ge, ge = oe = null, Ze(t), e)))
        for (t = 0; t < e.length; t++) Ze(e[t]);
    }
  }
  function wt(e, t) {
    var n = e.stateNode;
    if (n === null) return null;
    var a = n[pt] || null;
    if (a === null) return null;
    n = a[t];
    e: switch (t) {
      case "onClick":
      case "onClickCapture":
      case "onDoubleClick":
      case "onDoubleClickCapture":
      case "onMouseDown":
      case "onMouseDownCapture":
      case "onMouseMove":
      case "onMouseMoveCapture":
      case "onMouseUp":
      case "onMouseUpCapture":
      case "onMouseEnter":
        (a = !a.disabled) || (e = e.type, a = !(e === "button" || e === "input" || e === "select" || e === "textarea")), e = !a;
        break e;
      default:
        e = !1;
    }
    if (e) return null;
    if (n && typeof n != "function")
      throw Error(
        r(231, t, typeof n)
      );
    return n;
  }
  var Ln = !(typeof window > "u" || typeof window.document > "u" || typeof window.document.createElement > "u"), Dt = !1;
  if (Ln)
    try {
      var jr = {};
      Object.defineProperty(jr, "passive", {
        get: function() {
          Dt = !0;
        }
      }), window.addEventListener("test", jr, jr), window.removeEventListener("test", jr, jr);
    } catch {
      Dt = !1;
    }
  var Ta = null, Hc = null, ns = null;
  function id() {
    if (ns) return ns;
    var e, t = Hc, n = t.length, a, s = "value" in Ta ? Ta.value : Ta.textContent, c = s.length;
    for (e = 0; e < n && t[e] === s[e]; e++) ;
    var m = n - e;
    for (a = 1; a <= m && t[n - a] === s[c - a]; a++) ;
    return ns = s.slice(e, 1 < a ? 1 - a : void 0);
  }
  function ls(e) {
    var t = e.keyCode;
    return "charCode" in e ? (e = e.charCode, e === 0 && t === 13 && (e = 13)) : e = t, e === 10 && (e = 13), 32 <= e || e === 13 ? e : 0;
  }
  function as() {
    return !0;
  }
  function rd() {
    return !1;
  }
  function bn(e) {
    function t(n, a, s, c, m) {
      this._reactName = n, this._targetInst = s, this.type = a, this.nativeEvent = c, this.target = m, this.currentTarget = null;
      for (var _ in e)
        e.hasOwnProperty(_) && (n = e[_], this[_] = n ? n(c) : c[_]);
      return this.isDefaultPrevented = (c.defaultPrevented != null ? c.defaultPrevented : c.returnValue === !1) ? as : rd, this.isPropagationStopped = rd, this;
    }
    return S(t.prototype, {
      preventDefault: function() {
        this.defaultPrevented = !0;
        var n = this.nativeEvent;
        n && (n.preventDefault ? n.preventDefault() : typeof n.returnValue != "unknown" && (n.returnValue = !1), this.isDefaultPrevented = as);
      },
      stopPropagation: function() {
        var n = this.nativeEvent;
        n && (n.stopPropagation ? n.stopPropagation() : typeof n.cancelBubble != "unknown" && (n.cancelBubble = !0), this.isPropagationStopped = as);
      },
      persist: function() {
      },
      isPersistent: as
    }), t;
  }
  var ui = {
    eventPhase: 0,
    bubbles: 0,
    cancelable: 0,
    timeStamp: function(e) {
      return e.timeStamp || Date.now();
    },
    defaultPrevented: 0,
    isTrusted: 0
  }, is = bn(ui), Ur = S({}, ui, { view: 0, detail: 0 }), i_ = bn(Ur), Bc, qc, Lr, rs = S({}, Ur, {
    screenX: 0,
    screenY: 0,
    clientX: 0,
    clientY: 0,
    pageX: 0,
    pageY: 0,
    ctrlKey: 0,
    shiftKey: 0,
    altKey: 0,
    metaKey: 0,
    getModifierState: Gc,
    button: 0,
    buttons: 0,
    relatedTarget: function(e) {
      return e.relatedTarget === void 0 ? e.fromElement === e.srcElement ? e.toElement : e.fromElement : e.relatedTarget;
    },
    movementX: function(e) {
      return "movementX" in e ? e.movementX : (e !== Lr && (Lr && e.type === "mousemove" ? (Bc = e.screenX - Lr.screenX, qc = e.screenY - Lr.screenY) : qc = Bc = 0, Lr = e), Bc);
    },
    movementY: function(e) {
      return "movementY" in e ? e.movementY : qc;
    }
  }), ud = bn(rs), r_ = S({}, rs, { dataTransfer: 0 }), u_ = bn(r_), s_ = S({}, Ur, { relatedTarget: 0 }), Yc = bn(s_), c_ = S({}, ui, {
    animationName: 0,
    elapsedTime: 0,
    pseudoElement: 0
  }), o_ = bn(c_), f_ = S({}, ui, {
    clipboardData: function(e) {
      return "clipboardData" in e ? e.clipboardData : window.clipboardData;
    }
  }), h_ = bn(f_), d_ = S({}, ui, { data: 0 }), sd = bn(d_), p_ = {
    Esc: "Escape",
    Spacebar: " ",
    Left: "ArrowLeft",
    Up: "ArrowUp",
    Right: "ArrowRight",
    Down: "ArrowDown",
    Del: "Delete",
    Win: "OS",
    Menu: "ContextMenu",
    Apps: "ContextMenu",
    Scroll: "ScrollLock",
    MozPrintableKey: "Unidentified"
  }, m_ = {
    8: "Backspace",
    9: "Tab",
    12: "Clear",
    13: "Enter",
    16: "Shift",
    17: "Control",
    18: "Alt",
    19: "Pause",
    20: "CapsLock",
    27: "Escape",
    32: " ",
    33: "PageUp",
    34: "PageDown",
    35: "End",
    36: "Home",
    37: "ArrowLeft",
    38: "ArrowUp",
    39: "ArrowRight",
    40: "ArrowDown",
    45: "Insert",
    46: "Delete",
    112: "F1",
    113: "F2",
    114: "F3",
    115: "F4",
    116: "F5",
    117: "F6",
    118: "F7",
    119: "F8",
    120: "F9",
    121: "F10",
    122: "F11",
    123: "F12",
    144: "NumLock",
    145: "ScrollLock",
    224: "Meta"
  }, g_ = {
    Alt: "altKey",
    Control: "ctrlKey",
    Meta: "metaKey",
    Shift: "shiftKey"
  };
  function y_(e) {
    var t = this.nativeEvent;
    return t.getModifierState ? t.getModifierState(e) : (e = g_[e]) ? !!t[e] : !1;
  }
  function Gc() {
    return y_;
  }
  var __ = S({}, Ur, {
    key: function(e) {
      if (e.key) {
        var t = p_[e.key] || e.key;
        if (t !== "Unidentified") return t;
      }
      return e.type === "keypress" ? (e = ls(e), e === 13 ? "Enter" : String.fromCharCode(e)) : e.type === "keydown" || e.type === "keyup" ? m_[e.keyCode] || "Unidentified" : "";
    },
    code: 0,
    location: 0,
    ctrlKey: 0,
    shiftKey: 0,
    altKey: 0,
    metaKey: 0,
    repeat: 0,
    locale: 0,
    getModifierState: Gc,
    charCode: function(e) {
      return e.type === "keypress" ? ls(e) : 0;
    },
    keyCode: function(e) {
      return e.type === "keydown" || e.type === "keyup" ? e.keyCode : 0;
    },
    which: function(e) {
      return e.type === "keypress" ? ls(e) : e.type === "keydown" || e.type === "keyup" ? e.keyCode : 0;
    }
  }), v_ = bn(__), b_ = S({}, rs, {
    pointerId: 0,
    width: 0,
    height: 0,
    pressure: 0,
    tangentialPressure: 0,
    tiltX: 0,
    tiltY: 0,
    twist: 0,
    pointerType: 0,
    isPrimary: 0
  }), cd = bn(b_), S_ = S({}, Ur, {
    touches: 0,
    targetTouches: 0,
    changedTouches: 0,
    altKey: 0,
    metaKey: 0,
    ctrlKey: 0,
    shiftKey: 0,
    getModifierState: Gc
  }), x_ = bn(S_), T_ = S({}, ui, {
    propertyName: 0,
    elapsedTime: 0,
    pseudoElement: 0
  }), A_ = bn(T_), E_ = S({}, rs, {
    deltaX: function(e) {
      return "deltaX" in e ? e.deltaX : "wheelDeltaX" in e ? -e.wheelDeltaX : 0;
    },
    deltaY: function(e) {
      return "deltaY" in e ? e.deltaY : "wheelDeltaY" in e ? -e.wheelDeltaY : "wheelDelta" in e ? -e.wheelDelta : 0;
    },
    deltaZ: 0,
    deltaMode: 0
  }), w_ = bn(E_), z_ = S({}, ui, {
    newState: 0,
    oldState: 0
  }), k_ = bn(z_), O_ = [9, 13, 27, 32], Xc = Ln && "CompositionEvent" in window, Hr = null;
  Ln && "documentMode" in document && (Hr = document.documentMode);
  var M_ = Ln && "TextEvent" in window && !Hr, od = Ln && (!Xc || Hr && 8 < Hr && 11 >= Hr), fd = " ", hd = !1;
  function dd(e, t) {
    switch (e) {
      case "keyup":
        return O_.indexOf(t.keyCode) !== -1;
      case "keydown":
        return t.keyCode !== 229;
      case "keypress":
      case "mousedown":
      case "focusout":
        return !0;
      default:
        return !1;
    }
  }
  function pd(e) {
    return e = e.detail, typeof e == "object" && "data" in e ? e.data : null;
  }
  var Yi = !1;
  function R_(e, t) {
    switch (e) {
      case "compositionend":
        return pd(t);
      case "keypress":
        return t.which !== 32 ? null : (hd = !0, fd);
      case "textInput":
        return e = t.data, e === fd && hd ? null : e;
      default:
        return null;
    }
  }
  function C_(e, t) {
    if (Yi)
      return e === "compositionend" || !Xc && dd(e, t) ? (e = id(), ns = Hc = Ta = null, Yi = !1, e) : null;
    switch (e) {
      case "paste":
        return null;
      case "keypress":
        if (!(t.ctrlKey || t.altKey || t.metaKey) || t.ctrlKey && t.altKey) {
          if (t.char && 1 < t.char.length)
            return t.char;
          if (t.which) return String.fromCharCode(t.which);
        }
        return null;
      case "compositionend":
        return od && t.locale !== "ko" ? null : t.data;
      default:
        return null;
    }
  }
  var D_ = {
    color: !0,
    date: !0,
    datetime: !0,
    "datetime-local": !0,
    email: !0,
    month: !0,
    number: !0,
    password: !0,
    range: !0,
    search: !0,
    tel: !0,
    text: !0,
    time: !0,
    url: !0,
    week: !0
  };
  function md(e) {
    var t = e && e.nodeName && e.nodeName.toLowerCase();
    return t === "input" ? !!D_[e.type] : t === "textarea";
  }
  function gd(e, t, n, a) {
    oe ? ge ? ge.push(a) : ge = [a] : oe = a, t = Js(t, "onChange"), 0 < t.length && (n = new is(
      "onChange",
      "change",
      null,
      n,
      a
    ), e.push({ event: n, listeners: t }));
  }
  var Br = null, qr = null;
  function N_(e) {
    Im(e, 0);
  }
  function us(e) {
    var t = Ht(e);
    if (Sa(t)) return e;
  }
  function yd(e, t) {
    if (e === "change") return t;
  }
  var _d = !1;
  if (Ln) {
    var Qc;
    if (Ln) {
      var Vc = "oninput" in document;
      if (!Vc) {
        var vd = document.createElement("div");
        vd.setAttribute("oninput", "return;"), Vc = typeof vd.oninput == "function";
      }
      Qc = Vc;
    } else Qc = !1;
    _d = Qc && (!document.documentMode || 9 < document.documentMode);
  }
  function bd() {
    Br && (Br.detachEvent("onpropertychange", Sd), qr = Br = null);
  }
  function Sd(e) {
    if (e.propertyName === "value" && us(qr)) {
      var t = [];
      gd(
        t,
        qr,
        e,
        ae(e)
      ), Jt(N_, t);
    }
  }
  function j_(e, t, n) {
    e === "focusin" ? (bd(), Br = t, qr = n, Br.attachEvent("onpropertychange", Sd)) : e === "focusout" && bd();
  }
  function U_(e) {
    if (e === "selectionchange" || e === "keyup" || e === "keydown")
      return us(qr);
  }
  function L_(e, t) {
    if (e === "click") return us(t);
  }
  function H_(e, t) {
    if (e === "input" || e === "change")
      return us(t);
  }
  function B_(e, t) {
    return e === t && (e !== 0 || 1 / e === 1 / t) || e !== e && t !== t;
  }
  var Hn = typeof Object.is == "function" ? Object.is : B_;
  function Yr(e, t) {
    if (Hn(e, t)) return !0;
    if (typeof e != "object" || e === null || typeof t != "object" || t === null)
      return !1;
    var n = Object.keys(e), a = Object.keys(t);
    if (n.length !== a.length) return !1;
    for (a = 0; a < n.length; a++) {
      var s = n[a];
      if (!Dn.call(t, s) || !Hn(e[s], t[s]))
        return !1;
    }
    return !0;
  }
  function xd(e) {
    for (; e && e.firstChild; ) e = e.firstChild;
    return e;
  }
  function Td(e, t) {
    var n = xd(e);
    e = 0;
    for (var a; n; ) {
      if (n.nodeType === 3) {
        if (a = e + n.textContent.length, e <= t && a >= t)
          return { node: n, offset: t - e };
        e = a;
      }
      e: {
        for (; n; ) {
          if (n.nextSibling) {
            n = n.nextSibling;
            break e;
          }
          n = n.parentNode;
        }
        n = void 0;
      }
      n = xd(n);
    }
  }
  function Ad(e, t) {
    return e && t ? e === t ? !0 : e && e.nodeType === 3 ? !1 : t && t.nodeType === 3 ? Ad(e, t.parentNode) : "contains" in e ? e.contains(t) : e.compareDocumentPosition ? !!(e.compareDocumentPosition(t) & 16) : !1 : !1;
  }
  function Ed(e) {
    e = e != null && e.ownerDocument != null && e.ownerDocument.defaultView != null ? e.ownerDocument.defaultView : window;
    for (var t = hn(e.document); t instanceof e.HTMLIFrameElement; ) {
      try {
        var n = typeof t.contentWindow.location.href == "string";
      } catch {
        n = !1;
      }
      if (n) e = t.contentWindow;
      else break;
      t = hn(e.document);
    }
    return t;
  }
  function Zc(e) {
    var t = e && e.nodeName && e.nodeName.toLowerCase();
    return t && (t === "input" && (e.type === "text" || e.type === "search" || e.type === "tel" || e.type === "url" || e.type === "password") || t === "textarea" || e.contentEditable === "true");
  }
  var q_ = Ln && "documentMode" in document && 11 >= document.documentMode, Gi = null, Kc = null, Gr = null, $c = !1;
  function wd(e, t, n) {
    var a = n.window === n ? n.document : n.nodeType === 9 ? n : n.ownerDocument;
    $c || Gi == null || Gi !== hn(a) || (a = Gi, "selectionStart" in a && Zc(a) ? a = { start: a.selectionStart, end: a.selectionEnd } : (a = (a.ownerDocument && a.ownerDocument.defaultView || window).getSelection(), a = {
      anchorNode: a.anchorNode,
      anchorOffset: a.anchorOffset,
      focusNode: a.focusNode,
      focusOffset: a.focusOffset
    }), Gr && Yr(Gr, a) || (Gr = a, a = Js(Kc, "onSelect"), 0 < a.length && (t = new is(
      "onSelect",
      "select",
      null,
      t,
      n
    ), e.push({ event: t, listeners: a }), t.target = Gi)));
  }
  function si(e, t) {
    var n = {};
    return n[e.toLowerCase()] = t.toLowerCase(), n["Webkit" + e] = "webkit" + t, n["Moz" + e] = "moz" + t, n;
  }
  var Xi = {
    animationend: si("Animation", "AnimationEnd"),
    animationiteration: si("Animation", "AnimationIteration"),
    animationstart: si("Animation", "AnimationStart"),
    transitionrun: si("Transition", "TransitionRun"),
    transitionstart: si("Transition", "TransitionStart"),
    transitioncancel: si("Transition", "TransitionCancel"),
    transitionend: si("Transition", "TransitionEnd")
  }, Jc = {}, zd = {};
  Ln && (zd = document.createElement("div").style, "AnimationEvent" in window || (delete Xi.animationend.animation, delete Xi.animationiteration.animation, delete Xi.animationstart.animation), "TransitionEvent" in window || delete Xi.transitionend.transition);
  function ci(e) {
    if (Jc[e]) return Jc[e];
    if (!Xi[e]) return e;
    var t = Xi[e], n;
    for (n in t)
      if (t.hasOwnProperty(n) && n in zd)
        return Jc[e] = t[n];
    return e;
  }
  var kd = ci("animationend"), Od = ci("animationiteration"), Md = ci("animationstart"), Y_ = ci("transitionrun"), G_ = ci("transitionstart"), X_ = ci("transitioncancel"), Rd = ci("transitionend"), Cd = /* @__PURE__ */ new Map(), Fc = "abort auxClick beforeToggle cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(
    " "
  );
  Fc.push("scrollEnd");
  function vl(e, t) {
    Cd.set(e, t), kl(t, [e]);
  }
  var ss = typeof reportError == "function" ? reportError : function(e) {
    if (typeof window == "object" && typeof window.ErrorEvent == "function") {
      var t = new window.ErrorEvent("error", {
        bubbles: !0,
        cancelable: !0,
        message: typeof e == "object" && e !== null && typeof e.message == "string" ? String(e.message) : String(e),
        error: e
      });
      if (!window.dispatchEvent(t)) return;
    } else if (typeof process == "object" && typeof process.emit == "function") {
      process.emit("uncaughtException", e);
      return;
    }
    console.error(e);
  }, nl = [], Qi = 0, Wc = 0;
  function cs() {
    for (var e = Qi, t = Wc = Qi = 0; t < e; ) {
      var n = nl[t];
      nl[t++] = null;
      var a = nl[t];
      nl[t++] = null;
      var s = nl[t];
      nl[t++] = null;
      var c = nl[t];
      if (nl[t++] = null, a !== null && s !== null) {
        var m = a.pending;
        m === null ? s.next = s : (s.next = m.next, m.next = s), a.pending = s;
      }
      c !== 0 && Dd(n, s, c);
    }
  }
  function os(e, t, n, a) {
    nl[Qi++] = e, nl[Qi++] = t, nl[Qi++] = n, nl[Qi++] = a, Wc |= a, e.lanes |= a, e = e.alternate, e !== null && (e.lanes |= a);
  }
  function Ic(e, t, n, a) {
    return os(e, t, n, a), fs(e);
  }
  function oi(e, t) {
    return os(e, null, null, t), fs(e);
  }
  function Dd(e, t, n) {
    e.lanes |= n;
    var a = e.alternate;
    a !== null && (a.lanes |= n);
    for (var s = !1, c = e.return; c !== null; )
      c.childLanes |= n, a = c.alternate, a !== null && (a.childLanes |= n), c.tag === 22 && (e = c.stateNode, e === null || e._visibility & 1 || (s = !0)), e = c, c = c.return;
    return e.tag === 3 ? (c = e.stateNode, s && t !== null && (s = 31 - St(n), e = c.hiddenUpdates, a = e[s], a === null ? e[s] = [t] : a.push(t), t.lane = n | 536870912), c) : null;
  }
  function fs(e) {
    if (50 < ou)
      throw ou = 0, cf = null, Error(r(185));
    for (var t = e.return; t !== null; )
      e = t, t = e.return;
    return e.tag === 3 ? e.stateNode : null;
  }
  var Vi = {};
  function Q_(e, t, n, a) {
    this.tag = e, this.key = n, this.sibling = this.child = this.return = this.stateNode = this.type = this.elementType = null, this.index = 0, this.refCleanup = this.ref = null, this.pendingProps = t, this.dependencies = this.memoizedState = this.updateQueue = this.memoizedProps = null, this.mode = a, this.subtreeFlags = this.flags = 0, this.deletions = null, this.childLanes = this.lanes = 0, this.alternate = null;
  }
  function Bn(e, t, n, a) {
    return new Q_(e, t, n, a);
  }
  function Pc(e) {
    return e = e.prototype, !(!e || !e.isReactComponent);
  }
  function $l(e, t) {
    var n = e.alternate;
    return n === null ? (n = Bn(
      e.tag,
      t,
      e.key,
      e.mode
    ), n.elementType = e.elementType, n.type = e.type, n.stateNode = e.stateNode, n.alternate = e, e.alternate = n) : (n.pendingProps = t, n.type = e.type, n.flags = 0, n.subtreeFlags = 0, n.deletions = null), n.flags = e.flags & 65011712, n.childLanes = e.childLanes, n.lanes = e.lanes, n.child = e.child, n.memoizedProps = e.memoizedProps, n.memoizedState = e.memoizedState, n.updateQueue = e.updateQueue, t = e.dependencies, n.dependencies = t === null ? null : { lanes: t.lanes, firstContext: t.firstContext }, n.sibling = e.sibling, n.index = e.index, n.ref = e.ref, n.refCleanup = e.refCleanup, n;
  }
  function Nd(e, t) {
    e.flags &= 65011714;
    var n = e.alternate;
    return n === null ? (e.childLanes = 0, e.lanes = t, e.child = null, e.subtreeFlags = 0, e.memoizedProps = null, e.memoizedState = null, e.updateQueue = null, e.dependencies = null, e.stateNode = null) : (e.childLanes = n.childLanes, e.lanes = n.lanes, e.child = n.child, e.subtreeFlags = 0, e.deletions = null, e.memoizedProps = n.memoizedProps, e.memoizedState = n.memoizedState, e.updateQueue = n.updateQueue, e.type = n.type, t = n.dependencies, e.dependencies = t === null ? null : {
      lanes: t.lanes,
      firstContext: t.firstContext
    }), e;
  }
  function hs(e, t, n, a, s, c) {
    var m = 0;
    if (a = e, typeof e == "function") Pc(e) && (m = 1);
    else if (typeof e == "string")
      m = J1(
        e,
        n,
        P.current
      ) ? 26 : e === "html" || e === "head" || e === "body" ? 27 : 5;
    else
      e: switch (e) {
        case G:
          return e = Bn(31, n, t, s), e.elementType = G, e.lanes = c, e;
        case A:
          return fi(n.children, s, c, t);
        case C:
          m = 8, s |= 24;
          break;
        case j:
          return e = Bn(12, n, t, s | 2), e.elementType = j, e.lanes = c, e;
        case q:
          return e = Bn(13, n, t, s), e.elementType = q, e.lanes = c, e;
        case le:
          return e = Bn(19, n, t, s), e.elementType = le, e.lanes = c, e;
        default:
          if (typeof e == "object" && e !== null)
            switch (e.$$typeof) {
              case H:
                m = 10;
                break e;
              case K:
                m = 9;
                break e;
              case F:
                m = 11;
                break e;
              case X:
                m = 14;
                break e;
              case I:
                m = 16, a = null;
                break e;
            }
          m = 29, n = Error(
            r(130, e === null ? "null" : typeof e, "")
          ), a = null;
      }
    return t = Bn(m, n, t, s), t.elementType = e, t.type = a, t.lanes = c, t;
  }
  function fi(e, t, n, a) {
    return e = Bn(7, e, a, t), e.lanes = n, e;
  }
  function eo(e, t, n) {
    return e = Bn(6, e, null, t), e.lanes = n, e;
  }
  function jd(e) {
    var t = Bn(18, null, null, 0);
    return t.stateNode = e, t;
  }
  function to(e, t, n) {
    return t = Bn(
      4,
      e.children !== null ? e.children : [],
      e.key,
      t
    ), t.lanes = n, t.stateNode = {
      containerInfo: e.containerInfo,
      pendingChildren: null,
      implementation: e.implementation
    }, t;
  }
  var Ud = /* @__PURE__ */ new WeakMap();
  function ll(e, t) {
    if (typeof e == "object" && e !== null) {
      var n = Ud.get(e);
      return n !== void 0 ? n : (t = {
        value: e,
        source: t,
        stack: Xt(t)
      }, Ud.set(e, t), t);
    }
    return {
      value: e,
      source: t,
      stack: Xt(t)
    };
  }
  var Zi = [], Ki = 0, ds = null, Xr = 0, al = [], il = 0, Aa = null, Ml = 1, Rl = "";
  function Jl(e, t) {
    Zi[Ki++] = Xr, Zi[Ki++] = ds, ds = e, Xr = t;
  }
  function Ld(e, t, n) {
    al[il++] = Ml, al[il++] = Rl, al[il++] = Aa, Aa = e;
    var a = Ml;
    e = Rl;
    var s = 32 - St(a) - 1;
    a &= ~(1 << s), n += 1;
    var c = 32 - St(t) + s;
    if (30 < c) {
      var m = s - s % 5;
      c = (a & (1 << m) - 1).toString(32), a >>= m, s -= m, Ml = 1 << 32 - St(t) + s | n << s | a, Rl = c + e;
    } else
      Ml = 1 << c | n << s | a, Rl = e;
  }
  function no(e) {
    e.return !== null && (Jl(e, 1), Ld(e, 1, 0));
  }
  function lo(e) {
    for (; e === ds; )
      ds = Zi[--Ki], Zi[Ki] = null, Xr = Zi[--Ki], Zi[Ki] = null;
    for (; e === Aa; )
      Aa = al[--il], al[il] = null, Rl = al[--il], al[il] = null, Ml = al[--il], al[il] = null;
  }
  function Hd(e, t) {
    al[il++] = Ml, al[il++] = Rl, al[il++] = Aa, Ml = t.id, Rl = t.overflow, Aa = e;
  }
  var Ft = null, it = null, je = !1, Ea = null, rl = !1, ao = Error(r(519));
  function wa(e) {
    var t = Error(
      r(
        418,
        1 < arguments.length && arguments[1] !== void 0 && arguments[1] ? "text" : "HTML",
        ""
      )
    );
    throw Qr(ll(t, e)), ao;
  }
  function Bd(e) {
    var t = e.stateNode, n = e.type, a = e.memoizedProps;
    switch (t[dt] = e, t[pt] = a, n) {
      case "dialog":
        Ce("cancel", t), Ce("close", t);
        break;
      case "iframe":
      case "object":
      case "embed":
        Ce("load", t);
        break;
      case "video":
      case "audio":
        for (n = 0; n < hu.length; n++)
          Ce(hu[n], t);
        break;
      case "source":
        Ce("error", t);
        break;
      case "img":
      case "image":
      case "link":
        Ce("error", t), Ce("load", t);
        break;
      case "details":
        Ce("toggle", t);
        break;
      case "input":
        Ce("invalid", t), Rr(
          t,
          a.value,
          a.defaultValue,
          a.checked,
          a.defaultChecked,
          a.type,
          a.name,
          !0
        );
        break;
      case "select":
        Ce("invalid", t);
        break;
      case "textarea":
        Ce("invalid", t), es(t, a.value, a.defaultValue, a.children);
    }
    n = a.children, typeof n != "string" && typeof n != "number" && typeof n != "bigint" || t.textContent === "" + n || a.suppressHydrationWarning === !0 || ng(t.textContent, n) ? (a.popover != null && (Ce("beforetoggle", t), Ce("toggle", t)), a.onScroll != null && Ce("scroll", t), a.onScrollEnd != null && Ce("scrollend", t), a.onClick != null && (t.onclick = O), t = !0) : t = !1, t || wa(e, !0);
  }
  function qd(e) {
    for (Ft = e.return; Ft; )
      switch (Ft.tag) {
        case 5:
        case 31:
        case 13:
          rl = !1;
          return;
        case 27:
        case 3:
          rl = !0;
          return;
        default:
          Ft = Ft.return;
      }
  }
  function $i(e) {
    if (e !== Ft) return !1;
    if (!je) return qd(e), je = !0, !1;
    var t = e.tag, n;
    if ((n = t !== 3 && t !== 27) && ((n = t === 5) && (n = e.type, n = !(n !== "form" && n !== "button") || Af(e.type, e.memoizedProps)), n = !n), n && it && wa(e), qd(e), t === 13) {
      if (e = e.memoizedState, e = e !== null ? e.dehydrated : null, !e) throw Error(r(317));
      it = fg(e);
    } else if (t === 31) {
      if (e = e.memoizedState, e = e !== null ? e.dehydrated : null, !e) throw Error(r(317));
      it = fg(e);
    } else
      t === 27 ? (t = it, qa(e.type) ? (e = Of, Of = null, it = e) : it = t) : it = Ft ? sl(e.stateNode.nextSibling) : null;
    return !0;
  }
  function hi() {
    it = Ft = null, je = !1;
  }
  function io() {
    var e = Ea;
    return e !== null && (An === null ? An = e : An.push.apply(
      An,
      e
    ), Ea = null), e;
  }
  function Qr(e) {
    Ea === null ? Ea = [e] : Ea.push(e);
  }
  var ro = z(null), di = null, Fl = null;
  function za(e, t, n) {
    te(ro, t._currentValue), t._currentValue = n;
  }
  function Wl(e) {
    e._currentValue = ro.current, V(ro);
  }
  function uo(e, t, n) {
    for (; e !== null; ) {
      var a = e.alternate;
      if ((e.childLanes & t) !== t ? (e.childLanes |= t, a !== null && (a.childLanes |= t)) : a !== null && (a.childLanes & t) !== t && (a.childLanes |= t), e === n) break;
      e = e.return;
    }
  }
  function so(e, t, n, a) {
    var s = e.child;
    for (s !== null && (s.return = e); s !== null; ) {
      var c = s.dependencies;
      if (c !== null) {
        var m = s.child;
        c = c.firstContext;
        e: for (; c !== null; ) {
          var _ = c;
          c = s;
          for (var w = 0; w < t.length; w++)
            if (_.context === t[w]) {
              c.lanes |= n, _ = c.alternate, _ !== null && (_.lanes |= n), uo(
                c.return,
                n,
                e
              ), a || (m = null);
              break e;
            }
          c = _.next;
        }
      } else if (s.tag === 18) {
        if (m = s.return, m === null) throw Error(r(341));
        m.lanes |= n, c = m.alternate, c !== null && (c.lanes |= n), uo(m, n, e), m = null;
      } else m = s.child;
      if (m !== null) m.return = s;
      else
        for (m = s; m !== null; ) {
          if (m === e) {
            m = null;
            break;
          }
          if (s = m.sibling, s !== null) {
            s.return = m.return, m = s;
            break;
          }
          m = m.return;
        }
      s = m;
    }
  }
  function Ji(e, t, n, a) {
    e = null;
    for (var s = t, c = !1; s !== null; ) {
      if (!c) {
        if ((s.flags & 524288) !== 0) c = !0;
        else if ((s.flags & 262144) !== 0) break;
      }
      if (s.tag === 10) {
        var m = s.alternate;
        if (m === null) throw Error(r(387));
        if (m = m.memoizedProps, m !== null) {
          var _ = s.type;
          Hn(s.pendingProps.value, m.value) || (e !== null ? e.push(_) : e = [_]);
        }
      } else if (s === de.current) {
        if (m = s.alternate, m === null) throw Error(r(387));
        m.memoizedState.memoizedState !== s.memoizedState.memoizedState && (e !== null ? e.push(yu) : e = [yu]);
      }
      s = s.return;
    }
    e !== null && so(
      t,
      e,
      n,
      a
    ), t.flags |= 262144;
  }
  function ps(e) {
    for (e = e.firstContext; e !== null; ) {
      if (!Hn(
        e.context._currentValue,
        e.memoizedValue
      ))
        return !0;
      e = e.next;
    }
    return !1;
  }
  function pi(e) {
    di = e, Fl = null, e = e.dependencies, e !== null && (e.firstContext = null);
  }
  function Wt(e) {
    return Yd(di, e);
  }
  function ms(e, t) {
    return di === null && pi(e), Yd(e, t);
  }
  function Yd(e, t) {
    var n = t._currentValue;
    if (t = { context: t, memoizedValue: n, next: null }, Fl === null) {
      if (e === null) throw Error(r(308));
      Fl = t, e.dependencies = { lanes: 0, firstContext: t }, e.flags |= 524288;
    } else Fl = Fl.next = t;
    return n;
  }
  var V_ = typeof AbortController < "u" ? AbortController : function() {
    var e = [], t = this.signal = {
      aborted: !1,
      addEventListener: function(n, a) {
        e.push(a);
      }
    };
    this.abort = function() {
      t.aborted = !0, e.forEach(function(n) {
        return n();
      });
    };
  }, Z_ = o.unstable_scheduleCallback, K_ = o.unstable_NormalPriority, zt = {
    $$typeof: H,
    Consumer: null,
    Provider: null,
    _currentValue: null,
    _currentValue2: null,
    _threadCount: 0
  };
  function co() {
    return {
      controller: new V_(),
      data: /* @__PURE__ */ new Map(),
      refCount: 0
    };
  }
  function Vr(e) {
    e.refCount--, e.refCount === 0 && Z_(K_, function() {
      e.controller.abort();
    });
  }
  var Zr = null, oo = 0, Fi = 0, Wi = null;
  function $_(e, t) {
    if (Zr === null) {
      var n = Zr = [];
      oo = 0, Fi = mf(), Wi = {
        status: "pending",
        value: void 0,
        then: function(a) {
          n.push(a);
        }
      };
    }
    return oo++, t.then(Gd, Gd), t;
  }
  function Gd() {
    if (--oo === 0 && Zr !== null) {
      Wi !== null && (Wi.status = "fulfilled");
      var e = Zr;
      Zr = null, Fi = 0, Wi = null;
      for (var t = 0; t < e.length; t++) (0, e[t])();
    }
  }
  function J_(e, t) {
    var n = [], a = {
      status: "pending",
      value: null,
      reason: null,
      then: function(s) {
        n.push(s);
      }
    };
    return e.then(
      function() {
        a.status = "fulfilled", a.value = t;
        for (var s = 0; s < n.length; s++) (0, n[s])(t);
      },
      function(s) {
        for (a.status = "rejected", a.reason = s, s = 0; s < n.length; s++)
          (0, n[s])(void 0);
      }
    ), a;
  }
  var Xd = L.S;
  L.S = function(e, t) {
    wm = vt(), typeof t == "object" && t !== null && typeof t.then == "function" && $_(e, t), Xd !== null && Xd(e, t);
  };
  var mi = z(null);
  function fo() {
    var e = mi.current;
    return e !== null ? e : tt.pooledCache;
  }
  function gs(e, t) {
    t === null ? te(mi, mi.current) : te(mi, t.pool);
  }
  function Qd() {
    var e = fo();
    return e === null ? null : { parent: zt._currentValue, pool: e };
  }
  var Ii = Error(r(460)), ho = Error(r(474)), ys = Error(r(542)), _s = { then: function() {
  } };
  function Vd(e) {
    return e = e.status, e === "fulfilled" || e === "rejected";
  }
  function Zd(e, t, n) {
    switch (n = e[n], n === void 0 ? e.push(t) : n !== t && (t.then(O, O), t = n), t.status) {
      case "fulfilled":
        return t.value;
      case "rejected":
        throw e = t.reason, $d(e), e;
      default:
        if (typeof t.status == "string") t.then(O, O);
        else {
          if (e = tt, e !== null && 100 < e.shellSuspendCounter)
            throw Error(r(482));
          e = t, e.status = "pending", e.then(
            function(a) {
              if (t.status === "pending") {
                var s = t;
                s.status = "fulfilled", s.value = a;
              }
            },
            function(a) {
              if (t.status === "pending") {
                var s = t;
                s.status = "rejected", s.reason = a;
              }
            }
          );
        }
        switch (t.status) {
          case "fulfilled":
            return t.value;
          case "rejected":
            throw e = t.reason, $d(e), e;
        }
        throw yi = t, Ii;
    }
  }
  function gi(e) {
    try {
      var t = e._init;
      return t(e._payload);
    } catch (n) {
      throw n !== null && typeof n == "object" && typeof n.then == "function" ? (yi = n, Ii) : n;
    }
  }
  var yi = null;
  function Kd() {
    if (yi === null) throw Error(r(459));
    var e = yi;
    return yi = null, e;
  }
  function $d(e) {
    if (e === Ii || e === ys)
      throw Error(r(483));
  }
  var Pi = null, Kr = 0;
  function vs(e) {
    var t = Kr;
    return Kr += 1, Pi === null && (Pi = []), Zd(Pi, e, t);
  }
  function $r(e, t) {
    t = t.props.ref, e.ref = t !== void 0 ? t : null;
  }
  function bs(e, t) {
    throw t.$$typeof === E ? Error(r(525)) : (e = Object.prototype.toString.call(t), Error(
      r(
        31,
        e === "[object Object]" ? "object with keys {" + Object.keys(t).join(", ") + "}" : e
      )
    ));
  }
  function Jd(e) {
    function t(M, k) {
      if (e) {
        var D = M.deletions;
        D === null ? (M.deletions = [k], M.flags |= 16) : D.push(k);
      }
    }
    function n(M, k) {
      if (!e) return null;
      for (; k !== null; )
        t(M, k), k = k.sibling;
      return null;
    }
    function a(M) {
      for (var k = /* @__PURE__ */ new Map(); M !== null; )
        M.key !== null ? k.set(M.key, M) : k.set(M.index, M), M = M.sibling;
      return k;
    }
    function s(M, k) {
      return M = $l(M, k), M.index = 0, M.sibling = null, M;
    }
    function c(M, k, D) {
      return M.index = D, e ? (D = M.alternate, D !== null ? (D = D.index, D < k ? (M.flags |= 67108866, k) : D) : (M.flags |= 67108866, k)) : (M.flags |= 1048576, k);
    }
    function m(M) {
      return e && M.alternate === null && (M.flags |= 67108866), M;
    }
    function _(M, k, D, $) {
      return k === null || k.tag !== 6 ? (k = eo(D, M.mode, $), k.return = M, k) : (k = s(k, D), k.return = M, k);
    }
    function w(M, k, D, $) {
      var me = D.type;
      return me === A ? Z(
        M,
        k,
        D.props.children,
        $,
        D.key
      ) : k !== null && (k.elementType === me || typeof me == "object" && me !== null && me.$$typeof === I && gi(me) === k.type) ? (k = s(k, D.props), $r(k, D), k.return = M, k) : (k = hs(
        D.type,
        D.key,
        D.props,
        null,
        M.mode,
        $
      ), $r(k, D), k.return = M, k);
    }
    function N(M, k, D, $) {
      return k === null || k.tag !== 4 || k.stateNode.containerInfo !== D.containerInfo || k.stateNode.implementation !== D.implementation ? (k = to(D, M.mode, $), k.return = M, k) : (k = s(k, D.children || []), k.return = M, k);
    }
    function Z(M, k, D, $, me) {
      return k === null || k.tag !== 7 ? (k = fi(
        D,
        M.mode,
        $,
        me
      ), k.return = M, k) : (k = s(k, D), k.return = M, k);
    }
    function J(M, k, D) {
      if (typeof k == "string" && k !== "" || typeof k == "number" || typeof k == "bigint")
        return k = eo(
          "" + k,
          M.mode,
          D
        ), k.return = M, k;
      if (typeof k == "object" && k !== null) {
        switch (k.$$typeof) {
          case b:
            return D = hs(
              k.type,
              k.key,
              k.props,
              null,
              M.mode,
              D
            ), $r(D, k), D.return = M, D;
          case R:
            return k = to(
              k,
              M.mode,
              D
            ), k.return = M, k;
          case I:
            return k = gi(k), J(M, k, D);
        }
        if (Se(k) || ve(k))
          return k = fi(
            k,
            M.mode,
            D,
            null
          ), k.return = M, k;
        if (typeof k.then == "function")
          return J(M, vs(k), D);
        if (k.$$typeof === H)
          return J(
            M,
            ms(M, k),
            D
          );
        bs(M, k);
      }
      return null;
    }
    function U(M, k, D, $) {
      var me = k !== null ? k.key : null;
      if (typeof D == "string" && D !== "" || typeof D == "number" || typeof D == "bigint")
        return me !== null ? null : _(M, k, "" + D, $);
      if (typeof D == "object" && D !== null) {
        switch (D.$$typeof) {
          case b:
            return D.key === me ? w(M, k, D, $) : null;
          case R:
            return D.key === me ? N(M, k, D, $) : null;
          case I:
            return D = gi(D), U(M, k, D, $);
        }
        if (Se(D) || ve(D))
          return me !== null ? null : Z(M, k, D, $, null);
        if (typeof D.then == "function")
          return U(
            M,
            k,
            vs(D),
            $
          );
        if (D.$$typeof === H)
          return U(
            M,
            k,
            ms(M, D),
            $
          );
        bs(M, D);
      }
      return null;
    }
    function B(M, k, D, $, me) {
      if (typeof $ == "string" && $ !== "" || typeof $ == "number" || typeof $ == "bigint")
        return M = M.get(D) || null, _(k, M, "" + $, me);
      if (typeof $ == "object" && $ !== null) {
        switch ($.$$typeof) {
          case b:
            return M = M.get(
              $.key === null ? D : $.key
            ) || null, w(k, M, $, me);
          case R:
            return M = M.get(
              $.key === null ? D : $.key
            ) || null, N(k, M, $, me);
          case I:
            return $ = gi($), B(
              M,
              k,
              D,
              $,
              me
            );
        }
        if (Se($) || ve($))
          return M = M.get(D) || null, Z(k, M, $, me, null);
        if (typeof $.then == "function")
          return B(
            M,
            k,
            D,
            vs($),
            me
          );
        if ($.$$typeof === H)
          return B(
            M,
            k,
            D,
            ms(k, $),
            me
          );
        bs(k, $);
      }
      return null;
    }
    function fe(M, k, D, $) {
      for (var me = null, Be = null, he = k, we = k = 0, Ne = null; he !== null && we < D.length; we++) {
        he.index > we ? (Ne = he, he = null) : Ne = he.sibling;
        var qe = U(
          M,
          he,
          D[we],
          $
        );
        if (qe === null) {
          he === null && (he = Ne);
          break;
        }
        e && he && qe.alternate === null && t(M, he), k = c(qe, k, we), Be === null ? me = qe : Be.sibling = qe, Be = qe, he = Ne;
      }
      if (we === D.length)
        return n(M, he), je && Jl(M, we), me;
      if (he === null) {
        for (; we < D.length; we++)
          he = J(M, D[we], $), he !== null && (k = c(
            he,
            k,
            we
          ), Be === null ? me = he : Be.sibling = he, Be = he);
        return je && Jl(M, we), me;
      }
      for (he = a(he); we < D.length; we++)
        Ne = B(
          he,
          M,
          we,
          D[we],
          $
        ), Ne !== null && (e && Ne.alternate !== null && he.delete(
          Ne.key === null ? we : Ne.key
        ), k = c(
          Ne,
          k,
          we
        ), Be === null ? me = Ne : Be.sibling = Ne, Be = Ne);
      return e && he.forEach(function(Va) {
        return t(M, Va);
      }), je && Jl(M, we), me;
    }
    function ye(M, k, D, $) {
      if (D == null) throw Error(r(151));
      for (var me = null, Be = null, he = k, we = k = 0, Ne = null, qe = D.next(); he !== null && !qe.done; we++, qe = D.next()) {
        he.index > we ? (Ne = he, he = null) : Ne = he.sibling;
        var Va = U(M, he, qe.value, $);
        if (Va === null) {
          he === null && (he = Ne);
          break;
        }
        e && he && Va.alternate === null && t(M, he), k = c(Va, k, we), Be === null ? me = Va : Be.sibling = Va, Be = Va, he = Ne;
      }
      if (qe.done)
        return n(M, he), je && Jl(M, we), me;
      if (he === null) {
        for (; !qe.done; we++, qe = D.next())
          qe = J(M, qe.value, $), qe !== null && (k = c(qe, k, we), Be === null ? me = qe : Be.sibling = qe, Be = qe);
        return je && Jl(M, we), me;
      }
      for (he = a(he); !qe.done; we++, qe = D.next())
        qe = B(he, M, we, qe.value, $), qe !== null && (e && qe.alternate !== null && he.delete(qe.key === null ? we : qe.key), k = c(qe, k, we), Be === null ? me = qe : Be.sibling = qe, Be = qe);
      return e && he.forEach(function(rv) {
        return t(M, rv);
      }), je && Jl(M, we), me;
    }
    function Ie(M, k, D, $) {
      if (typeof D == "object" && D !== null && D.type === A && D.key === null && (D = D.props.children), typeof D == "object" && D !== null) {
        switch (D.$$typeof) {
          case b:
            e: {
              for (var me = D.key; k !== null; ) {
                if (k.key === me) {
                  if (me = D.type, me === A) {
                    if (k.tag === 7) {
                      n(
                        M,
                        k.sibling
                      ), $ = s(
                        k,
                        D.props.children
                      ), $.return = M, M = $;
                      break e;
                    }
                  } else if (k.elementType === me || typeof me == "object" && me !== null && me.$$typeof === I && gi(me) === k.type) {
                    n(
                      M,
                      k.sibling
                    ), $ = s(k, D.props), $r($, D), $.return = M, M = $;
                    break e;
                  }
                  n(M, k);
                  break;
                } else t(M, k);
                k = k.sibling;
              }
              D.type === A ? ($ = fi(
                D.props.children,
                M.mode,
                $,
                D.key
              ), $.return = M, M = $) : ($ = hs(
                D.type,
                D.key,
                D.props,
                null,
                M.mode,
                $
              ), $r($, D), $.return = M, M = $);
            }
            return m(M);
          case R:
            e: {
              for (me = D.key; k !== null; ) {
                if (k.key === me)
                  if (k.tag === 4 && k.stateNode.containerInfo === D.containerInfo && k.stateNode.implementation === D.implementation) {
                    n(
                      M,
                      k.sibling
                    ), $ = s(k, D.children || []), $.return = M, M = $;
                    break e;
                  } else {
                    n(M, k);
                    break;
                  }
                else t(M, k);
                k = k.sibling;
              }
              $ = to(D, M.mode, $), $.return = M, M = $;
            }
            return m(M);
          case I:
            return D = gi(D), Ie(
              M,
              k,
              D,
              $
            );
        }
        if (Se(D))
          return fe(
            M,
            k,
            D,
            $
          );
        if (ve(D)) {
          if (me = ve(D), typeof me != "function") throw Error(r(150));
          return D = me.call(D), ye(
            M,
            k,
            D,
            $
          );
        }
        if (typeof D.then == "function")
          return Ie(
            M,
            k,
            vs(D),
            $
          );
        if (D.$$typeof === H)
          return Ie(
            M,
            k,
            ms(M, D),
            $
          );
        bs(M, D);
      }
      return typeof D == "string" && D !== "" || typeof D == "number" || typeof D == "bigint" ? (D = "" + D, k !== null && k.tag === 6 ? (n(M, k.sibling), $ = s(k, D), $.return = M, M = $) : (n(M, k), $ = eo(D, M.mode, $), $.return = M, M = $), m(M)) : n(M, k);
    }
    return function(M, k, D, $) {
      try {
        Kr = 0;
        var me = Ie(
          M,
          k,
          D,
          $
        );
        return Pi = null, me;
      } catch (he) {
        if (he === Ii || he === ys) throw he;
        var Be = Bn(29, he, null, M.mode);
        return Be.lanes = $, Be.return = M, Be;
      } finally {
      }
    };
  }
  var _i = Jd(!0), Fd = Jd(!1), ka = !1;
  function po(e) {
    e.updateQueue = {
      baseState: e.memoizedState,
      firstBaseUpdate: null,
      lastBaseUpdate: null,
      shared: { pending: null, lanes: 0, hiddenCallbacks: null },
      callbacks: null
    };
  }
  function mo(e, t) {
    e = e.updateQueue, t.updateQueue === e && (t.updateQueue = {
      baseState: e.baseState,
      firstBaseUpdate: e.firstBaseUpdate,
      lastBaseUpdate: e.lastBaseUpdate,
      shared: e.shared,
      callbacks: null
    });
  }
  function Oa(e) {
    return { lane: e, tag: 0, payload: null, callback: null, next: null };
  }
  function Ma(e, t, n) {
    var a = e.updateQueue;
    if (a === null) return null;
    if (a = a.shared, (Xe & 2) !== 0) {
      var s = a.pending;
      return s === null ? t.next = t : (t.next = s.next, s.next = t), a.pending = t, t = fs(e), Dd(e, null, n), t;
    }
    return os(e, a, t, n), fs(e);
  }
  function Jr(e, t, n) {
    if (t = t.updateQueue, t !== null && (t = t.shared, (n & 4194048) !== 0)) {
      var a = t.lanes;
      a &= e.pendingLanes, n |= a, t.lanes = n, Yl(e, n);
    }
  }
  function go(e, t) {
    var n = e.updateQueue, a = e.alternate;
    if (a !== null && (a = a.updateQueue, n === a)) {
      var s = null, c = null;
      if (n = n.firstBaseUpdate, n !== null) {
        do {
          var m = {
            lane: n.lane,
            tag: n.tag,
            payload: n.payload,
            callback: null,
            next: null
          };
          c === null ? s = c = m : c = c.next = m, n = n.next;
        } while (n !== null);
        c === null ? s = c = t : c = c.next = t;
      } else s = c = t;
      n = {
        baseState: a.baseState,
        firstBaseUpdate: s,
        lastBaseUpdate: c,
        shared: a.shared,
        callbacks: a.callbacks
      }, e.updateQueue = n;
      return;
    }
    e = n.lastBaseUpdate, e === null ? n.firstBaseUpdate = t : e.next = t, n.lastBaseUpdate = t;
  }
  var yo = !1;
  function Fr() {
    if (yo) {
      var e = Wi;
      if (e !== null) throw e;
    }
  }
  function Wr(e, t, n, a) {
    yo = !1;
    var s = e.updateQueue;
    ka = !1;
    var c = s.firstBaseUpdate, m = s.lastBaseUpdate, _ = s.shared.pending;
    if (_ !== null) {
      s.shared.pending = null;
      var w = _, N = w.next;
      w.next = null, m === null ? c = N : m.next = N, m = w;
      var Z = e.alternate;
      Z !== null && (Z = Z.updateQueue, _ = Z.lastBaseUpdate, _ !== m && (_ === null ? Z.firstBaseUpdate = N : _.next = N, Z.lastBaseUpdate = w));
    }
    if (c !== null) {
      var J = s.baseState;
      m = 0, Z = N = w = null, _ = c;
      do {
        var U = _.lane & -536870913, B = U !== _.lane;
        if (B ? (De & U) === U : (a & U) === U) {
          U !== 0 && U === Fi && (yo = !0), Z !== null && (Z = Z.next = {
            lane: 0,
            tag: _.tag,
            payload: _.payload,
            callback: null,
            next: null
          });
          e: {
            var fe = e, ye = _;
            U = t;
            var Ie = n;
            switch (ye.tag) {
              case 1:
                if (fe = ye.payload, typeof fe == "function") {
                  J = fe.call(Ie, J, U);
                  break e;
                }
                J = fe;
                break e;
              case 3:
                fe.flags = fe.flags & -65537 | 128;
              case 0:
                if (fe = ye.payload, U = typeof fe == "function" ? fe.call(Ie, J, U) : fe, U == null) break e;
                J = S({}, J, U);
                break e;
              case 2:
                ka = !0;
            }
          }
          U = _.callback, U !== null && (e.flags |= 64, B && (e.flags |= 8192), B = s.callbacks, B === null ? s.callbacks = [U] : B.push(U));
        } else
          B = {
            lane: U,
            tag: _.tag,
            payload: _.payload,
            callback: _.callback,
            next: null
          }, Z === null ? (N = Z = B, w = J) : Z = Z.next = B, m |= U;
        if (_ = _.next, _ === null) {
          if (_ = s.shared.pending, _ === null)
            break;
          B = _, _ = B.next, B.next = null, s.lastBaseUpdate = B, s.shared.pending = null;
        }
      } while (!0);
      Z === null && (w = J), s.baseState = w, s.firstBaseUpdate = N, s.lastBaseUpdate = Z, c === null && (s.shared.lanes = 0), ja |= m, e.lanes = m, e.memoizedState = J;
    }
  }
  function Wd(e, t) {
    if (typeof e != "function")
      throw Error(r(191, e));
    e.call(t);
  }
  function Id(e, t) {
    var n = e.callbacks;
    if (n !== null)
      for (e.callbacks = null, e = 0; e < n.length; e++)
        Wd(n[e], t);
  }
  var er = z(null), Ss = z(0);
  function Pd(e, t) {
    e = ra, te(Ss, e), te(er, t), ra = e | t.baseLanes;
  }
  function _o() {
    te(Ss, ra), te(er, er.current);
  }
  function vo() {
    ra = Ss.current, V(er), V(Ss);
  }
  var qn = z(null), ul = null;
  function Ra(e) {
    var t = e.alternate;
    te(xt, xt.current & 1), te(qn, e), ul === null && (t === null || er.current !== null || t.memoizedState !== null) && (ul = e);
  }
  function bo(e) {
    te(xt, xt.current), te(qn, e), ul === null && (ul = e);
  }
  function ep(e) {
    e.tag === 22 ? (te(xt, xt.current), te(qn, e), ul === null && (ul = e)) : Ca();
  }
  function Ca() {
    te(xt, xt.current), te(qn, qn.current);
  }
  function Yn(e) {
    V(qn), ul === e && (ul = null), V(xt);
  }
  var xt = z(0);
  function xs(e) {
    for (var t = e; t !== null; ) {
      if (t.tag === 13) {
        var n = t.memoizedState;
        if (n !== null && (n = n.dehydrated, n === null || zf(n) || kf(n)))
          return t;
      } else if (t.tag === 19 && (t.memoizedProps.revealOrder === "forwards" || t.memoizedProps.revealOrder === "backwards" || t.memoizedProps.revealOrder === "unstable_legacy-backwards" || t.memoizedProps.revealOrder === "together")) {
        if ((t.flags & 128) !== 0) return t;
      } else if (t.child !== null) {
        t.child.return = t, t = t.child;
        continue;
      }
      if (t === e) break;
      for (; t.sibling === null; ) {
        if (t.return === null || t.return === e) return null;
        t = t.return;
      }
      t.sibling.return = t.return, t = t.sibling;
    }
    return null;
  }
  var Il = 0, Ee = null, Fe = null, kt = null, Ts = !1, tr = !1, vi = !1, As = 0, Ir = 0, nr = null, F_ = 0;
  function mt() {
    throw Error(r(321));
  }
  function So(e, t) {
    if (t === null) return !1;
    for (var n = 0; n < t.length && n < e.length; n++)
      if (!Hn(e[n], t[n])) return !1;
    return !0;
  }
  function xo(e, t, n, a, s, c) {
    return Il = c, Ee = t, t.memoizedState = null, t.updateQueue = null, t.lanes = 0, L.H = e === null || e.memoizedState === null ? Lp : Lo, vi = !1, c = n(a, s), vi = !1, tr && (c = np(
      t,
      n,
      a,
      s
    )), tp(e), c;
  }
  function tp(e) {
    L.H = tu;
    var t = Fe !== null && Fe.next !== null;
    if (Il = 0, kt = Fe = Ee = null, Ts = !1, Ir = 0, nr = null, t) throw Error(r(300));
    e === null || Ot || (e = e.dependencies, e !== null && ps(e) && (Ot = !0));
  }
  function np(e, t, n, a) {
    Ee = e;
    var s = 0;
    do {
      if (tr && (nr = null), Ir = 0, tr = !1, 25 <= s) throw Error(r(301));
      if (s += 1, kt = Fe = null, e.updateQueue != null) {
        var c = e.updateQueue;
        c.lastEffect = null, c.events = null, c.stores = null, c.memoCache != null && (c.memoCache.index = 0);
      }
      L.H = Hp, c = t(n, a);
    } while (tr);
    return c;
  }
  function W_() {
    var e = L.H, t = e.useState()[0];
    return t = typeof t.then == "function" ? Pr(t) : t, e = e.useState()[0], (Fe !== null ? Fe.memoizedState : null) !== e && (Ee.flags |= 1024), t;
  }
  function To() {
    var e = As !== 0;
    return As = 0, e;
  }
  function Ao(e, t, n) {
    t.updateQueue = e.updateQueue, t.flags &= -2053, e.lanes &= ~n;
  }
  function Eo(e) {
    if (Ts) {
      for (e = e.memoizedState; e !== null; ) {
        var t = e.queue;
        t !== null && (t.pending = null), e = e.next;
      }
      Ts = !1;
    }
    Il = 0, kt = Fe = Ee = null, tr = !1, Ir = As = 0, nr = null;
  }
  function dn() {
    var e = {
      memoizedState: null,
      baseState: null,
      baseQueue: null,
      queue: null,
      next: null
    };
    return kt === null ? Ee.memoizedState = kt = e : kt = kt.next = e, kt;
  }
  function Tt() {
    if (Fe === null) {
      var e = Ee.alternate;
      e = e !== null ? e.memoizedState : null;
    } else e = Fe.next;
    var t = kt === null ? Ee.memoizedState : kt.next;
    if (t !== null)
      kt = t, Fe = e;
    else {
      if (e === null)
        throw Ee.alternate === null ? Error(r(467)) : Error(r(310));
      Fe = e, e = {
        memoizedState: Fe.memoizedState,
        baseState: Fe.baseState,
        baseQueue: Fe.baseQueue,
        queue: Fe.queue,
        next: null
      }, kt === null ? Ee.memoizedState = kt = e : kt = kt.next = e;
    }
    return kt;
  }
  function Es() {
    return { lastEffect: null, events: null, stores: null, memoCache: null };
  }
  function Pr(e) {
    var t = Ir;
    return Ir += 1, nr === null && (nr = []), e = Zd(nr, e, t), t = Ee, (kt === null ? t.memoizedState : kt.next) === null && (t = t.alternate, L.H = t === null || t.memoizedState === null ? Lp : Lo), e;
  }
  function ws(e) {
    if (e !== null && typeof e == "object") {
      if (typeof e.then == "function") return Pr(e);
      if (e.$$typeof === H) return Wt(e);
    }
    throw Error(r(438, String(e)));
  }
  function wo(e) {
    var t = null, n = Ee.updateQueue;
    if (n !== null && (t = n.memoCache), t == null) {
      var a = Ee.alternate;
      a !== null && (a = a.updateQueue, a !== null && (a = a.memoCache, a != null && (t = {
        data: a.data.map(function(s) {
          return s.slice();
        }),
        index: 0
      })));
    }
    if (t == null && (t = { data: [], index: 0 }), n === null && (n = Es(), Ee.updateQueue = n), n.memoCache = t, n = t.data[t.index], n === void 0)
      for (n = t.data[t.index] = Array(e), a = 0; a < e; a++)
        n[a] = ce;
    return t.index++, n;
  }
  function Pl(e, t) {
    return typeof t == "function" ? t(e) : t;
  }
  function zs(e) {
    var t = Tt();
    return zo(t, Fe, e);
  }
  function zo(e, t, n) {
    var a = e.queue;
    if (a === null) throw Error(r(311));
    a.lastRenderedReducer = n;
    var s = e.baseQueue, c = a.pending;
    if (c !== null) {
      if (s !== null) {
        var m = s.next;
        s.next = c.next, c.next = m;
      }
      t.baseQueue = s = c, a.pending = null;
    }
    if (c = e.baseState, s === null) e.memoizedState = c;
    else {
      t = s.next;
      var _ = m = null, w = null, N = t, Z = !1;
      do {
        var J = N.lane & -536870913;
        if (J !== N.lane ? (De & J) === J : (Il & J) === J) {
          var U = N.revertLane;
          if (U === 0)
            w !== null && (w = w.next = {
              lane: 0,
              revertLane: 0,
              gesture: null,
              action: N.action,
              hasEagerState: N.hasEagerState,
              eagerState: N.eagerState,
              next: null
            }), J === Fi && (Z = !0);
          else if ((Il & U) === U) {
            N = N.next, U === Fi && (Z = !0);
            continue;
          } else
            J = {
              lane: 0,
              revertLane: N.revertLane,
              gesture: null,
              action: N.action,
              hasEagerState: N.hasEagerState,
              eagerState: N.eagerState,
              next: null
            }, w === null ? (_ = w = J, m = c) : w = w.next = J, Ee.lanes |= U, ja |= U;
          J = N.action, vi && n(c, J), c = N.hasEagerState ? N.eagerState : n(c, J);
        } else
          U = {
            lane: J,
            revertLane: N.revertLane,
            gesture: N.gesture,
            action: N.action,
            hasEagerState: N.hasEagerState,
            eagerState: N.eagerState,
            next: null
          }, w === null ? (_ = w = U, m = c) : w = w.next = U, Ee.lanes |= J, ja |= J;
        N = N.next;
      } while (N !== null && N !== t);
      if (w === null ? m = c : w.next = _, !Hn(c, e.memoizedState) && (Ot = !0, Z && (n = Wi, n !== null)))
        throw n;
      e.memoizedState = c, e.baseState = m, e.baseQueue = w, a.lastRenderedState = c;
    }
    return s === null && (a.lanes = 0), [e.memoizedState, a.dispatch];
  }
  function ko(e) {
    var t = Tt(), n = t.queue;
    if (n === null) throw Error(r(311));
    n.lastRenderedReducer = e;
    var a = n.dispatch, s = n.pending, c = t.memoizedState;
    if (s !== null) {
      n.pending = null;
      var m = s = s.next;
      do
        c = e(c, m.action), m = m.next;
      while (m !== s);
      Hn(c, t.memoizedState) || (Ot = !0), t.memoizedState = c, t.baseQueue === null && (t.baseState = c), n.lastRenderedState = c;
    }
    return [c, a];
  }
  function lp(e, t, n) {
    var a = Ee, s = Tt(), c = je;
    if (c) {
      if (n === void 0) throw Error(r(407));
      n = n();
    } else n = t();
    var m = !Hn(
      (Fe || s).memoizedState,
      n
    );
    if (m && (s.memoizedState = n, Ot = !0), s = s.queue, Ro(rp.bind(null, a, s, e), [
      e
    ]), s.getSnapshot !== t || m || kt !== null && kt.memoizedState.tag & 1) {
      if (a.flags |= 2048, lr(
        9,
        { destroy: void 0 },
        ip.bind(
          null,
          a,
          s,
          n,
          t
        ),
        null
      ), tt === null) throw Error(r(349));
      c || (Il & 127) !== 0 || ap(a, t, n);
    }
    return n;
  }
  function ap(e, t, n) {
    e.flags |= 16384, e = { getSnapshot: t, value: n }, t = Ee.updateQueue, t === null ? (t = Es(), Ee.updateQueue = t, t.stores = [e]) : (n = t.stores, n === null ? t.stores = [e] : n.push(e));
  }
  function ip(e, t, n, a) {
    t.value = n, t.getSnapshot = a, up(t) && sp(e);
  }
  function rp(e, t, n) {
    return n(function() {
      up(t) && sp(e);
    });
  }
  function up(e) {
    var t = e.getSnapshot;
    e = e.value;
    try {
      var n = t();
      return !Hn(e, n);
    } catch {
      return !0;
    }
  }
  function sp(e) {
    var t = oi(e, 2);
    t !== null && En(t, e, 2);
  }
  function Oo(e) {
    var t = dn();
    if (typeof e == "function") {
      var n = e;
      if (e = n(), vi) {
        Vt(!0);
        try {
          n();
        } finally {
          Vt(!1);
        }
      }
    }
    return t.memoizedState = t.baseState = e, t.queue = {
      pending: null,
      lanes: 0,
      dispatch: null,
      lastRenderedReducer: Pl,
      lastRenderedState: e
    }, t;
  }
  function cp(e, t, n, a) {
    return e.baseState = n, zo(
      e,
      Fe,
      typeof a == "function" ? a : Pl
    );
  }
  function I_(e, t, n, a, s) {
    if (Ms(e)) throw Error(r(485));
    if (e = t.action, e !== null) {
      var c = {
        payload: s,
        action: e,
        next: null,
        isTransition: !0,
        status: "pending",
        value: null,
        reason: null,
        listeners: [],
        then: function(m) {
          c.listeners.push(m);
        }
      };
      L.T !== null ? n(!0) : c.isTransition = !1, a(c), n = t.pending, n === null ? (c.next = t.pending = c, op(t, c)) : (c.next = n.next, t.pending = n.next = c);
    }
  }
  function op(e, t) {
    var n = t.action, a = t.payload, s = e.state;
    if (t.isTransition) {
      var c = L.T, m = {};
      L.T = m;
      try {
        var _ = n(s, a), w = L.S;
        w !== null && w(m, _), fp(e, t, _);
      } catch (N) {
        Mo(e, t, N);
      } finally {
        c !== null && m.types !== null && (c.types = m.types), L.T = c;
      }
    } else
      try {
        c = n(s, a), fp(e, t, c);
      } catch (N) {
        Mo(e, t, N);
      }
  }
  function fp(e, t, n) {
    n !== null && typeof n == "object" && typeof n.then == "function" ? n.then(
      function(a) {
        hp(e, t, a);
      },
      function(a) {
        return Mo(e, t, a);
      }
    ) : hp(e, t, n);
  }
  function hp(e, t, n) {
    t.status = "fulfilled", t.value = n, dp(t), e.state = n, t = e.pending, t !== null && (n = t.next, n === t ? e.pending = null : (n = n.next, t.next = n, op(e, n)));
  }
  function Mo(e, t, n) {
    var a = e.pending;
    if (e.pending = null, a !== null) {
      a = a.next;
      do
        t.status = "rejected", t.reason = n, dp(t), t = t.next;
      while (t !== a);
    }
    e.action = null;
  }
  function dp(e) {
    e = e.listeners;
    for (var t = 0; t < e.length; t++) (0, e[t])();
  }
  function pp(e, t) {
    return t;
  }
  function mp(e, t) {
    if (je) {
      var n = tt.formState;
      if (n !== null) {
        e: {
          var a = Ee;
          if (je) {
            if (it) {
              t: {
                for (var s = it, c = rl; s.nodeType !== 8; ) {
                  if (!c) {
                    s = null;
                    break t;
                  }
                  if (s = sl(
                    s.nextSibling
                  ), s === null) {
                    s = null;
                    break t;
                  }
                }
                c = s.data, s = c === "F!" || c === "F" ? s : null;
              }
              if (s) {
                it = sl(
                  s.nextSibling
                ), a = s.data === "F!";
                break e;
              }
            }
            wa(a);
          }
          a = !1;
        }
        a && (t = n[0]);
      }
    }
    return n = dn(), n.memoizedState = n.baseState = t, a = {
      pending: null,
      lanes: 0,
      dispatch: null,
      lastRenderedReducer: pp,
      lastRenderedState: t
    }, n.queue = a, n = Np.bind(
      null,
      Ee,
      a
    ), a.dispatch = n, a = Oo(!1), c = Uo.bind(
      null,
      Ee,
      !1,
      a.queue
    ), a = dn(), s = {
      state: t,
      dispatch: null,
      action: e,
      pending: null
    }, a.queue = s, n = I_.bind(
      null,
      Ee,
      s,
      c,
      n
    ), s.dispatch = n, a.memoizedState = e, [t, n, !1];
  }
  function gp(e) {
    var t = Tt();
    return yp(t, Fe, e);
  }
  function yp(e, t, n) {
    if (t = zo(
      e,
      t,
      pp
    )[0], e = zs(Pl)[0], typeof t == "object" && t !== null && typeof t.then == "function")
      try {
        var a = Pr(t);
      } catch (m) {
        throw m === Ii ? ys : m;
      }
    else a = t;
    t = Tt();
    var s = t.queue, c = s.dispatch;
    return n !== t.memoizedState && (Ee.flags |= 2048, lr(
      9,
      { destroy: void 0 },
      P_.bind(null, s, n),
      null
    )), [a, c, e];
  }
  function P_(e, t) {
    e.action = t;
  }
  function _p(e) {
    var t = Tt(), n = Fe;
    if (n !== null)
      return yp(t, n, e);
    Tt(), t = t.memoizedState, n = Tt();
    var a = n.queue.dispatch;
    return n.memoizedState = e, [t, a, !1];
  }
  function lr(e, t, n, a) {
    return e = { tag: e, create: n, deps: a, inst: t, next: null }, t = Ee.updateQueue, t === null && (t = Es(), Ee.updateQueue = t), n = t.lastEffect, n === null ? t.lastEffect = e.next = e : (a = n.next, n.next = e, e.next = a, t.lastEffect = e), e;
  }
  function vp() {
    return Tt().memoizedState;
  }
  function ks(e, t, n, a) {
    var s = dn();
    Ee.flags |= e, s.memoizedState = lr(
      1 | t,
      { destroy: void 0 },
      n,
      a === void 0 ? null : a
    );
  }
  function Os(e, t, n, a) {
    var s = Tt();
    a = a === void 0 ? null : a;
    var c = s.memoizedState.inst;
    Fe !== null && a !== null && So(a, Fe.memoizedState.deps) ? s.memoizedState = lr(t, c, n, a) : (Ee.flags |= e, s.memoizedState = lr(
      1 | t,
      c,
      n,
      a
    ));
  }
  function bp(e, t) {
    ks(8390656, 8, e, t);
  }
  function Ro(e, t) {
    Os(2048, 8, e, t);
  }
  function e1(e) {
    Ee.flags |= 4;
    var t = Ee.updateQueue;
    if (t === null)
      t = Es(), Ee.updateQueue = t, t.events = [e];
    else {
      var n = t.events;
      n === null ? t.events = [e] : n.push(e);
    }
  }
  function Sp(e) {
    var t = Tt().memoizedState;
    return e1({ ref: t, nextImpl: e }), function() {
      if ((Xe & 2) !== 0) throw Error(r(440));
      return t.impl.apply(void 0, arguments);
    };
  }
  function xp(e, t) {
    return Os(4, 2, e, t);
  }
  function Tp(e, t) {
    return Os(4, 4, e, t);
  }
  function Ap(e, t) {
    if (typeof t == "function") {
      e = e();
      var n = t(e);
      return function() {
        typeof n == "function" ? n() : t(null);
      };
    }
    if (t != null)
      return e = e(), t.current = e, function() {
        t.current = null;
      };
  }
  function Ep(e, t, n) {
    n = n != null ? n.concat([e]) : null, Os(4, 4, Ap.bind(null, t, e), n);
  }
  function Co() {
  }
  function wp(e, t) {
    var n = Tt();
    t = t === void 0 ? null : t;
    var a = n.memoizedState;
    return t !== null && So(t, a[1]) ? a[0] : (n.memoizedState = [e, t], e);
  }
  function zp(e, t) {
    var n = Tt();
    t = t === void 0 ? null : t;
    var a = n.memoizedState;
    if (t !== null && So(t, a[1]))
      return a[0];
    if (a = e(), vi) {
      Vt(!0);
      try {
        e();
      } finally {
        Vt(!1);
      }
    }
    return n.memoizedState = [a, t], a;
  }
  function Do(e, t, n) {
    return n === void 0 || (Il & 1073741824) !== 0 && (De & 261930) === 0 ? e.memoizedState = t : (e.memoizedState = n, e = km(), Ee.lanes |= e, ja |= e, n);
  }
  function kp(e, t, n, a) {
    return Hn(n, t) ? n : er.current !== null ? (e = Do(e, n, a), Hn(e, t) || (Ot = !0), e) : (Il & 42) === 0 || (Il & 1073741824) !== 0 && (De & 261930) === 0 ? (Ot = !0, e.memoizedState = n) : (e = km(), Ee.lanes |= e, ja |= e, t);
  }
  function Op(e, t, n, a, s) {
    var c = Y.p;
    Y.p = c !== 0 && 8 > c ? c : 8;
    var m = L.T, _ = {};
    L.T = _, Uo(e, !1, t, n);
    try {
      var w = s(), N = L.S;
      if (N !== null && N(_, w), w !== null && typeof w == "object" && typeof w.then == "function") {
        var Z = J_(
          w,
          a
        );
        eu(
          e,
          t,
          Z,
          Qn(e)
        );
      } else
        eu(
          e,
          t,
          a,
          Qn(e)
        );
    } catch (J) {
      eu(
        e,
        t,
        { then: function() {
        }, status: "rejected", reason: J },
        Qn()
      );
    } finally {
      Y.p = c, m !== null && _.types !== null && (m.types = _.types), L.T = m;
    }
  }
  function t1() {
  }
  function No(e, t, n, a) {
    if (e.tag !== 5) throw Error(r(476));
    var s = Mp(e).queue;
    Op(
      e,
      s,
      t,
      ie,
      n === null ? t1 : function() {
        return Rp(e), n(a);
      }
    );
  }
  function Mp(e) {
    var t = e.memoizedState;
    if (t !== null) return t;
    t = {
      memoizedState: ie,
      baseState: ie,
      baseQueue: null,
      queue: {
        pending: null,
        lanes: 0,
        dispatch: null,
        lastRenderedReducer: Pl,
        lastRenderedState: ie
      },
      next: null
    };
    var n = {};
    return t.next = {
      memoizedState: n,
      baseState: n,
      baseQueue: null,
      queue: {
        pending: null,
        lanes: 0,
        dispatch: null,
        lastRenderedReducer: Pl,
        lastRenderedState: n
      },
      next: null
    }, e.memoizedState = t, e = e.alternate, e !== null && (e.memoizedState = t), t;
  }
  function Rp(e) {
    var t = Mp(e);
    t.next === null && (t = e.alternate.memoizedState), eu(
      e,
      t.next.queue,
      {},
      Qn()
    );
  }
  function jo() {
    return Wt(yu);
  }
  function Cp() {
    return Tt().memoizedState;
  }
  function Dp() {
    return Tt().memoizedState;
  }
  function n1(e) {
    for (var t = e.return; t !== null; ) {
      switch (t.tag) {
        case 24:
        case 3:
          var n = Qn();
          e = Oa(n);
          var a = Ma(t, e, n);
          a !== null && (En(a, t, n), Jr(a, t, n)), t = { cache: co() }, e.payload = t;
          return;
      }
      t = t.return;
    }
  }
  function l1(e, t, n) {
    var a = Qn();
    n = {
      lane: a,
      revertLane: 0,
      gesture: null,
      action: n,
      hasEagerState: !1,
      eagerState: null,
      next: null
    }, Ms(e) ? jp(t, n) : (n = Ic(e, t, n, a), n !== null && (En(n, e, a), Up(n, t, a)));
  }
  function Np(e, t, n) {
    var a = Qn();
    eu(e, t, n, a);
  }
  function eu(e, t, n, a) {
    var s = {
      lane: a,
      revertLane: 0,
      gesture: null,
      action: n,
      hasEagerState: !1,
      eagerState: null,
      next: null
    };
    if (Ms(e)) jp(t, s);
    else {
      var c = e.alternate;
      if (e.lanes === 0 && (c === null || c.lanes === 0) && (c = t.lastRenderedReducer, c !== null))
        try {
          var m = t.lastRenderedState, _ = c(m, n);
          if (s.hasEagerState = !0, s.eagerState = _, Hn(_, m))
            return os(e, t, s, 0), tt === null && cs(), !1;
        } catch {
        } finally {
        }
      if (n = Ic(e, t, s, a), n !== null)
        return En(n, e, a), Up(n, t, a), !0;
    }
    return !1;
  }
  function Uo(e, t, n, a) {
    if (a = {
      lane: 2,
      revertLane: mf(),
      gesture: null,
      action: a,
      hasEagerState: !1,
      eagerState: null,
      next: null
    }, Ms(e)) {
      if (t) throw Error(r(479));
    } else
      t = Ic(
        e,
        n,
        a,
        2
      ), t !== null && En(t, e, 2);
  }
  function Ms(e) {
    var t = e.alternate;
    return e === Ee || t !== null && t === Ee;
  }
  function jp(e, t) {
    tr = Ts = !0;
    var n = e.pending;
    n === null ? t.next = t : (t.next = n.next, n.next = t), e.pending = t;
  }
  function Up(e, t, n) {
    if ((n & 4194048) !== 0) {
      var a = t.lanes;
      a &= e.pendingLanes, n |= a, t.lanes = n, Yl(e, n);
    }
  }
  var tu = {
    readContext: Wt,
    use: ws,
    useCallback: mt,
    useContext: mt,
    useEffect: mt,
    useImperativeHandle: mt,
    useLayoutEffect: mt,
    useInsertionEffect: mt,
    useMemo: mt,
    useReducer: mt,
    useRef: mt,
    useState: mt,
    useDebugValue: mt,
    useDeferredValue: mt,
    useTransition: mt,
    useSyncExternalStore: mt,
    useId: mt,
    useHostTransitionStatus: mt,
    useFormState: mt,
    useActionState: mt,
    useOptimistic: mt,
    useMemoCache: mt,
    useCacheRefresh: mt
  };
  tu.useEffectEvent = mt;
  var Lp = {
    readContext: Wt,
    use: ws,
    useCallback: function(e, t) {
      return dn().memoizedState = [
        e,
        t === void 0 ? null : t
      ], e;
    },
    useContext: Wt,
    useEffect: bp,
    useImperativeHandle: function(e, t, n) {
      n = n != null ? n.concat([e]) : null, ks(
        4194308,
        4,
        Ap.bind(null, t, e),
        n
      );
    },
    useLayoutEffect: function(e, t) {
      return ks(4194308, 4, e, t);
    },
    useInsertionEffect: function(e, t) {
      ks(4, 2, e, t);
    },
    useMemo: function(e, t) {
      var n = dn();
      t = t === void 0 ? null : t;
      var a = e();
      if (vi) {
        Vt(!0);
        try {
          e();
        } finally {
          Vt(!1);
        }
      }
      return n.memoizedState = [a, t], a;
    },
    useReducer: function(e, t, n) {
      var a = dn();
      if (n !== void 0) {
        var s = n(t);
        if (vi) {
          Vt(!0);
          try {
            n(t);
          } finally {
            Vt(!1);
          }
        }
      } else s = t;
      return a.memoizedState = a.baseState = s, e = {
        pending: null,
        lanes: 0,
        dispatch: null,
        lastRenderedReducer: e,
        lastRenderedState: s
      }, a.queue = e, e = e.dispatch = l1.bind(
        null,
        Ee,
        e
      ), [a.memoizedState, e];
    },
    useRef: function(e) {
      var t = dn();
      return e = { current: e }, t.memoizedState = e;
    },
    useState: function(e) {
      e = Oo(e);
      var t = e.queue, n = Np.bind(null, Ee, t);
      return t.dispatch = n, [e.memoizedState, n];
    },
    useDebugValue: Co,
    useDeferredValue: function(e, t) {
      var n = dn();
      return Do(n, e, t);
    },
    useTransition: function() {
      var e = Oo(!1);
      return e = Op.bind(
        null,
        Ee,
        e.queue,
        !0,
        !1
      ), dn().memoizedState = e, [!1, e];
    },
    useSyncExternalStore: function(e, t, n) {
      var a = Ee, s = dn();
      if (je) {
        if (n === void 0)
          throw Error(r(407));
        n = n();
      } else {
        if (n = t(), tt === null)
          throw Error(r(349));
        (De & 127) !== 0 || ap(a, t, n);
      }
      s.memoizedState = n;
      var c = { value: n, getSnapshot: t };
      return s.queue = c, bp(rp.bind(null, a, c, e), [
        e
      ]), a.flags |= 2048, lr(
        9,
        { destroy: void 0 },
        ip.bind(
          null,
          a,
          c,
          n,
          t
        ),
        null
      ), n;
    },
    useId: function() {
      var e = dn(), t = tt.identifierPrefix;
      if (je) {
        var n = Rl, a = Ml;
        n = (a & ~(1 << 32 - St(a) - 1)).toString(32) + n, t = "_" + t + "R_" + n, n = As++, 0 < n && (t += "H" + n.toString(32)), t += "_";
      } else
        n = F_++, t = "_" + t + "r_" + n.toString(32) + "_";
      return e.memoizedState = t;
    },
    useHostTransitionStatus: jo,
    useFormState: mp,
    useActionState: mp,
    useOptimistic: function(e) {
      var t = dn();
      t.memoizedState = t.baseState = e;
      var n = {
        pending: null,
        lanes: 0,
        dispatch: null,
        lastRenderedReducer: null,
        lastRenderedState: null
      };
      return t.queue = n, t = Uo.bind(
        null,
        Ee,
        !0,
        n
      ), n.dispatch = t, [e, t];
    },
    useMemoCache: wo,
    useCacheRefresh: function() {
      return dn().memoizedState = n1.bind(
        null,
        Ee
      );
    },
    useEffectEvent: function(e) {
      var t = dn(), n = { impl: e };
      return t.memoizedState = n, function() {
        if ((Xe & 2) !== 0)
          throw Error(r(440));
        return n.impl.apply(void 0, arguments);
      };
    }
  }, Lo = {
    readContext: Wt,
    use: ws,
    useCallback: wp,
    useContext: Wt,
    useEffect: Ro,
    useImperativeHandle: Ep,
    useInsertionEffect: xp,
    useLayoutEffect: Tp,
    useMemo: zp,
    useReducer: zs,
    useRef: vp,
    useState: function() {
      return zs(Pl);
    },
    useDebugValue: Co,
    useDeferredValue: function(e, t) {
      var n = Tt();
      return kp(
        n,
        Fe.memoizedState,
        e,
        t
      );
    },
    useTransition: function() {
      var e = zs(Pl)[0], t = Tt().memoizedState;
      return [
        typeof e == "boolean" ? e : Pr(e),
        t
      ];
    },
    useSyncExternalStore: lp,
    useId: Cp,
    useHostTransitionStatus: jo,
    useFormState: gp,
    useActionState: gp,
    useOptimistic: function(e, t) {
      var n = Tt();
      return cp(n, Fe, e, t);
    },
    useMemoCache: wo,
    useCacheRefresh: Dp
  };
  Lo.useEffectEvent = Sp;
  var Hp = {
    readContext: Wt,
    use: ws,
    useCallback: wp,
    useContext: Wt,
    useEffect: Ro,
    useImperativeHandle: Ep,
    useInsertionEffect: xp,
    useLayoutEffect: Tp,
    useMemo: zp,
    useReducer: ko,
    useRef: vp,
    useState: function() {
      return ko(Pl);
    },
    useDebugValue: Co,
    useDeferredValue: function(e, t) {
      var n = Tt();
      return Fe === null ? Do(n, e, t) : kp(
        n,
        Fe.memoizedState,
        e,
        t
      );
    },
    useTransition: function() {
      var e = ko(Pl)[0], t = Tt().memoizedState;
      return [
        typeof e == "boolean" ? e : Pr(e),
        t
      ];
    },
    useSyncExternalStore: lp,
    useId: Cp,
    useHostTransitionStatus: jo,
    useFormState: _p,
    useActionState: _p,
    useOptimistic: function(e, t) {
      var n = Tt();
      return Fe !== null ? cp(n, Fe, e, t) : (n.baseState = e, [e, n.queue.dispatch]);
    },
    useMemoCache: wo,
    useCacheRefresh: Dp
  };
  Hp.useEffectEvent = Sp;
  function Ho(e, t, n, a) {
    t = e.memoizedState, n = n(a, t), n = n == null ? t : S({}, t, n), e.memoizedState = n, e.lanes === 0 && (e.updateQueue.baseState = n);
  }
  var Bo = {
    enqueueSetState: function(e, t, n) {
      e = e._reactInternals;
      var a = Qn(), s = Oa(a);
      s.payload = t, n != null && (s.callback = n), t = Ma(e, s, a), t !== null && (En(t, e, a), Jr(t, e, a));
    },
    enqueueReplaceState: function(e, t, n) {
      e = e._reactInternals;
      var a = Qn(), s = Oa(a);
      s.tag = 1, s.payload = t, n != null && (s.callback = n), t = Ma(e, s, a), t !== null && (En(t, e, a), Jr(t, e, a));
    },
    enqueueForceUpdate: function(e, t) {
      e = e._reactInternals;
      var n = Qn(), a = Oa(n);
      a.tag = 2, t != null && (a.callback = t), t = Ma(e, a, n), t !== null && (En(t, e, n), Jr(t, e, n));
    }
  };
  function Bp(e, t, n, a, s, c, m) {
    return e = e.stateNode, typeof e.shouldComponentUpdate == "function" ? e.shouldComponentUpdate(a, c, m) : t.prototype && t.prototype.isPureReactComponent ? !Yr(n, a) || !Yr(s, c) : !0;
  }
  function qp(e, t, n, a) {
    e = t.state, typeof t.componentWillReceiveProps == "function" && t.componentWillReceiveProps(n, a), typeof t.UNSAFE_componentWillReceiveProps == "function" && t.UNSAFE_componentWillReceiveProps(n, a), t.state !== e && Bo.enqueueReplaceState(t, t.state, null);
  }
  function bi(e, t) {
    var n = t;
    if ("ref" in t) {
      n = {};
      for (var a in t)
        a !== "ref" && (n[a] = t[a]);
    }
    if (e = e.defaultProps) {
      n === t && (n = S({}, n));
      for (var s in e)
        n[s] === void 0 && (n[s] = e[s]);
    }
    return n;
  }
  function Yp(e) {
    ss(e);
  }
  function Gp(e) {
    console.error(e);
  }
  function Xp(e) {
    ss(e);
  }
  function Rs(e, t) {
    try {
      var n = e.onUncaughtError;
      n(t.value, { componentStack: t.stack });
    } catch (a) {
      setTimeout(function() {
        throw a;
      });
    }
  }
  function Qp(e, t, n) {
    try {
      var a = e.onCaughtError;
      a(n.value, {
        componentStack: n.stack,
        errorBoundary: t.tag === 1 ? t.stateNode : null
      });
    } catch (s) {
      setTimeout(function() {
        throw s;
      });
    }
  }
  function qo(e, t, n) {
    return n = Oa(n), n.tag = 3, n.payload = { element: null }, n.callback = function() {
      Rs(e, t);
    }, n;
  }
  function Vp(e) {
    return e = Oa(e), e.tag = 3, e;
  }
  function Zp(e, t, n, a) {
    var s = n.type.getDerivedStateFromError;
    if (typeof s == "function") {
      var c = a.value;
      e.payload = function() {
        return s(c);
      }, e.callback = function() {
        Qp(t, n, a);
      };
    }
    var m = n.stateNode;
    m !== null && typeof m.componentDidCatch == "function" && (e.callback = function() {
      Qp(t, n, a), typeof s != "function" && (Ua === null ? Ua = /* @__PURE__ */ new Set([this]) : Ua.add(this));
      var _ = a.stack;
      this.componentDidCatch(a.value, {
        componentStack: _ !== null ? _ : ""
      });
    });
  }
  function a1(e, t, n, a, s) {
    if (n.flags |= 32768, a !== null && typeof a == "object" && typeof a.then == "function") {
      if (t = n.alternate, t !== null && Ji(
        t,
        n,
        s,
        !0
      ), n = qn.current, n !== null) {
        switch (n.tag) {
          case 31:
          case 13:
            return ul === null ? Xs() : n.alternate === null && gt === 0 && (gt = 3), n.flags &= -257, n.flags |= 65536, n.lanes = s, a === _s ? n.flags |= 16384 : (t = n.updateQueue, t === null ? n.updateQueue = /* @__PURE__ */ new Set([a]) : t.add(a), hf(e, a, s)), !1;
          case 22:
            return n.flags |= 65536, a === _s ? n.flags |= 16384 : (t = n.updateQueue, t === null ? (t = {
              transitions: null,
              markerInstances: null,
              retryQueue: /* @__PURE__ */ new Set([a])
            }, n.updateQueue = t) : (n = t.retryQueue, n === null ? t.retryQueue = /* @__PURE__ */ new Set([a]) : n.add(a)), hf(e, a, s)), !1;
        }
        throw Error(r(435, n.tag));
      }
      return hf(e, a, s), Xs(), !1;
    }
    if (je)
      return t = qn.current, t !== null ? ((t.flags & 65536) === 0 && (t.flags |= 256), t.flags |= 65536, t.lanes = s, a !== ao && (e = Error(r(422), { cause: a }), Qr(ll(e, n)))) : (a !== ao && (t = Error(r(423), {
        cause: a
      }), Qr(
        ll(t, n)
      )), e = e.current.alternate, e.flags |= 65536, s &= -s, e.lanes |= s, a = ll(a, n), s = qo(
        e.stateNode,
        a,
        s
      ), go(e, s), gt !== 4 && (gt = 2)), !1;
    var c = Error(r(520), { cause: a });
    if (c = ll(c, n), cu === null ? cu = [c] : cu.push(c), gt !== 4 && (gt = 2), t === null) return !0;
    a = ll(a, n), n = t;
    do {
      switch (n.tag) {
        case 3:
          return n.flags |= 65536, e = s & -s, n.lanes |= e, e = qo(n.stateNode, a, e), go(n, e), !1;
        case 1:
          if (t = n.type, c = n.stateNode, (n.flags & 128) === 0 && (typeof t.getDerivedStateFromError == "function" || c !== null && typeof c.componentDidCatch == "function" && (Ua === null || !Ua.has(c))))
            return n.flags |= 65536, s &= -s, n.lanes |= s, s = Vp(s), Zp(
              s,
              e,
              n,
              a
            ), go(n, s), !1;
      }
      n = n.return;
    } while (n !== null);
    return !1;
  }
  var Yo = Error(r(461)), Ot = !1;
  function It(e, t, n, a) {
    t.child = e === null ? Fd(t, null, n, a) : _i(
      t,
      e.child,
      n,
      a
    );
  }
  function Kp(e, t, n, a, s) {
    n = n.render;
    var c = t.ref;
    if ("ref" in a) {
      var m = {};
      for (var _ in a)
        _ !== "ref" && (m[_] = a[_]);
    } else m = a;
    return pi(t), a = xo(
      e,
      t,
      n,
      m,
      c,
      s
    ), _ = To(), e !== null && !Ot ? (Ao(e, t, s), ea(e, t, s)) : (je && _ && no(t), t.flags |= 1, It(e, t, a, s), t.child);
  }
  function $p(e, t, n, a, s) {
    if (e === null) {
      var c = n.type;
      return typeof c == "function" && !Pc(c) && c.defaultProps === void 0 && n.compare === null ? (t.tag = 15, t.type = c, Jp(
        e,
        t,
        c,
        a,
        s
      )) : (e = hs(
        n.type,
        null,
        a,
        t,
        t.mode,
        s
      ), e.ref = t.ref, e.return = t, t.child = e);
    }
    if (c = e.child, !Jo(e, s)) {
      var m = c.memoizedProps;
      if (n = n.compare, n = n !== null ? n : Yr, n(m, a) && e.ref === t.ref)
        return ea(e, t, s);
    }
    return t.flags |= 1, e = $l(c, a), e.ref = t.ref, e.return = t, t.child = e;
  }
  function Jp(e, t, n, a, s) {
    if (e !== null) {
      var c = e.memoizedProps;
      if (Yr(c, a) && e.ref === t.ref)
        if (Ot = !1, t.pendingProps = a = c, Jo(e, s))
          (e.flags & 131072) !== 0 && (Ot = !0);
        else
          return t.lanes = e.lanes, ea(e, t, s);
    }
    return Go(
      e,
      t,
      n,
      a,
      s
    );
  }
  function Fp(e, t, n, a) {
    var s = a.children, c = e !== null ? e.memoizedState : null;
    if (e === null && t.stateNode === null && (t.stateNode = {
      _visibility: 1,
      _pendingMarkers: null,
      _retryCache: null,
      _transitions: null
    }), a.mode === "hidden") {
      if ((t.flags & 128) !== 0) {
        if (c = c !== null ? c.baseLanes | n : n, e !== null) {
          for (a = t.child = e.child, s = 0; a !== null; )
            s = s | a.lanes | a.childLanes, a = a.sibling;
          a = s & ~c;
        } else a = 0, t.child = null;
        return Wp(
          e,
          t,
          c,
          n,
          a
        );
      }
      if ((n & 536870912) !== 0)
        t.memoizedState = { baseLanes: 0, cachePool: null }, e !== null && gs(
          t,
          c !== null ? c.cachePool : null
        ), c !== null ? Pd(t, c) : _o(), ep(t);
      else
        return a = t.lanes = 536870912, Wp(
          e,
          t,
          c !== null ? c.baseLanes | n : n,
          n,
          a
        );
    } else
      c !== null ? (gs(t, c.cachePool), Pd(t, c), Ca(), t.memoizedState = null) : (e !== null && gs(t, null), _o(), Ca());
    return It(e, t, s, n), t.child;
  }
  function nu(e, t) {
    return e !== null && e.tag === 22 || t.stateNode !== null || (t.stateNode = {
      _visibility: 1,
      _pendingMarkers: null,
      _retryCache: null,
      _transitions: null
    }), t.sibling;
  }
  function Wp(e, t, n, a, s) {
    var c = fo();
    return c = c === null ? null : { parent: zt._currentValue, pool: c }, t.memoizedState = {
      baseLanes: n,
      cachePool: c
    }, e !== null && gs(t, null), _o(), ep(t), e !== null && Ji(e, t, a, !0), t.childLanes = s, null;
  }
  function Cs(e, t) {
    return t = Ns(
      { mode: t.mode, children: t.children },
      e.mode
    ), t.ref = e.ref, e.child = t, t.return = e, t;
  }
  function Ip(e, t, n) {
    return _i(t, e.child, null, n), e = Cs(t, t.pendingProps), e.flags |= 2, Yn(t), t.memoizedState = null, e;
  }
  function i1(e, t, n) {
    var a = t.pendingProps, s = (t.flags & 128) !== 0;
    if (t.flags &= -129, e === null) {
      if (je) {
        if (a.mode === "hidden")
          return e = Cs(t, a), t.lanes = 536870912, nu(null, e);
        if (bo(t), (e = it) ? (e = og(
          e,
          rl
        ), e = e !== null && e.data === "&" ? e : null, e !== null && (t.memoizedState = {
          dehydrated: e,
          treeContext: Aa !== null ? { id: Ml, overflow: Rl } : null,
          retryLane: 536870912,
          hydrationErrors: null
        }, n = jd(e), n.return = t, t.child = n, Ft = t, it = null)) : e = null, e === null) throw wa(t);
        return t.lanes = 536870912, null;
      }
      return Cs(t, a);
    }
    var c = e.memoizedState;
    if (c !== null) {
      var m = c.dehydrated;
      if (bo(t), s)
        if (t.flags & 256)
          t.flags &= -257, t = Ip(
            e,
            t,
            n
          );
        else if (t.memoizedState !== null)
          t.child = e.child, t.flags |= 128, t = null;
        else throw Error(r(558));
      else if (Ot || Ji(e, t, n, !1), s = (n & e.childLanes) !== 0, Ot || s) {
        if (a = tt, a !== null && (m = Gl(a, n), m !== 0 && m !== c.retryLane))
          throw c.retryLane = m, oi(e, m), En(a, e, m), Yo;
        Xs(), t = Ip(
          e,
          t,
          n
        );
      } else
        e = c.treeContext, it = sl(m.nextSibling), Ft = t, je = !0, Ea = null, rl = !1, e !== null && Hd(t, e), t = Cs(t, a), t.flags |= 4096;
      return t;
    }
    return e = $l(e.child, {
      mode: a.mode,
      children: a.children
    }), e.ref = t.ref, t.child = e, e.return = t, e;
  }
  function Ds(e, t) {
    var n = t.ref;
    if (n === null)
      e !== null && e.ref !== null && (t.flags |= 4194816);
    else {
      if (typeof n != "function" && typeof n != "object")
        throw Error(r(284));
      (e === null || e.ref !== n) && (t.flags |= 4194816);
    }
  }
  function Go(e, t, n, a, s) {
    return pi(t), n = xo(
      e,
      t,
      n,
      a,
      void 0,
      s
    ), a = To(), e !== null && !Ot ? (Ao(e, t, s), ea(e, t, s)) : (je && a && no(t), t.flags |= 1, It(e, t, n, s), t.child);
  }
  function Pp(e, t, n, a, s, c) {
    return pi(t), t.updateQueue = null, n = np(
      t,
      a,
      n,
      s
    ), tp(e), a = To(), e !== null && !Ot ? (Ao(e, t, c), ea(e, t, c)) : (je && a && no(t), t.flags |= 1, It(e, t, n, c), t.child);
  }
  function em(e, t, n, a, s) {
    if (pi(t), t.stateNode === null) {
      var c = Vi, m = n.contextType;
      typeof m == "object" && m !== null && (c = Wt(m)), c = new n(a, c), t.memoizedState = c.state !== null && c.state !== void 0 ? c.state : null, c.updater = Bo, t.stateNode = c, c._reactInternals = t, c = t.stateNode, c.props = a, c.state = t.memoizedState, c.refs = {}, po(t), m = n.contextType, c.context = typeof m == "object" && m !== null ? Wt(m) : Vi, c.state = t.memoizedState, m = n.getDerivedStateFromProps, typeof m == "function" && (Ho(
        t,
        n,
        m,
        a
      ), c.state = t.memoizedState), typeof n.getDerivedStateFromProps == "function" || typeof c.getSnapshotBeforeUpdate == "function" || typeof c.UNSAFE_componentWillMount != "function" && typeof c.componentWillMount != "function" || (m = c.state, typeof c.componentWillMount == "function" && c.componentWillMount(), typeof c.UNSAFE_componentWillMount == "function" && c.UNSAFE_componentWillMount(), m !== c.state && Bo.enqueueReplaceState(c, c.state, null), Wr(t, a, c, s), Fr(), c.state = t.memoizedState), typeof c.componentDidMount == "function" && (t.flags |= 4194308), a = !0;
    } else if (e === null) {
      c = t.stateNode;
      var _ = t.memoizedProps, w = bi(n, _);
      c.props = w;
      var N = c.context, Z = n.contextType;
      m = Vi, typeof Z == "object" && Z !== null && (m = Wt(Z));
      var J = n.getDerivedStateFromProps;
      Z = typeof J == "function" || typeof c.getSnapshotBeforeUpdate == "function", _ = t.pendingProps !== _, Z || typeof c.UNSAFE_componentWillReceiveProps != "function" && typeof c.componentWillReceiveProps != "function" || (_ || N !== m) && qp(
        t,
        c,
        a,
        m
      ), ka = !1;
      var U = t.memoizedState;
      c.state = U, Wr(t, a, c, s), Fr(), N = t.memoizedState, _ || U !== N || ka ? (typeof J == "function" && (Ho(
        t,
        n,
        J,
        a
      ), N = t.memoizedState), (w = ka || Bp(
        t,
        n,
        w,
        a,
        U,
        N,
        m
      )) ? (Z || typeof c.UNSAFE_componentWillMount != "function" && typeof c.componentWillMount != "function" || (typeof c.componentWillMount == "function" && c.componentWillMount(), typeof c.UNSAFE_componentWillMount == "function" && c.UNSAFE_componentWillMount()), typeof c.componentDidMount == "function" && (t.flags |= 4194308)) : (typeof c.componentDidMount == "function" && (t.flags |= 4194308), t.memoizedProps = a, t.memoizedState = N), c.props = a, c.state = N, c.context = m, a = w) : (typeof c.componentDidMount == "function" && (t.flags |= 4194308), a = !1);
    } else {
      c = t.stateNode, mo(e, t), m = t.memoizedProps, Z = bi(n, m), c.props = Z, J = t.pendingProps, U = c.context, N = n.contextType, w = Vi, typeof N == "object" && N !== null && (w = Wt(N)), _ = n.getDerivedStateFromProps, (N = typeof _ == "function" || typeof c.getSnapshotBeforeUpdate == "function") || typeof c.UNSAFE_componentWillReceiveProps != "function" && typeof c.componentWillReceiveProps != "function" || (m !== J || U !== w) && qp(
        t,
        c,
        a,
        w
      ), ka = !1, U = t.memoizedState, c.state = U, Wr(t, a, c, s), Fr();
      var B = t.memoizedState;
      m !== J || U !== B || ka || e !== null && e.dependencies !== null && ps(e.dependencies) ? (typeof _ == "function" && (Ho(
        t,
        n,
        _,
        a
      ), B = t.memoizedState), (Z = ka || Bp(
        t,
        n,
        Z,
        a,
        U,
        B,
        w
      ) || e !== null && e.dependencies !== null && ps(e.dependencies)) ? (N || typeof c.UNSAFE_componentWillUpdate != "function" && typeof c.componentWillUpdate != "function" || (typeof c.componentWillUpdate == "function" && c.componentWillUpdate(a, B, w), typeof c.UNSAFE_componentWillUpdate == "function" && c.UNSAFE_componentWillUpdate(
        a,
        B,
        w
      )), typeof c.componentDidUpdate == "function" && (t.flags |= 4), typeof c.getSnapshotBeforeUpdate == "function" && (t.flags |= 1024)) : (typeof c.componentDidUpdate != "function" || m === e.memoizedProps && U === e.memoizedState || (t.flags |= 4), typeof c.getSnapshotBeforeUpdate != "function" || m === e.memoizedProps && U === e.memoizedState || (t.flags |= 1024), t.memoizedProps = a, t.memoizedState = B), c.props = a, c.state = B, c.context = w, a = Z) : (typeof c.componentDidUpdate != "function" || m === e.memoizedProps && U === e.memoizedState || (t.flags |= 4), typeof c.getSnapshotBeforeUpdate != "function" || m === e.memoizedProps && U === e.memoizedState || (t.flags |= 1024), a = !1);
    }
    return c = a, Ds(e, t), a = (t.flags & 128) !== 0, c || a ? (c = t.stateNode, n = a && typeof n.getDerivedStateFromError != "function" ? null : c.render(), t.flags |= 1, e !== null && a ? (t.child = _i(
      t,
      e.child,
      null,
      s
    ), t.child = _i(
      t,
      null,
      n,
      s
    )) : It(e, t, n, s), t.memoizedState = c.state, e = t.child) : e = ea(
      e,
      t,
      s
    ), e;
  }
  function tm(e, t, n, a) {
    return hi(), t.flags |= 256, It(e, t, n, a), t.child;
  }
  var Xo = {
    dehydrated: null,
    treeContext: null,
    retryLane: 0,
    hydrationErrors: null
  };
  function Qo(e) {
    return { baseLanes: e, cachePool: Qd() };
  }
  function Vo(e, t, n) {
    return e = e !== null ? e.childLanes & ~n : 0, t && (e |= Xn), e;
  }
  function nm(e, t, n) {
    var a = t.pendingProps, s = !1, c = (t.flags & 128) !== 0, m;
    if ((m = c) || (m = e !== null && e.memoizedState === null ? !1 : (xt.current & 2) !== 0), m && (s = !0, t.flags &= -129), m = (t.flags & 32) !== 0, t.flags &= -33, e === null) {
      if (je) {
        if (s ? Ra(t) : Ca(), (e = it) ? (e = og(
          e,
          rl
        ), e = e !== null && e.data !== "&" ? e : null, e !== null && (t.memoizedState = {
          dehydrated: e,
          treeContext: Aa !== null ? { id: Ml, overflow: Rl } : null,
          retryLane: 536870912,
          hydrationErrors: null
        }, n = jd(e), n.return = t, t.child = n, Ft = t, it = null)) : e = null, e === null) throw wa(t);
        return kf(e) ? t.lanes = 32 : t.lanes = 536870912, null;
      }
      var _ = a.children;
      return a = a.fallback, s ? (Ca(), s = t.mode, _ = Ns(
        { mode: "hidden", children: _ },
        s
      ), a = fi(
        a,
        s,
        n,
        null
      ), _.return = t, a.return = t, _.sibling = a, t.child = _, a = t.child, a.memoizedState = Qo(n), a.childLanes = Vo(
        e,
        m,
        n
      ), t.memoizedState = Xo, nu(null, a)) : (Ra(t), Zo(t, _));
    }
    var w = e.memoizedState;
    if (w !== null && (_ = w.dehydrated, _ !== null)) {
      if (c)
        t.flags & 256 ? (Ra(t), t.flags &= -257, t = Ko(
          e,
          t,
          n
        )) : t.memoizedState !== null ? (Ca(), t.child = e.child, t.flags |= 128, t = null) : (Ca(), _ = a.fallback, s = t.mode, a = Ns(
          { mode: "visible", children: a.children },
          s
        ), _ = fi(
          _,
          s,
          n,
          null
        ), _.flags |= 2, a.return = t, _.return = t, a.sibling = _, t.child = a, _i(
          t,
          e.child,
          null,
          n
        ), a = t.child, a.memoizedState = Qo(n), a.childLanes = Vo(
          e,
          m,
          n
        ), t.memoizedState = Xo, t = nu(null, a));
      else if (Ra(t), kf(_)) {
        if (m = _.nextSibling && _.nextSibling.dataset, m) var N = m.dgst;
        m = N, a = Error(r(419)), a.stack = "", a.digest = m, Qr({ value: a, source: null, stack: null }), t = Ko(
          e,
          t,
          n
        );
      } else if (Ot || Ji(e, t, n, !1), m = (n & e.childLanes) !== 0, Ot || m) {
        if (m = tt, m !== null && (a = Gl(m, n), a !== 0 && a !== w.retryLane))
          throw w.retryLane = a, oi(e, a), En(m, e, a), Yo;
        zf(_) || Xs(), t = Ko(
          e,
          t,
          n
        );
      } else
        zf(_) ? (t.flags |= 192, t.child = e.child, t = null) : (e = w.treeContext, it = sl(
          _.nextSibling
        ), Ft = t, je = !0, Ea = null, rl = !1, e !== null && Hd(t, e), t = Zo(
          t,
          a.children
        ), t.flags |= 4096);
      return t;
    }
    return s ? (Ca(), _ = a.fallback, s = t.mode, w = e.child, N = w.sibling, a = $l(w, {
      mode: "hidden",
      children: a.children
    }), a.subtreeFlags = w.subtreeFlags & 65011712, N !== null ? _ = $l(
      N,
      _
    ) : (_ = fi(
      _,
      s,
      n,
      null
    ), _.flags |= 2), _.return = t, a.return = t, a.sibling = _, t.child = a, nu(null, a), a = t.child, _ = e.child.memoizedState, _ === null ? _ = Qo(n) : (s = _.cachePool, s !== null ? (w = zt._currentValue, s = s.parent !== w ? { parent: w, pool: w } : s) : s = Qd(), _ = {
      baseLanes: _.baseLanes | n,
      cachePool: s
    }), a.memoizedState = _, a.childLanes = Vo(
      e,
      m,
      n
    ), t.memoizedState = Xo, nu(e.child, a)) : (Ra(t), n = e.child, e = n.sibling, n = $l(n, {
      mode: "visible",
      children: a.children
    }), n.return = t, n.sibling = null, e !== null && (m = t.deletions, m === null ? (t.deletions = [e], t.flags |= 16) : m.push(e)), t.child = n, t.memoizedState = null, n);
  }
  function Zo(e, t) {
    return t = Ns(
      { mode: "visible", children: t },
      e.mode
    ), t.return = e, e.child = t;
  }
  function Ns(e, t) {
    return e = Bn(22, e, null, t), e.lanes = 0, e;
  }
  function Ko(e, t, n) {
    return _i(t, e.child, null, n), e = Zo(
      t,
      t.pendingProps.children
    ), e.flags |= 2, t.memoizedState = null, e;
  }
  function lm(e, t, n) {
    e.lanes |= t;
    var a = e.alternate;
    a !== null && (a.lanes |= t), uo(e.return, t, n);
  }
  function $o(e, t, n, a, s, c) {
    var m = e.memoizedState;
    m === null ? e.memoizedState = {
      isBackwards: t,
      rendering: null,
      renderingStartTime: 0,
      last: a,
      tail: n,
      tailMode: s,
      treeForkCount: c
    } : (m.isBackwards = t, m.rendering = null, m.renderingStartTime = 0, m.last = a, m.tail = n, m.tailMode = s, m.treeForkCount = c);
  }
  function am(e, t, n) {
    var a = t.pendingProps, s = a.revealOrder, c = a.tail;
    a = a.children;
    var m = xt.current, _ = (m & 2) !== 0;
    if (_ ? (m = m & 1 | 2, t.flags |= 128) : m &= 1, te(xt, m), It(e, t, a, n), a = je ? Xr : 0, !_ && e !== null && (e.flags & 128) !== 0)
      e: for (e = t.child; e !== null; ) {
        if (e.tag === 13)
          e.memoizedState !== null && lm(e, n, t);
        else if (e.tag === 19)
          lm(e, n, t);
        else if (e.child !== null) {
          e.child.return = e, e = e.child;
          continue;
        }
        if (e === t) break e;
        for (; e.sibling === null; ) {
          if (e.return === null || e.return === t)
            break e;
          e = e.return;
        }
        e.sibling.return = e.return, e = e.sibling;
      }
    switch (s) {
      case "forwards":
        for (n = t.child, s = null; n !== null; )
          e = n.alternate, e !== null && xs(e) === null && (s = n), n = n.sibling;
        n = s, n === null ? (s = t.child, t.child = null) : (s = n.sibling, n.sibling = null), $o(
          t,
          !1,
          s,
          n,
          c,
          a
        );
        break;
      case "backwards":
      case "unstable_legacy-backwards":
        for (n = null, s = t.child, t.child = null; s !== null; ) {
          if (e = s.alternate, e !== null && xs(e) === null) {
            t.child = s;
            break;
          }
          e = s.sibling, s.sibling = n, n = s, s = e;
        }
        $o(
          t,
          !0,
          n,
          null,
          c,
          a
        );
        break;
      case "together":
        $o(
          t,
          !1,
          null,
          null,
          void 0,
          a
        );
        break;
      default:
        t.memoizedState = null;
    }
    return t.child;
  }
  function ea(e, t, n) {
    if (e !== null && (t.dependencies = e.dependencies), ja |= t.lanes, (n & t.childLanes) === 0)
      if (e !== null) {
        if (Ji(
          e,
          t,
          n,
          !1
        ), (n & t.childLanes) === 0)
          return null;
      } else return null;
    if (e !== null && t.child !== e.child)
      throw Error(r(153));
    if (t.child !== null) {
      for (e = t.child, n = $l(e, e.pendingProps), t.child = n, n.return = t; e.sibling !== null; )
        e = e.sibling, n = n.sibling = $l(e, e.pendingProps), n.return = t;
      n.sibling = null;
    }
    return t.child;
  }
  function Jo(e, t) {
    return (e.lanes & t) !== 0 ? !0 : (e = e.dependencies, !!(e !== null && ps(e)));
  }
  function r1(e, t, n) {
    switch (t.tag) {
      case 3:
        at(t, t.stateNode.containerInfo), za(t, zt, e.memoizedState.cache), hi();
        break;
      case 27:
      case 5:
        Hl(t);
        break;
      case 4:
        at(t, t.stateNode.containerInfo);
        break;
      case 10:
        za(
          t,
          t.type,
          t.memoizedProps.value
        );
        break;
      case 31:
        if (t.memoizedState !== null)
          return t.flags |= 128, bo(t), null;
        break;
      case 13:
        var a = t.memoizedState;
        if (a !== null)
          return a.dehydrated !== null ? (Ra(t), t.flags |= 128, null) : (n & t.child.childLanes) !== 0 ? nm(e, t, n) : (Ra(t), e = ea(
            e,
            t,
            n
          ), e !== null ? e.sibling : null);
        Ra(t);
        break;
      case 19:
        var s = (e.flags & 128) !== 0;
        if (a = (n & t.childLanes) !== 0, a || (Ji(
          e,
          t,
          n,
          !1
        ), a = (n & t.childLanes) !== 0), s) {
          if (a)
            return am(
              e,
              t,
              n
            );
          t.flags |= 128;
        }
        if (s = t.memoizedState, s !== null && (s.rendering = null, s.tail = null, s.lastEffect = null), te(xt, xt.current), a) break;
        return null;
      case 22:
        return t.lanes = 0, Fp(
          e,
          t,
          n,
          t.pendingProps
        );
      case 24:
        za(t, zt, e.memoizedState.cache);
    }
    return ea(e, t, n);
  }
  function im(e, t, n) {
    if (e !== null)
      if (e.memoizedProps !== t.pendingProps)
        Ot = !0;
      else {
        if (!Jo(e, n) && (t.flags & 128) === 0)
          return Ot = !1, r1(
            e,
            t,
            n
          );
        Ot = (e.flags & 131072) !== 0;
      }
    else
      Ot = !1, je && (t.flags & 1048576) !== 0 && Ld(t, Xr, t.index);
    switch (t.lanes = 0, t.tag) {
      case 16:
        e: {
          var a = t.pendingProps;
          if (e = gi(t.elementType), t.type = e, typeof e == "function")
            Pc(e) ? (a = bi(e, a), t.tag = 1, t = em(
              null,
              t,
              e,
              a,
              n
            )) : (t.tag = 0, t = Go(
              null,
              t,
              e,
              a,
              n
            ));
          else {
            if (e != null) {
              var s = e.$$typeof;
              if (s === F) {
                t.tag = 11, t = Kp(
                  null,
                  t,
                  e,
                  a,
                  n
                );
                break e;
              } else if (s === X) {
                t.tag = 14, t = $p(
                  null,
                  t,
                  e,
                  a,
                  n
                );
                break e;
              }
            }
            throw t = ue(e) || e, Error(r(306, t, ""));
          }
        }
        return t;
      case 0:
        return Go(
          e,
          t,
          t.type,
          t.pendingProps,
          n
        );
      case 1:
        return a = t.type, s = bi(
          a,
          t.pendingProps
        ), em(
          e,
          t,
          a,
          s,
          n
        );
      case 3:
        e: {
          if (at(
            t,
            t.stateNode.containerInfo
          ), e === null) throw Error(r(387));
          a = t.pendingProps;
          var c = t.memoizedState;
          s = c.element, mo(e, t), Wr(t, a, null, n);
          var m = t.memoizedState;
          if (a = m.cache, za(t, zt, a), a !== c.cache && so(
            t,
            [zt],
            n,
            !0
          ), Fr(), a = m.element, c.isDehydrated)
            if (c = {
              element: a,
              isDehydrated: !1,
              cache: m.cache
            }, t.updateQueue.baseState = c, t.memoizedState = c, t.flags & 256) {
              t = tm(
                e,
                t,
                a,
                n
              );
              break e;
            } else if (a !== s) {
              s = ll(
                Error(r(424)),
                t
              ), Qr(s), t = tm(
                e,
                t,
                a,
                n
              );
              break e;
            } else {
              switch (e = t.stateNode.containerInfo, e.nodeType) {
                case 9:
                  e = e.body;
                  break;
                default:
                  e = e.nodeName === "HTML" ? e.ownerDocument.body : e;
              }
              for (it = sl(e.firstChild), Ft = t, je = !0, Ea = null, rl = !0, n = Fd(
                t,
                null,
                a,
                n
              ), t.child = n; n; )
                n.flags = n.flags & -3 | 4096, n = n.sibling;
            }
          else {
            if (hi(), a === s) {
              t = ea(
                e,
                t,
                n
              );
              break e;
            }
            It(e, t, a, n);
          }
          t = t.child;
        }
        return t;
      case 26:
        return Ds(e, t), e === null ? (n = gg(
          t.type,
          null,
          t.pendingProps,
          null
        )) ? t.memoizedState = n : je || (n = t.type, e = t.pendingProps, a = Fs(
          Ae.current
        ).createElement(n), a[dt] = t, a[pt] = e, Pt(a, n, e), ut(a), t.stateNode = a) : t.memoizedState = gg(
          t.type,
          e.memoizedProps,
          t.pendingProps,
          e.memoizedState
        ), null;
      case 27:
        return Hl(t), e === null && je && (a = t.stateNode = dg(
          t.type,
          t.pendingProps,
          Ae.current
        ), Ft = t, rl = !0, s = it, qa(t.type) ? (Of = s, it = sl(a.firstChild)) : it = s), It(
          e,
          t,
          t.pendingProps.children,
          n
        ), Ds(e, t), e === null && (t.flags |= 4194304), t.child;
      case 5:
        return e === null && je && ((s = a = it) && (a = U1(
          a,
          t.type,
          t.pendingProps,
          rl
        ), a !== null ? (t.stateNode = a, Ft = t, it = sl(a.firstChild), rl = !1, s = !0) : s = !1), s || wa(t)), Hl(t), s = t.type, c = t.pendingProps, m = e !== null ? e.memoizedProps : null, a = c.children, Af(s, c) ? a = null : m !== null && Af(s, m) && (t.flags |= 32), t.memoizedState !== null && (s = xo(
          e,
          t,
          W_,
          null,
          null,
          n
        ), yu._currentValue = s), Ds(e, t), It(e, t, a, n), t.child;
      case 6:
        return e === null && je && ((e = n = it) && (n = L1(
          n,
          t.pendingProps,
          rl
        ), n !== null ? (t.stateNode = n, Ft = t, it = null, e = !0) : e = !1), e || wa(t)), null;
      case 13:
        return nm(e, t, n);
      case 4:
        return at(
          t,
          t.stateNode.containerInfo
        ), a = t.pendingProps, e === null ? t.child = _i(
          t,
          null,
          a,
          n
        ) : It(e, t, a, n), t.child;
      case 11:
        return Kp(
          e,
          t,
          t.type,
          t.pendingProps,
          n
        );
      case 7:
        return It(
          e,
          t,
          t.pendingProps,
          n
        ), t.child;
      case 8:
        return It(
          e,
          t,
          t.pendingProps.children,
          n
        ), t.child;
      case 12:
        return It(
          e,
          t,
          t.pendingProps.children,
          n
        ), t.child;
      case 10:
        return a = t.pendingProps, za(t, t.type, a.value), It(e, t, a.children, n), t.child;
      case 9:
        return s = t.type._context, a = t.pendingProps.children, pi(t), s = Wt(s), a = a(s), t.flags |= 1, It(e, t, a, n), t.child;
      case 14:
        return $p(
          e,
          t,
          t.type,
          t.pendingProps,
          n
        );
      case 15:
        return Jp(
          e,
          t,
          t.type,
          t.pendingProps,
          n
        );
      case 19:
        return am(e, t, n);
      case 31:
        return i1(e, t, n);
      case 22:
        return Fp(
          e,
          t,
          n,
          t.pendingProps
        );
      case 24:
        return pi(t), a = Wt(zt), e === null ? (s = fo(), s === null && (s = tt, c = co(), s.pooledCache = c, c.refCount++, c !== null && (s.pooledCacheLanes |= n), s = c), t.memoizedState = { parent: a, cache: s }, po(t), za(t, zt, s)) : ((e.lanes & n) !== 0 && (mo(e, t), Wr(t, null, null, n), Fr()), s = e.memoizedState, c = t.memoizedState, s.parent !== a ? (s = { parent: a, cache: a }, t.memoizedState = s, t.lanes === 0 && (t.memoizedState = t.updateQueue.baseState = s), za(t, zt, a)) : (a = c.cache, za(t, zt, a), a !== s.cache && so(
          t,
          [zt],
          n,
          !0
        ))), It(
          e,
          t,
          t.pendingProps.children,
          n
        ), t.child;
      case 29:
        throw t.pendingProps;
    }
    throw Error(r(156, t.tag));
  }
  function ta(e) {
    e.flags |= 4;
  }
  function Fo(e, t, n, a, s) {
    if ((t = (e.mode & 32) !== 0) && (t = !1), t) {
      if (e.flags |= 16777216, (s & 335544128) === s)
        if (e.stateNode.complete) e.flags |= 8192;
        else if (Cm()) e.flags |= 8192;
        else
          throw yi = _s, ho;
    } else e.flags &= -16777217;
  }
  function rm(e, t) {
    if (t.type !== "stylesheet" || (t.state.loading & 4) !== 0)
      e.flags &= -16777217;
    else if (e.flags |= 16777216, !Sg(t))
      if (Cm()) e.flags |= 8192;
      else
        throw yi = _s, ho;
  }
  function js(e, t) {
    t !== null && (e.flags |= 4), e.flags & 16384 && (t = e.tag !== 22 ? ya() : 536870912, e.lanes |= t, ur |= t);
  }
  function lu(e, t) {
    if (!je)
      switch (e.tailMode) {
        case "hidden":
          t = e.tail;
          for (var n = null; t !== null; )
            t.alternate !== null && (n = t), t = t.sibling;
          n === null ? e.tail = null : n.sibling = null;
          break;
        case "collapsed":
          n = e.tail;
          for (var a = null; n !== null; )
            n.alternate !== null && (a = n), n = n.sibling;
          a === null ? t || e.tail === null ? e.tail = null : e.tail.sibling = null : a.sibling = null;
      }
  }
  function rt(e) {
    var t = e.alternate !== null && e.alternate.child === e.child, n = 0, a = 0;
    if (t)
      for (var s = e.child; s !== null; )
        n |= s.lanes | s.childLanes, a |= s.subtreeFlags & 65011712, a |= s.flags & 65011712, s.return = e, s = s.sibling;
    else
      for (s = e.child; s !== null; )
        n |= s.lanes | s.childLanes, a |= s.subtreeFlags, a |= s.flags, s.return = e, s = s.sibling;
    return e.subtreeFlags |= a, e.childLanes = n, t;
  }
  function u1(e, t, n) {
    var a = t.pendingProps;
    switch (lo(t), t.tag) {
      case 16:
      case 15:
      case 0:
      case 11:
      case 7:
      case 8:
      case 12:
      case 9:
      case 14:
        return rt(t), null;
      case 1:
        return rt(t), null;
      case 3:
        return n = t.stateNode, a = null, e !== null && (a = e.memoizedState.cache), t.memoizedState.cache !== a && (t.flags |= 2048), Wl(zt), Qe(), n.pendingContext && (n.context = n.pendingContext, n.pendingContext = null), (e === null || e.child === null) && ($i(t) ? ta(t) : e === null || e.memoizedState.isDehydrated && (t.flags & 256) === 0 || (t.flags |= 1024, io())), rt(t), null;
      case 26:
        var s = t.type, c = t.memoizedState;
        return e === null ? (ta(t), c !== null ? (rt(t), rm(t, c)) : (rt(t), Fo(
          t,
          s,
          null,
          a,
          n
        ))) : c ? c !== e.memoizedState ? (ta(t), rt(t), rm(t, c)) : (rt(t), t.flags &= -16777217) : (e = e.memoizedProps, e !== a && ta(t), rt(t), Fo(
          t,
          s,
          e,
          a,
          n
        )), null;
      case 27:
        if (dl(t), n = Ae.current, s = t.type, e !== null && t.stateNode != null)
          e.memoizedProps !== a && ta(t);
        else {
          if (!a) {
            if (t.stateNode === null)
              throw Error(r(166));
            return rt(t), null;
          }
          e = P.current, $i(t) ? Bd(t) : (e = dg(s, a, n), t.stateNode = e, ta(t));
        }
        return rt(t), null;
      case 5:
        if (dl(t), s = t.type, e !== null && t.stateNode != null)
          e.memoizedProps !== a && ta(t);
        else {
          if (!a) {
            if (t.stateNode === null)
              throw Error(r(166));
            return rt(t), null;
          }
          if (c = P.current, $i(t))
            Bd(t);
          else {
            var m = Fs(
              Ae.current
            );
            switch (c) {
              case 1:
                c = m.createElementNS(
                  "http://www.w3.org/2000/svg",
                  s
                );
                break;
              case 2:
                c = m.createElementNS(
                  "http://www.w3.org/1998/Math/MathML",
                  s
                );
                break;
              default:
                switch (s) {
                  case "svg":
                    c = m.createElementNS(
                      "http://www.w3.org/2000/svg",
                      s
                    );
                    break;
                  case "math":
                    c = m.createElementNS(
                      "http://www.w3.org/1998/Math/MathML",
                      s
                    );
                    break;
                  case "script":
                    c = m.createElement("div"), c.innerHTML = "<script><\/script>", c = c.removeChild(
                      c.firstChild
                    );
                    break;
                  case "select":
                    c = typeof a.is == "string" ? m.createElement("select", {
                      is: a.is
                    }) : m.createElement("select"), a.multiple ? c.multiple = !0 : a.size && (c.size = a.size);
                    break;
                  default:
                    c = typeof a.is == "string" ? m.createElement(s, { is: a.is }) : m.createElement(s);
                }
            }
            c[dt] = t, c[pt] = a;
            e: for (m = t.child; m !== null; ) {
              if (m.tag === 5 || m.tag === 6)
                c.appendChild(m.stateNode);
              else if (m.tag !== 4 && m.tag !== 27 && m.child !== null) {
                m.child.return = m, m = m.child;
                continue;
              }
              if (m === t) break e;
              for (; m.sibling === null; ) {
                if (m.return === null || m.return === t)
                  break e;
                m = m.return;
              }
              m.sibling.return = m.return, m = m.sibling;
            }
            t.stateNode = c;
            e: switch (Pt(c, s, a), s) {
              case "button":
              case "input":
              case "select":
              case "textarea":
                a = !!a.autoFocus;
                break e;
              case "img":
                a = !0;
                break e;
              default:
                a = !1;
            }
            a && ta(t);
          }
        }
        return rt(t), Fo(
          t,
          t.type,
          e === null ? null : e.memoizedProps,
          t.pendingProps,
          n
        ), null;
      case 6:
        if (e && t.stateNode != null)
          e.memoizedProps !== a && ta(t);
        else {
          if (typeof a != "string" && t.stateNode === null)
            throw Error(r(166));
          if (e = Ae.current, $i(t)) {
            if (e = t.stateNode, n = t.memoizedProps, a = null, s = Ft, s !== null)
              switch (s.tag) {
                case 27:
                case 5:
                  a = s.memoizedProps;
              }
            e[dt] = t, e = !!(e.nodeValue === n || a !== null && a.suppressHydrationWarning === !0 || ng(e.nodeValue, n)), e || wa(t, !0);
          } else
            e = Fs(e).createTextNode(
              a
            ), e[dt] = t, t.stateNode = e;
        }
        return rt(t), null;
      case 31:
        if (n = t.memoizedState, e === null || e.memoizedState !== null) {
          if (a = $i(t), n !== null) {
            if (e === null) {
              if (!a) throw Error(r(318));
              if (e = t.memoizedState, e = e !== null ? e.dehydrated : null, !e) throw Error(r(557));
              e[dt] = t;
            } else
              hi(), (t.flags & 128) === 0 && (t.memoizedState = null), t.flags |= 4;
            rt(t), e = !1;
          } else
            n = io(), e !== null && e.memoizedState !== null && (e.memoizedState.hydrationErrors = n), e = !0;
          if (!e)
            return t.flags & 256 ? (Yn(t), t) : (Yn(t), null);
          if ((t.flags & 128) !== 0)
            throw Error(r(558));
        }
        return rt(t), null;
      case 13:
        if (a = t.memoizedState, e === null || e.memoizedState !== null && e.memoizedState.dehydrated !== null) {
          if (s = $i(t), a !== null && a.dehydrated !== null) {
            if (e === null) {
              if (!s) throw Error(r(318));
              if (s = t.memoizedState, s = s !== null ? s.dehydrated : null, !s) throw Error(r(317));
              s[dt] = t;
            } else
              hi(), (t.flags & 128) === 0 && (t.memoizedState = null), t.flags |= 4;
            rt(t), s = !1;
          } else
            s = io(), e !== null && e.memoizedState !== null && (e.memoizedState.hydrationErrors = s), s = !0;
          if (!s)
            return t.flags & 256 ? (Yn(t), t) : (Yn(t), null);
        }
        return Yn(t), (t.flags & 128) !== 0 ? (t.lanes = n, t) : (n = a !== null, e = e !== null && e.memoizedState !== null, n && (a = t.child, s = null, a.alternate !== null && a.alternate.memoizedState !== null && a.alternate.memoizedState.cachePool !== null && (s = a.alternate.memoizedState.cachePool.pool), c = null, a.memoizedState !== null && a.memoizedState.cachePool !== null && (c = a.memoizedState.cachePool.pool), c !== s && (a.flags |= 2048)), n !== e && n && (t.child.flags |= 8192), js(t, t.updateQueue), rt(t), null);
      case 4:
        return Qe(), e === null && vf(t.stateNode.containerInfo), rt(t), null;
      case 10:
        return Wl(t.type), rt(t), null;
      case 19:
        if (V(xt), a = t.memoizedState, a === null) return rt(t), null;
        if (s = (t.flags & 128) !== 0, c = a.rendering, c === null)
          if (s) lu(a, !1);
          else {
            if (gt !== 0 || e !== null && (e.flags & 128) !== 0)
              for (e = t.child; e !== null; ) {
                if (c = xs(e), c !== null) {
                  for (t.flags |= 128, lu(a, !1), e = c.updateQueue, t.updateQueue = e, js(t, e), t.subtreeFlags = 0, e = n, n = t.child; n !== null; )
                    Nd(n, e), n = n.sibling;
                  return te(
                    xt,
                    xt.current & 1 | 2
                  ), je && Jl(t, a.treeForkCount), t.child;
                }
                e = e.sibling;
              }
            a.tail !== null && vt() > qs && (t.flags |= 128, s = !0, lu(a, !1), t.lanes = 4194304);
          }
        else {
          if (!s)
            if (e = xs(c), e !== null) {
              if (t.flags |= 128, s = !0, e = e.updateQueue, t.updateQueue = e, js(t, e), lu(a, !0), a.tail === null && a.tailMode === "hidden" && !c.alternate && !je)
                return rt(t), null;
            } else
              2 * vt() - a.renderingStartTime > qs && n !== 536870912 && (t.flags |= 128, s = !0, lu(a, !1), t.lanes = 4194304);
          a.isBackwards ? (c.sibling = t.child, t.child = c) : (e = a.last, e !== null ? e.sibling = c : t.child = c, a.last = c);
        }
        return a.tail !== null ? (e = a.tail, a.rendering = e, a.tail = e.sibling, a.renderingStartTime = vt(), e.sibling = null, n = xt.current, te(
          xt,
          s ? n & 1 | 2 : n & 1
        ), je && Jl(t, a.treeForkCount), e) : (rt(t), null);
      case 22:
      case 23:
        return Yn(t), vo(), a = t.memoizedState !== null, e !== null ? e.memoizedState !== null !== a && (t.flags |= 8192) : a && (t.flags |= 8192), a ? (n & 536870912) !== 0 && (t.flags & 128) === 0 && (rt(t), t.subtreeFlags & 6 && (t.flags |= 8192)) : rt(t), n = t.updateQueue, n !== null && js(t, n.retryQueue), n = null, e !== null && e.memoizedState !== null && e.memoizedState.cachePool !== null && (n = e.memoizedState.cachePool.pool), a = null, t.memoizedState !== null && t.memoizedState.cachePool !== null && (a = t.memoizedState.cachePool.pool), a !== n && (t.flags |= 2048), e !== null && V(mi), null;
      case 24:
        return n = null, e !== null && (n = e.memoizedState.cache), t.memoizedState.cache !== n && (t.flags |= 2048), Wl(zt), rt(t), null;
      case 25:
        return null;
      case 30:
        return null;
    }
    throw Error(r(156, t.tag));
  }
  function s1(e, t) {
    switch (lo(t), t.tag) {
      case 1:
        return e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
      case 3:
        return Wl(zt), Qe(), e = t.flags, (e & 65536) !== 0 && (e & 128) === 0 ? (t.flags = e & -65537 | 128, t) : null;
      case 26:
      case 27:
      case 5:
        return dl(t), null;
      case 31:
        if (t.memoizedState !== null) {
          if (Yn(t), t.alternate === null)
            throw Error(r(340));
          hi();
        }
        return e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
      case 13:
        if (Yn(t), e = t.memoizedState, e !== null && e.dehydrated !== null) {
          if (t.alternate === null)
            throw Error(r(340));
          hi();
        }
        return e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
      case 19:
        return V(xt), null;
      case 4:
        return Qe(), null;
      case 10:
        return Wl(t.type), null;
      case 22:
      case 23:
        return Yn(t), vo(), e !== null && V(mi), e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
      case 24:
        return Wl(zt), null;
      case 25:
        return null;
      default:
        return null;
    }
  }
  function um(e, t) {
    switch (lo(t), t.tag) {
      case 3:
        Wl(zt), Qe();
        break;
      case 26:
      case 27:
      case 5:
        dl(t);
        break;
      case 4:
        Qe();
        break;
      case 31:
        t.memoizedState !== null && Yn(t);
        break;
      case 13:
        Yn(t);
        break;
      case 19:
        V(xt);
        break;
      case 10:
        Wl(t.type);
        break;
      case 22:
      case 23:
        Yn(t), vo(), e !== null && V(mi);
        break;
      case 24:
        Wl(zt);
    }
  }
  function au(e, t) {
    try {
      var n = t.updateQueue, a = n !== null ? n.lastEffect : null;
      if (a !== null) {
        var s = a.next;
        n = s;
        do {
          if ((n.tag & e) === e) {
            a = void 0;
            var c = n.create, m = n.inst;
            a = c(), m.destroy = a;
          }
          n = n.next;
        } while (n !== s);
      }
    } catch (_) {
      $e(t, t.return, _);
    }
  }
  function Da(e, t, n) {
    try {
      var a = t.updateQueue, s = a !== null ? a.lastEffect : null;
      if (s !== null) {
        var c = s.next;
        a = c;
        do {
          if ((a.tag & e) === e) {
            var m = a.inst, _ = m.destroy;
            if (_ !== void 0) {
              m.destroy = void 0, s = t;
              var w = n, N = _;
              try {
                N();
              } catch (Z) {
                $e(
                  s,
                  w,
                  Z
                );
              }
            }
          }
          a = a.next;
        } while (a !== c);
      }
    } catch (Z) {
      $e(t, t.return, Z);
    }
  }
  function sm(e) {
    var t = e.updateQueue;
    if (t !== null) {
      var n = e.stateNode;
      try {
        Id(t, n);
      } catch (a) {
        $e(e, e.return, a);
      }
    }
  }
  function cm(e, t, n) {
    n.props = bi(
      e.type,
      e.memoizedProps
    ), n.state = e.memoizedState;
    try {
      n.componentWillUnmount();
    } catch (a) {
      $e(e, t, a);
    }
  }
  function iu(e, t) {
    try {
      var n = e.ref;
      if (n !== null) {
        switch (e.tag) {
          case 26:
          case 27:
          case 5:
            var a = e.stateNode;
            break;
          case 30:
            a = e.stateNode;
            break;
          default:
            a = e.stateNode;
        }
        typeof n == "function" ? e.refCleanup = n(a) : n.current = a;
      }
    } catch (s) {
      $e(e, t, s);
    }
  }
  function Cl(e, t) {
    var n = e.ref, a = e.refCleanup;
    if (n !== null)
      if (typeof a == "function")
        try {
          a();
        } catch (s) {
          $e(e, t, s);
        } finally {
          e.refCleanup = null, e = e.alternate, e != null && (e.refCleanup = null);
        }
      else if (typeof n == "function")
        try {
          n(null);
        } catch (s) {
          $e(e, t, s);
        }
      else n.current = null;
  }
  function om(e) {
    var t = e.type, n = e.memoizedProps, a = e.stateNode;
    try {
      e: switch (t) {
        case "button":
        case "input":
        case "select":
        case "textarea":
          n.autoFocus && a.focus();
          break e;
        case "img":
          n.src ? a.src = n.src : n.srcSet && (a.srcset = n.srcSet);
      }
    } catch (s) {
      $e(e, e.return, s);
    }
  }
  function Wo(e, t, n) {
    try {
      var a = e.stateNode;
      M1(a, e.type, n, t), a[pt] = t;
    } catch (s) {
      $e(e, e.return, s);
    }
  }
  function fm(e) {
    return e.tag === 5 || e.tag === 3 || e.tag === 26 || e.tag === 27 && qa(e.type) || e.tag === 4;
  }
  function Io(e) {
    e: for (; ; ) {
      for (; e.sibling === null; ) {
        if (e.return === null || fm(e.return)) return null;
        e = e.return;
      }
      for (e.sibling.return = e.return, e = e.sibling; e.tag !== 5 && e.tag !== 6 && e.tag !== 18; ) {
        if (e.tag === 27 && qa(e.type) || e.flags & 2 || e.child === null || e.tag === 4) continue e;
        e.child.return = e, e = e.child;
      }
      if (!(e.flags & 2)) return e.stateNode;
    }
  }
  function Po(e, t, n) {
    var a = e.tag;
    if (a === 5 || a === 6)
      e = e.stateNode, t ? (n.nodeType === 9 ? n.body : n.nodeName === "HTML" ? n.ownerDocument.body : n).insertBefore(e, t) : (t = n.nodeType === 9 ? n.body : n.nodeName === "HTML" ? n.ownerDocument.body : n, t.appendChild(e), n = n._reactRootContainer, n != null || t.onclick !== null || (t.onclick = O));
    else if (a !== 4 && (a === 27 && qa(e.type) && (n = e.stateNode, t = null), e = e.child, e !== null))
      for (Po(e, t, n), e = e.sibling; e !== null; )
        Po(e, t, n), e = e.sibling;
  }
  function Us(e, t, n) {
    var a = e.tag;
    if (a === 5 || a === 6)
      e = e.stateNode, t ? n.insertBefore(e, t) : n.appendChild(e);
    else if (a !== 4 && (a === 27 && qa(e.type) && (n = e.stateNode), e = e.child, e !== null))
      for (Us(e, t, n), e = e.sibling; e !== null; )
        Us(e, t, n), e = e.sibling;
  }
  function hm(e) {
    var t = e.stateNode, n = e.memoizedProps;
    try {
      for (var a = e.type, s = t.attributes; s.length; )
        t.removeAttributeNode(s[0]);
      Pt(t, a, n), t[dt] = e, t[pt] = n;
    } catch (c) {
      $e(e, e.return, c);
    }
  }
  var na = !1, Mt = !1, ef = !1, dm = typeof WeakSet == "function" ? WeakSet : Set, Bt = null;
  function c1(e, t) {
    if (e = e.containerInfo, xf = lc, e = Ed(e), Zc(e)) {
      if ("selectionStart" in e)
        var n = {
          start: e.selectionStart,
          end: e.selectionEnd
        };
      else
        e: {
          n = (n = e.ownerDocument) && n.defaultView || window;
          var a = n.getSelection && n.getSelection();
          if (a && a.rangeCount !== 0) {
            n = a.anchorNode;
            var s = a.anchorOffset, c = a.focusNode;
            a = a.focusOffset;
            try {
              n.nodeType, c.nodeType;
            } catch {
              n = null;
              break e;
            }
            var m = 0, _ = -1, w = -1, N = 0, Z = 0, J = e, U = null;
            t: for (; ; ) {
              for (var B; J !== n || s !== 0 && J.nodeType !== 3 || (_ = m + s), J !== c || a !== 0 && J.nodeType !== 3 || (w = m + a), J.nodeType === 3 && (m += J.nodeValue.length), (B = J.firstChild) !== null; )
                U = J, J = B;
              for (; ; ) {
                if (J === e) break t;
                if (U === n && ++N === s && (_ = m), U === c && ++Z === a && (w = m), (B = J.nextSibling) !== null) break;
                J = U, U = J.parentNode;
              }
              J = B;
            }
            n = _ === -1 || w === -1 ? null : { start: _, end: w };
          } else n = null;
        }
      n = n || { start: 0, end: 0 };
    } else n = null;
    for (Tf = { focusedElem: e, selectionRange: n }, lc = !1, Bt = t; Bt !== null; )
      if (t = Bt, e = t.child, (t.subtreeFlags & 1028) !== 0 && e !== null)
        e.return = t, Bt = e;
      else
        for (; Bt !== null; ) {
          switch (t = Bt, c = t.alternate, e = t.flags, t.tag) {
            case 0:
              if ((e & 4) !== 0 && (e = t.updateQueue, e = e !== null ? e.events : null, e !== null))
                for (n = 0; n < e.length; n++)
                  s = e[n], s.ref.impl = s.nextImpl;
              break;
            case 11:
            case 15:
              break;
            case 1:
              if ((e & 1024) !== 0 && c !== null) {
                e = void 0, n = t, s = c.memoizedProps, c = c.memoizedState, a = n.stateNode;
                try {
                  var fe = bi(
                    n.type,
                    s
                  );
                  e = a.getSnapshotBeforeUpdate(
                    fe,
                    c
                  ), a.__reactInternalSnapshotBeforeUpdate = e;
                } catch (ye) {
                  $e(
                    n,
                    n.return,
                    ye
                  );
                }
              }
              break;
            case 3:
              if ((e & 1024) !== 0) {
                if (e = t.stateNode.containerInfo, n = e.nodeType, n === 9)
                  wf(e);
                else if (n === 1)
                  switch (e.nodeName) {
                    case "HEAD":
                    case "HTML":
                    case "BODY":
                      wf(e);
                      break;
                    default:
                      e.textContent = "";
                  }
              }
              break;
            case 5:
            case 26:
            case 27:
            case 6:
            case 4:
            case 17:
              break;
            default:
              if ((e & 1024) !== 0) throw Error(r(163));
          }
          if (e = t.sibling, e !== null) {
            e.return = t.return, Bt = e;
            break;
          }
          Bt = t.return;
        }
  }
  function pm(e, t, n) {
    var a = n.flags;
    switch (n.tag) {
      case 0:
      case 11:
      case 15:
        aa(e, n), a & 4 && au(5, n);
        break;
      case 1:
        if (aa(e, n), a & 4)
          if (e = n.stateNode, t === null)
            try {
              e.componentDidMount();
            } catch (m) {
              $e(n, n.return, m);
            }
          else {
            var s = bi(
              n.type,
              t.memoizedProps
            );
            t = t.memoizedState;
            try {
              e.componentDidUpdate(
                s,
                t,
                e.__reactInternalSnapshotBeforeUpdate
              );
            } catch (m) {
              $e(
                n,
                n.return,
                m
              );
            }
          }
        a & 64 && sm(n), a & 512 && iu(n, n.return);
        break;
      case 3:
        if (aa(e, n), a & 64 && (e = n.updateQueue, e !== null)) {
          if (t = null, n.child !== null)
            switch (n.child.tag) {
              case 27:
              case 5:
                t = n.child.stateNode;
                break;
              case 1:
                t = n.child.stateNode;
            }
          try {
            Id(e, t);
          } catch (m) {
            $e(n, n.return, m);
          }
        }
        break;
      case 27:
        t === null && a & 4 && hm(n);
      case 26:
      case 5:
        aa(e, n), t === null && a & 4 && om(n), a & 512 && iu(n, n.return);
        break;
      case 12:
        aa(e, n);
        break;
      case 31:
        aa(e, n), a & 4 && ym(e, n);
        break;
      case 13:
        aa(e, n), a & 4 && _m(e, n), a & 64 && (e = n.memoizedState, e !== null && (e = e.dehydrated, e !== null && (n = _1.bind(
          null,
          n
        ), H1(e, n))));
        break;
      case 22:
        if (a = n.memoizedState !== null || na, !a) {
          t = t !== null && t.memoizedState !== null || Mt, s = na;
          var c = Mt;
          na = a, (Mt = t) && !c ? ia(
            e,
            n,
            (n.subtreeFlags & 8772) !== 0
          ) : aa(e, n), na = s, Mt = c;
        }
        break;
      case 30:
        break;
      default:
        aa(e, n);
    }
  }
  function mm(e) {
    var t = e.alternate;
    t !== null && (e.alternate = null, mm(t)), e.child = null, e.deletions = null, e.sibling = null, e.tag === 5 && (t = e.stateNode, t !== null && Me(t)), e.stateNode = null, e.return = null, e.dependencies = null, e.memoizedProps = null, e.memoizedState = null, e.pendingProps = null, e.stateNode = null, e.updateQueue = null;
  }
  var st = null, Sn = !1;
  function la(e, t, n) {
    for (n = n.child; n !== null; )
      gm(e, t, n), n = n.sibling;
  }
  function gm(e, t, n) {
    if (bt && typeof bt.onCommitFiberUnmount == "function")
      try {
        bt.onCommitFiberUnmount(_n, n);
      } catch {
      }
    switch (n.tag) {
      case 26:
        Mt || Cl(n, t), la(
          e,
          t,
          n
        ), n.memoizedState ? n.memoizedState.count-- : n.stateNode && (n = n.stateNode, n.parentNode.removeChild(n));
        break;
      case 27:
        Mt || Cl(n, t);
        var a = st, s = Sn;
        qa(n.type) && (st = n.stateNode, Sn = !1), la(
          e,
          t,
          n
        ), pu(n.stateNode), st = a, Sn = s;
        break;
      case 5:
        Mt || Cl(n, t);
      case 6:
        if (a = st, s = Sn, st = null, la(
          e,
          t,
          n
        ), st = a, Sn = s, st !== null)
          if (Sn)
            try {
              (st.nodeType === 9 ? st.body : st.nodeName === "HTML" ? st.ownerDocument.body : st).removeChild(n.stateNode);
            } catch (c) {
              $e(
                n,
                t,
                c
              );
            }
          else
            try {
              st.removeChild(n.stateNode);
            } catch (c) {
              $e(
                n,
                t,
                c
              );
            }
        break;
      case 18:
        st !== null && (Sn ? (e = st, sg(
          e.nodeType === 9 ? e.body : e.nodeName === "HTML" ? e.ownerDocument.body : e,
          n.stateNode
        ), mr(e)) : sg(st, n.stateNode));
        break;
      case 4:
        a = st, s = Sn, st = n.stateNode.containerInfo, Sn = !0, la(
          e,
          t,
          n
        ), st = a, Sn = s;
        break;
      case 0:
      case 11:
      case 14:
      case 15:
        Da(2, n, t), Mt || Da(4, n, t), la(
          e,
          t,
          n
        );
        break;
      case 1:
        Mt || (Cl(n, t), a = n.stateNode, typeof a.componentWillUnmount == "function" && cm(
          n,
          t,
          a
        )), la(
          e,
          t,
          n
        );
        break;
      case 21:
        la(
          e,
          t,
          n
        );
        break;
      case 22:
        Mt = (a = Mt) || n.memoizedState !== null, la(
          e,
          t,
          n
        ), Mt = a;
        break;
      default:
        la(
          e,
          t,
          n
        );
    }
  }
  function ym(e, t) {
    if (t.memoizedState === null && (e = t.alternate, e !== null && (e = e.memoizedState, e !== null))) {
      e = e.dehydrated;
      try {
        mr(e);
      } catch (n) {
        $e(t, t.return, n);
      }
    }
  }
  function _m(e, t) {
    if (t.memoizedState === null && (e = t.alternate, e !== null && (e = e.memoizedState, e !== null && (e = e.dehydrated, e !== null))))
      try {
        mr(e);
      } catch (n) {
        $e(t, t.return, n);
      }
  }
  function o1(e) {
    switch (e.tag) {
      case 31:
      case 13:
      case 19:
        var t = e.stateNode;
        return t === null && (t = e.stateNode = new dm()), t;
      case 22:
        return e = e.stateNode, t = e._retryCache, t === null && (t = e._retryCache = new dm()), t;
      default:
        throw Error(r(435, e.tag));
    }
  }
  function Ls(e, t) {
    var n = o1(e);
    t.forEach(function(a) {
      if (!n.has(a)) {
        n.add(a);
        var s = v1.bind(null, e, a);
        a.then(s, s);
      }
    });
  }
  function xn(e, t) {
    var n = t.deletions;
    if (n !== null)
      for (var a = 0; a < n.length; a++) {
        var s = n[a], c = e, m = t, _ = m;
        e: for (; _ !== null; ) {
          switch (_.tag) {
            case 27:
              if (qa(_.type)) {
                st = _.stateNode, Sn = !1;
                break e;
              }
              break;
            case 5:
              st = _.stateNode, Sn = !1;
              break e;
            case 3:
            case 4:
              st = _.stateNode.containerInfo, Sn = !0;
              break e;
          }
          _ = _.return;
        }
        if (st === null) throw Error(r(160));
        gm(c, m, s), st = null, Sn = !1, c = s.alternate, c !== null && (c.return = null), s.return = null;
      }
    if (t.subtreeFlags & 13886)
      for (t = t.child; t !== null; )
        vm(t, e), t = t.sibling;
  }
  var bl = null;
  function vm(e, t) {
    var n = e.alternate, a = e.flags;
    switch (e.tag) {
      case 0:
      case 11:
      case 14:
      case 15:
        xn(t, e), Tn(e), a & 4 && (Da(3, e, e.return), au(3, e), Da(5, e, e.return));
        break;
      case 1:
        xn(t, e), Tn(e), a & 512 && (Mt || n === null || Cl(n, n.return)), a & 64 && na && (e = e.updateQueue, e !== null && (a = e.callbacks, a !== null && (n = e.shared.hiddenCallbacks, e.shared.hiddenCallbacks = n === null ? a : n.concat(a))));
        break;
      case 26:
        var s = bl;
        if (xn(t, e), Tn(e), a & 512 && (Mt || n === null || Cl(n, n.return)), a & 4) {
          var c = n !== null ? n.memoizedState : null;
          if (a = e.memoizedState, n === null)
            if (a === null)
              if (e.stateNode === null) {
                e: {
                  a = e.type, n = e.memoizedProps, s = s.ownerDocument || s;
                  t: switch (a) {
                    case "title":
                      c = s.getElementsByTagName("title")[0], (!c || c[ne] || c[dt] || c.namespaceURI === "http://www.w3.org/2000/svg" || c.hasAttribute("itemprop")) && (c = s.createElement(a), s.head.insertBefore(
                        c,
                        s.querySelector("head > title")
                      )), Pt(c, a, n), c[dt] = e, ut(c), a = c;
                      break e;
                    case "link":
                      var m = vg(
                        "link",
                        "href",
                        s
                      ).get(a + (n.href || ""));
                      if (m) {
                        for (var _ = 0; _ < m.length; _++)
                          if (c = m[_], c.getAttribute("href") === (n.href == null || n.href === "" ? null : n.href) && c.getAttribute("rel") === (n.rel == null ? null : n.rel) && c.getAttribute("title") === (n.title == null ? null : n.title) && c.getAttribute("crossorigin") === (n.crossOrigin == null ? null : n.crossOrigin)) {
                            m.splice(_, 1);
                            break t;
                          }
                      }
                      c = s.createElement(a), Pt(c, a, n), s.head.appendChild(c);
                      break;
                    case "meta":
                      if (m = vg(
                        "meta",
                        "content",
                        s
                      ).get(a + (n.content || ""))) {
                        for (_ = 0; _ < m.length; _++)
                          if (c = m[_], c.getAttribute("content") === (n.content == null ? null : "" + n.content) && c.getAttribute("name") === (n.name == null ? null : n.name) && c.getAttribute("property") === (n.property == null ? null : n.property) && c.getAttribute("http-equiv") === (n.httpEquiv == null ? null : n.httpEquiv) && c.getAttribute("charset") === (n.charSet == null ? null : n.charSet)) {
                            m.splice(_, 1);
                            break t;
                          }
                      }
                      c = s.createElement(a), Pt(c, a, n), s.head.appendChild(c);
                      break;
                    default:
                      throw Error(r(468, a));
                  }
                  c[dt] = e, ut(c), a = c;
                }
                e.stateNode = a;
              } else
                bg(
                  s,
                  e.type,
                  e.stateNode
                );
            else
              e.stateNode = _g(
                s,
                a,
                e.memoizedProps
              );
          else
            c !== a ? (c === null ? n.stateNode !== null && (n = n.stateNode, n.parentNode.removeChild(n)) : c.count--, a === null ? bg(
              s,
              e.type,
              e.stateNode
            ) : _g(
              s,
              a,
              e.memoizedProps
            )) : a === null && e.stateNode !== null && Wo(
              e,
              e.memoizedProps,
              n.memoizedProps
            );
        }
        break;
      case 27:
        xn(t, e), Tn(e), a & 512 && (Mt || n === null || Cl(n, n.return)), n !== null && a & 4 && Wo(
          e,
          e.memoizedProps,
          n.memoizedProps
        );
        break;
      case 5:
        if (xn(t, e), Tn(e), a & 512 && (Mt || n === null || Cl(n, n.return)), e.flags & 32) {
          s = e.stateNode;
          try {
            Kl(s, "");
          } catch (fe) {
            $e(e, e.return, fe);
          }
        }
        a & 4 && e.stateNode != null && (s = e.memoizedProps, Wo(
          e,
          s,
          n !== null ? n.memoizedProps : s
        )), a & 1024 && (ef = !0);
        break;
      case 6:
        if (xn(t, e), Tn(e), a & 4) {
          if (e.stateNode === null)
            throw Error(r(162));
          a = e.memoizedProps, n = e.stateNode;
          try {
            n.nodeValue = a;
          } catch (fe) {
            $e(e, e.return, fe);
          }
        }
        break;
      case 3:
        if (Ps = null, s = bl, bl = Ws(t.containerInfo), xn(t, e), bl = s, Tn(e), a & 4 && n !== null && n.memoizedState.isDehydrated)
          try {
            mr(t.containerInfo);
          } catch (fe) {
            $e(e, e.return, fe);
          }
        ef && (ef = !1, bm(e));
        break;
      case 4:
        a = bl, bl = Ws(
          e.stateNode.containerInfo
        ), xn(t, e), Tn(e), bl = a;
        break;
      case 12:
        xn(t, e), Tn(e);
        break;
      case 31:
        xn(t, e), Tn(e), a & 4 && (a = e.updateQueue, a !== null && (e.updateQueue = null, Ls(e, a)));
        break;
      case 13:
        xn(t, e), Tn(e), e.child.flags & 8192 && e.memoizedState !== null != (n !== null && n.memoizedState !== null) && (Bs = vt()), a & 4 && (a = e.updateQueue, a !== null && (e.updateQueue = null, Ls(e, a)));
        break;
      case 22:
        s = e.memoizedState !== null;
        var w = n !== null && n.memoizedState !== null, N = na, Z = Mt;
        if (na = N || s, Mt = Z || w, xn(t, e), Mt = Z, na = N, Tn(e), a & 8192)
          e: for (t = e.stateNode, t._visibility = s ? t._visibility & -2 : t._visibility | 1, s && (n === null || w || na || Mt || Si(e)), n = null, t = e; ; ) {
            if (t.tag === 5 || t.tag === 26) {
              if (n === null) {
                w = n = t;
                try {
                  if (c = w.stateNode, s)
                    m = c.style, typeof m.setProperty == "function" ? m.setProperty("display", "none", "important") : m.display = "none";
                  else {
                    _ = w.stateNode;
                    var J = w.memoizedProps.style, U = J != null && J.hasOwnProperty("display") ? J.display : null;
                    _.style.display = U == null || typeof U == "boolean" ? "" : ("" + U).trim();
                  }
                } catch (fe) {
                  $e(w, w.return, fe);
                }
              }
            } else if (t.tag === 6) {
              if (n === null) {
                w = t;
                try {
                  w.stateNode.nodeValue = s ? "" : w.memoizedProps;
                } catch (fe) {
                  $e(w, w.return, fe);
                }
              }
            } else if (t.tag === 18) {
              if (n === null) {
                w = t;
                try {
                  var B = w.stateNode;
                  s ? cg(B, !0) : cg(w.stateNode, !1);
                } catch (fe) {
                  $e(w, w.return, fe);
                }
              }
            } else if ((t.tag !== 22 && t.tag !== 23 || t.memoizedState === null || t === e) && t.child !== null) {
              t.child.return = t, t = t.child;
              continue;
            }
            if (t === e) break e;
            for (; t.sibling === null; ) {
              if (t.return === null || t.return === e) break e;
              n === t && (n = null), t = t.return;
            }
            n === t && (n = null), t.sibling.return = t.return, t = t.sibling;
          }
        a & 4 && (a = e.updateQueue, a !== null && (n = a.retryQueue, n !== null && (a.retryQueue = null, Ls(e, n))));
        break;
      case 19:
        xn(t, e), Tn(e), a & 4 && (a = e.updateQueue, a !== null && (e.updateQueue = null, Ls(e, a)));
        break;
      case 30:
        break;
      case 21:
        break;
      default:
        xn(t, e), Tn(e);
    }
  }
  function Tn(e) {
    var t = e.flags;
    if (t & 2) {
      try {
        for (var n, a = e.return; a !== null; ) {
          if (fm(a)) {
            n = a;
            break;
          }
          a = a.return;
        }
        if (n == null) throw Error(r(160));
        switch (n.tag) {
          case 27:
            var s = n.stateNode, c = Io(e);
            Us(e, c, s);
            break;
          case 5:
            var m = n.stateNode;
            n.flags & 32 && (Kl(m, ""), n.flags &= -33);
            var _ = Io(e);
            Us(e, _, m);
            break;
          case 3:
          case 4:
            var w = n.stateNode.containerInfo, N = Io(e);
            Po(
              e,
              N,
              w
            );
            break;
          default:
            throw Error(r(161));
        }
      } catch (Z) {
        $e(e, e.return, Z);
      }
      e.flags &= -3;
    }
    t & 4096 && (e.flags &= -4097);
  }
  function bm(e) {
    if (e.subtreeFlags & 1024)
      for (e = e.child; e !== null; ) {
        var t = e;
        bm(t), t.tag === 5 && t.flags & 1024 && t.stateNode.reset(), e = e.sibling;
      }
  }
  function aa(e, t) {
    if (t.subtreeFlags & 8772)
      for (t = t.child; t !== null; )
        pm(e, t.alternate, t), t = t.sibling;
  }
  function Si(e) {
    for (e = e.child; e !== null; ) {
      var t = e;
      switch (t.tag) {
        case 0:
        case 11:
        case 14:
        case 15:
          Da(4, t, t.return), Si(t);
          break;
        case 1:
          Cl(t, t.return);
          var n = t.stateNode;
          typeof n.componentWillUnmount == "function" && cm(
            t,
            t.return,
            n
          ), Si(t);
          break;
        case 27:
          pu(t.stateNode);
        case 26:
        case 5:
          Cl(t, t.return), Si(t);
          break;
        case 22:
          t.memoizedState === null && Si(t);
          break;
        case 30:
          Si(t);
          break;
        default:
          Si(t);
      }
      e = e.sibling;
    }
  }
  function ia(e, t, n) {
    for (n = n && (t.subtreeFlags & 8772) !== 0, t = t.child; t !== null; ) {
      var a = t.alternate, s = e, c = t, m = c.flags;
      switch (c.tag) {
        case 0:
        case 11:
        case 15:
          ia(
            s,
            c,
            n
          ), au(4, c);
          break;
        case 1:
          if (ia(
            s,
            c,
            n
          ), a = c, s = a.stateNode, typeof s.componentDidMount == "function")
            try {
              s.componentDidMount();
            } catch (N) {
              $e(a, a.return, N);
            }
          if (a = c, s = a.updateQueue, s !== null) {
            var _ = a.stateNode;
            try {
              var w = s.shared.hiddenCallbacks;
              if (w !== null)
                for (s.shared.hiddenCallbacks = null, s = 0; s < w.length; s++)
                  Wd(w[s], _);
            } catch (N) {
              $e(a, a.return, N);
            }
          }
          n && m & 64 && sm(c), iu(c, c.return);
          break;
        case 27:
          hm(c);
        case 26:
        case 5:
          ia(
            s,
            c,
            n
          ), n && a === null && m & 4 && om(c), iu(c, c.return);
          break;
        case 12:
          ia(
            s,
            c,
            n
          );
          break;
        case 31:
          ia(
            s,
            c,
            n
          ), n && m & 4 && ym(s, c);
          break;
        case 13:
          ia(
            s,
            c,
            n
          ), n && m & 4 && _m(s, c);
          break;
        case 22:
          c.memoizedState === null && ia(
            s,
            c,
            n
          ), iu(c, c.return);
          break;
        case 30:
          break;
        default:
          ia(
            s,
            c,
            n
          );
      }
      t = t.sibling;
    }
  }
  function tf(e, t) {
    var n = null;
    e !== null && e.memoizedState !== null && e.memoizedState.cachePool !== null && (n = e.memoizedState.cachePool.pool), e = null, t.memoizedState !== null && t.memoizedState.cachePool !== null && (e = t.memoizedState.cachePool.pool), e !== n && (e != null && e.refCount++, n != null && Vr(n));
  }
  function nf(e, t) {
    e = null, t.alternate !== null && (e = t.alternate.memoizedState.cache), t = t.memoizedState.cache, t !== e && (t.refCount++, e != null && Vr(e));
  }
  function Sl(e, t, n, a) {
    if (t.subtreeFlags & 10256)
      for (t = t.child; t !== null; )
        Sm(
          e,
          t,
          n,
          a
        ), t = t.sibling;
  }
  function Sm(e, t, n, a) {
    var s = t.flags;
    switch (t.tag) {
      case 0:
      case 11:
      case 15:
        Sl(
          e,
          t,
          n,
          a
        ), s & 2048 && au(9, t);
        break;
      case 1:
        Sl(
          e,
          t,
          n,
          a
        );
        break;
      case 3:
        Sl(
          e,
          t,
          n,
          a
        ), s & 2048 && (e = null, t.alternate !== null && (e = t.alternate.memoizedState.cache), t = t.memoizedState.cache, t !== e && (t.refCount++, e != null && Vr(e)));
        break;
      case 12:
        if (s & 2048) {
          Sl(
            e,
            t,
            n,
            a
          ), e = t.stateNode;
          try {
            var c = t.memoizedProps, m = c.id, _ = c.onPostCommit;
            typeof _ == "function" && _(
              m,
              t.alternate === null ? "mount" : "update",
              e.passiveEffectDuration,
              -0
            );
          } catch (w) {
            $e(t, t.return, w);
          }
        } else
          Sl(
            e,
            t,
            n,
            a
          );
        break;
      case 31:
        Sl(
          e,
          t,
          n,
          a
        );
        break;
      case 13:
        Sl(
          e,
          t,
          n,
          a
        );
        break;
      case 23:
        break;
      case 22:
        c = t.stateNode, m = t.alternate, t.memoizedState !== null ? c._visibility & 2 ? Sl(
          e,
          t,
          n,
          a
        ) : ru(e, t) : c._visibility & 2 ? Sl(
          e,
          t,
          n,
          a
        ) : (c._visibility |= 2, ar(
          e,
          t,
          n,
          a,
          (t.subtreeFlags & 10256) !== 0 || !1
        )), s & 2048 && tf(m, t);
        break;
      case 24:
        Sl(
          e,
          t,
          n,
          a
        ), s & 2048 && nf(t.alternate, t);
        break;
      default:
        Sl(
          e,
          t,
          n,
          a
        );
    }
  }
  function ar(e, t, n, a, s) {
    for (s = s && ((t.subtreeFlags & 10256) !== 0 || !1), t = t.child; t !== null; ) {
      var c = e, m = t, _ = n, w = a, N = m.flags;
      switch (m.tag) {
        case 0:
        case 11:
        case 15:
          ar(
            c,
            m,
            _,
            w,
            s
          ), au(8, m);
          break;
        case 23:
          break;
        case 22:
          var Z = m.stateNode;
          m.memoizedState !== null ? Z._visibility & 2 ? ar(
            c,
            m,
            _,
            w,
            s
          ) : ru(
            c,
            m
          ) : (Z._visibility |= 2, ar(
            c,
            m,
            _,
            w,
            s
          )), s && N & 2048 && tf(
            m.alternate,
            m
          );
          break;
        case 24:
          ar(
            c,
            m,
            _,
            w,
            s
          ), s && N & 2048 && nf(m.alternate, m);
          break;
        default:
          ar(
            c,
            m,
            _,
            w,
            s
          );
      }
      t = t.sibling;
    }
  }
  function ru(e, t) {
    if (t.subtreeFlags & 10256)
      for (t = t.child; t !== null; ) {
        var n = e, a = t, s = a.flags;
        switch (a.tag) {
          case 22:
            ru(n, a), s & 2048 && tf(
              a.alternate,
              a
            );
            break;
          case 24:
            ru(n, a), s & 2048 && nf(a.alternate, a);
            break;
          default:
            ru(n, a);
        }
        t = t.sibling;
      }
  }
  var uu = 8192;
  function ir(e, t, n) {
    if (e.subtreeFlags & uu)
      for (e = e.child; e !== null; )
        xm(
          e,
          t,
          n
        ), e = e.sibling;
  }
  function xm(e, t, n) {
    switch (e.tag) {
      case 26:
        ir(
          e,
          t,
          n
        ), e.flags & uu && e.memoizedState !== null && F1(
          n,
          bl,
          e.memoizedState,
          e.memoizedProps
        );
        break;
      case 5:
        ir(
          e,
          t,
          n
        );
        break;
      case 3:
      case 4:
        var a = bl;
        bl = Ws(e.stateNode.containerInfo), ir(
          e,
          t,
          n
        ), bl = a;
        break;
      case 22:
        e.memoizedState === null && (a = e.alternate, a !== null && a.memoizedState !== null ? (a = uu, uu = 16777216, ir(
          e,
          t,
          n
        ), uu = a) : ir(
          e,
          t,
          n
        ));
        break;
      default:
        ir(
          e,
          t,
          n
        );
    }
  }
  function Tm(e) {
    var t = e.alternate;
    if (t !== null && (e = t.child, e !== null)) {
      t.child = null;
      do
        t = e.sibling, e.sibling = null, e = t;
      while (e !== null);
    }
  }
  function su(e) {
    var t = e.deletions;
    if ((e.flags & 16) !== 0) {
      if (t !== null)
        for (var n = 0; n < t.length; n++) {
          var a = t[n];
          Bt = a, Em(
            a,
            e
          );
        }
      Tm(e);
    }
    if (e.subtreeFlags & 10256)
      for (e = e.child; e !== null; )
        Am(e), e = e.sibling;
  }
  function Am(e) {
    switch (e.tag) {
      case 0:
      case 11:
      case 15:
        su(e), e.flags & 2048 && Da(9, e, e.return);
        break;
      case 3:
        su(e);
        break;
      case 12:
        su(e);
        break;
      case 22:
        var t = e.stateNode;
        e.memoizedState !== null && t._visibility & 2 && (e.return === null || e.return.tag !== 13) ? (t._visibility &= -3, Hs(e)) : su(e);
        break;
      default:
        su(e);
    }
  }
  function Hs(e) {
    var t = e.deletions;
    if ((e.flags & 16) !== 0) {
      if (t !== null)
        for (var n = 0; n < t.length; n++) {
          var a = t[n];
          Bt = a, Em(
            a,
            e
          );
        }
      Tm(e);
    }
    for (e = e.child; e !== null; ) {
      switch (t = e, t.tag) {
        case 0:
        case 11:
        case 15:
          Da(8, t, t.return), Hs(t);
          break;
        case 22:
          n = t.stateNode, n._visibility & 2 && (n._visibility &= -3, Hs(t));
          break;
        default:
          Hs(t);
      }
      e = e.sibling;
    }
  }
  function Em(e, t) {
    for (; Bt !== null; ) {
      var n = Bt;
      switch (n.tag) {
        case 0:
        case 11:
        case 15:
          Da(8, n, t);
          break;
        case 23:
        case 22:
          if (n.memoizedState !== null && n.memoizedState.cachePool !== null) {
            var a = n.memoizedState.cachePool.pool;
            a != null && a.refCount++;
          }
          break;
        case 24:
          Vr(n.memoizedState.cache);
      }
      if (a = n.child, a !== null) a.return = n, Bt = a;
      else
        e: for (n = e; Bt !== null; ) {
          a = Bt;
          var s = a.sibling, c = a.return;
          if (mm(a), a === n) {
            Bt = null;
            break e;
          }
          if (s !== null) {
            s.return = c, Bt = s;
            break e;
          }
          Bt = c;
        }
    }
  }
  var f1 = {
    getCacheForType: function(e) {
      var t = Wt(zt), n = t.data.get(e);
      return n === void 0 && (n = e(), t.data.set(e, n)), n;
    },
    cacheSignal: function() {
      return Wt(zt).controller.signal;
    }
  }, h1 = typeof WeakMap == "function" ? WeakMap : Map, Xe = 0, tt = null, Re = null, De = 0, Ke = 0, Gn = null, Na = !1, rr = !1, lf = !1, ra = 0, gt = 0, ja = 0, xi = 0, af = 0, Xn = 0, ur = 0, cu = null, An = null, rf = !1, Bs = 0, wm = 0, qs = 1 / 0, Ys = null, Ua = null, Nt = 0, La = null, sr = null, ua = 0, uf = 0, sf = null, zm = null, ou = 0, cf = null;
  function Qn() {
    return (Xe & 2) !== 0 && De !== 0 ? De & -De : L.T !== null ? mf() : va();
  }
  function km() {
    if (Xn === 0)
      if ((De & 536870912) === 0 || je) {
        var e = Lt;
        Lt <<= 1, (Lt & 3932160) === 0 && (Lt = 262144), Xn = e;
      } else Xn = 536870912;
    return e = qn.current, e !== null && (e.flags |= 32), Xn;
  }
  function En(e, t, n) {
    (e === tt && (Ke === 2 || Ke === 9) || e.cancelPendingCommit !== null) && (cr(e, 0), Ha(
      e,
      De,
      Xn,
      !1
    )), sn(e, n), ((Xe & 2) === 0 || e !== tt) && (e === tt && ((Xe & 2) === 0 && (xi |= n), gt === 4 && Ha(
      e,
      De,
      Xn,
      !1
    )), Dl(e));
  }
  function Om(e, t, n) {
    if ((Xe & 6) !== 0) throw Error(r(327));
    var a = !n && (t & 127) === 0 && (t & e.expiredLanes) === 0 || Un(e, t), s = a ? m1(e, t) : ff(e, t, !0), c = a;
    do {
      if (s === 0) {
        rr && !a && Ha(e, t, 0, !1);
        break;
      } else {
        if (n = e.current.alternate, c && !d1(n)) {
          s = ff(e, t, !1), c = !1;
          continue;
        }
        if (s === 2) {
          if (c = t, e.errorRecoveryDisabledLanes & c)
            var m = 0;
          else
            m = e.pendingLanes & -536870913, m = m !== 0 ? m : m & 536870912 ? 536870912 : 0;
          if (m !== 0) {
            t = m;
            e: {
              var _ = e;
              s = cu;
              var w = _.current.memoizedState.isDehydrated;
              if (w && (cr(_, m).flags |= 256), m = ff(
                _,
                m,
                !1
              ), m !== 2) {
                if (lf && !w) {
                  _.errorRecoveryDisabledLanes |= c, xi |= c, s = 4;
                  break e;
                }
                c = An, An = s, c !== null && (An === null ? An = c : An.push.apply(
                  An,
                  c
                ));
              }
              s = m;
            }
            if (c = !1, s !== 2) continue;
          }
        }
        if (s === 1) {
          cr(e, 0), Ha(e, t, 0, !0);
          break;
        }
        e: {
          switch (a = e, c = s, c) {
            case 0:
            case 1:
              throw Error(r(345));
            case 4:
              if ((t & 4194048) !== t) break;
            case 6:
              Ha(
                a,
                t,
                Xn,
                !Na
              );
              break e;
            case 2:
              An = null;
              break;
            case 3:
            case 5:
              break;
            default:
              throw Error(r(329));
          }
          if ((t & 62914560) === t && (s = Bs + 300 - vt(), 10 < s)) {
            if (Ha(
              a,
              t,
              Xn,
              !Na
            ), ml(a, 0, !0) !== 0) break e;
            ua = t, a.timeoutHandle = rg(
              Mm.bind(
                null,
                a,
                n,
                An,
                Ys,
                rf,
                t,
                Xn,
                xi,
                ur,
                Na,
                c,
                "Throttled",
                -0,
                0
              ),
              s
            );
            break e;
          }
          Mm(
            a,
            n,
            An,
            Ys,
            rf,
            t,
            Xn,
            xi,
            ur,
            Na,
            c,
            null,
            -0,
            0
          );
        }
      }
      break;
    } while (!0);
    Dl(e);
  }
  function Mm(e, t, n, a, s, c, m, _, w, N, Z, J, U, B) {
    if (e.timeoutHandle = -1, J = t.subtreeFlags, J & 8192 || (J & 16785408) === 16785408) {
      J = {
        stylesheets: null,
        count: 0,
        imgCount: 0,
        imgBytes: 0,
        suspenseyImages: [],
        waitingForImages: !0,
        waitingForViewTransition: !1,
        unsuspend: O
      }, xm(
        t,
        c,
        J
      );
      var fe = (c & 62914560) === c ? Bs - vt() : (c & 4194048) === c ? wm - vt() : 0;
      if (fe = W1(
        J,
        fe
      ), fe !== null) {
        ua = c, e.cancelPendingCommit = fe(
          Hm.bind(
            null,
            e,
            t,
            c,
            n,
            a,
            s,
            m,
            _,
            w,
            Z,
            J,
            null,
            U,
            B
          )
        ), Ha(e, c, m, !N);
        return;
      }
    }
    Hm(
      e,
      t,
      c,
      n,
      a,
      s,
      m,
      _,
      w
    );
  }
  function d1(e) {
    for (var t = e; ; ) {
      var n = t.tag;
      if ((n === 0 || n === 11 || n === 15) && t.flags & 16384 && (n = t.updateQueue, n !== null && (n = n.stores, n !== null)))
        for (var a = 0; a < n.length; a++) {
          var s = n[a], c = s.getSnapshot;
          s = s.value;
          try {
            if (!Hn(c(), s)) return !1;
          } catch {
            return !1;
          }
        }
      if (n = t.child, t.subtreeFlags & 16384 && n !== null)
        n.return = t, t = n;
      else {
        if (t === e) break;
        for (; t.sibling === null; ) {
          if (t.return === null || t.return === e) return !0;
          t = t.return;
        }
        t.sibling.return = t.return, t = t.sibling;
      }
    }
    return !0;
  }
  function Ha(e, t, n, a) {
    t &= ~af, t &= ~xi, e.suspendedLanes |= t, e.pingedLanes &= ~t, a && (e.warmLanes |= t), a = e.expirationTimes;
    for (var s = t; 0 < s; ) {
      var c = 31 - St(s), m = 1 << c;
      a[c] = -1, s &= ~m;
    }
    n !== 0 && cn(e, n, t);
  }
  function Gs() {
    return (Xe & 6) === 0 ? (fu(0), !1) : !0;
  }
  function of() {
    if (Re !== null) {
      if (Ke === 0)
        var e = Re.return;
      else
        e = Re, Fl = di = null, Eo(e), Pi = null, Kr = 0, e = Re;
      for (; e !== null; )
        um(e.alternate, e), e = e.return;
      Re = null;
    }
  }
  function cr(e, t) {
    var n = e.timeoutHandle;
    n !== -1 && (e.timeoutHandle = -1, D1(n)), n = e.cancelPendingCommit, n !== null && (e.cancelPendingCommit = null, n()), ua = 0, of(), tt = e, Re = n = $l(e.current, null), De = t, Ke = 0, Gn = null, Na = !1, rr = Un(e, t), lf = !1, ur = Xn = af = xi = ja = gt = 0, An = cu = null, rf = !1, (t & 8) !== 0 && (t |= t & 32);
    var a = e.entangledLanes;
    if (a !== 0)
      for (e = e.entanglements, a &= t; 0 < a; ) {
        var s = 31 - St(a), c = 1 << s;
        t |= e[s], a &= ~c;
      }
    return ra = t, cs(), n;
  }
  function Rm(e, t) {
    Ee = null, L.H = tu, t === Ii || t === ys ? (t = Kd(), Ke = 3) : t === ho ? (t = Kd(), Ke = 4) : Ke = t === Yo ? 8 : t !== null && typeof t == "object" && typeof t.then == "function" ? 6 : 1, Gn = t, Re === null && (gt = 1, Rs(
      e,
      ll(t, e.current)
    ));
  }
  function Cm() {
    var e = qn.current;
    return e === null ? !0 : (De & 4194048) === De ? ul === null : (De & 62914560) === De || (De & 536870912) !== 0 ? e === ul : !1;
  }
  function Dm() {
    var e = L.H;
    return L.H = tu, e === null ? tu : e;
  }
  function Nm() {
    var e = L.A;
    return L.A = f1, e;
  }
  function Xs() {
    gt = 4, Na || (De & 4194048) !== De && qn.current !== null || (rr = !0), (ja & 134217727) === 0 && (xi & 134217727) === 0 || tt === null || Ha(
      tt,
      De,
      Xn,
      !1
    );
  }
  function ff(e, t, n) {
    var a = Xe;
    Xe |= 2;
    var s = Dm(), c = Nm();
    (tt !== e || De !== t) && (Ys = null, cr(e, t)), t = !1;
    var m = gt;
    e: do
      try {
        if (Ke !== 0 && Re !== null) {
          var _ = Re, w = Gn;
          switch (Ke) {
            case 8:
              of(), m = 6;
              break e;
            case 3:
            case 2:
            case 9:
            case 6:
              qn.current === null && (t = !0);
              var N = Ke;
              if (Ke = 0, Gn = null, or(e, _, w, N), n && rr) {
                m = 0;
                break e;
              }
              break;
            default:
              N = Ke, Ke = 0, Gn = null, or(e, _, w, N);
          }
        }
        p1(), m = gt;
        break;
      } catch (Z) {
        Rm(e, Z);
      }
    while (!0);
    return t && e.shellSuspendCounter++, Fl = di = null, Xe = a, L.H = s, L.A = c, Re === null && (tt = null, De = 0, cs()), m;
  }
  function p1() {
    for (; Re !== null; ) jm(Re);
  }
  function m1(e, t) {
    var n = Xe;
    Xe |= 2;
    var a = Dm(), s = Nm();
    tt !== e || De !== t ? (Ys = null, qs = vt() + 500, cr(e, t)) : rr = Un(
      e,
      t
    );
    e: do
      try {
        if (Ke !== 0 && Re !== null) {
          t = Re;
          var c = Gn;
          t: switch (Ke) {
            case 1:
              Ke = 0, Gn = null, or(e, t, c, 1);
              break;
            case 2:
            case 9:
              if (Vd(c)) {
                Ke = 0, Gn = null, Um(t);
                break;
              }
              t = function() {
                Ke !== 2 && Ke !== 9 || tt !== e || (Ke = 7), Dl(e);
              }, c.then(t, t);
              break e;
            case 3:
              Ke = 7;
              break e;
            case 4:
              Ke = 5;
              break e;
            case 7:
              Vd(c) ? (Ke = 0, Gn = null, Um(t)) : (Ke = 0, Gn = null, or(e, t, c, 7));
              break;
            case 5:
              var m = null;
              switch (Re.tag) {
                case 26:
                  m = Re.memoizedState;
                case 5:
                case 27:
                  var _ = Re;
                  if (m ? Sg(m) : _.stateNode.complete) {
                    Ke = 0, Gn = null;
                    var w = _.sibling;
                    if (w !== null) Re = w;
                    else {
                      var N = _.return;
                      N !== null ? (Re = N, Qs(N)) : Re = null;
                    }
                    break t;
                  }
              }
              Ke = 0, Gn = null, or(e, t, c, 5);
              break;
            case 6:
              Ke = 0, Gn = null, or(e, t, c, 6);
              break;
            case 8:
              of(), gt = 6;
              break e;
            default:
              throw Error(r(462));
          }
        }
        g1();
        break;
      } catch (Z) {
        Rm(e, Z);
      }
    while (!0);
    return Fl = di = null, L.H = a, L.A = s, Xe = n, Re !== null ? 0 : (tt = null, De = 0, cs(), gt);
  }
  function g1() {
    for (; Re !== null && !li(); )
      jm(Re);
  }
  function jm(e) {
    var t = im(e.alternate, e, ra);
    e.memoizedProps = e.pendingProps, t === null ? Qs(e) : Re = t;
  }
  function Um(e) {
    var t = e, n = t.alternate;
    switch (t.tag) {
      case 15:
      case 0:
        t = Pp(
          n,
          t,
          t.pendingProps,
          t.type,
          void 0,
          De
        );
        break;
      case 11:
        t = Pp(
          n,
          t,
          t.pendingProps,
          t.type.render,
          t.ref,
          De
        );
        break;
      case 5:
        Eo(t);
      default:
        um(n, t), t = Re = Nd(t, ra), t = im(n, t, ra);
    }
    e.memoizedProps = e.pendingProps, t === null ? Qs(e) : Re = t;
  }
  function or(e, t, n, a) {
    Fl = di = null, Eo(t), Pi = null, Kr = 0;
    var s = t.return;
    try {
      if (a1(
        e,
        s,
        t,
        n,
        De
      )) {
        gt = 1, Rs(
          e,
          ll(n, e.current)
        ), Re = null;
        return;
      }
    } catch (c) {
      if (s !== null) throw Re = s, c;
      gt = 1, Rs(
        e,
        ll(n, e.current)
      ), Re = null;
      return;
    }
    t.flags & 32768 ? (je || a === 1 ? e = !0 : rr || (De & 536870912) !== 0 ? e = !1 : (Na = e = !0, (a === 2 || a === 9 || a === 3 || a === 6) && (a = qn.current, a !== null && a.tag === 13 && (a.flags |= 16384))), Lm(t, e)) : Qs(t);
  }
  function Qs(e) {
    var t = e;
    do {
      if ((t.flags & 32768) !== 0) {
        Lm(
          t,
          Na
        );
        return;
      }
      e = t.return;
      var n = u1(
        t.alternate,
        t,
        ra
      );
      if (n !== null) {
        Re = n;
        return;
      }
      if (t = t.sibling, t !== null) {
        Re = t;
        return;
      }
      Re = t = e;
    } while (t !== null);
    gt === 0 && (gt = 5);
  }
  function Lm(e, t) {
    do {
      var n = s1(e.alternate, e);
      if (n !== null) {
        n.flags &= 32767, Re = n;
        return;
      }
      if (n = e.return, n !== null && (n.flags |= 32768, n.subtreeFlags = 0, n.deletions = null), !t && (e = e.sibling, e !== null)) {
        Re = e;
        return;
      }
      Re = e = n;
    } while (e !== null);
    gt = 6, Re = null;
  }
  function Hm(e, t, n, a, s, c, m, _, w) {
    e.cancelPendingCommit = null;
    do
      Vs();
    while (Nt !== 0);
    if ((Xe & 6) !== 0) throw Error(r(327));
    if (t !== null) {
      if (t === e.current) throw Error(r(177));
      if (c = t.lanes | t.childLanes, c |= Wc, Zt(
        e,
        n,
        c,
        m,
        _,
        w
      ), e === tt && (Re = tt = null, De = 0), sr = t, La = e, ua = n, uf = c, sf = s, zm = a, (t.subtreeFlags & 10256) !== 0 || (t.flags & 10256) !== 0 ? (e.callbackNode = null, e.callbackPriority = 0, b1(gn, function() {
        return Xm(), null;
      })) : (e.callbackNode = null, e.callbackPriority = 0), a = (t.flags & 13878) !== 0, (t.subtreeFlags & 13878) !== 0 || a) {
        a = L.T, L.T = null, s = Y.p, Y.p = 2, m = Xe, Xe |= 4;
        try {
          c1(e, t, n);
        } finally {
          Xe = m, Y.p = s, L.T = a;
        }
      }
      Nt = 1, Bm(), qm(), Ym();
    }
  }
  function Bm() {
    if (Nt === 1) {
      Nt = 0;
      var e = La, t = sr, n = (t.flags & 13878) !== 0;
      if ((t.subtreeFlags & 13878) !== 0 || n) {
        n = L.T, L.T = null;
        var a = Y.p;
        Y.p = 2;
        var s = Xe;
        Xe |= 4;
        try {
          vm(t, e);
          var c = Tf, m = Ed(e.containerInfo), _ = c.focusedElem, w = c.selectionRange;
          if (m !== _ && _ && _.ownerDocument && Ad(
            _.ownerDocument.documentElement,
            _
          )) {
            if (w !== null && Zc(_)) {
              var N = w.start, Z = w.end;
              if (Z === void 0 && (Z = N), "selectionStart" in _)
                _.selectionStart = N, _.selectionEnd = Math.min(
                  Z,
                  _.value.length
                );
              else {
                var J = _.ownerDocument || document, U = J && J.defaultView || window;
                if (U.getSelection) {
                  var B = U.getSelection(), fe = _.textContent.length, ye = Math.min(w.start, fe), Ie = w.end === void 0 ? ye : Math.min(w.end, fe);
                  !B.extend && ye > Ie && (m = Ie, Ie = ye, ye = m);
                  var M = Td(
                    _,
                    ye
                  ), k = Td(
                    _,
                    Ie
                  );
                  if (M && k && (B.rangeCount !== 1 || B.anchorNode !== M.node || B.anchorOffset !== M.offset || B.focusNode !== k.node || B.focusOffset !== k.offset)) {
                    var D = J.createRange();
                    D.setStart(M.node, M.offset), B.removeAllRanges(), ye > Ie ? (B.addRange(D), B.extend(k.node, k.offset)) : (D.setEnd(k.node, k.offset), B.addRange(D));
                  }
                }
              }
            }
            for (J = [], B = _; B = B.parentNode; )
              B.nodeType === 1 && J.push({
                element: B,
                left: B.scrollLeft,
                top: B.scrollTop
              });
            for (typeof _.focus == "function" && _.focus(), _ = 0; _ < J.length; _++) {
              var $ = J[_];
              $.element.scrollLeft = $.left, $.element.scrollTop = $.top;
            }
          }
          lc = !!xf, Tf = xf = null;
        } finally {
          Xe = s, Y.p = a, L.T = n;
        }
      }
      e.current = t, Nt = 2;
    }
  }
  function qm() {
    if (Nt === 2) {
      Nt = 0;
      var e = La, t = sr, n = (t.flags & 8772) !== 0;
      if ((t.subtreeFlags & 8772) !== 0 || n) {
        n = L.T, L.T = null;
        var a = Y.p;
        Y.p = 2;
        var s = Xe;
        Xe |= 4;
        try {
          pm(e, t.alternate, t);
        } finally {
          Xe = s, Y.p = a, L.T = n;
        }
      }
      Nt = 3;
    }
  }
  function Ym() {
    if (Nt === 4 || Nt === 3) {
      Nt = 0, Nn();
      var e = La, t = sr, n = ua, a = zm;
      (t.subtreeFlags & 10256) !== 0 || (t.flags & 10256) !== 0 ? Nt = 5 : (Nt = 0, sr = La = null, Gm(e, e.pendingLanes));
      var s = e.pendingLanes;
      if (s === 0 && (Ua = null), _a(n), t = t.stateNode, bt && typeof bt.onCommitFiberRoot == "function")
        try {
          bt.onCommitFiberRoot(
            _n,
            t,
            void 0,
            (t.current.flags & 128) === 128
          );
        } catch {
        }
      if (a !== null) {
        t = L.T, s = Y.p, Y.p = 2, L.T = null;
        try {
          for (var c = e.onRecoverableError, m = 0; m < a.length; m++) {
            var _ = a[m];
            c(_.value, {
              componentStack: _.stack
            });
          }
        } finally {
          L.T = t, Y.p = s;
        }
      }
      (ua & 3) !== 0 && Vs(), Dl(e), s = e.pendingLanes, (n & 261930) !== 0 && (s & 42) !== 0 ? e === cf ? ou++ : (ou = 0, cf = e) : ou = 0, fu(0);
    }
  }
  function Gm(e, t) {
    (e.pooledCacheLanes &= t) === 0 && (t = e.pooledCache, t != null && (e.pooledCache = null, Vr(t)));
  }
  function Vs() {
    return Bm(), qm(), Ym(), Xm();
  }
  function Xm() {
    if (Nt !== 5) return !1;
    var e = La, t = uf;
    uf = 0;
    var n = _a(ua), a = L.T, s = Y.p;
    try {
      Y.p = 32 > n ? 32 : n, L.T = null, n = sf, sf = null;
      var c = La, m = ua;
      if (Nt = 0, sr = La = null, ua = 0, (Xe & 6) !== 0) throw Error(r(331));
      var _ = Xe;
      if (Xe |= 4, Am(c.current), Sm(
        c,
        c.current,
        m,
        n
      ), Xe = _, fu(0, !1), bt && typeof bt.onPostCommitFiberRoot == "function")
        try {
          bt.onPostCommitFiberRoot(_n, c);
        } catch {
        }
      return !0;
    } finally {
      Y.p = s, L.T = a, Gm(e, t);
    }
  }
  function Qm(e, t, n) {
    t = ll(n, t), t = qo(e.stateNode, t, 2), e = Ma(e, t, 2), e !== null && (sn(e, 2), Dl(e));
  }
  function $e(e, t, n) {
    if (e.tag === 3)
      Qm(e, e, n);
    else
      for (; t !== null; ) {
        if (t.tag === 3) {
          Qm(
            t,
            e,
            n
          );
          break;
        } else if (t.tag === 1) {
          var a = t.stateNode;
          if (typeof t.type.getDerivedStateFromError == "function" || typeof a.componentDidCatch == "function" && (Ua === null || !Ua.has(a))) {
            e = ll(n, e), n = Vp(2), a = Ma(t, n, 2), a !== null && (Zp(
              n,
              a,
              t,
              e
            ), sn(a, 2), Dl(a));
            break;
          }
        }
        t = t.return;
      }
  }
  function hf(e, t, n) {
    var a = e.pingCache;
    if (a === null) {
      a = e.pingCache = new h1();
      var s = /* @__PURE__ */ new Set();
      a.set(t, s);
    } else
      s = a.get(t), s === void 0 && (s = /* @__PURE__ */ new Set(), a.set(t, s));
    s.has(n) || (lf = !0, s.add(n), e = y1.bind(null, e, t, n), t.then(e, e));
  }
  function y1(e, t, n) {
    var a = e.pingCache;
    a !== null && a.delete(t), e.pingedLanes |= e.suspendedLanes & n, e.warmLanes &= ~n, tt === e && (De & n) === n && (gt === 4 || gt === 3 && (De & 62914560) === De && 300 > vt() - Bs ? (Xe & 2) === 0 && cr(e, 0) : af |= n, ur === De && (ur = 0)), Dl(e);
  }
  function Vm(e, t) {
    t === 0 && (t = ya()), e = oi(e, t), e !== null && (sn(e, t), Dl(e));
  }
  function _1(e) {
    var t = e.memoizedState, n = 0;
    t !== null && (n = t.retryLane), Vm(e, n);
  }
  function v1(e, t) {
    var n = 0;
    switch (e.tag) {
      case 31:
      case 13:
        var a = e.stateNode, s = e.memoizedState;
        s !== null && (n = s.retryLane);
        break;
      case 19:
        a = e.stateNode;
        break;
      case 22:
        a = e.stateNode._retryCache;
        break;
      default:
        throw Error(r(314));
    }
    a !== null && a.delete(t), Vm(e, n);
  }
  function b1(e, t) {
    return pl(e, t);
  }
  var Zs = null, fr = null, df = !1, Ks = !1, pf = !1, Ba = 0;
  function Dl(e) {
    e !== fr && e.next === null && (fr === null ? Zs = fr = e : fr = fr.next = e), Ks = !0, df || (df = !0, x1());
  }
  function fu(e, t) {
    if (!pf && Ks) {
      pf = !0;
      do
        for (var n = !1, a = Zs; a !== null; ) {
          if (e !== 0) {
            var s = a.pendingLanes;
            if (s === 0) var c = 0;
            else {
              var m = a.suspendedLanes, _ = a.pingedLanes;
              c = (1 << 31 - St(42 | e) + 1) - 1, c &= s & ~(m & ~_), c = c & 201326741 ? c & 201326741 | 1 : c ? c | 2 : 0;
            }
            c !== 0 && (n = !0, Jm(a, c));
          } else
            c = De, c = ml(
              a,
              a === tt ? c : 0,
              a.cancelPendingCommit !== null || a.timeoutHandle !== -1
            ), (c & 3) === 0 || Un(a, c) || (n = !0, Jm(a, c));
          a = a.next;
        }
      while (n);
      pf = !1;
    }
  }
  function S1() {
    Zm();
  }
  function Zm() {
    Ks = df = !1;
    var e = 0;
    Ba !== 0 && C1() && (e = Ba);
    for (var t = vt(), n = null, a = Zs; a !== null; ) {
      var s = a.next, c = Km(a, t);
      c === 0 ? (a.next = null, n === null ? Zs = s : n.next = s, s === null && (fr = n)) : (n = a, (e !== 0 || (c & 3) !== 0) && (Ks = !0)), a = s;
    }
    Nt !== 0 && Nt !== 5 || fu(e), Ba !== 0 && (Ba = 0);
  }
  function Km(e, t) {
    for (var n = e.suspendedLanes, a = e.pingedLanes, s = e.expirationTimes, c = e.pendingLanes & -62914561; 0 < c; ) {
      var m = 31 - St(c), _ = 1 << m, w = s[m];
      w === -1 ? ((_ & n) === 0 || (_ & a) !== 0) && (s[m] = ai(_, t)) : w <= t && (e.expiredLanes |= _), c &= ~_;
    }
    if (t = tt, n = De, n = ml(
      e,
      e === t ? n : 0,
      e.cancelPendingCommit !== null || e.timeoutHandle !== -1
    ), a = e.callbackNode, n === 0 || e === t && (Ke === 2 || Ke === 9) || e.cancelPendingCommit !== null)
      return a !== null && a !== null && Qt(a), e.callbackNode = null, e.callbackPriority = 0;
    if ((n & 3) === 0 || Un(e, n)) {
      if (t = n & -n, t === e.callbackPriority) return t;
      switch (a !== null && Qt(a), _a(n)) {
        case 2:
        case 8:
          n = mn;
          break;
        case 32:
          n = gn;
          break;
        case 268435456:
          n = yn;
          break;
        default:
          n = gn;
      }
      return a = $m.bind(null, e), n = pl(n, a), e.callbackPriority = t, e.callbackNode = n, t;
    }
    return a !== null && a !== null && Qt(a), e.callbackPriority = 2, e.callbackNode = null, 2;
  }
  function $m(e, t) {
    if (Nt !== 0 && Nt !== 5)
      return e.callbackNode = null, e.callbackPriority = 0, null;
    var n = e.callbackNode;
    if (Vs() && e.callbackNode !== n)
      return null;
    var a = De;
    return a = ml(
      e,
      e === tt ? a : 0,
      e.cancelPendingCommit !== null || e.timeoutHandle !== -1
    ), a === 0 ? null : (Om(e, a, t), Km(e, vt()), e.callbackNode != null && e.callbackNode === n ? $m.bind(null, e) : null);
  }
  function Jm(e, t) {
    if (Vs()) return null;
    Om(e, t, !0);
  }
  function x1() {
    N1(function() {
      (Xe & 6) !== 0 ? pl(
        jn,
        S1
      ) : Zm();
    });
  }
  function mf() {
    if (Ba === 0) {
      var e = Fi;
      e === 0 && (e = vn, vn <<= 1, (vn & 261888) === 0 && (vn = 256)), Ba = e;
    }
    return Ba;
  }
  function Fm(e) {
    return e == null || typeof e == "symbol" || typeof e == "boolean" ? null : typeof e == "function" ? e : T("" + e);
  }
  function Wm(e, t) {
    var n = t.ownerDocument.createElement("input");
    return n.name = t.name, n.value = t.value, e.id && n.setAttribute("form", e.id), t.parentNode.insertBefore(n, t), e = new FormData(e), n.parentNode.removeChild(n), e;
  }
  function T1(e, t, n, a, s) {
    if (t === "submit" && n && n.stateNode === s) {
      var c = Fm(
        (s[pt] || null).action
      ), m = a.submitter;
      m && (t = (t = m[pt] || null) ? Fm(t.formAction) : m.getAttribute("formAction"), t !== null && (c = t, m = null));
      var _ = new is(
        "action",
        "action",
        null,
        a,
        s
      );
      e.push({
        event: _,
        listeners: [
          {
            instance: null,
            listener: function() {
              if (a.defaultPrevented) {
                if (Ba !== 0) {
                  var w = m ? Wm(s, m) : new FormData(s);
                  No(
                    n,
                    {
                      pending: !0,
                      data: w,
                      method: s.method,
                      action: c
                    },
                    null,
                    w
                  );
                }
              } else
                typeof c == "function" && (_.preventDefault(), w = m ? Wm(s, m) : new FormData(s), No(
                  n,
                  {
                    pending: !0,
                    data: w,
                    method: s.method,
                    action: c
                  },
                  c,
                  w
                ));
            },
            currentTarget: s
          }
        ]
      });
    }
  }
  for (var gf = 0; gf < Fc.length; gf++) {
    var yf = Fc[gf], A1 = yf.toLowerCase(), E1 = yf[0].toUpperCase() + yf.slice(1);
    vl(
      A1,
      "on" + E1
    );
  }
  vl(kd, "onAnimationEnd"), vl(Od, "onAnimationIteration"), vl(Md, "onAnimationStart"), vl("dblclick", "onDoubleClick"), vl("focusin", "onFocus"), vl("focusout", "onBlur"), vl(Y_, "onTransitionRun"), vl(G_, "onTransitionStart"), vl(X_, "onTransitionCancel"), vl(Rd, "onTransitionEnd"), _l("onMouseEnter", ["mouseout", "mouseover"]), _l("onMouseLeave", ["mouseout", "mouseover"]), _l("onPointerEnter", ["pointerout", "pointerover"]), _l("onPointerLeave", ["pointerout", "pointerover"]), kl(
    "onChange",
    "change click focusin focusout input keydown keyup selectionchange".split(" ")
  ), kl(
    "onSelect",
    "focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(
      " "
    )
  ), kl("onBeforeInput", [
    "compositionend",
    "keypress",
    "textInput",
    "paste"
  ]), kl(
    "onCompositionEnd",
    "compositionend focusout keydown keypress keyup mousedown".split(" ")
  ), kl(
    "onCompositionStart",
    "compositionstart focusout keydown keypress keyup mousedown".split(" ")
  ), kl(
    "onCompositionUpdate",
    "compositionupdate focusout keydown keypress keyup mousedown".split(" ")
  );
  var hu = "abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(
    " "
  ), w1 = new Set(
    "beforetoggle cancel close invalid load scroll scrollend toggle".split(" ").concat(hu)
  );
  function Im(e, t) {
    t = (t & 4) !== 0;
    for (var n = 0; n < e.length; n++) {
      var a = e[n], s = a.event;
      a = a.listeners;
      e: {
        var c = void 0;
        if (t)
          for (var m = a.length - 1; 0 <= m; m--) {
            var _ = a[m], w = _.instance, N = _.currentTarget;
            if (_ = _.listener, w !== c && s.isPropagationStopped())
              break e;
            c = _, s.currentTarget = N;
            try {
              c(s);
            } catch (Z) {
              ss(Z);
            }
            s.currentTarget = null, c = w;
          }
        else
          for (m = 0; m < a.length; m++) {
            if (_ = a[m], w = _.instance, N = _.currentTarget, _ = _.listener, w !== c && s.isPropagationStopped())
              break e;
            c = _, s.currentTarget = N;
            try {
              c(s);
            } catch (Z) {
              ss(Z);
            }
            s.currentTarget = null, c = w;
          }
      }
    }
  }
  function Ce(e, t) {
    var n = t[Ql];
    n === void 0 && (n = t[Ql] = /* @__PURE__ */ new Set());
    var a = e + "__bubble";
    n.has(a) || (Pm(t, e, 2, !1), n.add(a));
  }
  function _f(e, t, n) {
    var a = 0;
    t && (a |= 4), Pm(
      n,
      e,
      a,
      t
    );
  }
  var $s = "_reactListening" + Math.random().toString(36).slice(2);
  function vf(e) {
    if (!e[$s]) {
      e[$s] = !0, ba.forEach(function(n) {
        n !== "selectionchange" && (w1.has(n) || _f(n, !1, e), _f(n, !0, e));
      });
      var t = e.nodeType === 9 ? e : e.ownerDocument;
      t === null || t[$s] || (t[$s] = !0, _f("selectionchange", !1, t));
    }
  }
  function Pm(e, t, n, a) {
    switch (kg(t)) {
      case 2:
        var s = ev;
        break;
      case 8:
        s = tv;
        break;
      default:
        s = Nf;
    }
    n = s.bind(
      null,
      t,
      n,
      e
    ), s = void 0, !Dt || t !== "touchstart" && t !== "touchmove" && t !== "wheel" || (s = !0), a ? s !== void 0 ? e.addEventListener(t, n, {
      capture: !0,
      passive: s
    }) : e.addEventListener(t, n, !0) : s !== void 0 ? e.addEventListener(t, n, {
      passive: s
    }) : e.addEventListener(t, n, !1);
  }
  function bf(e, t, n, a, s) {
    var c = a;
    if ((t & 1) === 0 && (t & 2) === 0 && a !== null)
      e: for (; ; ) {
        if (a === null) return;
        var m = a.tag;
        if (m === 3 || m === 4) {
          var _ = a.stateNode.containerInfo;
          if (_ === s) break;
          if (m === 4)
            for (m = a.return; m !== null; ) {
              var w = m.tag;
              if ((w === 3 || w === 4) && m.stateNode.containerInfo === s)
                return;
              m = m.return;
            }
          for (; _ !== null; ) {
            if (m = xe(_), m === null) return;
            if (w = m.tag, w === 5 || w === 6 || w === 26 || w === 27) {
              a = c = m;
              continue e;
            }
            _ = _.parentNode;
          }
        }
        a = a.return;
      }
    Jt(function() {
      var N = c, Z = ae(n), J = [];
      e: {
        var U = Cd.get(e);
        if (U !== void 0) {
          var B = is, fe = e;
          switch (e) {
            case "keypress":
              if (ls(n) === 0) break e;
            case "keydown":
            case "keyup":
              B = v_;
              break;
            case "focusin":
              fe = "focus", B = Yc;
              break;
            case "focusout":
              fe = "blur", B = Yc;
              break;
            case "beforeblur":
            case "afterblur":
              B = Yc;
              break;
            case "click":
              if (n.button === 2) break e;
            case "auxclick":
            case "dblclick":
            case "mousedown":
            case "mousemove":
            case "mouseup":
            case "mouseout":
            case "mouseover":
            case "contextmenu":
              B = ud;
              break;
            case "drag":
            case "dragend":
            case "dragenter":
            case "dragexit":
            case "dragleave":
            case "dragover":
            case "dragstart":
            case "drop":
              B = u_;
              break;
            case "touchcancel":
            case "touchend":
            case "touchmove":
            case "touchstart":
              B = x_;
              break;
            case kd:
            case Od:
            case Md:
              B = o_;
              break;
            case Rd:
              B = A_;
              break;
            case "scroll":
            case "scrollend":
              B = i_;
              break;
            case "wheel":
              B = w_;
              break;
            case "copy":
            case "cut":
            case "paste":
              B = h_;
              break;
            case "gotpointercapture":
            case "lostpointercapture":
            case "pointercancel":
            case "pointerdown":
            case "pointermove":
            case "pointerout":
            case "pointerover":
            case "pointerup":
              B = cd;
              break;
            case "toggle":
            case "beforetoggle":
              B = k_;
          }
          var ye = (t & 4) !== 0, Ie = !ye && (e === "scroll" || e === "scrollend"), M = ye ? U !== null ? U + "Capture" : null : U;
          ye = [];
          for (var k = N, D; k !== null; ) {
            var $ = k;
            if (D = $.stateNode, $ = $.tag, $ !== 5 && $ !== 26 && $ !== 27 || D === null || M === null || ($ = wt(k, M), $ != null && ye.push(
              du(k, $, D)
            )), Ie) break;
            k = k.return;
          }
          0 < ye.length && (U = new B(
            U,
            fe,
            null,
            n,
            Z
          ), J.push({ event: U, listeners: ye }));
        }
      }
      if ((t & 7) === 0) {
        e: {
          if (U = e === "mouseover" || e === "pointerover", B = e === "mouseout" || e === "pointerout", U && n !== W && (fe = n.relatedTarget || n.fromElement) && (xe(fe) || fe[el]))
            break e;
          if ((B || U) && (U = Z.window === Z ? Z : (U = Z.ownerDocument) ? U.defaultView || U.parentWindow : window, B ? (fe = n.relatedTarget || n.toElement, B = N, fe = fe ? xe(fe) : null, fe !== null && (Ie = f(fe), ye = fe.tag, fe !== Ie || ye !== 5 && ye !== 27 && ye !== 6) && (fe = null)) : (B = null, fe = N), B !== fe)) {
            if (ye = ud, $ = "onMouseLeave", M = "onMouseEnter", k = "mouse", (e === "pointerout" || e === "pointerover") && (ye = cd, $ = "onPointerLeave", M = "onPointerEnter", k = "pointer"), Ie = B == null ? U : Ht(B), D = fe == null ? U : Ht(fe), U = new ye(
              $,
              k + "leave",
              B,
              n,
              Z
            ), U.target = Ie, U.relatedTarget = D, $ = null, xe(Z) === N && (ye = new ye(
              M,
              k + "enter",
              fe,
              n,
              Z
            ), ye.target = D, ye.relatedTarget = Ie, $ = ye), Ie = $, B && fe)
              t: {
                for (ye = z1, M = B, k = fe, D = 0, $ = M; $; $ = ye($))
                  D++;
                $ = 0;
                for (var me = k; me; me = ye(me))
                  $++;
                for (; 0 < D - $; )
                  M = ye(M), D--;
                for (; 0 < $ - D; )
                  k = ye(k), $--;
                for (; D--; ) {
                  if (M === k || k !== null && M === k.alternate) {
                    ye = M;
                    break t;
                  }
                  M = ye(M), k = ye(k);
                }
                ye = null;
              }
            else ye = null;
            B !== null && eg(
              J,
              U,
              B,
              ye,
              !1
            ), fe !== null && Ie !== null && eg(
              J,
              Ie,
              fe,
              ye,
              !0
            );
          }
        }
        e: {
          if (U = N ? Ht(N) : window, B = U.nodeName && U.nodeName.toLowerCase(), B === "select" || B === "input" && U.type === "file")
            var Be = yd;
          else if (md(U))
            if (_d)
              Be = H_;
            else {
              Be = U_;
              var he = j_;
            }
          else
            B = U.nodeName, !B || B.toLowerCase() !== "input" || U.type !== "checkbox" && U.type !== "radio" ? N && xa(N.elementType) && (Be = yd) : Be = L_;
          if (Be && (Be = Be(e, N))) {
            gd(
              J,
              Be,
              n,
              Z
            );
            break e;
          }
          he && he(e, U, N), e === "focusout" && N && U.type === "number" && N.memoizedProps.value != null && qi(U, "number", U.value);
        }
        switch (he = N ? Ht(N) : window, e) {
          case "focusin":
            (md(he) || he.contentEditable === "true") && (Gi = he, Kc = N, Gr = null);
            break;
          case "focusout":
            Gr = Kc = Gi = null;
            break;
          case "mousedown":
            $c = !0;
            break;
          case "contextmenu":
          case "mouseup":
          case "dragend":
            $c = !1, wd(J, n, Z);
            break;
          case "selectionchange":
            if (q_) break;
          case "keydown":
          case "keyup":
            wd(J, n, Z);
        }
        var we;
        if (Xc)
          e: {
            switch (e) {
              case "compositionstart":
                var Ne = "onCompositionStart";
                break e;
              case "compositionend":
                Ne = "onCompositionEnd";
                break e;
              case "compositionupdate":
                Ne = "onCompositionUpdate";
                break e;
            }
            Ne = void 0;
          }
        else
          Yi ? dd(e, n) && (Ne = "onCompositionEnd") : e === "keydown" && n.keyCode === 229 && (Ne = "onCompositionStart");
        Ne && (od && n.locale !== "ko" && (Yi || Ne !== "onCompositionStart" ? Ne === "onCompositionEnd" && Yi && (we = id()) : (Ta = Z, Hc = "value" in Ta ? Ta.value : Ta.textContent, Yi = !0)), he = Js(N, Ne), 0 < he.length && (Ne = new sd(
          Ne,
          e,
          null,
          n,
          Z
        ), J.push({ event: Ne, listeners: he }), we ? Ne.data = we : (we = pd(n), we !== null && (Ne.data = we)))), (we = M_ ? R_(e, n) : C_(e, n)) && (Ne = Js(N, "onBeforeInput"), 0 < Ne.length && (he = new sd(
          "onBeforeInput",
          "beforeinput",
          null,
          n,
          Z
        ), J.push({
          event: he,
          listeners: Ne
        }), he.data = we)), T1(
          J,
          e,
          N,
          n,
          Z
        );
      }
      Im(J, t);
    });
  }
  function du(e, t, n) {
    return {
      instance: e,
      listener: t,
      currentTarget: n
    };
  }
  function Js(e, t) {
    for (var n = t + "Capture", a = []; e !== null; ) {
      var s = e, c = s.stateNode;
      if (s = s.tag, s !== 5 && s !== 26 && s !== 27 || c === null || (s = wt(e, n), s != null && a.unshift(
        du(e, s, c)
      ), s = wt(e, t), s != null && a.push(
        du(e, s, c)
      )), e.tag === 3) return a;
      e = e.return;
    }
    return [];
  }
  function z1(e) {
    if (e === null) return null;
    do
      e = e.return;
    while (e && e.tag !== 5 && e.tag !== 27);
    return e || null;
  }
  function eg(e, t, n, a, s) {
    for (var c = t._reactName, m = []; n !== null && n !== a; ) {
      var _ = n, w = _.alternate, N = _.stateNode;
      if (_ = _.tag, w !== null && w === a) break;
      _ !== 5 && _ !== 26 && _ !== 27 || N === null || (w = N, s ? (N = wt(n, c), N != null && m.unshift(
        du(n, N, w)
      )) : s || (N = wt(n, c), N != null && m.push(
        du(n, N, w)
      ))), n = n.return;
    }
    m.length !== 0 && e.push({ event: t, listeners: m });
  }
  var k1 = /\r\n?/g, O1 = /\u0000|\uFFFD/g;
  function tg(e) {
    return (typeof e == "string" ? e : "" + e).replace(k1, `
`).replace(O1, "");
  }
  function ng(e, t) {
    return t = tg(t), tg(e) === t;
  }
  function We(e, t, n, a, s, c) {
    switch (n) {
      case "children":
        typeof a == "string" ? t === "body" || t === "textarea" && a === "" || Kl(e, a) : (typeof a == "number" || typeof a == "bigint") && t !== "body" && Kl(e, "" + a);
        break;
      case "className":
        ri(e, "class", a);
        break;
      case "tabIndex":
        ri(e, "tabindex", a);
        break;
      case "dir":
      case "role":
      case "viewBox":
      case "width":
      case "height":
        ri(e, n, a);
        break;
      case "style":
        Dr(e, a, c);
        break;
      case "data":
        if (t !== "object") {
          ri(e, "data", a);
          break;
        }
      case "src":
      case "href":
        if (a === "" && (t !== "a" || n !== "href")) {
          e.removeAttribute(n);
          break;
        }
        if (a == null || typeof a == "function" || typeof a == "symbol" || typeof a == "boolean") {
          e.removeAttribute(n);
          break;
        }
        a = T("" + a), e.setAttribute(n, a);
        break;
      case "action":
      case "formAction":
        if (typeof a == "function") {
          e.setAttribute(
            n,
            "javascript:throw new Error('A React form was unexpectedly submitted. If you called form.submit() manually, consider using form.requestSubmit() instead. If you\\'re trying to use event.stopPropagation() in a submit event handler, consider also calling event.preventDefault().')"
          );
          break;
        } else
          typeof c == "function" && (n === "formAction" ? (t !== "input" && We(e, t, "name", s.name, s, null), We(
            e,
            t,
            "formEncType",
            s.formEncType,
            s,
            null
          ), We(
            e,
            t,
            "formMethod",
            s.formMethod,
            s,
            null
          ), We(
            e,
            t,
            "formTarget",
            s.formTarget,
            s,
            null
          )) : (We(e, t, "encType", s.encType, s, null), We(e, t, "method", s.method, s, null), We(e, t, "target", s.target, s, null)));
        if (a == null || typeof a == "symbol" || typeof a == "boolean") {
          e.removeAttribute(n);
          break;
        }
        a = T("" + a), e.setAttribute(n, a);
        break;
      case "onClick":
        a != null && (e.onclick = O);
        break;
      case "onScroll":
        a != null && Ce("scroll", e);
        break;
      case "onScrollEnd":
        a != null && Ce("scrollend", e);
        break;
      case "dangerouslySetInnerHTML":
        if (a != null) {
          if (typeof a != "object" || !("__html" in a))
            throw Error(r(61));
          if (n = a.__html, n != null) {
            if (s.children != null) throw Error(r(60));
            e.innerHTML = n;
          }
        }
        break;
      case "multiple":
        e.multiple = a && typeof a != "function" && typeof a != "symbol";
        break;
      case "muted":
        e.muted = a && typeof a != "function" && typeof a != "symbol";
        break;
      case "suppressContentEditableWarning":
      case "suppressHydrationWarning":
      case "defaultValue":
      case "defaultChecked":
      case "innerHTML":
      case "ref":
        break;
      case "autoFocus":
        break;
      case "xlinkHref":
        if (a == null || typeof a == "function" || typeof a == "boolean" || typeof a == "symbol") {
          e.removeAttribute("xlink:href");
          break;
        }
        n = T("" + a), e.setAttributeNS(
          "http://www.w3.org/1999/xlink",
          "xlink:href",
          n
        );
        break;
      case "contentEditable":
      case "spellCheck":
      case "draggable":
      case "value":
      case "autoReverse":
      case "externalResourcesRequired":
      case "focusable":
      case "preserveAlpha":
        a != null && typeof a != "function" && typeof a != "symbol" ? e.setAttribute(n, "" + a) : e.removeAttribute(n);
        break;
      case "inert":
      case "allowFullScreen":
      case "async":
      case "autoPlay":
      case "controls":
      case "default":
      case "defer":
      case "disabled":
      case "disablePictureInPicture":
      case "disableRemotePlayback":
      case "formNoValidate":
      case "hidden":
      case "loop":
      case "noModule":
      case "noValidate":
      case "open":
      case "playsInline":
      case "readOnly":
      case "required":
      case "reversed":
      case "scoped":
      case "seamless":
      case "itemScope":
        a && typeof a != "function" && typeof a != "symbol" ? e.setAttribute(n, "") : e.removeAttribute(n);
        break;
      case "capture":
      case "download":
        a === !0 ? e.setAttribute(n, "") : a !== !1 && a != null && typeof a != "function" && typeof a != "symbol" ? e.setAttribute(n, a) : e.removeAttribute(n);
        break;
      case "cols":
      case "rows":
      case "size":
      case "span":
        a != null && typeof a != "function" && typeof a != "symbol" && !isNaN(a) && 1 <= a ? e.setAttribute(n, a) : e.removeAttribute(n);
        break;
      case "rowSpan":
      case "start":
        a == null || typeof a == "function" || typeof a == "symbol" || isNaN(a) ? e.removeAttribute(n) : e.setAttribute(n, a);
        break;
      case "popover":
        Ce("beforetoggle", e), Ce("toggle", e), Li(e, "popover", a);
        break;
      case "xlinkActuate":
        tl(
          e,
          "http://www.w3.org/1999/xlink",
          "xlink:actuate",
          a
        );
        break;
      case "xlinkArcrole":
        tl(
          e,
          "http://www.w3.org/1999/xlink",
          "xlink:arcrole",
          a
        );
        break;
      case "xlinkRole":
        tl(
          e,
          "http://www.w3.org/1999/xlink",
          "xlink:role",
          a
        );
        break;
      case "xlinkShow":
        tl(
          e,
          "http://www.w3.org/1999/xlink",
          "xlink:show",
          a
        );
        break;
      case "xlinkTitle":
        tl(
          e,
          "http://www.w3.org/1999/xlink",
          "xlink:title",
          a
        );
        break;
      case "xlinkType":
        tl(
          e,
          "http://www.w3.org/1999/xlink",
          "xlink:type",
          a
        );
        break;
      case "xmlBase":
        tl(
          e,
          "http://www.w3.org/XML/1998/namespace",
          "xml:base",
          a
        );
        break;
      case "xmlLang":
        tl(
          e,
          "http://www.w3.org/XML/1998/namespace",
          "xml:lang",
          a
        );
        break;
      case "xmlSpace":
        tl(
          e,
          "http://www.w3.org/XML/1998/namespace",
          "xml:space",
          a
        );
        break;
      case "is":
        Li(e, "is", a);
        break;
      case "innerText":
      case "textContent":
        break;
      default:
        (!(2 < n.length) || n[0] !== "o" && n[0] !== "O" || n[1] !== "n" && n[1] !== "N") && (n = Nr.get(n) || n, Li(e, n, a));
    }
  }
  function Sf(e, t, n, a, s, c) {
    switch (n) {
      case "style":
        Dr(e, a, c);
        break;
      case "dangerouslySetInnerHTML":
        if (a != null) {
          if (typeof a != "object" || !("__html" in a))
            throw Error(r(61));
          if (n = a.__html, n != null) {
            if (s.children != null) throw Error(r(60));
            e.innerHTML = n;
          }
        }
        break;
      case "children":
        typeof a == "string" ? Kl(e, a) : (typeof a == "number" || typeof a == "bigint") && Kl(e, "" + a);
        break;
      case "onScroll":
        a != null && Ce("scroll", e);
        break;
      case "onScrollEnd":
        a != null && Ce("scrollend", e);
        break;
      case "onClick":
        a != null && (e.onclick = O);
        break;
      case "suppressContentEditableWarning":
      case "suppressHydrationWarning":
      case "innerHTML":
      case "ref":
        break;
      case "innerText":
      case "textContent":
        break;
      default:
        if (!yl.hasOwnProperty(n))
          e: {
            if (n[0] === "o" && n[1] === "n" && (s = n.endsWith("Capture"), t = n.slice(2, s ? n.length - 7 : void 0), c = e[pt] || null, c = c != null ? c[n] : null, typeof c == "function" && e.removeEventListener(t, c, s), typeof a == "function")) {
              typeof c != "function" && c !== null && (n in e ? e[n] = null : e.hasAttribute(n) && e.removeAttribute(n)), e.addEventListener(t, a, s);
              break e;
            }
            n in e ? e[n] = a : a === !0 ? e.setAttribute(n, "") : Li(e, n, a);
          }
    }
  }
  function Pt(e, t, n) {
    switch (t) {
      case "div":
      case "span":
      case "svg":
      case "path":
      case "a":
      case "g":
      case "p":
      case "li":
        break;
      case "img":
        Ce("error", e), Ce("load", e);
        var a = !1, s = !1, c;
        for (c in n)
          if (n.hasOwnProperty(c)) {
            var m = n[c];
            if (m != null)
              switch (c) {
                case "src":
                  a = !0;
                  break;
                case "srcSet":
                  s = !0;
                  break;
                case "children":
                case "dangerouslySetInnerHTML":
                  throw Error(r(137, t));
                default:
                  We(e, t, c, m, n, null);
              }
          }
        s && We(e, t, "srcSet", n.srcSet, n, null), a && We(e, t, "src", n.src, n, null);
        return;
      case "input":
        Ce("invalid", e);
        var _ = c = m = s = null, w = null, N = null;
        for (a in n)
          if (n.hasOwnProperty(a)) {
            var Z = n[a];
            if (Z != null)
              switch (a) {
                case "name":
                  s = Z;
                  break;
                case "type":
                  m = Z;
                  break;
                case "checked":
                  w = Z;
                  break;
                case "defaultChecked":
                  N = Z;
                  break;
                case "value":
                  c = Z;
                  break;
                case "defaultValue":
                  _ = Z;
                  break;
                case "children":
                case "dangerouslySetInnerHTML":
                  if (Z != null)
                    throw Error(r(137, t));
                  break;
                default:
                  We(e, t, a, Z, n, null);
              }
          }
        Rr(
          e,
          c,
          _,
          w,
          N,
          m,
          s,
          !1
        );
        return;
      case "select":
        Ce("invalid", e), a = m = c = null;
        for (s in n)
          if (n.hasOwnProperty(s) && (_ = n[s], _ != null))
            switch (s) {
              case "value":
                c = _;
                break;
              case "defaultValue":
                m = _;
                break;
              case "multiple":
                a = _;
              default:
                We(e, t, s, _, n, null);
            }
        t = c, n = m, e.multiple = !!a, t != null ? Zl(e, !!a, t, !1) : n != null && Zl(e, !!a, n, !0);
        return;
      case "textarea":
        Ce("invalid", e), c = s = a = null;
        for (m in n)
          if (n.hasOwnProperty(m) && (_ = n[m], _ != null))
            switch (m) {
              case "value":
                a = _;
                break;
              case "defaultValue":
                s = _;
                break;
              case "children":
                c = _;
                break;
              case "dangerouslySetInnerHTML":
                if (_ != null) throw Error(r(91));
                break;
              default:
                We(e, t, m, _, n, null);
            }
        es(e, a, s, c);
        return;
      case "option":
        for (w in n)
          if (n.hasOwnProperty(w) && (a = n[w], a != null))
            switch (w) {
              case "selected":
                e.selected = a && typeof a != "function" && typeof a != "symbol";
                break;
              default:
                We(e, t, w, a, n, null);
            }
        return;
      case "dialog":
        Ce("beforetoggle", e), Ce("toggle", e), Ce("cancel", e), Ce("close", e);
        break;
      case "iframe":
      case "object":
        Ce("load", e);
        break;
      case "video":
      case "audio":
        for (a = 0; a < hu.length; a++)
          Ce(hu[a], e);
        break;
      case "image":
        Ce("error", e), Ce("load", e);
        break;
      case "details":
        Ce("toggle", e);
        break;
      case "embed":
      case "source":
      case "link":
        Ce("error", e), Ce("load", e);
      case "area":
      case "base":
      case "br":
      case "col":
      case "hr":
      case "keygen":
      case "meta":
      case "param":
      case "track":
      case "wbr":
      case "menuitem":
        for (N in n)
          if (n.hasOwnProperty(N) && (a = n[N], a != null))
            switch (N) {
              case "children":
              case "dangerouslySetInnerHTML":
                throw Error(r(137, t));
              default:
                We(e, t, N, a, n, null);
            }
        return;
      default:
        if (xa(t)) {
          for (Z in n)
            n.hasOwnProperty(Z) && (a = n[Z], a !== void 0 && Sf(
              e,
              t,
              Z,
              a,
              n,
              void 0
            ));
          return;
        }
    }
    for (_ in n)
      n.hasOwnProperty(_) && (a = n[_], a != null && We(e, t, _, a, n, null));
  }
  function M1(e, t, n, a) {
    switch (t) {
      case "div":
      case "span":
      case "svg":
      case "path":
      case "a":
      case "g":
      case "p":
      case "li":
        break;
      case "input":
        var s = null, c = null, m = null, _ = null, w = null, N = null, Z = null;
        for (B in n) {
          var J = n[B];
          if (n.hasOwnProperty(B) && J != null)
            switch (B) {
              case "checked":
                break;
              case "value":
                break;
              case "defaultValue":
                w = J;
              default:
                a.hasOwnProperty(B) || We(e, t, B, null, a, J);
            }
        }
        for (var U in a) {
          var B = a[U];
          if (J = n[U], a.hasOwnProperty(U) && (B != null || J != null))
            switch (U) {
              case "type":
                c = B;
                break;
              case "name":
                s = B;
                break;
              case "checked":
                N = B;
                break;
              case "defaultChecked":
                Z = B;
                break;
              case "value":
                m = B;
                break;
              case "defaultValue":
                _ = B;
                break;
              case "children":
              case "dangerouslySetInnerHTML":
                if (B != null)
                  throw Error(r(137, t));
                break;
              default:
                B !== J && We(
                  e,
                  t,
                  U,
                  B,
                  a,
                  J
                );
            }
        }
        Mr(
          e,
          m,
          _,
          w,
          N,
          Z,
          c,
          s
        );
        return;
      case "select":
        B = m = _ = U = null;
        for (c in n)
          if (w = n[c], n.hasOwnProperty(c) && w != null)
            switch (c) {
              case "value":
                break;
              case "multiple":
                B = w;
              default:
                a.hasOwnProperty(c) || We(
                  e,
                  t,
                  c,
                  null,
                  a,
                  w
                );
            }
        for (s in a)
          if (c = a[s], w = n[s], a.hasOwnProperty(s) && (c != null || w != null))
            switch (s) {
              case "value":
                U = c;
                break;
              case "defaultValue":
                _ = c;
                break;
              case "multiple":
                m = c;
              default:
                c !== w && We(
                  e,
                  t,
                  s,
                  c,
                  a,
                  w
                );
            }
        t = _, n = m, a = B, U != null ? Zl(e, !!n, U, !1) : !!a != !!n && (t != null ? Zl(e, !!n, t, !0) : Zl(e, !!n, n ? [] : "", !1));
        return;
      case "textarea":
        B = U = null;
        for (_ in n)
          if (s = n[_], n.hasOwnProperty(_) && s != null && !a.hasOwnProperty(_))
            switch (_) {
              case "value":
                break;
              case "children":
                break;
              default:
                We(e, t, _, null, a, s);
            }
        for (m in a)
          if (s = a[m], c = n[m], a.hasOwnProperty(m) && (s != null || c != null))
            switch (m) {
              case "value":
                U = s;
                break;
              case "defaultValue":
                B = s;
                break;
              case "children":
                break;
              case "dangerouslySetInnerHTML":
                if (s != null) throw Error(r(91));
                break;
              default:
                s !== c && We(e, t, m, s, a, c);
            }
        Cr(e, U, B);
        return;
      case "option":
        for (var fe in n)
          if (U = n[fe], n.hasOwnProperty(fe) && U != null && !a.hasOwnProperty(fe))
            switch (fe) {
              case "selected":
                e.selected = !1;
                break;
              default:
                We(
                  e,
                  t,
                  fe,
                  null,
                  a,
                  U
                );
            }
        for (w in a)
          if (U = a[w], B = n[w], a.hasOwnProperty(w) && U !== B && (U != null || B != null))
            switch (w) {
              case "selected":
                e.selected = U && typeof U != "function" && typeof U != "symbol";
                break;
              default:
                We(
                  e,
                  t,
                  w,
                  U,
                  a,
                  B
                );
            }
        return;
      case "img":
      case "link":
      case "area":
      case "base":
      case "br":
      case "col":
      case "embed":
      case "hr":
      case "keygen":
      case "meta":
      case "param":
      case "source":
      case "track":
      case "wbr":
      case "menuitem":
        for (var ye in n)
          U = n[ye], n.hasOwnProperty(ye) && U != null && !a.hasOwnProperty(ye) && We(e, t, ye, null, a, U);
        for (N in a)
          if (U = a[N], B = n[N], a.hasOwnProperty(N) && U !== B && (U != null || B != null))
            switch (N) {
              case "children":
              case "dangerouslySetInnerHTML":
                if (U != null)
                  throw Error(r(137, t));
                break;
              default:
                We(
                  e,
                  t,
                  N,
                  U,
                  a,
                  B
                );
            }
        return;
      default:
        if (xa(t)) {
          for (var Ie in n)
            U = n[Ie], n.hasOwnProperty(Ie) && U !== void 0 && !a.hasOwnProperty(Ie) && Sf(
              e,
              t,
              Ie,
              void 0,
              a,
              U
            );
          for (Z in a)
            U = a[Z], B = n[Z], !a.hasOwnProperty(Z) || U === B || U === void 0 && B === void 0 || Sf(
              e,
              t,
              Z,
              U,
              a,
              B
            );
          return;
        }
    }
    for (var M in n)
      U = n[M], n.hasOwnProperty(M) && U != null && !a.hasOwnProperty(M) && We(e, t, M, null, a, U);
    for (J in a)
      U = a[J], B = n[J], !a.hasOwnProperty(J) || U === B || U == null && B == null || We(e, t, J, U, a, B);
  }
  function lg(e) {
    switch (e) {
      case "css":
      case "script":
      case "font":
      case "img":
      case "image":
      case "input":
      case "link":
        return !0;
      default:
        return !1;
    }
  }
  function R1() {
    if (typeof performance.getEntriesByType == "function") {
      for (var e = 0, t = 0, n = performance.getEntriesByType("resource"), a = 0; a < n.length; a++) {
        var s = n[a], c = s.transferSize, m = s.initiatorType, _ = s.duration;
        if (c && _ && lg(m)) {
          for (m = 0, _ = s.responseEnd, a += 1; a < n.length; a++) {
            var w = n[a], N = w.startTime;
            if (N > _) break;
            var Z = w.transferSize, J = w.initiatorType;
            Z && lg(J) && (w = w.responseEnd, m += Z * (w < _ ? 1 : (_ - N) / (w - N)));
          }
          if (--a, t += 8 * (c + m) / (s.duration / 1e3), e++, 10 < e) break;
        }
      }
      if (0 < e) return t / e / 1e6;
    }
    return navigator.connection && (e = navigator.connection.downlink, typeof e == "number") ? e : 5;
  }
  var xf = null, Tf = null;
  function Fs(e) {
    return e.nodeType === 9 ? e : e.ownerDocument;
  }
  function ag(e) {
    switch (e) {
      case "http://www.w3.org/2000/svg":
        return 1;
      case "http://www.w3.org/1998/Math/MathML":
        return 2;
      default:
        return 0;
    }
  }
  function ig(e, t) {
    if (e === 0)
      switch (t) {
        case "svg":
          return 1;
        case "math":
          return 2;
        default:
          return 0;
      }
    return e === 1 && t === "foreignObject" ? 0 : e;
  }
  function Af(e, t) {
    return e === "textarea" || e === "noscript" || typeof t.children == "string" || typeof t.children == "number" || typeof t.children == "bigint" || typeof t.dangerouslySetInnerHTML == "object" && t.dangerouslySetInnerHTML !== null && t.dangerouslySetInnerHTML.__html != null;
  }
  var Ef = null;
  function C1() {
    var e = window.event;
    return e && e.type === "popstate" ? e === Ef ? !1 : (Ef = e, !0) : (Ef = null, !1);
  }
  var rg = typeof setTimeout == "function" ? setTimeout : void 0, D1 = typeof clearTimeout == "function" ? clearTimeout : void 0, ug = typeof Promise == "function" ? Promise : void 0, N1 = typeof queueMicrotask == "function" ? queueMicrotask : typeof ug < "u" ? function(e) {
    return ug.resolve(null).then(e).catch(j1);
  } : rg;
  function j1(e) {
    setTimeout(function() {
      throw e;
    });
  }
  function qa(e) {
    return e === "head";
  }
  function sg(e, t) {
    var n = t, a = 0;
    do {
      var s = n.nextSibling;
      if (e.removeChild(n), s && s.nodeType === 8)
        if (n = s.data, n === "/$" || n === "/&") {
          if (a === 0) {
            e.removeChild(s), mr(t);
            return;
          }
          a--;
        } else if (n === "$" || n === "$?" || n === "$~" || n === "$!" || n === "&")
          a++;
        else if (n === "html")
          pu(e.ownerDocument.documentElement);
        else if (n === "head") {
          n = e.ownerDocument.head, pu(n);
          for (var c = n.firstChild; c; ) {
            var m = c.nextSibling, _ = c.nodeName;
            c[ne] || _ === "SCRIPT" || _ === "STYLE" || _ === "LINK" && c.rel.toLowerCase() === "stylesheet" || n.removeChild(c), c = m;
          }
        } else
          n === "body" && pu(e.ownerDocument.body);
      n = s;
    } while (n);
    mr(t);
  }
  function cg(e, t) {
    var n = e;
    e = 0;
    do {
      var a = n.nextSibling;
      if (n.nodeType === 1 ? t ? (n._stashedDisplay = n.style.display, n.style.display = "none") : (n.style.display = n._stashedDisplay || "", n.getAttribute("style") === "" && n.removeAttribute("style")) : n.nodeType === 3 && (t ? (n._stashedText = n.nodeValue, n.nodeValue = "") : n.nodeValue = n._stashedText || ""), a && a.nodeType === 8)
        if (n = a.data, n === "/$") {
          if (e === 0) break;
          e--;
        } else
          n !== "$" && n !== "$?" && n !== "$~" && n !== "$!" || e++;
      n = a;
    } while (n);
  }
  function wf(e) {
    var t = e.firstChild;
    for (t && t.nodeType === 10 && (t = t.nextSibling); t; ) {
      var n = t;
      switch (t = t.nextSibling, n.nodeName) {
        case "HTML":
        case "HEAD":
        case "BODY":
          wf(n), Me(n);
          continue;
        case "SCRIPT":
        case "STYLE":
          continue;
        case "LINK":
          if (n.rel.toLowerCase() === "stylesheet") continue;
      }
      e.removeChild(n);
    }
  }
  function U1(e, t, n, a) {
    for (; e.nodeType === 1; ) {
      var s = n;
      if (e.nodeName.toLowerCase() !== t.toLowerCase()) {
        if (!a && (e.nodeName !== "INPUT" || e.type !== "hidden"))
          break;
      } else if (a) {
        if (!e[ne])
          switch (t) {
            case "meta":
              if (!e.hasAttribute("itemprop")) break;
              return e;
            case "link":
              if (c = e.getAttribute("rel"), c === "stylesheet" && e.hasAttribute("data-precedence"))
                break;
              if (c !== s.rel || e.getAttribute("href") !== (s.href == null || s.href === "" ? null : s.href) || e.getAttribute("crossorigin") !== (s.crossOrigin == null ? null : s.crossOrigin) || e.getAttribute("title") !== (s.title == null ? null : s.title))
                break;
              return e;
            case "style":
              if (e.hasAttribute("data-precedence")) break;
              return e;
            case "script":
              if (c = e.getAttribute("src"), (c !== (s.src == null ? null : s.src) || e.getAttribute("type") !== (s.type == null ? null : s.type) || e.getAttribute("crossorigin") !== (s.crossOrigin == null ? null : s.crossOrigin)) && c && e.hasAttribute("async") && !e.hasAttribute("itemprop"))
                break;
              return e;
            default:
              return e;
          }
      } else if (t === "input" && e.type === "hidden") {
        var c = s.name == null ? null : "" + s.name;
        if (s.type === "hidden" && e.getAttribute("name") === c)
          return e;
      } else return e;
      if (e = sl(e.nextSibling), e === null) break;
    }
    return null;
  }
  function L1(e, t, n) {
    if (t === "") return null;
    for (; e.nodeType !== 3; )
      if ((e.nodeType !== 1 || e.nodeName !== "INPUT" || e.type !== "hidden") && !n || (e = sl(e.nextSibling), e === null)) return null;
    return e;
  }
  function og(e, t) {
    for (; e.nodeType !== 8; )
      if ((e.nodeType !== 1 || e.nodeName !== "INPUT" || e.type !== "hidden") && !t || (e = sl(e.nextSibling), e === null)) return null;
    return e;
  }
  function zf(e) {
    return e.data === "$?" || e.data === "$~";
  }
  function kf(e) {
    return e.data === "$!" || e.data === "$?" && e.ownerDocument.readyState !== "loading";
  }
  function H1(e, t) {
    var n = e.ownerDocument;
    if (e.data === "$~") e._reactRetry = t;
    else if (e.data !== "$?" || n.readyState !== "loading")
      t();
    else {
      var a = function() {
        t(), n.removeEventListener("DOMContentLoaded", a);
      };
      n.addEventListener("DOMContentLoaded", a), e._reactRetry = a;
    }
  }
  function sl(e) {
    for (; e != null; e = e.nextSibling) {
      var t = e.nodeType;
      if (t === 1 || t === 3) break;
      if (t === 8) {
        if (t = e.data, t === "$" || t === "$!" || t === "$?" || t === "$~" || t === "&" || t === "F!" || t === "F")
          break;
        if (t === "/$" || t === "/&") return null;
      }
    }
    return e;
  }
  var Of = null;
  function fg(e) {
    e = e.nextSibling;
    for (var t = 0; e; ) {
      if (e.nodeType === 8) {
        var n = e.data;
        if (n === "/$" || n === "/&") {
          if (t === 0)
            return sl(e.nextSibling);
          t--;
        } else
          n !== "$" && n !== "$!" && n !== "$?" && n !== "$~" && n !== "&" || t++;
      }
      e = e.nextSibling;
    }
    return null;
  }
  function hg(e) {
    e = e.previousSibling;
    for (var t = 0; e; ) {
      if (e.nodeType === 8) {
        var n = e.data;
        if (n === "$" || n === "$!" || n === "$?" || n === "$~" || n === "&") {
          if (t === 0) return e;
          t--;
        } else n !== "/$" && n !== "/&" || t++;
      }
      e = e.previousSibling;
    }
    return null;
  }
  function dg(e, t, n) {
    switch (t = Fs(n), e) {
      case "html":
        if (e = t.documentElement, !e) throw Error(r(452));
        return e;
      case "head":
        if (e = t.head, !e) throw Error(r(453));
        return e;
      case "body":
        if (e = t.body, !e) throw Error(r(454));
        return e;
      default:
        throw Error(r(451));
    }
  }
  function pu(e) {
    for (var t = e.attributes; t.length; )
      e.removeAttributeNode(t[0]);
    Me(e);
  }
  var cl = /* @__PURE__ */ new Map(), pg = /* @__PURE__ */ new Set();
  function Ws(e) {
    return typeof e.getRootNode == "function" ? e.getRootNode() : e.nodeType === 9 ? e : e.ownerDocument;
  }
  var sa = Y.d;
  Y.d = {
    f: B1,
    r: q1,
    D: Y1,
    C: G1,
    L: X1,
    m: Q1,
    X: Z1,
    S: V1,
    M: K1
  };
  function B1() {
    var e = sa.f(), t = Gs();
    return e || t;
  }
  function q1(e) {
    var t = Ve(e);
    t !== null && t.tag === 5 && t.type === "form" ? Rp(t) : sa.r(e);
  }
  var hr = typeof document > "u" ? null : document;
  function mg(e, t, n) {
    var a = hr;
    if (a && typeof t == "string" && t) {
      var s = $t(t);
      s = 'link[rel="' + e + '"][href="' + s + '"]', typeof n == "string" && (s += '[crossorigin="' + n + '"]'), pg.has(s) || (pg.add(s), e = { rel: e, crossOrigin: n, href: t }, a.querySelector(s) === null && (t = a.createElement("link"), Pt(t, "link", e), ut(t), a.head.appendChild(t)));
    }
  }
  function Y1(e) {
    sa.D(e), mg("dns-prefetch", e, null);
  }
  function G1(e, t) {
    sa.C(e, t), mg("preconnect", e, t);
  }
  function X1(e, t, n) {
    sa.L(e, t, n);
    var a = hr;
    if (a && e && t) {
      var s = 'link[rel="preload"][as="' + $t(t) + '"]';
      t === "image" && n && n.imageSrcSet ? (s += '[imagesrcset="' + $t(
        n.imageSrcSet
      ) + '"]', typeof n.imageSizes == "string" && (s += '[imagesizes="' + $t(
        n.imageSizes
      ) + '"]')) : s += '[href="' + $t(e) + '"]';
      var c = s;
      switch (t) {
        case "style":
          c = dr(e);
          break;
        case "script":
          c = pr(e);
      }
      cl.has(c) || (e = S(
        {
          rel: "preload",
          href: t === "image" && n && n.imageSrcSet ? void 0 : e,
          as: t
        },
        n
      ), cl.set(c, e), a.querySelector(s) !== null || t === "style" && a.querySelector(mu(c)) || t === "script" && a.querySelector(gu(c)) || (t = a.createElement("link"), Pt(t, "link", e), ut(t), a.head.appendChild(t)));
    }
  }
  function Q1(e, t) {
    sa.m(e, t);
    var n = hr;
    if (n && e) {
      var a = t && typeof t.as == "string" ? t.as : "script", s = 'link[rel="modulepreload"][as="' + $t(a) + '"][href="' + $t(e) + '"]', c = s;
      switch (a) {
        case "audioworklet":
        case "paintworklet":
        case "serviceworker":
        case "sharedworker":
        case "worker":
        case "script":
          c = pr(e);
      }
      if (!cl.has(c) && (e = S({ rel: "modulepreload", href: e }, t), cl.set(c, e), n.querySelector(s) === null)) {
        switch (a) {
          case "audioworklet":
          case "paintworklet":
          case "serviceworker":
          case "sharedworker":
          case "worker":
          case "script":
            if (n.querySelector(gu(c)))
              return;
        }
        a = n.createElement("link"), Pt(a, "link", e), ut(a), n.head.appendChild(a);
      }
    }
  }
  function V1(e, t, n) {
    sa.S(e, t, n);
    var a = hr;
    if (a && e) {
      var s = fn(a).hoistableStyles, c = dr(e);
      t = t || "default";
      var m = s.get(c);
      if (!m) {
        var _ = { loading: 0, preload: null };
        if (m = a.querySelector(
          mu(c)
        ))
          _.loading = 5;
        else {
          e = S(
            { rel: "stylesheet", href: e, "data-precedence": t },
            n
          ), (n = cl.get(c)) && Mf(e, n);
          var w = m = a.createElement("link");
          ut(w), Pt(w, "link", e), w._p = new Promise(function(N, Z) {
            w.onload = N, w.onerror = Z;
          }), w.addEventListener("load", function() {
            _.loading |= 1;
          }), w.addEventListener("error", function() {
            _.loading |= 2;
          }), _.loading |= 4, Is(m, t, a);
        }
        m = {
          type: "stylesheet",
          instance: m,
          count: 1,
          state: _
        }, s.set(c, m);
      }
    }
  }
  function Z1(e, t) {
    sa.X(e, t);
    var n = hr;
    if (n && e) {
      var a = fn(n).hoistableScripts, s = pr(e), c = a.get(s);
      c || (c = n.querySelector(gu(s)), c || (e = S({ src: e, async: !0 }, t), (t = cl.get(s)) && Rf(e, t), c = n.createElement("script"), ut(c), Pt(c, "link", e), n.head.appendChild(c)), c = {
        type: "script",
        instance: c,
        count: 1,
        state: null
      }, a.set(s, c));
    }
  }
  function K1(e, t) {
    sa.M(e, t);
    var n = hr;
    if (n && e) {
      var a = fn(n).hoistableScripts, s = pr(e), c = a.get(s);
      c || (c = n.querySelector(gu(s)), c || (e = S({ src: e, async: !0, type: "module" }, t), (t = cl.get(s)) && Rf(e, t), c = n.createElement("script"), ut(c), Pt(c, "link", e), n.head.appendChild(c)), c = {
        type: "script",
        instance: c,
        count: 1,
        state: null
      }, a.set(s, c));
    }
  }
  function gg(e, t, n, a) {
    var s = (s = Ae.current) ? Ws(s) : null;
    if (!s) throw Error(r(446));
    switch (e) {
      case "meta":
      case "title":
        return null;
      case "style":
        return typeof n.precedence == "string" && typeof n.href == "string" ? (t = dr(n.href), n = fn(
          s
        ).hoistableStyles, a = n.get(t), a || (a = {
          type: "style",
          instance: null,
          count: 0,
          state: null
        }, n.set(t, a)), a) : { type: "void", instance: null, count: 0, state: null };
      case "link":
        if (n.rel === "stylesheet" && typeof n.href == "string" && typeof n.precedence == "string") {
          e = dr(n.href);
          var c = fn(
            s
          ).hoistableStyles, m = c.get(e);
          if (m || (s = s.ownerDocument || s, m = {
            type: "stylesheet",
            instance: null,
            count: 0,
            state: { loading: 0, preload: null }
          }, c.set(e, m), (c = s.querySelector(
            mu(e)
          )) && !c._p && (m.instance = c, m.state.loading = 5), cl.has(e) || (n = {
            rel: "preload",
            as: "style",
            href: n.href,
            crossOrigin: n.crossOrigin,
            integrity: n.integrity,
            media: n.media,
            hrefLang: n.hrefLang,
            referrerPolicy: n.referrerPolicy
          }, cl.set(e, n), c || $1(
            s,
            e,
            n,
            m.state
          ))), t && a === null)
            throw Error(r(528, ""));
          return m;
        }
        if (t && a !== null)
          throw Error(r(529, ""));
        return null;
      case "script":
        return t = n.async, n = n.src, typeof n == "string" && t && typeof t != "function" && typeof t != "symbol" ? (t = pr(n), n = fn(
          s
        ).hoistableScripts, a = n.get(t), a || (a = {
          type: "script",
          instance: null,
          count: 0,
          state: null
        }, n.set(t, a)), a) : { type: "void", instance: null, count: 0, state: null };
      default:
        throw Error(r(444, e));
    }
  }
  function dr(e) {
    return 'href="' + $t(e) + '"';
  }
  function mu(e) {
    return 'link[rel="stylesheet"][' + e + "]";
  }
  function yg(e) {
    return S({}, e, {
      "data-precedence": e.precedence,
      precedence: null
    });
  }
  function $1(e, t, n, a) {
    e.querySelector('link[rel="preload"][as="style"][' + t + "]") ? a.loading = 1 : (t = e.createElement("link"), a.preload = t, t.addEventListener("load", function() {
      return a.loading |= 1;
    }), t.addEventListener("error", function() {
      return a.loading |= 2;
    }), Pt(t, "link", n), ut(t), e.head.appendChild(t));
  }
  function pr(e) {
    return '[src="' + $t(e) + '"]';
  }
  function gu(e) {
    return "script[async]" + e;
  }
  function _g(e, t, n) {
    if (t.count++, t.instance === null)
      switch (t.type) {
        case "style":
          var a = e.querySelector(
            'style[data-href~="' + $t(n.href) + '"]'
          );
          if (a)
            return t.instance = a, ut(a), a;
          var s = S({}, n, {
            "data-href": n.href,
            "data-precedence": n.precedence,
            href: null,
            precedence: null
          });
          return a = (e.ownerDocument || e).createElement(
            "style"
          ), ut(a), Pt(a, "style", s), Is(a, n.precedence, e), t.instance = a;
        case "stylesheet":
          s = dr(n.href);
          var c = e.querySelector(
            mu(s)
          );
          if (c)
            return t.state.loading |= 4, t.instance = c, ut(c), c;
          a = yg(n), (s = cl.get(s)) && Mf(a, s), c = (e.ownerDocument || e).createElement("link"), ut(c);
          var m = c;
          return m._p = new Promise(function(_, w) {
            m.onload = _, m.onerror = w;
          }), Pt(c, "link", a), t.state.loading |= 4, Is(c, n.precedence, e), t.instance = c;
        case "script":
          return c = pr(n.src), (s = e.querySelector(
            gu(c)
          )) ? (t.instance = s, ut(s), s) : (a = n, (s = cl.get(c)) && (a = S({}, n), Rf(a, s)), e = e.ownerDocument || e, s = e.createElement("script"), ut(s), Pt(s, "link", a), e.head.appendChild(s), t.instance = s);
        case "void":
          return null;
        default:
          throw Error(r(443, t.type));
      }
    else
      t.type === "stylesheet" && (t.state.loading & 4) === 0 && (a = t.instance, t.state.loading |= 4, Is(a, n.precedence, e));
    return t.instance;
  }
  function Is(e, t, n) {
    for (var a = n.querySelectorAll(
      'link[rel="stylesheet"][data-precedence],style[data-precedence]'
    ), s = a.length ? a[a.length - 1] : null, c = s, m = 0; m < a.length; m++) {
      var _ = a[m];
      if (_.dataset.precedence === t) c = _;
      else if (c !== s) break;
    }
    c ? c.parentNode.insertBefore(e, c.nextSibling) : (t = n.nodeType === 9 ? n.head : n, t.insertBefore(e, t.firstChild));
  }
  function Mf(e, t) {
    e.crossOrigin == null && (e.crossOrigin = t.crossOrigin), e.referrerPolicy == null && (e.referrerPolicy = t.referrerPolicy), e.title == null && (e.title = t.title);
  }
  function Rf(e, t) {
    e.crossOrigin == null && (e.crossOrigin = t.crossOrigin), e.referrerPolicy == null && (e.referrerPolicy = t.referrerPolicy), e.integrity == null && (e.integrity = t.integrity);
  }
  var Ps = null;
  function vg(e, t, n) {
    if (Ps === null) {
      var a = /* @__PURE__ */ new Map(), s = Ps = /* @__PURE__ */ new Map();
      s.set(n, a);
    } else
      s = Ps, a = s.get(n), a || (a = /* @__PURE__ */ new Map(), s.set(n, a));
    if (a.has(e)) return a;
    for (a.set(e, null), n = n.getElementsByTagName(e), s = 0; s < n.length; s++) {
      var c = n[s];
      if (!(c[ne] || c[dt] || e === "link" && c.getAttribute("rel") === "stylesheet") && c.namespaceURI !== "http://www.w3.org/2000/svg") {
        var m = c.getAttribute(t) || "";
        m = e + m;
        var _ = a.get(m);
        _ ? _.push(c) : a.set(m, [c]);
      }
    }
    return a;
  }
  function bg(e, t, n) {
    e = e.ownerDocument || e, e.head.insertBefore(
      n,
      t === "title" ? e.querySelector("head > title") : null
    );
  }
  function J1(e, t, n) {
    if (n === 1 || t.itemProp != null) return !1;
    switch (e) {
      case "meta":
      case "title":
        return !0;
      case "style":
        if (typeof t.precedence != "string" || typeof t.href != "string" || t.href === "")
          break;
        return !0;
      case "link":
        if (typeof t.rel != "string" || typeof t.href != "string" || t.href === "" || t.onLoad || t.onError)
          break;
        switch (t.rel) {
          case "stylesheet":
            return e = t.disabled, typeof t.precedence == "string" && e == null;
          default:
            return !0;
        }
      case "script":
        if (t.async && typeof t.async != "function" && typeof t.async != "symbol" && !t.onLoad && !t.onError && t.src && typeof t.src == "string")
          return !0;
    }
    return !1;
  }
  function Sg(e) {
    return !(e.type === "stylesheet" && (e.state.loading & 3) === 0);
  }
  function F1(e, t, n, a) {
    if (n.type === "stylesheet" && (typeof a.media != "string" || matchMedia(a.media).matches !== !1) && (n.state.loading & 4) === 0) {
      if (n.instance === null) {
        var s = dr(a.href), c = t.querySelector(
          mu(s)
        );
        if (c) {
          t = c._p, t !== null && typeof t == "object" && typeof t.then == "function" && (e.count++, e = ec.bind(e), t.then(e, e)), n.state.loading |= 4, n.instance = c, ut(c);
          return;
        }
        c = t.ownerDocument || t, a = yg(a), (s = cl.get(s)) && Mf(a, s), c = c.createElement("link"), ut(c);
        var m = c;
        m._p = new Promise(function(_, w) {
          m.onload = _, m.onerror = w;
        }), Pt(c, "link", a), n.instance = c;
      }
      e.stylesheets === null && (e.stylesheets = /* @__PURE__ */ new Map()), e.stylesheets.set(n, t), (t = n.state.preload) && (n.state.loading & 3) === 0 && (e.count++, n = ec.bind(e), t.addEventListener("load", n), t.addEventListener("error", n));
    }
  }
  var Cf = 0;
  function W1(e, t) {
    return e.stylesheets && e.count === 0 && nc(e, e.stylesheets), 0 < e.count || 0 < e.imgCount ? function(n) {
      var a = setTimeout(function() {
        if (e.stylesheets && nc(e, e.stylesheets), e.unsuspend) {
          var c = e.unsuspend;
          e.unsuspend = null, c();
        }
      }, 6e4 + t);
      0 < e.imgBytes && Cf === 0 && (Cf = 62500 * R1());
      var s = setTimeout(
        function() {
          if (e.waitingForImages = !1, e.count === 0 && (e.stylesheets && nc(e, e.stylesheets), e.unsuspend)) {
            var c = e.unsuspend;
            e.unsuspend = null, c();
          }
        },
        (e.imgBytes > Cf ? 50 : 800) + t
      );
      return e.unsuspend = n, function() {
        e.unsuspend = null, clearTimeout(a), clearTimeout(s);
      };
    } : null;
  }
  function ec() {
    if (this.count--, this.count === 0 && (this.imgCount === 0 || !this.waitingForImages)) {
      if (this.stylesheets) nc(this, this.stylesheets);
      else if (this.unsuspend) {
        var e = this.unsuspend;
        this.unsuspend = null, e();
      }
    }
  }
  var tc = null;
  function nc(e, t) {
    e.stylesheets = null, e.unsuspend !== null && (e.count++, tc = /* @__PURE__ */ new Map(), t.forEach(I1, e), tc = null, ec.call(e));
  }
  function I1(e, t) {
    if (!(t.state.loading & 4)) {
      var n = tc.get(e);
      if (n) var a = n.get(null);
      else {
        n = /* @__PURE__ */ new Map(), tc.set(e, n);
        for (var s = e.querySelectorAll(
          "link[data-precedence],style[data-precedence]"
        ), c = 0; c < s.length; c++) {
          var m = s[c];
          (m.nodeName === "LINK" || m.getAttribute("media") !== "not all") && (n.set(m.dataset.precedence, m), a = m);
        }
        a && n.set(null, a);
      }
      s = t.instance, m = s.getAttribute("data-precedence"), c = n.get(m) || a, c === a && n.set(null, s), n.set(m, s), this.count++, a = ec.bind(this), s.addEventListener("load", a), s.addEventListener("error", a), c ? c.parentNode.insertBefore(s, c.nextSibling) : (e = e.nodeType === 9 ? e.head : e, e.insertBefore(s, e.firstChild)), t.state.loading |= 4;
    }
  }
  var yu = {
    $$typeof: H,
    Provider: null,
    Consumer: null,
    _currentValue: ie,
    _currentValue2: ie,
    _threadCount: 0
  };
  function P1(e, t, n, a, s, c, m, _, w) {
    this.tag = 1, this.containerInfo = e, this.pingCache = this.current = this.pendingChildren = null, this.timeoutHandle = -1, this.callbackNode = this.next = this.pendingContext = this.context = this.cancelPendingCommit = null, this.callbackPriority = 0, this.expirationTimes = zl(-1), this.entangledLanes = this.shellSuspendCounter = this.errorRecoveryDisabledLanes = this.expiredLanes = this.warmLanes = this.pingedLanes = this.suspendedLanes = this.pendingLanes = 0, this.entanglements = zl(0), this.hiddenUpdates = zl(null), this.identifierPrefix = a, this.onUncaughtError = s, this.onCaughtError = c, this.onRecoverableError = m, this.pooledCache = null, this.pooledCacheLanes = 0, this.formState = w, this.incompleteTransitions = /* @__PURE__ */ new Map();
  }
  function xg(e, t, n, a, s, c, m, _, w, N, Z, J) {
    return e = new P1(
      e,
      t,
      n,
      m,
      w,
      N,
      Z,
      J,
      _
    ), t = 1, c === !0 && (t |= 24), c = Bn(3, null, null, t), e.current = c, c.stateNode = e, t = co(), t.refCount++, e.pooledCache = t, t.refCount++, c.memoizedState = {
      element: a,
      isDehydrated: n,
      cache: t
    }, po(c), e;
  }
  function Tg(e) {
    return e ? (e = Vi, e) : Vi;
  }
  function Ag(e, t, n, a, s, c) {
    s = Tg(s), a.context === null ? a.context = s : a.pendingContext = s, a = Oa(t), a.payload = { element: n }, c = c === void 0 ? null : c, c !== null && (a.callback = c), n = Ma(e, a, t), n !== null && (En(n, e, t), Jr(n, e, t));
  }
  function Eg(e, t) {
    if (e = e.memoizedState, e !== null && e.dehydrated !== null) {
      var n = e.retryLane;
      e.retryLane = n !== 0 && n < t ? n : t;
    }
  }
  function Df(e, t) {
    Eg(e, t), (e = e.alternate) && Eg(e, t);
  }
  function wg(e) {
    if (e.tag === 13 || e.tag === 31) {
      var t = oi(e, 67108864);
      t !== null && En(t, e, 67108864), Df(e, 67108864);
    }
  }
  function zg(e) {
    if (e.tag === 13 || e.tag === 31) {
      var t = Qn();
      t = Xl(t);
      var n = oi(e, t);
      n !== null && En(n, e, t), Df(e, t);
    }
  }
  var lc = !0;
  function ev(e, t, n, a) {
    var s = L.T;
    L.T = null;
    var c = Y.p;
    try {
      Y.p = 2, Nf(e, t, n, a);
    } finally {
      Y.p = c, L.T = s;
    }
  }
  function tv(e, t, n, a) {
    var s = L.T;
    L.T = null;
    var c = Y.p;
    try {
      Y.p = 8, Nf(e, t, n, a);
    } finally {
      Y.p = c, L.T = s;
    }
  }
  function Nf(e, t, n, a) {
    if (lc) {
      var s = jf(a);
      if (s === null)
        bf(
          e,
          t,
          a,
          ac,
          n
        ), Og(e, a);
      else if (lv(
        s,
        e,
        t,
        n,
        a
      ))
        a.stopPropagation();
      else if (Og(e, a), t & 4 && -1 < nv.indexOf(e)) {
        for (; s !== null; ) {
          var c = Ve(s);
          if (c !== null)
            switch (c.tag) {
              case 3:
                if (c = c.stateNode, c.current.memoizedState.isDehydrated) {
                  var m = un(c.pendingLanes);
                  if (m !== 0) {
                    var _ = c;
                    for (_.pendingLanes |= 2, _.entangledLanes |= 2; m; ) {
                      var w = 1 << 31 - St(m);
                      _.entanglements[1] |= w, m &= ~w;
                    }
                    Dl(c), (Xe & 6) === 0 && (qs = vt() + 500, fu(0));
                  }
                }
                break;
              case 31:
              case 13:
                _ = oi(c, 2), _ !== null && En(_, c, 2), Gs(), Df(c, 2);
            }
          if (c = jf(a), c === null && bf(
            e,
            t,
            a,
            ac,
            n
          ), c === s) break;
          s = c;
        }
        s !== null && a.stopPropagation();
      } else
        bf(
          e,
          t,
          a,
          null,
          n
        );
    }
  }
  function jf(e) {
    return e = ae(e), Uf(e);
  }
  var ac = null;
  function Uf(e) {
    if (ac = null, e = xe(e), e !== null) {
      var t = f(e);
      if (t === null) e = null;
      else {
        var n = t.tag;
        if (n === 13) {
          if (e = h(t), e !== null) return e;
          e = null;
        } else if (n === 31) {
          if (e = p(t), e !== null) return e;
          e = null;
        } else if (n === 3) {
          if (t.stateNode.current.memoizedState.isDehydrated)
            return t.tag === 3 ? t.stateNode.containerInfo : null;
          e = null;
        } else t !== e && (e = null);
      }
    }
    return ac = e, null;
  }
  function kg(e) {
    switch (e) {
      case "beforetoggle":
      case "cancel":
      case "click":
      case "close":
      case "contextmenu":
      case "copy":
      case "cut":
      case "auxclick":
      case "dblclick":
      case "dragend":
      case "dragstart":
      case "drop":
      case "focusin":
      case "focusout":
      case "input":
      case "invalid":
      case "keydown":
      case "keypress":
      case "keyup":
      case "mousedown":
      case "mouseup":
      case "paste":
      case "pause":
      case "play":
      case "pointercancel":
      case "pointerdown":
      case "pointerup":
      case "ratechange":
      case "reset":
      case "resize":
      case "seeked":
      case "submit":
      case "toggle":
      case "touchcancel":
      case "touchend":
      case "touchstart":
      case "volumechange":
      case "change":
      case "selectionchange":
      case "textInput":
      case "compositionstart":
      case "compositionend":
      case "compositionupdate":
      case "beforeblur":
      case "afterblur":
      case "beforeinput":
      case "blur":
      case "fullscreenchange":
      case "focus":
      case "hashchange":
      case "popstate":
      case "select":
      case "selectstart":
        return 2;
      case "drag":
      case "dragenter":
      case "dragexit":
      case "dragleave":
      case "dragover":
      case "mousemove":
      case "mouseout":
      case "mouseover":
      case "pointermove":
      case "pointerout":
      case "pointerover":
      case "scroll":
      case "touchmove":
      case "wheel":
      case "mouseenter":
      case "mouseleave":
      case "pointerenter":
      case "pointerleave":
        return 8;
      case "message":
        switch (ma()) {
          case jn:
            return 2;
          case mn:
            return 8;
          case gn:
          case Ut:
            return 32;
          case yn:
            return 268435456;
          default:
            return 32;
        }
      default:
        return 32;
    }
  }
  var Lf = !1, Ya = null, Ga = null, Xa = null, _u = /* @__PURE__ */ new Map(), vu = /* @__PURE__ */ new Map(), Qa = [], nv = "mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset".split(
    " "
  );
  function Og(e, t) {
    switch (e) {
      case "focusin":
      case "focusout":
        Ya = null;
        break;
      case "dragenter":
      case "dragleave":
        Ga = null;
        break;
      case "mouseover":
      case "mouseout":
        Xa = null;
        break;
      case "pointerover":
      case "pointerout":
        _u.delete(t.pointerId);
        break;
      case "gotpointercapture":
      case "lostpointercapture":
        vu.delete(t.pointerId);
    }
  }
  function bu(e, t, n, a, s, c) {
    return e === null || e.nativeEvent !== c ? (e = {
      blockedOn: t,
      domEventName: n,
      eventSystemFlags: a,
      nativeEvent: c,
      targetContainers: [s]
    }, t !== null && (t = Ve(t), t !== null && wg(t)), e) : (e.eventSystemFlags |= a, t = e.targetContainers, s !== null && t.indexOf(s) === -1 && t.push(s), e);
  }
  function lv(e, t, n, a, s) {
    switch (t) {
      case "focusin":
        return Ya = bu(
          Ya,
          e,
          t,
          n,
          a,
          s
        ), !0;
      case "dragenter":
        return Ga = bu(
          Ga,
          e,
          t,
          n,
          a,
          s
        ), !0;
      case "mouseover":
        return Xa = bu(
          Xa,
          e,
          t,
          n,
          a,
          s
        ), !0;
      case "pointerover":
        var c = s.pointerId;
        return _u.set(
          c,
          bu(
            _u.get(c) || null,
            e,
            t,
            n,
            a,
            s
          )
        ), !0;
      case "gotpointercapture":
        return c = s.pointerId, vu.set(
          c,
          bu(
            vu.get(c) || null,
            e,
            t,
            n,
            a,
            s
          )
        ), !0;
    }
    return !1;
  }
  function Mg(e) {
    var t = xe(e.target);
    if (t !== null) {
      var n = f(t);
      if (n !== null) {
        if (t = n.tag, t === 13) {
          if (t = h(n), t !== null) {
            e.blockedOn = t, gl(e.priority, function() {
              zg(n);
            });
            return;
          }
        } else if (t === 31) {
          if (t = p(n), t !== null) {
            e.blockedOn = t, gl(e.priority, function() {
              zg(n);
            });
            return;
          }
        } else if (t === 3 && n.stateNode.current.memoizedState.isDehydrated) {
          e.blockedOn = n.tag === 3 ? n.stateNode.containerInfo : null;
          return;
        }
      }
    }
    e.blockedOn = null;
  }
  function ic(e) {
    if (e.blockedOn !== null) return !1;
    for (var t = e.targetContainers; 0 < t.length; ) {
      var n = jf(e.nativeEvent);
      if (n === null) {
        n = e.nativeEvent;
        var a = new n.constructor(
          n.type,
          n
        );
        W = a, n.target.dispatchEvent(a), W = null;
      } else
        return t = Ve(n), t !== null && wg(t), e.blockedOn = n, !1;
      t.shift();
    }
    return !0;
  }
  function Rg(e, t, n) {
    ic(e) && n.delete(t);
  }
  function av() {
    Lf = !1, Ya !== null && ic(Ya) && (Ya = null), Ga !== null && ic(Ga) && (Ga = null), Xa !== null && ic(Xa) && (Xa = null), _u.forEach(Rg), vu.forEach(Rg);
  }
  function rc(e, t) {
    e.blockedOn === t && (e.blockedOn = null, Lf || (Lf = !0, o.unstable_scheduleCallback(
      o.unstable_NormalPriority,
      av
    )));
  }
  var uc = null;
  function Cg(e) {
    uc !== e && (uc = e, o.unstable_scheduleCallback(
      o.unstable_NormalPriority,
      function() {
        uc === e && (uc = null);
        for (var t = 0; t < e.length; t += 3) {
          var n = e[t], a = e[t + 1], s = e[t + 2];
          if (typeof a != "function") {
            if (Uf(a || n) === null)
              continue;
            break;
          }
          var c = Ve(n);
          c !== null && (e.splice(t, 3), t -= 3, No(
            c,
            {
              pending: !0,
              data: s,
              method: n.method,
              action: a
            },
            a,
            s
          ));
        }
      }
    ));
  }
  function mr(e) {
    function t(w) {
      return rc(w, e);
    }
    Ya !== null && rc(Ya, e), Ga !== null && rc(Ga, e), Xa !== null && rc(Xa, e), _u.forEach(t), vu.forEach(t);
    for (var n = 0; n < Qa.length; n++) {
      var a = Qa[n];
      a.blockedOn === e && (a.blockedOn = null);
    }
    for (; 0 < Qa.length && (n = Qa[0], n.blockedOn === null); )
      Mg(n), n.blockedOn === null && Qa.shift();
    if (n = (e.ownerDocument || e).$$reactFormReplay, n != null)
      for (a = 0; a < n.length; a += 3) {
        var s = n[a], c = n[a + 1], m = s[pt] || null;
        if (typeof c == "function")
          m || Cg(n);
        else if (m) {
          var _ = null;
          if (c && c.hasAttribute("formAction")) {
            if (s = c, m = c[pt] || null)
              _ = m.formAction;
            else if (Uf(s) !== null) continue;
          } else _ = m.action;
          typeof _ == "function" ? n[a + 1] = _ : (n.splice(a, 3), a -= 3), Cg(n);
        }
      }
  }
  function Dg() {
    function e(c) {
      c.canIntercept && c.info === "react-transition" && c.intercept({
        handler: function() {
          return new Promise(function(m) {
            return s = m;
          });
        },
        focusReset: "manual",
        scroll: "manual"
      });
    }
    function t() {
      s !== null && (s(), s = null), a || setTimeout(n, 20);
    }
    function n() {
      if (!a && !navigation.transition) {
        var c = navigation.currentEntry;
        c && c.url != null && navigation.navigate(c.url, {
          state: c.getState(),
          info: "react-transition",
          history: "replace"
        });
      }
    }
    if (typeof navigation == "object") {
      var a = !1, s = null;
      return navigation.addEventListener("navigate", e), navigation.addEventListener("navigatesuccess", t), navigation.addEventListener("navigateerror", t), setTimeout(n, 100), function() {
        a = !0, navigation.removeEventListener("navigate", e), navigation.removeEventListener("navigatesuccess", t), navigation.removeEventListener("navigateerror", t), s !== null && (s(), s = null);
      };
    }
  }
  function Hf(e) {
    this._internalRoot = e;
  }
  sc.prototype.render = Hf.prototype.render = function(e) {
    var t = this._internalRoot;
    if (t === null) throw Error(r(409));
    var n = t.current, a = Qn();
    Ag(n, a, e, t, null, null);
  }, sc.prototype.unmount = Hf.prototype.unmount = function() {
    var e = this._internalRoot;
    if (e !== null) {
      this._internalRoot = null;
      var t = e.containerInfo;
      Ag(e.current, 2, null, e, null, null), Gs(), t[el] = null;
    }
  };
  function sc(e) {
    this._internalRoot = e;
  }
  sc.prototype.unstable_scheduleHydration = function(e) {
    if (e) {
      var t = va();
      e = { blockedOn: null, target: e, priority: t };
      for (var n = 0; n < Qa.length && t !== 0 && t < Qa[n].priority; n++) ;
      Qa.splice(n, 0, e), n === 0 && Mg(e);
    }
  };
  var Ng = l.version;
  if (Ng !== "19.2.1")
    throw Error(
      r(
        527,
        Ng,
        "19.2.1"
      )
    );
  Y.findDOMNode = function(e) {
    var t = e._reactInternals;
    if (t === void 0)
      throw typeof e.render == "function" ? Error(r(188)) : (e = Object.keys(e).join(","), Error(r(268, e)));
    return e = g(t), e = e !== null ? y(e) : null, e = e === null ? null : e.stateNode, e;
  };
  var iv = {
    bundleType: 0,
    version: "19.2.1",
    rendererPackageName: "react-dom",
    currentDispatcherRef: L,
    reconcilerVersion: "19.2.1"
  };
  if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u") {
    var cc = __REACT_DEVTOOLS_GLOBAL_HOOK__;
    if (!cc.isDisabled && cc.supportsFiber)
      try {
        _n = cc.inject(
          iv
        ), bt = cc;
      } catch {
      }
  }
  return xu.createRoot = function(e, t) {
    if (!u(e)) throw Error(r(299));
    var n = !1, a = "", s = Yp, c = Gp, m = Xp;
    return t != null && (t.unstable_strictMode === !0 && (n = !0), t.identifierPrefix !== void 0 && (a = t.identifierPrefix), t.onUncaughtError !== void 0 && (s = t.onUncaughtError), t.onCaughtError !== void 0 && (c = t.onCaughtError), t.onRecoverableError !== void 0 && (m = t.onRecoverableError)), t = xg(
      e,
      1,
      !1,
      null,
      null,
      n,
      a,
      null,
      s,
      c,
      m,
      Dg
    ), e[el] = t.current, vf(e), new Hf(t);
  }, xu.hydrateRoot = function(e, t, n) {
    if (!u(e)) throw Error(r(299));
    var a = !1, s = "", c = Yp, m = Gp, _ = Xp, w = null;
    return n != null && (n.unstable_strictMode === !0 && (a = !0), n.identifierPrefix !== void 0 && (s = n.identifierPrefix), n.onUncaughtError !== void 0 && (c = n.onUncaughtError), n.onCaughtError !== void 0 && (m = n.onCaughtError), n.onRecoverableError !== void 0 && (_ = n.onRecoverableError), n.formState !== void 0 && (w = n.formState)), t = xg(
      e,
      1,
      !0,
      t,
      n ?? null,
      a,
      s,
      w,
      c,
      m,
      _,
      Dg
    ), t.context = Tg(null), n = t.current, a = Qn(), a = Xl(a), s = Oa(a), s.callback = null, Ma(n, s, a), n = a, t.current.lanes = n, sn(t, n), Dl(t), e[el] = t.current, vf(e), new sc(t);
  }, xu.version = "19.2.1", xu;
}
var Qg;
function mv() {
  if (Qg) return Yf.exports;
  Qg = 1;
  function o() {
    if (!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ > "u" || typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE != "function"))
      try {
        __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(o);
      } catch (l) {
        console.error(l);
      }
  }
  return o(), Yf.exports = pv(), Yf.exports;
}
var gv = mv();
const yv = (o) => o.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase(), _v = (o) => o.replace(
  /^([A-Z])|[\s-_]+(\w)/g,
  (l, i, r) => r ? r.toUpperCase() : i.toLowerCase()
), Vg = (o) => {
  const l = _v(o);
  return l.charAt(0).toUpperCase() + l.slice(1);
}, G0 = (...o) => o.filter((l, i, r) => !!l && l.trim() !== "" && r.indexOf(l) === i).join(" ").trim(), vv = (o) => {
  for (const l in o)
    if (l.startsWith("aria-") || l === "role" || l === "title")
      return !0;
};
var bv = {
  xmlns: "http://www.w3.org/2000/svg",
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round"
};
const Sv = re.forwardRef(
  ({
    color: o = "currentColor",
    size: l = 24,
    strokeWidth: i = 2,
    absoluteStrokeWidth: r,
    className: u = "",
    children: f,
    iconNode: h,
    ...p
  }, d) => re.createElement(
    "svg",
    {
      ref: d,
      ...bv,
      width: l,
      height: l,
      stroke: o,
      strokeWidth: r ? Number(i) * 24 / Number(l) : i,
      className: G0("lucide", u),
      ...!f && !vv(p) && { "aria-hidden": "true" },
      ...p
    },
    [
      ...h.map(([g, y]) => re.createElement(g, y)),
      ...Array.isArray(f) ? f : [f]
    ]
  )
);
const Le = (o, l) => {
  const i = re.forwardRef(
    ({ className: r, ...u }, f) => re.createElement(Sv, {
      ref: f,
      iconNode: l,
      className: G0(
        `lucide-${yv(Vg(o))}`,
        `lucide-${o}`,
        r
      ),
      ...u
    })
  );
  return i.displayName = Vg(o), i;
};
const xv = [
  ["path", { d: "M12 17V3", key: "1cwfxf" }],
  ["path", { d: "m6 11 6 6 6-6", key: "12ii2o" }],
  ["path", { d: "M19 21H5", key: "150jfl" }]
], ch = Le("arrow-down-to-line", xv);
const Tv = [
  ["path", { d: "M8 3 4 7l4 4", key: "9rb6wj" }],
  ["path", { d: "M4 7h16", key: "6tx8e3" }],
  ["path", { d: "m16 21 4-4-4-4", key: "siv7j2" }],
  ["path", { d: "M20 17H4", key: "h6l3hr" }]
], Av = Le("arrow-left-right", Tv);
const Ev = [
  ["path", { d: "m12 19-7-7 7-7", key: "1l729n" }],
  ["path", { d: "M19 12H5", key: "x3x0zl" }]
], wv = Le("arrow-left", Ev);
const zv = [
  ["path", { d: "M7 7h10v10", key: "1tivn9" }],
  ["path", { d: "M7 17 17 7", key: "1vkiza" }]
], oc = Le("arrow-up-right", zv);
const kv = [
  ["path", { d: "M12 7v14", key: "1akyts" }],
  [
    "path",
    {
      d: "M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z",
      key: "ruj8y"
    }
  ]
], Zg = Le("book-open", kv);
const Ov = [["path", { d: "M20 6 9 17l-5-5", key: "1gmf2c" }]], X0 = Le("check", Ov);
const Mv = [["path", { d: "m6 9 6 6 6-6", key: "qrunsl" }]], Rv = Le("chevron-down", Mv);
const Cv = [["path", { d: "m18 15-6-6-6 6", key: "153udz" }]], Dv = Le("chevron-up", Cv);
const Nv = [
  ["path", { d: "m9 7-5 5 5 5", key: "j5w590" }],
  ["path", { d: "m15 7 5 5-5 5", key: "1bl6da" }]
], jv = Le("chevrons-left-right", Nv);
const Uv = [
  ["rect", { width: "18", height: "18", x: "3", y: "3", rx: "2", key: "afitv7" }],
  ["path", { d: "M12 3v18", key: "108xh3" }]
], Q0 = Le("columns-2", Uv);
const Lv = [
  ["rect", { width: "14", height: "14", x: "8", y: "8", rx: "2", ry: "2", key: "17jyea" }],
  ["path", { d: "M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2", key: "zix9uf" }]
], V0 = Le("copy", Lv);
const Hv = [
  ["path", { d: "M12 15V3", key: "m9g1x1" }],
  ["path", { d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4", key: "ih7n3h" }],
  ["path", { d: "m7 10 5 5 5-5", key: "brsn70" }]
], Bv = Le("download", Hv);
const qv = [
  [
    "path",
    {
      d: "M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49",
      key: "ct8e1f"
    }
  ],
  ["path", { d: "M14.084 14.158a3 3 0 0 1-4.242-4.242", key: "151rxh" }],
  [
    "path",
    {
      d: "M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143",
      key: "13bj9a"
    }
  ],
  ["path", { d: "m2 2 20 20", key: "1ooewy" }]
], Yv = Le("eye-off", qv);
const Gv = [
  [
    "path",
    {
      d: "M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0",
      key: "1nclc0"
    }
  ],
  ["circle", { cx: "12", cy: "12", r: "3", key: "1v7zrd" }]
], Xv = Le("eye", Gv);
const Qv = [
  [
    "path",
    {
      d: "M10.5 22H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.706.706l3.588 3.588A2.4 2.4 0 0 1 20 8v6",
      key: "g5mvt7"
    }
  ],
  ["path", { d: "M14 2v5a1 1 0 0 0 1 1h5", key: "wfsgrz" }],
  ["path", { d: "m14 20 2 2 4-4", key: "15kota" }]
], Vv = Le("file-check-corner", Qv);
const Zv = [
  [
    "path",
    {
      d: "M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5",
      key: "mvr1a0"
    }
  ]
], Kg = Le("heart", Zv);
const Kv = [
  ["path", { d: "M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8", key: "1357e3" }],
  ["path", { d: "M3 3v5h5", key: "1xhq8a" }],
  ["path", { d: "M12 7v5l4 2", key: "1fdv2h" }]
], $v = Le("history", Kv);
const Jv = [
  ["path", { d: "m22 11-1.296-1.296a2.4 2.4 0 0 0-3.408 0L11 16", key: "9kzy35" }],
  ["path", { d: "M4 8a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2", key: "1t0f0t" }],
  ["circle", { cx: "13", cy: "7", r: "1", fill: "currentColor", key: "1obus6" }],
  ["rect", { x: "8", y: "2", width: "14", height: "14", rx: "2", key: "1gvhby" }]
], oh = Le("images", Jv);
const Fv = [
  [
    "path",
    {
      d: "M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z",
      key: "1s6t7t"
    }
  ],
  ["circle", { cx: "16.5", cy: "7.5", r: ".5", fill: "currentColor", key: "w0ekpg" }]
], Wv = Le("key-round", Fv);
const Iv = [["path", { d: "M21 12a9 9 0 1 1-6.219-8.56", key: "13zald" }]], $g = Le("loader-circle", Iv);
const Pv = [
  ["path", { d: "M15 3h6v6", key: "1q9fwt" }],
  ["path", { d: "m21 3-7 7", key: "1l2asr" }],
  ["path", { d: "m3 21 7-7", key: "tjx5ai" }],
  ["path", { d: "M9 21H3v-6", key: "wtvkvv" }]
], eb = Le("maximize-2", Pv);
const tb = [
  [
    "path",
    {
      d: "M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401",
      key: "kfwtm"
    }
  ]
], nb = Le("moon", tb);
const lb = [
  ["rect", { width: "18", height: "18", x: "3", y: "3", rx: "2", key: "afitv7" }],
  ["path", { d: "M3 9h18", key: "1pudct" }],
  ["path", { d: "M9 21V9", key: "1oto5p" }]
], ab = Le("panels-top-left", lb);
const ib = [
  ["path", { d: "M5 12h14", key: "1ays0h" }],
  ["path", { d: "M12 5v14", key: "s699le" }]
], Ka = Le("plus", ib);
const rb = [
  ["path", { d: "M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8", key: "1357e3" }],
  ["path", { d: "M3 3v5h5", key: "1xhq8a" }]
], Jg = Le("rotate-ccw", rb);
const ub = [
  ["path", { d: "m21 21-4.34-4.34", key: "14j7rj" }],
  ["circle", { cx: "11", cy: "11", r: "8", key: "4ej97u" }]
], Fg = Le("search", ub);
const sb = [
  ["path", { d: "M14 17H5", key: "gfn3mx" }],
  ["path", { d: "M19 7h-9", key: "6i9tg" }],
  ["circle", { cx: "17", cy: "17", r: "3", key: "18b49y" }],
  ["circle", { cx: "7", cy: "7", r: "3", key: "dfmy0x" }]
], cb = Le("settings-2", sb);
const ob = [
  ["path", { d: "M10 5H3", key: "1qgfaw" }],
  ["path", { d: "M12 19H3", key: "yhmn1j" }],
  ["path", { d: "M14 3v4", key: "1sua03" }],
  ["path", { d: "M16 17v4", key: "1q0r14" }],
  ["path", { d: "M21 12h-9", key: "1o4lsq" }],
  ["path", { d: "M21 19h-5", key: "1rlt1p" }],
  ["path", { d: "M21 5h-7", key: "1oszz2" }],
  ["path", { d: "M8 10v4", key: "tgpxqk" }],
  ["path", { d: "M8 12H3", key: "a7s4jb" }]
], Wg = Le("sliders-horizontal", ob);
const fb = [
  [
    "path",
    {
      d: "M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z",
      key: "1s2grr"
    }
  ],
  ["path", { d: "M20 2v4", key: "1rf3ol" }],
  ["path", { d: "M22 4h-4", key: "gwowj6" }],
  ["circle", { cx: "4", cy: "20", r: "2", key: "6kqj1y" }]
], hb = Le("sparkles", fb);
const db = [
  ["rect", { width: "18", height: "18", x: "3", y: "3", rx: "2", key: "afitv7" }]
], Ig = Le("square", db);
const pb = [
  ["circle", { cx: "12", cy: "12", r: "4", key: "4exip2" }],
  ["path", { d: "M12 2v2", key: "tus03m" }],
  ["path", { d: "M12 20v2", key: "1lh1kg" }],
  ["path", { d: "m4.93 4.93 1.41 1.41", key: "149t6j" }],
  ["path", { d: "m17.66 17.66 1.41 1.41", key: "ptbguv" }],
  ["path", { d: "M2 12h2", key: "1t8f8n" }],
  ["path", { d: "M20 12h2", key: "1q8mjw" }],
  ["path", { d: "m6.34 17.66-1.41 1.41", key: "1m8zz5" }],
  ["path", { d: "m19.07 4.93-1.41 1.41", key: "1shlcs" }]
], mb = Le("sun", pb);
const gb = [
  ["path", { d: "M10 11v6", key: "nco0om" }],
  ["path", { d: "M14 11v6", key: "outv1u" }],
  ["path", { d: "M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6", key: "miytrc" }],
  ["path", { d: "M3 6h18", key: "d0wm0j" }],
  ["path", { d: "M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2", key: "e791ji" }]
], yb = Le("trash-2", gb);
const _b = [
  ["path", { d: "M12 3v12", key: "1x0j5s" }],
  ["path", { d: "m17 8-5-5-5 5", key: "7q97r8" }],
  ["path", { d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4", key: "ih7n3h" }]
], vb = Le("upload", _b);
const bb = [
  [
    "path",
    {
      d: "m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72",
      key: "ul74o6"
    }
  ],
  ["path", { d: "m14 7 3 3", key: "1r5n42" }],
  ["path", { d: "M5 6v4", key: "ilb8ba" }],
  ["path", { d: "M19 14v4", key: "blhpug" }],
  ["path", { d: "M10 2v2", key: "7u0qdc" }],
  ["path", { d: "M7 8H3", key: "zfb6yr" }],
  ["path", { d: "M21 16h-4", key: "1cnmox" }],
  ["path", { d: "M11 3H9", key: "1obp7u" }]
], fc = Le("wand-sparkles", bb);
const Sb = [
  ["path", { d: "M18 6 6 18", key: "1bl5f8" }],
  ["path", { d: "m6 6 12 12", key: "d8bk6v" }]
], Tu = Le("x", Sb);
function oa(o) {
  if (o === void 0)
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  return o;
}
function Z0(o, l) {
  o.prototype = Object.create(l.prototype), o.prototype.constructor = o, o.__proto__ = l;
}
var Wn = {
  autoSleep: 120,
  force3D: "auto",
  nullTargetWarn: 1,
  units: {
    lineHeight: ""
  }
}, Bu = {
  duration: 0.5,
  overwrite: !1,
  delay: 0
}, Rh, en, ct, fl = 1e8, lt = 1 / fl, fh = Math.PI * 2, xb = fh / 4, Tb = 0, K0 = Math.sqrt, Ab = Math.cos, Eb = Math.sin, Yt = function(l) {
  return typeof l == "string";
}, _t = function(l) {
  return typeof l == "function";
}, ha = function(l) {
  return typeof l == "number";
}, Ch = function(l) {
  return typeof l > "u";
}, Ll = function(l) {
  return typeof l == "object";
}, kn = function(l) {
  return l !== !1;
}, Dh = function() {
  return typeof window < "u";
}, hc = function(l) {
  return _t(l) || Yt(l);
}, $0 = typeof ArrayBuffer == "function" && ArrayBuffer.isView || function() {
}, rn = Array.isArray, wb = /random\([^)]+\)/g, zb = /,\s*/g, Pg = /(?:-?\.?\d|\.)+/gi, J0 = /[-+=.]*\d+[.e\-+]*\d*[e\-+]*\d*/g, vr = /[-+=.]*\d+[.e-]*\d*[a-z%]*/g, Vf = /[-+=.]*\d+\.?\d*(?:e-|e\+)?\d*/gi, F0 = /[+-]=-?[.\d]+/, kb = /[^,'"\[\]\s]+/gi, Ob = /^[+\-=e\s\d]*\d+[.\d]*([a-z]*|%)\s*$/i, ft, Nl, hh, Nh, In = {}, bc = {}, W0, I0 = function(l) {
  return (bc = Er(l, In)) && Cn;
}, jh = function(l, i) {
  return console.warn("Invalid property", l, "set to", i, "Missing plugin? gsap.registerPlugin()");
}, qu = function(l, i) {
  return !i && console.warn(l);
}, P0 = function(l, i) {
  return l && (In[l] = i) && bc && (bc[l] = i) || In;
}, Yu = function() {
  return 0;
}, Mb = {
  suppressEvents: !0,
  isStart: !0,
  kill: !1
}, yc = {
  suppressEvents: !0,
  kill: !1
}, Rb = {
  suppressEvents: !0
}, Uh = {}, Wa = [], dh = {}, ey, Kn = {}, Zf = {}, e0 = 30, _c = [], Lh = "", Hh = function(l) {
  var i = l[0], r, u;
  if (Ll(i) || _t(i) || (l = [l]), !(r = (i._gsap || {}).harness)) {
    for (u = _c.length; u-- && !_c[u].targetTest(i); )
      ;
    r = _c[u];
  }
  for (u = l.length; u--; )
    l[u] && (l[u]._gsap || (l[u]._gsap = new xy(l[u], r))) || l.splice(u, 1);
  return l;
}, Oi = function(l) {
  return l._gsap || Hh(hl(l))[0]._gsap;
}, ty = function(l, i, r) {
  return (r = l[i]) && _t(r) ? l[i]() : Ch(r) && l.getAttribute && l.getAttribute(i) || r;
}, On = function(l, i) {
  return (l = l.split(",")).forEach(i) || l;
}, At = function(l) {
  return Math.round(l * 1e5) / 1e5 || 0;
}, ot = function(l) {
  return Math.round(l * 1e7) / 1e7 || 0;
}, Sr = function(l, i) {
  var r = i.charAt(0), u = parseFloat(i.substr(2));
  return l = parseFloat(l), r === "+" ? l + u : r === "-" ? l - u : r === "*" ? l * u : l / u;
}, Cb = function(l, i) {
  for (var r = i.length, u = 0; l.indexOf(i[u]) < 0 && ++u < r; )
    ;
  return u < r;
}, Sc = function() {
  var l = Wa.length, i = Wa.slice(0), r, u;
  for (dh = {}, Wa.length = 0, r = 0; r < l; r++)
    u = i[r], u && u._lazy && (u.render(u._lazy[0], u._lazy[1], !0)._lazy = 0);
}, Bh = function(l) {
  return !!(l._initted || l._startAt || l.add);
}, ny = function(l, i, r, u) {
  Wa.length && !en && Sc(), l.render(i, r, !!(en && i < 0 && Bh(l))), Wa.length && !en && Sc();
}, ly = function(l) {
  var i = parseFloat(l);
  return (i || i === 0) && (l + "").match(kb).length < 2 ? i : Yt(l) ? l.trim() : l;
}, ay = function(l) {
  return l;
}, Pn = function(l, i) {
  for (var r in i)
    r in l || (l[r] = i[r]);
  return l;
}, Db = function(l) {
  return function(i, r) {
    for (var u in r)
      u in i || u === "duration" && l || u === "ease" || (i[u] = r[u]);
  };
}, Er = function(l, i) {
  for (var r in i)
    l[r] = i[r];
  return l;
}, t0 = function o(l, i) {
  for (var r in i)
    r !== "__proto__" && r !== "constructor" && r !== "prototype" && (l[r] = Ll(i[r]) ? o(l[r] || (l[r] = {}), i[r]) : i[r]);
  return l;
}, xc = function(l, i) {
  var r = {}, u;
  for (u in l)
    u in i || (r[u] = l[u]);
  return r;
}, ju = function(l) {
  var i = l.parent || ft, r = l.keyframes ? Db(rn(l.keyframes)) : Pn;
  if (kn(l.inherit))
    for (; i; )
      r(l, i.vars.defaults), i = i.parent || i._dp;
  return l;
}, Nb = function(l, i) {
  for (var r = l.length, u = r === i.length; u && r-- && l[r] === i[r]; )
    ;
  return r < 0;
}, iy = function(l, i, r, u, f) {
  var h = l[u], p;
  if (f)
    for (p = i[f]; h && h[f] > p; )
      h = h._prev;
  return h ? (i._next = h._next, h._next = i) : (i._next = l[r], l[r] = i), i._next ? i._next._prev = i : l[u] = i, i._prev = h, i.parent = i._dp = l, i;
}, Rc = function(l, i, r, u) {
  r === void 0 && (r = "_first"), u === void 0 && (u = "_last");
  var f = i._prev, h = i._next;
  f ? f._next = h : l[r] === i && (l[r] = h), h ? h._prev = f : l[u] === i && (l[u] = f), i._next = i._prev = i.parent = null;
}, Pa = function(l, i) {
  l.parent && (!i || l.parent.autoRemoveChildren) && l.parent.remove && l.parent.remove(l), l._act = 0;
}, Mi = function(l, i) {
  if (l && (!i || i._end > l._dur || i._start < 0))
    for (var r = l; r; )
      r._dirty = 1, r = r.parent;
  return l;
}, jb = function(l) {
  for (var i = l.parent; i && i.parent; )
    i._dirty = 1, i.totalDuration(), i = i.parent;
  return l;
}, ph = function(l, i, r, u) {
  return l._startAt && (en ? l._startAt.revert(yc) : l.vars.immediateRender && !l.vars.autoRevert || l._startAt.render(i, !0, u));
}, Ub = function o(l) {
  return !l || l._ts && o(l.parent);
}, n0 = function(l) {
  return l._repeat ? wr(l._tTime, l = l.duration() + l._rDelay) * l : 0;
}, wr = function(l, i) {
  var r = Math.floor(l = ot(l / i));
  return l && r === l ? r - 1 : r;
}, Tc = function(l, i) {
  return (l - i._start) * i._ts + (i._ts >= 0 ? 0 : i._dirty ? i.totalDuration() : i._tDur);
}, Cc = function(l) {
  return l._end = ot(l._start + (l._tDur / Math.abs(l._ts || l._rts || lt) || 0));
}, Dc = function(l, i) {
  var r = l._dp;
  return r && r.smoothChildTiming && l._ts && (l._start = ot(r._time - (l._ts > 0 ? i / l._ts : ((l._dirty ? l.totalDuration() : l._tDur) - i) / -l._ts)), Cc(l), r._dirty || Mi(r, l)), l;
}, ry = function(l, i) {
  var r;
  if ((i._time || !i._dur && i._initted || i._start < l._time && (i._dur || !i.add)) && (r = Tc(l.rawTime(), i), (!i._dur || Fu(0, i.totalDuration(), r) - i._tTime > lt) && i.render(r, !0)), Mi(l, i)._dp && l._initted && l._time >= l._dur && l._ts) {
    if (l._dur < l.duration())
      for (r = l; r._dp; )
        r.rawTime() >= 0 && r.totalTime(r._tTime), r = r._dp;
    l._zTime = -lt;
  }
}, jl = function(l, i, r, u) {
  return i.parent && Pa(i), i._start = ot((ha(r) ? r : r || l !== ft ? ol(l, r, i) : l._time) + i._delay), i._end = ot(i._start + (i.totalDuration() / Math.abs(i.timeScale()) || 0)), iy(l, i, "_first", "_last", l._sort ? "_start" : 0), mh(i) || (l._recent = i), u || ry(l, i), l._ts < 0 && Dc(l, l._tTime), l;
}, uy = function(l, i) {
  return (In.ScrollTrigger || jh("scrollTrigger", i)) && In.ScrollTrigger.create(i, l);
}, sy = function(l, i, r, u, f) {
  if (Yh(l, i, f), !l._initted)
    return 1;
  if (!r && l._pt && !en && (l._dur && l.vars.lazy !== !1 || !l._dur && l.vars.lazy) && ey !== $n.frame)
    return Wa.push(l), l._lazy = [f, u], 1;
}, Lb = function o(l) {
  var i = l.parent;
  return i && i._ts && i._initted && !i._lock && (i.rawTime() < 0 || o(i));
}, mh = function(l) {
  var i = l.data;
  return i === "isFromStart" || i === "isStart";
}, Hb = function(l, i, r, u) {
  var f = l.ratio, h = i < 0 || !i && (!l._start && Lb(l) && !(!l._initted && mh(l)) || (l._ts < 0 || l._dp._ts < 0) && !mh(l)) ? 0 : 1, p = l._rDelay, d = 0, g, y, S;
  if (p && l._repeat && (d = Fu(0, l._tDur, i), y = wr(d, p), l._yoyo && y & 1 && (h = 1 - h), y !== wr(l._tTime, p) && (f = 1 - h, l.vars.repeatRefresh && l._initted && l.invalidate())), h !== f || en || u || l._zTime === lt || !i && l._zTime) {
    if (!l._initted && sy(l, i, u, r, d))
      return;
    for (S = l._zTime, l._zTime = i || (r ? lt : 0), r || (r = i && !S), l.ratio = h, l._from && (h = 1 - h), l._time = 0, l._tTime = d, g = l._pt; g; )
      g.r(h, g.d), g = g._next;
    i < 0 && ph(l, i, r, !0), l._onUpdate && !r && Jn(l, "onUpdate"), d && l._repeat && !r && l.parent && Jn(l, "onRepeat"), (i >= l._tDur || i < 0) && l.ratio === h && (h && Pa(l, 1), !r && !en && (Jn(l, h ? "onComplete" : "onReverseComplete", !0), l._prom && l._prom()));
  } else l._zTime || (l._zTime = i);
}, Bb = function(l, i, r) {
  var u;
  if (r > i)
    for (u = l._first; u && u._start <= r; ) {
      if (u.data === "isPause" && u._start > i)
        return u;
      u = u._next;
    }
  else
    for (u = l._last; u && u._start >= r; ) {
      if (u.data === "isPause" && u._start < i)
        return u;
      u = u._prev;
    }
}, zr = function(l, i, r, u) {
  var f = l._repeat, h = ot(i) || 0, p = l._tTime / l._tDur;
  return p && !u && (l._time *= h / l._dur), l._dur = h, l._tDur = f ? f < 0 ? 1e10 : ot(h * (f + 1) + l._rDelay * f) : h, p > 0 && !u && Dc(l, l._tTime = l._tDur * p), l.parent && Cc(l), r || Mi(l.parent, l), l;
}, l0 = function(l) {
  return l instanceof zn ? Mi(l) : zr(l, l._dur);
}, qb = {
  _start: 0,
  endTime: Yu,
  totalDuration: Yu
}, ol = function o(l, i, r) {
  var u = l.labels, f = l._recent || qb, h = l.duration() >= fl ? f.endTime(!1) : l._dur, p, d, g;
  return Yt(i) && (isNaN(i) || i in u) ? (d = i.charAt(0), g = i.substr(-1) === "%", p = i.indexOf("="), d === "<" || d === ">" ? (p >= 0 && (i = i.replace(/=/, "")), (d === "<" ? f._start : f.endTime(f._repeat >= 0)) + (parseFloat(i.substr(1)) || 0) * (g ? (p < 0 ? f : r).totalDuration() / 100 : 1)) : p < 0 ? (i in u || (u[i] = h), u[i]) : (d = parseFloat(i.charAt(p - 1) + i.substr(p + 1)), g && r && (d = d / 100 * (rn(r) ? r[0] : r).totalDuration()), p > 1 ? o(l, i.substr(0, p - 1), r) + d : h + d)) : i == null ? h : +i;
}, Uu = function(l, i, r) {
  var u = ha(i[1]), f = (u ? 2 : 1) + (l < 2 ? 0 : 1), h = i[f], p, d;
  if (u && (h.duration = i[1]), h.parent = r, l) {
    for (p = h, d = r; d && !("immediateRender" in p); )
      p = d.vars.defaults || {}, d = kn(d.vars.inherit) && d.parent;
    h.immediateRender = kn(p.immediateRender), l < 2 ? h.runBackwards = 1 : h.startAt = i[f - 1];
  }
  return new Rt(i[0], h, i[f + 1]);
}, ni = function(l, i) {
  return l || l === 0 ? i(l) : i;
}, Fu = function(l, i, r) {
  return r < l ? l : r > i ? i : r;
}, an = function(l, i) {
  return !Yt(l) || !(i = Ob.exec(l)) ? "" : i[1];
}, Yb = function(l, i, r) {
  return ni(r, function(u) {
    return Fu(l, i, u);
  });
}, gh = [].slice, cy = function(l, i) {
  return l && Ll(l) && "length" in l && (!i && !l.length || l.length - 1 in l && Ll(l[0])) && !l.nodeType && l !== Nl;
}, Gb = function(l, i, r) {
  return r === void 0 && (r = []), l.forEach(function(u) {
    var f;
    return Yt(u) && !i || cy(u, 1) ? (f = r).push.apply(f, hl(u)) : r.push(u);
  }) || r;
}, hl = function(l, i, r) {
  return ct && !i && ct.selector ? ct.selector(l) : Yt(l) && !r && (hh || !kr()) ? gh.call((i || Nh).querySelectorAll(l), 0) : rn(l) ? Gb(l, r) : cy(l) ? gh.call(l, 0) : l ? [l] : [];
}, yh = function(l) {
  return l = hl(l)[0] || qu("Invalid scope") || {}, function(i) {
    var r = l.current || l.nativeElement || l;
    return hl(i, r.querySelectorAll ? r : r === l ? qu("Invalid scope") || Nh.createElement("div") : l);
  };
}, oy = function(l) {
  return l.sort(function() {
    return 0.5 - Math.random();
  });
}, fy = function(l) {
  if (_t(l))
    return l;
  var i = Ll(l) ? l : {
    each: l
  }, r = Ri(i.ease), u = i.from || 0, f = parseFloat(i.base) || 0, h = {}, p = u > 0 && u < 1, d = isNaN(u) || p, g = i.axis, y = u, S = u;
  return Yt(u) ? y = S = {
    center: 0.5,
    edges: 0.5,
    end: 1
  }[u] || 0 : !p && d && (y = u[0], S = u[1]), function(E, b, R) {
    var A = (R || i).length, C = h[A], j, K, H, F, q, le, X, I, G;
    if (!C) {
      if (G = i.grid === "auto" ? 0 : (i.grid || [1, fl])[1], !G) {
        for (X = -fl; X < (X = R[G++].getBoundingClientRect().left) && G < A; )
          ;
        G < A && G--;
      }
      for (C = h[A] = [], j = d ? Math.min(G, A) * y - 0.5 : u % G, K = G === fl ? 0 : d ? A * S / G - 0.5 : u / G | 0, X = 0, I = fl, le = 0; le < A; le++)
        H = le % G - j, F = K - (le / G | 0), C[le] = q = g ? Math.abs(g === "y" ? F : H) : K0(H * H + F * F), q > X && (X = q), q < I && (I = q);
      u === "random" && oy(C), C.max = X - I, C.min = I, C.v = A = (parseFloat(i.amount) || parseFloat(i.each) * (G > A ? A - 1 : g ? g === "y" ? A / G : G : Math.max(G, A / G)) || 0) * (u === "edges" ? -1 : 1), C.b = A < 0 ? f - A : f, C.u = an(i.amount || i.each) || 0, r = r && A < 0 ? tS(r) : r;
    }
    return A = (C[E] - C.min) / C.max || 0, ot(C.b + (r ? r(A) : A) * C.v) + C.u;
  };
}, _h = function(l) {
  var i = Math.pow(10, ((l + "").split(".")[1] || "").length);
  return function(r) {
    var u = ot(Math.round(parseFloat(r) / l) * l * i);
    return (u - u % 1) / i + (ha(r) ? 0 : an(r));
  };
}, hy = function(l, i) {
  var r = rn(l), u, f;
  return !r && Ll(l) && (u = r = l.radius || fl, l.values ? (l = hl(l.values), (f = !ha(l[0])) && (u *= u)) : l = _h(l.increment)), ni(i, r ? _t(l) ? function(h) {
    return f = l(h), Math.abs(f - h) <= u ? f : h;
  } : function(h) {
    for (var p = parseFloat(f ? h.x : h), d = parseFloat(f ? h.y : 0), g = fl, y = 0, S = l.length, E, b; S--; )
      f ? (E = l[S].x - p, b = l[S].y - d, E = E * E + b * b) : E = Math.abs(l[S] - p), E < g && (g = E, y = S);
    return y = !u || g <= u ? l[y] : h, f || y === h || ha(h) ? y : y + an(h);
  } : _h(l));
}, dy = function(l, i, r, u) {
  return ni(rn(l) ? !i : r === !0 ? !!(r = 0) : !u, function() {
    return rn(l) ? l[~~(Math.random() * l.length)] : (r = r || 1e-5) && (u = r < 1 ? Math.pow(10, (r + "").length - 2) : 1) && Math.floor(Math.round((l - r / 2 + Math.random() * (i - l + r * 0.99)) / r) * r * u) / u;
  });
}, Xb = function() {
  for (var l = arguments.length, i = new Array(l), r = 0; r < l; r++)
    i[r] = arguments[r];
  return function(u) {
    return i.reduce(function(f, h) {
      return h(f);
    }, u);
  };
}, Qb = function(l, i) {
  return function(r) {
    return l(parseFloat(r)) + (i || an(r));
  };
}, Vb = function(l, i, r) {
  return my(l, i, 0, 1, r);
}, py = function(l, i, r) {
  return ni(r, function(u) {
    return l[~~i(u)];
  });
}, Zb = function o(l, i, r) {
  var u = i - l;
  return rn(l) ? py(l, o(0, l.length), i) : ni(r, function(f) {
    return (u + (f - l) % u) % u + l;
  });
}, Kb = function o(l, i, r) {
  var u = i - l, f = u * 2;
  return rn(l) ? py(l, o(0, l.length - 1), i) : ni(r, function(h) {
    return h = (f + (h - l) % f) % f || 0, l + (h > u ? f - h : h);
  });
}, Gu = function(l) {
  return l.replace(wb, function(i) {
    var r = i.indexOf("[") + 1, u = i.substring(r || 7, r ? i.indexOf("]") : i.length - 1).split(zb);
    return dy(r ? u : +u[0], r ? 0 : +u[1], +u[2] || 1e-5);
  });
}, my = function(l, i, r, u, f) {
  var h = i - l, p = u - r;
  return ni(f, function(d) {
    return r + ((d - l) / h * p || 0);
  });
}, $b = function o(l, i, r, u) {
  var f = isNaN(l + i) ? 0 : function(b) {
    return (1 - b) * l + b * i;
  };
  if (!f) {
    var h = Yt(l), p = {}, d, g, y, S, E;
    if (r === !0 && (u = 1) && (r = null), h)
      l = {
        p: l
      }, i = {
        p: i
      };
    else if (rn(l) && !rn(i)) {
      for (y = [], S = l.length, E = S - 2, g = 1; g < S; g++)
        y.push(o(l[g - 1], l[g]));
      S--, f = function(R) {
        R *= S;
        var A = Math.min(E, ~~R);
        return y[A](R - A);
      }, r = i;
    } else u || (l = Er(rn(l) ? [] : {}, l));
    if (!y) {
      for (d in i)
        qh.call(p, l, d, "get", i[d]);
      f = function(R) {
        return Qh(R, p) || (h ? l.p : l);
      };
    }
  }
  return ni(r, f);
}, a0 = function(l, i, r) {
  var u = l.labels, f = fl, h, p, d;
  for (h in u)
    p = u[h] - i, p < 0 == !!r && p && f > (p = Math.abs(p)) && (d = h, f = p);
  return d;
}, Jn = function(l, i, r) {
  var u = l.vars, f = u[i], h = ct, p = l._ctx, d, g, y;
  if (f)
    return d = u[i + "Params"], g = u.callbackScope || l, r && Wa.length && Sc(), p && (ct = p), y = d ? f.apply(g, d) : f.call(g), ct = h, y;
}, Ru = function(l) {
  return Pa(l), l.scrollTrigger && l.scrollTrigger.kill(!!en), l.progress() < 1 && Jn(l, "onInterrupt"), l;
}, br, gy = [], yy = function(l) {
  if (l)
    if (l = !l.name && l.default || l, Dh() || l.headless) {
      var i = l.name, r = _t(l), u = i && !r && l.init ? function() {
        this._props = [];
      } : l, f = {
        init: Yu,
        render: Qh,
        add: qh,
        kill: fS,
        modifier: oS,
        rawVars: 0
      }, h = {
        targetTest: 0,
        get: 0,
        getSetter: Xh,
        aliases: {},
        register: 0
      };
      if (kr(), l !== u) {
        if (Kn[i])
          return;
        Pn(u, Pn(xc(l, f), h)), Er(u.prototype, Er(f, xc(l, h))), Kn[u.prop = i] = u, l.targetTest && (_c.push(u), Uh[i] = 1), i = (i === "css" ? "CSS" : i.charAt(0).toUpperCase() + i.substr(1)) + "Plugin";
      }
      P0(i, u), l.register && l.register(Cn, u, Mn);
    } else
      gy.push(l);
}, nt = 255, Cu = {
  aqua: [0, nt, nt],
  lime: [0, nt, 0],
  silver: [192, 192, 192],
  black: [0, 0, 0],
  maroon: [128, 0, 0],
  teal: [0, 128, 128],
  blue: [0, 0, nt],
  navy: [0, 0, 128],
  white: [nt, nt, nt],
  olive: [128, 128, 0],
  yellow: [nt, nt, 0],
  orange: [nt, 165, 0],
  gray: [128, 128, 128],
  purple: [128, 0, 128],
  green: [0, 128, 0],
  red: [nt, 0, 0],
  pink: [nt, 192, 203],
  cyan: [0, nt, nt],
  transparent: [nt, nt, nt, 0]
}, Kf = function(l, i, r) {
  return l += l < 0 ? 1 : l > 1 ? -1 : 0, (l * 6 < 1 ? i + (r - i) * l * 6 : l < 0.5 ? r : l * 3 < 2 ? i + (r - i) * (2 / 3 - l) * 6 : i) * nt + 0.5 | 0;
}, _y = function(l, i, r) {
  var u = l ? ha(l) ? [l >> 16, l >> 8 & nt, l & nt] : 0 : Cu.black, f, h, p, d, g, y, S, E, b, R;
  if (!u) {
    if (l.substr(-1) === "," && (l = l.substr(0, l.length - 1)), Cu[l])
      u = Cu[l];
    else if (l.charAt(0) === "#") {
      if (l.length < 6 && (f = l.charAt(1), h = l.charAt(2), p = l.charAt(3), l = "#" + f + f + h + h + p + p + (l.length === 5 ? l.charAt(4) + l.charAt(4) : "")), l.length === 9)
        return u = parseInt(l.substr(1, 6), 16), [u >> 16, u >> 8 & nt, u & nt, parseInt(l.substr(7), 16) / 255];
      l = parseInt(l.substr(1), 16), u = [l >> 16, l >> 8 & nt, l & nt];
    } else if (l.substr(0, 3) === "hsl") {
      if (u = R = l.match(Pg), !i)
        d = +u[0] % 360 / 360, g = +u[1] / 100, y = +u[2] / 100, h = y <= 0.5 ? y * (g + 1) : y + g - y * g, f = y * 2 - h, u.length > 3 && (u[3] *= 1), u[0] = Kf(d + 1 / 3, f, h), u[1] = Kf(d, f, h), u[2] = Kf(d - 1 / 3, f, h);
      else if (~l.indexOf("="))
        return u = l.match(J0), r && u.length < 4 && (u[3] = 1), u;
    } else
      u = l.match(Pg) || Cu.transparent;
    u = u.map(Number);
  }
  return i && !R && (f = u[0] / nt, h = u[1] / nt, p = u[2] / nt, S = Math.max(f, h, p), E = Math.min(f, h, p), y = (S + E) / 2, S === E ? d = g = 0 : (b = S - E, g = y > 0.5 ? b / (2 - S - E) : b / (S + E), d = S === f ? (h - p) / b + (h < p ? 6 : 0) : S === h ? (p - f) / b + 2 : (f - h) / b + 4, d *= 60), u[0] = ~~(d + 0.5), u[1] = ~~(g * 100 + 0.5), u[2] = ~~(y * 100 + 0.5)), r && u.length < 4 && (u[3] = 1), u;
}, vy = function(l) {
  var i = [], r = [], u = -1;
  return l.split(Ia).forEach(function(f) {
    var h = f.match(vr) || [];
    i.push.apply(i, h), r.push(u += h.length + 1);
  }), i.c = r, i;
}, i0 = function(l, i, r) {
  var u = "", f = (l + u).match(Ia), h = i ? "hsla(" : "rgba(", p = 0, d, g, y, S;
  if (!f)
    return l;
  if (f = f.map(function(E) {
    return (E = _y(E, i, 1)) && h + (i ? E[0] + "," + E[1] + "%," + E[2] + "%," + E[3] : E.join(",")) + ")";
  }), r && (y = vy(l), d = r.c, d.join(u) !== y.c.join(u)))
    for (g = l.replace(Ia, "1").split(vr), S = g.length - 1; p < S; p++)
      u += g[p] + (~d.indexOf(p) ? f.shift() || h + "0,0,0,0)" : (y.length ? y : f.length ? f : r).shift());
  if (!g)
    for (g = l.split(Ia), S = g.length - 1; p < S; p++)
      u += g[p] + f[p];
  return u + g[S];
}, Ia = (function() {
  var o = "(?:\\b(?:(?:rgb|rgba|hsl|hsla)\\(.+?\\))|\\B#(?:[0-9a-f]{3,4}){1,2}\\b", l;
  for (l in Cu)
    o += "|" + l + "\\b";
  return new RegExp(o + ")", "gi");
})(), Jb = /hsl[a]?\(/, by = function(l) {
  var i = l.join(" "), r;
  if (Ia.lastIndex = 0, Ia.test(i))
    return r = Jb.test(i), l[1] = i0(l[1], r), l[0] = i0(l[0], r, vy(l[1])), !0;
}, Xu, $n = (function() {
  var o = Date.now, l = 500, i = 33, r = o(), u = r, f = 1e3 / 240, h = f, p = [], d, g, y, S, E, b, R = function A(C) {
    var j = o() - u, K = C === !0, H, F, q, le;
    if ((j > l || j < 0) && (r += j - i), u += j, q = u - r, H = q - h, (H > 0 || K) && (le = ++S.frame, E = q - S.time * 1e3, S.time = q = q / 1e3, h += H + (H >= f ? 4 : f - H), F = 1), K || (d = g(A)), F)
      for (b = 0; b < p.length; b++)
        p[b](q, E, le, C);
  };
  return S = {
    time: 0,
    frame: 0,
    tick: function() {
      R(!0);
    },
    deltaRatio: function(C) {
      return E / (1e3 / (C || 60));
    },
    wake: function() {
      W0 && (!hh && Dh() && (Nl = hh = window, Nh = Nl.document || {}, In.gsap = Cn, (Nl.gsapVersions || (Nl.gsapVersions = [])).push(Cn.version), I0(bc || Nl.GreenSockGlobals || !Nl.gsap && Nl || {}), gy.forEach(yy)), y = typeof requestAnimationFrame < "u" && requestAnimationFrame, d && S.sleep(), g = y || function(C) {
        return setTimeout(C, h - S.time * 1e3 + 1 | 0);
      }, Xu = 1, R(2));
    },
    sleep: function() {
      (y ? cancelAnimationFrame : clearTimeout)(d), Xu = 0, g = Yu;
    },
    lagSmoothing: function(C, j) {
      l = C || 1 / 0, i = Math.min(j || 33, l);
    },
    fps: function(C) {
      f = 1e3 / (C || 240), h = S.time * 1e3 + f;
    },
    add: function(C, j, K) {
      var H = j ? function(F, q, le, X) {
        C(F, q, le, X), S.remove(H);
      } : C;
      return S.remove(C), p[K ? "unshift" : "push"](H), kr(), H;
    },
    remove: function(C, j) {
      ~(j = p.indexOf(C)) && p.splice(j, 1) && b >= j && b--;
    },
    _listeners: p
  }, S;
})(), kr = function() {
  return !Xu && $n.wake();
}, Ue = {}, Fb = /^[\d.\-M][\d.\-,\s]/, Wb = /["']/g, Ib = function(l) {
  for (var i = {}, r = l.substr(1, l.length - 3).split(":"), u = r[0], f = 1, h = r.length, p, d, g; f < h; f++)
    d = r[f], p = f !== h - 1 ? d.lastIndexOf(",") : d.length, g = d.substr(0, p), i[u] = isNaN(g) ? g.replace(Wb, "").trim() : +g, u = d.substr(p + 1).trim();
  return i;
}, Pb = function(l) {
  var i = l.indexOf("(") + 1, r = l.indexOf(")"), u = l.indexOf("(", i);
  return l.substring(i, ~u && u < r ? l.indexOf(")", r + 1) : r);
}, eS = function(l) {
  var i = (l + "").split("("), r = Ue[i[0]];
  return r && i.length > 1 && r.config ? r.config.apply(null, ~l.indexOf("{") ? [Ib(i[1])] : Pb(l).split(",").map(ly)) : Ue._CE && Fb.test(l) ? Ue._CE("", l) : r;
}, tS = function(l) {
  return function(i) {
    return 1 - l(1 - i);
  };
}, Ri = function(l, i) {
  return l && (_t(l) ? l : Ue[l] || eS(l)) || i;
}, Ni = function(l, i, r, u) {
  r === void 0 && (r = function(d) {
    return 1 - i(1 - d);
  }), u === void 0 && (u = function(d) {
    return d < 0.5 ? i(d * 2) / 2 : 1 - i((1 - d) * 2) / 2;
  });
  var f = {
    easeIn: i,
    easeOut: r,
    easeInOut: u
  }, h;
  return On(l, function(p) {
    Ue[p] = In[p] = f, Ue[h = p.toLowerCase()] = r;
    for (var d in f)
      Ue[h + (d === "easeIn" ? ".in" : d === "easeOut" ? ".out" : ".inOut")] = Ue[p + "." + d] = f[d];
  }), f;
}, Sy = function(l) {
  return function(i) {
    return i < 0.5 ? (1 - l(1 - i * 2)) / 2 : 0.5 + l((i - 0.5) * 2) / 2;
  };
}, $f = function o(l, i, r) {
  var u = i >= 1 ? i : 1, f = (r || (l ? 0.3 : 0.45)) / (i < 1 ? i : 1), h = f / fh * (Math.asin(1 / u) || 0), p = function(y) {
    return y === 1 ? 1 : u * Math.pow(2, -10 * y) * Eb((y - h) * f) + 1;
  }, d = l === "out" ? p : l === "in" ? function(g) {
    return 1 - p(1 - g);
  } : Sy(p);
  return f = fh / f, d.config = function(g, y) {
    return o(l, g, y);
  }, d;
}, Jf = function o(l, i) {
  i === void 0 && (i = 1.70158);
  var r = function(h) {
    return h ? --h * h * ((i + 1) * h + i) + 1 : 0;
  }, u = l === "out" ? r : l === "in" ? function(f) {
    return 1 - r(1 - f);
  } : Sy(r);
  return u.config = function(f) {
    return o(l, f);
  }, u;
};
On("Linear,Quad,Cubic,Quart,Quint,Strong", function(o, l) {
  var i = l < 5 ? l + 1 : l;
  Ni(o + ",Power" + (i - 1), l ? function(r) {
    return Math.pow(r, i);
  } : function(r) {
    return r;
  }, function(r) {
    return 1 - Math.pow(1 - r, i);
  }, function(r) {
    return r < 0.5 ? Math.pow(r * 2, i) / 2 : 1 - Math.pow((1 - r) * 2, i) / 2;
  });
});
Ue.Linear.easeNone = Ue.none = Ue.Linear.easeIn;
Ni("Elastic", $f("in"), $f("out"), $f());
(function(o, l) {
  var i = 1 / l, r = 2 * i, u = 2.5 * i, f = function(p) {
    return p < i ? o * p * p : p < r ? o * Math.pow(p - 1.5 / l, 2) + 0.75 : p < u ? o * (p -= 2.25 / l) * p + 0.9375 : o * Math.pow(p - 2.625 / l, 2) + 0.984375;
  };
  Ni("Bounce", function(h) {
    return 1 - f(1 - h);
  }, f);
})(7.5625, 2.75);
Ni("Expo", function(o) {
  return Math.pow(2, 10 * (o - 1)) * o + o * o * o * o * o * o * (1 - o);
});
Ni("Circ", function(o) {
  return -(K0(1 - o * o) - 1);
});
Ni("Sine", function(o) {
  return o === 1 ? 1 : -Ab(o * xb) + 1;
});
Ni("Back", Jf("in"), Jf("out"), Jf());
Ue.SteppedEase = Ue.steps = In.SteppedEase = {
  config: function(l, i) {
    l === void 0 && (l = 1);
    var r = 1 / l, u = l + (i ? 0 : 1), f = i ? 1 : 0, h = 1 - lt;
    return function(p) {
      return ((u * Fu(0, h, p) | 0) + f) * r;
    };
  }
};
Bu.ease = Ue["quad.out"];
On("onComplete,onUpdate,onStart,onRepeat,onReverseComplete,onInterrupt", function(o) {
  return Lh += o + "," + o + "Params,";
});
var xy = function(l, i) {
  this.id = Tb++, l._gsap = this, this.target = l, this.harness = i, this.get = i ? i.get : ty, this.set = i ? i.getSetter : Xh;
}, Qu = /* @__PURE__ */ (function() {
  function o(i) {
    this.vars = i, this._delay = +i.delay || 0, (this._repeat = i.repeat === 1 / 0 ? -2 : i.repeat || 0) && (this._rDelay = i.repeatDelay || 0, this._yoyo = !!i.yoyo || !!i.yoyoEase), this._ts = 1, zr(this, +i.duration, 1, 1), this.data = i.data, ct && (this._ctx = ct, ct.data.push(this)), Xu || $n.wake();
  }
  var l = o.prototype;
  return l.delay = function(r) {
    return r || r === 0 ? (this.parent && this.parent.smoothChildTiming && this.startTime(this._start + r - this._delay), this._delay = r, this) : this._delay;
  }, l.duration = function(r) {
    return arguments.length ? this.totalDuration(this._repeat > 0 ? r + (r + this._rDelay) * this._repeat : r) : this.totalDuration() && this._dur;
  }, l.totalDuration = function(r) {
    return arguments.length ? (this._dirty = 0, zr(this, this._repeat < 0 ? r : (r - this._repeat * this._rDelay) / (this._repeat + 1))) : this._tDur;
  }, l.totalTime = function(r, u) {
    if (kr(), !arguments.length)
      return this._tTime;
    var f = this._dp;
    if (f && f.smoothChildTiming && this._ts) {
      for (Dc(this, r), !f._dp || f.parent || ry(f, this); f && f.parent; )
        f.parent._time !== f._start + (f._ts >= 0 ? f._tTime / f._ts : (f.totalDuration() - f._tTime) / -f._ts) && f.totalTime(f._tTime, !0), f = f.parent;
      !this.parent && this._dp.autoRemoveChildren && (this._ts > 0 && r < this._tDur || this._ts < 0 && r > 0 || !this._tDur && !r) && jl(this._dp, this, this._start - this._delay);
    }
    return (this._tTime !== r || !this._dur && !u || this._initted && Math.abs(this._zTime) === lt || !this._initted && this._dur && r || !r && !this._initted && (this.add || this._ptLookup)) && (this._ts || (this._pTime = r), ny(this, r, u)), this;
  }, l.time = function(r, u) {
    return arguments.length ? this.totalTime(Math.min(this.totalDuration(), r + n0(this)) % (this._dur + this._rDelay) || (r ? this._dur : 0), u) : this._time;
  }, l.totalProgress = function(r, u) {
    return arguments.length ? this.totalTime(this.totalDuration() * r, u) : this.totalDuration() ? Math.min(1, this._tTime / this._tDur) : this.rawTime() >= 0 && this._initted ? 1 : 0;
  }, l.progress = function(r, u) {
    return arguments.length ? this.totalTime(this.duration() * (this._yoyo && !(this.iteration() & 1) ? 1 - r : r) + n0(this), u) : this.duration() ? Math.min(1, this._time / this._dur) : this.rawTime() > 0 ? 1 : 0;
  }, l.iteration = function(r, u) {
    var f = this.duration() + this._rDelay;
    return arguments.length ? this.totalTime(this._time + (r - 1) * f, u) : this._repeat ? wr(this._tTime, f) + 1 : 1;
  }, l.timeScale = function(r, u) {
    if (!arguments.length)
      return this._rts === -lt ? 0 : this._rts;
    if (this._rts === r)
      return this;
    var f = this.parent && this._ts ? Tc(this.parent._time, this) : this._tTime;
    return this._rts = +r || 0, this._ts = this._ps || r === -lt ? 0 : this._rts, this.totalTime(Fu(-Math.abs(this._delay), this.totalDuration(), f), u !== !1), Cc(this), jb(this);
  }, l.paused = function(r) {
    return arguments.length ? (this._ps !== r && (this._ps = r, r ? (this._pTime = this._tTime || Math.max(-this._delay, this.rawTime()), this._ts = this._act = 0) : (kr(), this._ts = this._rts, this.totalTime(this.parent && !this.parent.smoothChildTiming ? this.rawTime() : this._tTime || this._pTime, this.progress() === 1 && Math.abs(this._zTime) !== lt && (this._tTime -= lt)))), this) : this._ps;
  }, l.startTime = function(r) {
    if (arguments.length) {
      this._start = ot(r);
      var u = this.parent || this._dp;
      return u && (u._sort || !this.parent) && jl(u, this, this._start - this._delay), this;
    }
    return this._start;
  }, l.endTime = function(r) {
    return this._start + (kn(r) ? this.totalDuration() : this.duration()) / Math.abs(this._ts || 1);
  }, l.rawTime = function(r) {
    var u = this.parent || this._dp;
    return u ? r && (!this._ts || this._repeat && this._time && this.totalProgress() < 1) ? this._tTime % (this._dur + this._rDelay) : this._ts ? Tc(u.rawTime(r), this) : this._tTime : this._tTime;
  }, l.revert = function(r) {
    r === void 0 && (r = Rb);
    var u = en;
    return en = r, Bh(this) && (this.timeline && this.timeline.revert(r), this.totalTime(-0.01, r.suppressEvents)), this.data !== "nested" && r.kill !== !1 && this.kill(), en = u, this;
  }, l.globalTime = function(r) {
    for (var u = this, f = arguments.length ? r : u.rawTime(); u; )
      f = u._start + f / (Math.abs(u._ts) || 1), u = u._dp;
    return !this.parent && this._sat ? this._sat.globalTime(r) : f;
  }, l.repeat = function(r) {
    return arguments.length ? (this._repeat = r === 1 / 0 ? -2 : r, l0(this)) : this._repeat === -2 ? 1 / 0 : this._repeat;
  }, l.repeatDelay = function(r) {
    if (arguments.length) {
      var u = this._time;
      return this._rDelay = r, l0(this), u ? this.time(u) : this;
    }
    return this._rDelay;
  }, l.yoyo = function(r) {
    return arguments.length ? (this._yoyo = r, this) : this._yoyo;
  }, l.seek = function(r, u) {
    return this.totalTime(ol(this, r), kn(u));
  }, l.restart = function(r, u) {
    return this.play().totalTime(r ? -this._delay : 0, kn(u)), this._dur || (this._zTime = -lt), this;
  }, l.play = function(r, u) {
    return r != null && this.seek(r, u), this.reversed(!1).paused(!1);
  }, l.reverse = function(r, u) {
    return r != null && this.seek(r || this.totalDuration(), u), this.reversed(!0).paused(!1);
  }, l.pause = function(r, u) {
    return r != null && this.seek(r, u), this.paused(!0);
  }, l.resume = function() {
    return this.paused(!1);
  }, l.reversed = function(r) {
    return arguments.length ? (!!r !== this.reversed() && this.timeScale(-this._rts || (r ? -lt : 0)), this) : this._rts < 0;
  }, l.invalidate = function() {
    return this._initted = this._act = 0, this._zTime = -lt, this;
  }, l.isActive = function() {
    var r = this.parent || this._dp, u = this._start, f;
    return !!(!r || this._ts && this._initted && r.isActive() && (f = r.rawTime(!0)) >= u && f < this.endTime(!0) - lt);
  }, l.eventCallback = function(r, u, f) {
    var h = this.vars;
    return arguments.length > 1 ? (u ? (h[r] = u, f && (h[r + "Params"] = f), r === "onUpdate" && (this._onUpdate = u)) : delete h[r], this) : h[r];
  }, l.then = function(r) {
    var u = this, f = u._prom;
    return new Promise(function(h) {
      var p = _t(r) ? r : ay, d = function() {
        var y = u.then;
        u.then = null, f && f(), _t(p) && (p = p(u)) && (p.then || p === u) && (u.then = y), h(p), u.then = y;
      };
      u._initted && u.totalProgress() === 1 && u._ts >= 0 || !u._tTime && u._ts < 0 ? d() : u._prom = d;
    });
  }, l.kill = function() {
    Ru(this);
  }, o;
})();
Pn(Qu.prototype, {
  _time: 0,
  _start: 0,
  _end: 0,
  _tTime: 0,
  _tDur: 0,
  _dirty: 0,
  _repeat: 0,
  _yoyo: !1,
  parent: null,
  _initted: !1,
  _rDelay: 0,
  _ts: 1,
  _dp: 0,
  ratio: 0,
  _zTime: -lt,
  _prom: 0,
  _ps: !1,
  _rts: 1
});
var zn = /* @__PURE__ */ (function(o) {
  Z0(l, o);
  function l(r, u) {
    var f;
    return r === void 0 && (r = {}), f = o.call(this, r) || this, f.labels = {}, f.smoothChildTiming = !!r.smoothChildTiming, f.autoRemoveChildren = !!r.autoRemoveChildren, f._sort = kn(r.sortChildren), ft && jl(r.parent || ft, oa(f), u), r.reversed && f.reverse(), r.paused && f.paused(!0), r.scrollTrigger && uy(oa(f), r.scrollTrigger), f;
  }
  var i = l.prototype;
  return i.to = function(u, f, h) {
    return Uu(0, arguments, this), this;
  }, i.from = function(u, f, h) {
    return Uu(1, arguments, this), this;
  }, i.fromTo = function(u, f, h, p) {
    return Uu(2, arguments, this), this;
  }, i.set = function(u, f, h) {
    return f.duration = 0, f.parent = this, ju(f).repeatDelay || (f.repeat = 0), f.immediateRender = !!f.immediateRender, new Rt(u, f, ol(this, h), 1), this;
  }, i.call = function(u, f, h) {
    return jl(this, Rt.delayedCall(0, u, f), h);
  }, i.staggerTo = function(u, f, h, p, d, g, y) {
    return h.duration = f, h.stagger = h.stagger || p, h.onComplete = g, h.onCompleteParams = y, h.parent = this, new Rt(u, h, ol(this, d)), this;
  }, i.staggerFrom = function(u, f, h, p, d, g, y) {
    return h.runBackwards = 1, ju(h).immediateRender = kn(h.immediateRender), this.staggerTo(u, f, h, p, d, g, y);
  }, i.staggerFromTo = function(u, f, h, p, d, g, y, S) {
    return p.startAt = h, ju(p).immediateRender = kn(p.immediateRender), this.staggerTo(u, f, p, d, g, y, S);
  }, i.render = function(u, f, h) {
    var p = this._time, d = this._dirty ? this.totalDuration() : this._tDur, g = this._dur, y = u <= 0 ? 0 : ot(u), S = this._zTime < 0 != u < 0 && (this._initted || !g), E, b, R, A, C, j, K, H, F, q, le, X;
    if (this !== ft && y > d && u >= 0 && (y = d), y !== this._tTime || h || S) {
      if (p !== this._time && g && (y += this._time - p, u += this._time - p), E = y, F = this._start, H = this._ts, j = !H, S && (g || (p = this._zTime), (u || !f) && (this._zTime = u)), this._repeat) {
        if (le = this._yoyo, C = g + this._rDelay, this._repeat < -1 && u < 0)
          return this.totalTime(C * 100 + u, f, h);
        if (E = ot(y % C), y === d ? (A = this._repeat, E = g) : (q = ot(y / C), A = ~~q, A && A === q && (E = g, A--), E > g && (E = g)), q = wr(this._tTime, C), !p && this._tTime && q !== A && this._tTime - q * C - this._dur <= 0 && (q = A), le && A & 1 && (E = g - E, X = 1), A !== q && !this._lock) {
          var I = le && q & 1, G = I === (le && A & 1);
          if (A < q && (I = !I), p = I ? 0 : y % g ? g : y, this._lock = 1, this.render(p || (X ? 0 : ot(A * C)), f, !g)._lock = 0, this._tTime = y, !f && this.parent && Jn(this, "onRepeat"), this.vars.repeatRefresh && !X && (this.invalidate()._lock = 1, q = A), p && p !== this._time || j !== !this._ts || this.vars.onRepeat && !this.parent && !this._act)
            return this;
          if (g = this._dur, d = this._tDur, G && (this._lock = 2, p = I ? g : -1e-4, this.render(p, !0), this.vars.repeatRefresh && !X && this.invalidate()), this._lock = 0, !this._ts && !j)
            return this;
        }
      }
      if (this._hasPause && !this._forcing && this._lock < 2 && (K = Bb(this, ot(p), ot(E)), K && (y -= E - (E = K._start))), this._tTime = y, this._time = E, this._act = !!H, this._initted || (this._onUpdate = this.vars.onUpdate, this._initted = 1, this._zTime = u, p = 0), !p && y && g && !f && !q && (Jn(this, "onStart"), this._tTime !== y))
        return this;
      if (E >= p && u >= 0)
        for (b = this._first; b; ) {
          if (R = b._next, (b._act || E >= b._start) && b._ts && K !== b) {
            if (b.parent !== this)
              return this.render(u, f, h);
            if (b.render(b._ts > 0 ? (E - b._start) * b._ts : (b._dirty ? b.totalDuration() : b._tDur) + (E - b._start) * b._ts, f, h), E !== this._time || !this._ts && !j) {
              K = 0, R && (y += this._zTime = -lt);
              break;
            }
          }
          b = R;
        }
      else {
        b = this._last;
        for (var ce = u < 0 ? u : E; b; ) {
          if (R = b._prev, (b._act || ce <= b._end) && b._ts && K !== b) {
            if (b.parent !== this)
              return this.render(u, f, h);
            if (b.render(b._ts > 0 ? (ce - b._start) * b._ts : (b._dirty ? b.totalDuration() : b._tDur) + (ce - b._start) * b._ts, f, h || en && Bh(b)), E !== this._time || !this._ts && !j) {
              K = 0, R && (y += this._zTime = ce ? -lt : lt);
              break;
            }
          }
          b = R;
        }
      }
      if (K && !f && (this.pause(), K.render(E >= p ? 0 : -lt)._zTime = E >= p ? 1 : -1, this._ts))
        return this._start = F, Cc(this), this.render(u, f, h);
      this._onUpdate && !f && Jn(this, "onUpdate", !0), (y === d && this._tTime >= this.totalDuration() || !y && p) && (F === this._start || Math.abs(H) !== Math.abs(this._ts)) && (this._lock || ((u || !g) && (y === d && this._ts > 0 || !y && this._ts < 0) && Pa(this, 1), !f && !(u < 0 && !p) && (y || p || !d) && (Jn(this, y === d && u >= 0 ? "onComplete" : "onReverseComplete", !0), this._prom && !(y < d && this.timeScale() > 0) && this._prom())));
    }
    return this;
  }, i.add = function(u, f) {
    var h = this;
    if (ha(f) || (f = ol(this, f, u)), !(u instanceof Qu)) {
      if (rn(u))
        return u.forEach(function(p) {
          return h.add(p, f);
        }), this;
      if (Yt(u))
        return this.addLabel(u, f);
      if (_t(u))
        u = Rt.delayedCall(0, u);
      else
        return this;
    }
    return this !== u ? jl(this, u, f) : this;
  }, i.getChildren = function(u, f, h, p) {
    u === void 0 && (u = !0), f === void 0 && (f = !0), h === void 0 && (h = !0), p === void 0 && (p = -fl);
    for (var d = [], g = this._first; g; )
      g._start >= p && (g instanceof Rt ? f && d.push(g) : (h && d.push(g), u && d.push.apply(d, g.getChildren(!0, f, h)))), g = g._next;
    return d;
  }, i.getById = function(u) {
    for (var f = this.getChildren(1, 1, 1), h = f.length; h--; )
      if (f[h].vars.id === u)
        return f[h];
  }, i.remove = function(u) {
    return Yt(u) ? this.removeLabel(u) : _t(u) ? this.killTweensOf(u) : (u.parent === this && Rc(this, u), u === this._recent && (this._recent = this._last), Mi(this));
  }, i.totalTime = function(u, f) {
    return arguments.length ? (this._forcing = 1, !this._dp && this._ts && (this._start = ot($n.time - (this._ts > 0 ? u / this._ts : (this.totalDuration() - u) / -this._ts))), o.prototype.totalTime.call(this, u, f), this._forcing = 0, this) : this._tTime;
  }, i.addLabel = function(u, f) {
    return this.labels[u] = ol(this, f), this;
  }, i.removeLabel = function(u) {
    return delete this.labels[u], this;
  }, i.addPause = function(u, f, h) {
    var p = Rt.delayedCall(0, f || Yu, h);
    return p.data = "isPause", this._hasPause = 1, jl(this, p, ol(this, u));
  }, i.removePause = function(u) {
    var f = this._first;
    for (u = ol(this, u); f; )
      f._start === u && f.data === "isPause" && Pa(f), f = f._next;
  }, i.killTweensOf = function(u, f, h) {
    for (var p = this.getTweensOf(u, h), d = p.length; d--; )
      $a !== p[d] && p[d].kill(u, f);
    return this;
  }, i.getTweensOf = function(u, f) {
    for (var h = [], p = hl(u), d = this._first, g = ha(f), y; d; )
      d instanceof Rt ? Cb(d._targets, p) && (g ? (!$a || d._initted && d._ts) && d.globalTime(0) <= f && d.globalTime(d.totalDuration()) > f : !f || d.isActive()) && h.push(d) : (y = d.getTweensOf(p, f)).length && h.push.apply(h, y), d = d._next;
    return h;
  }, i.tweenTo = function(u, f) {
    f = f || {};
    var h = this, p = ol(h, u), d = f, g = d.startAt, y = d.onStart, S = d.onStartParams, E = d.immediateRender, b, R = Rt.to(h, Pn({
      ease: f.ease || "none",
      lazy: !1,
      immediateRender: !1,
      time: p,
      overwrite: "auto",
      duration: f.duration || Math.abs((p - (g && "time" in g ? g.time : h._time)) / h.timeScale()) || lt,
      onStart: function() {
        if (h.pause(), !b) {
          var C = f.duration || Math.abs((p - (g && "time" in g ? g.time : h._time)) / h.timeScale());
          R._dur !== C && zr(R, C, 0, 1).render(R._time, !0, !0), b = 1;
        }
        y && y.apply(R, S || []);
      }
    }, f));
    return E ? R.render(0) : R;
  }, i.tweenFromTo = function(u, f, h) {
    return this.tweenTo(f, Pn({
      startAt: {
        time: ol(this, u)
      }
    }, h));
  }, i.recent = function() {
    return this._recent;
  }, i.nextLabel = function(u) {
    return u === void 0 && (u = this._time), a0(this, ol(this, u));
  }, i.previousLabel = function(u) {
    return u === void 0 && (u = this._time), a0(this, ol(this, u), 1);
  }, i.currentLabel = function(u) {
    return arguments.length ? this.seek(u, !0) : this.previousLabel(this._time + lt);
  }, i.shiftChildren = function(u, f, h) {
    h === void 0 && (h = 0);
    var p = this._first, d = this.labels, g;
    for (u = ot(u); p; )
      p._start >= h && (p._start += u, p._end += u), p = p._next;
    if (f)
      for (g in d)
        d[g] >= h && (d[g] += u);
    return Mi(this);
  }, i.invalidate = function(u) {
    var f = this._first;
    for (this._lock = 0; f; )
      f.invalidate(u), f = f._next;
    return o.prototype.invalidate.call(this, u);
  }, i.clear = function(u) {
    u === void 0 && (u = !0);
    for (var f = this._first, h; f; )
      h = f._next, this.remove(f), f = h;
    return this._dp && (this._time = this._tTime = this._pTime = 0), u && (this.labels = {}), Mi(this);
  }, i.totalDuration = function(u) {
    var f = 0, h = this, p = h._last, d = fl, g, y, S;
    if (arguments.length)
      return h.timeScale((h._repeat < 0 ? h.duration() : h.totalDuration()) / (h.reversed() ? -u : u));
    if (h._dirty) {
      for (S = h.parent; p; )
        g = p._prev, p._dirty && p.totalDuration(), y = p._start, y > d && h._sort && p._ts && !h._lock ? (h._lock = 1, jl(h, p, y - p._delay, 1)._lock = 0) : d = y, y < 0 && p._ts && (f -= y, (!S && !h._dp || S && S.smoothChildTiming) && (h._start += ot(y / h._ts), h._time -= y, h._tTime -= y), h.shiftChildren(-y, !1, -1 / 0), d = 0), p._end > f && p._ts && (f = p._end), p = g;
      zr(h, h === ft && h._time > f ? h._time : f, 1, 1), h._dirty = 0;
    }
    return h._tDur;
  }, l.updateRoot = function(u) {
    if (ft._ts && (ny(ft, Tc(u, ft)), ey = $n.frame), $n.frame >= e0) {
      e0 += Wn.autoSleep || 120;
      var f = ft._first;
      if ((!f || !f._ts) && Wn.autoSleep && $n._listeners.length < 2) {
        for (; f && !f._ts; )
          f = f._next;
        f || $n.sleep();
      }
    }
  }, l;
})(Qu);
Pn(zn.prototype, {
  _lock: 0,
  _hasPause: 0,
  _forcing: 0
});
var nS = function(l, i, r, u, f, h, p) {
  var d = new Mn(this._pt, l, i, 0, 1, ky, null, f), g = 0, y = 0, S, E, b, R, A, C, j, K;
  for (d.b = r, d.e = u, r += "", u += "", (j = ~u.indexOf("random(")) && (u = Gu(u)), h && (K = [r, u], h(K, l, i), r = K[0], u = K[1]), E = r.match(Vf) || []; S = Vf.exec(u); )
    R = S[0], A = u.substring(g, S.index), b ? b = (b + 1) % 5 : A.substr(-5) === "rgba(" && (b = 1), R !== E[y++] && (C = parseFloat(E[y - 1]) || 0, d._pt = {
      _next: d._pt,
      p: A || y === 1 ? A : ",",
      //note: SVG spec allows omission of comma/space when a negative sign is wedged between two numbers, like 2.5-5.3 instead of 2.5,-5.3 but when tweening, the negative value may switch to positive, so we insert the comma just in case.
      s: C,
      c: R.charAt(1) === "=" ? Sr(C, R) - C : parseFloat(R) - C,
      m: b && b < 4 ? Math.round : 0
    }, g = Vf.lastIndex);
  return d.c = g < u.length ? u.substring(g, u.length) : "", d.fp = p, (F0.test(u) || j) && (d.e = 0), this._pt = d, d;
}, qh = function(l, i, r, u, f, h, p, d, g, y) {
  _t(u) && (u = u(f || 0, l, h));
  var S = l[i], E = r !== "get" ? r : _t(S) ? g ? l[i.indexOf("set") || !_t(l["get" + i.substr(3)]) ? i : "get" + i.substr(3)](g) : l[i]() : S, b = _t(S) ? g ? uS : wy : Gh, R;
  if (Yt(u) && (~u.indexOf("random(") && (u = Gu(u)), u.charAt(1) === "=" && (R = Sr(E, u) + (an(E) || 0), (R || R === 0) && (u = R))), !y || E !== u || vh)
    return !isNaN(E * u) && u !== "" ? (R = new Mn(this._pt, l, i, +E || 0, u - (E || 0), typeof S == "boolean" ? cS : zy, 0, b), g && (R.fp = g), p && R.modifier(p, this, l), this._pt = R) : (!S && !(i in l) && jh(i, u), nS.call(this, l, i, E, u, b, d || Wn.stringFilter, g));
}, lS = function(l, i, r, u, f) {
  if (_t(l) && (l = Lu(l, f, i, r, u)), !Ll(l) || l.style && l.nodeType || rn(l) || $0(l))
    return Yt(l) ? Lu(l, f, i, r, u) : l;
  var h = {}, p;
  for (p in l)
    h[p] = Lu(l[p], f, i, r, u);
  return h;
}, Ty = function(l, i, r, u, f, h) {
  var p, d, g, y;
  if (Kn[l] && (p = new Kn[l]()).init(f, p.rawVars ? i[l] : lS(i[l], u, f, h, r), r, u, h) !== !1 && (r._pt = d = new Mn(r._pt, f, l, 0, 1, p.render, p, 0, p.priority), r !== br))
    for (g = r._ptLookup[r._targets.indexOf(f)], y = p._props.length; y--; )
      g[p._props[y]] = d;
  return p;
}, $a, vh, Yh = function o(l, i, r) {
  var u = l.vars, f = u.ease, h = u.startAt, p = u.immediateRender, d = u.lazy, g = u.onUpdate, y = u.runBackwards, S = u.yoyoEase, E = u.keyframes, b = u.autoRevert, R = l._dur, A = l._startAt, C = l._targets, j = l.parent, K = j && j.data === "nested" ? j.vars.targets : C, H = l._overwrite === "auto" && !Rh, F = l.timeline, q = u.easeReverse || S, le, X, I, G, ce, be, ve, _e, ue, Se, L, Y, ie;
  if (F && (!E || !f) && (f = "none"), l._ease = Ri(f, Bu.ease), l._rEase = q && (Ri(q) || l._ease), l._from = !F && !!u.runBackwards, l._from && (l.ratio = 1), !F || E && !u.stagger) {
    if (_e = C[0] ? Oi(C[0]).harness : 0, Y = _e && u[_e.prop], le = xc(u, Uh), A && (A._zTime < 0 && A.progress(1), i < 0 && y && p && !b ? A.render(-1, !0) : A.revert(y && R ? yc : Mb), A._lazy = 0), h) {
      if (Pa(l._startAt = Rt.set(C, Pn({
        data: "isStart",
        overwrite: !1,
        parent: j,
        immediateRender: !0,
        lazy: !A && kn(d),
        startAt: null,
        delay: 0,
        onUpdate: g && function() {
          return Jn(l, "onUpdate");
        },
        stagger: 0
      }, h))), l._startAt._dp = 0, l._startAt._sat = l, i < 0 && (en || !p && !b) && l._startAt.revert(yc), p && R && i <= 0 && r <= 0) {
        i && (l._zTime = i);
        return;
      }
    } else if (y && R && !A) {
      if (i && (p = !1), I = Pn({
        overwrite: !1,
        data: "isFromStart",
        //we tag the tween with as "isFromStart" so that if [inside a plugin] we need to only do something at the very END of a tween, we have a way of identifying this tween as merely the one that's setting the beginning values for a "from()" tween. For example, clearProps in CSSPlugin should only get applied at the very END of a tween and without this tag, from(...{height:100, clearProps:"height", delay:1}) would wipe the height at the beginning of the tween and after 1 second, it'd kick back in.
        lazy: p && !A && kn(d),
        immediateRender: p,
        //zero-duration tweens render immediately by default, but if we're not specifically instructed to render this tween immediately, we should skip this and merely _init() to record the starting values (rendering them immediately would push them to completion which is wasteful in that case - we'd have to render(-1) immediately after)
        stagger: 0,
        parent: j
        //ensures that nested tweens that had a stagger are handled properly, like gsap.from(".class", {y: gsap.utils.wrap([-100,100]), stagger: 0.5})
      }, le), Y && (I[_e.prop] = Y), Pa(l._startAt = Rt.set(C, I)), l._startAt._dp = 0, l._startAt._sat = l, i < 0 && (en ? l._startAt.revert(yc) : l._startAt.render(-1, !0)), l._zTime = i, !p)
        o(l._startAt, lt, lt);
      else if (!i)
        return;
    }
    for (l._pt = l._ptCache = 0, d = R && kn(d) || d && !R, X = 0; X < C.length; X++) {
      if (ce = C[X], ve = ce._gsap || Hh(C)[X]._gsap, l._ptLookup[X] = Se = {}, dh[ve.id] && Wa.length && Sc(), L = K === C ? X : K.indexOf(ce), _e && (ue = new _e()).init(ce, Y || le, l, L, K) !== !1 && (l._pt = G = new Mn(l._pt, ce, ue.name, 0, 1, ue.render, ue, 0, ue.priority), ue._props.forEach(function(se) {
        Se[se] = G;
      }), ue.priority && (be = 1)), !_e || Y)
        for (I in le)
          Kn[I] && (ue = Ty(I, le, l, L, ce, K)) ? ue.priority && (be = 1) : Se[I] = G = qh.call(l, ce, I, "get", le[I], L, K, 0, u.stringFilter);
      l._op && l._op[X] && l.kill(ce, l._op[X]), H && l._pt && ($a = l, ft.killTweensOf(ce, Se, l.globalTime(i)), ie = !l.parent, $a = 0), l._pt && d && (dh[ve.id] = 1);
    }
    be && Oy(l), l._onInit && l._onInit(l);
  }
  l._onUpdate = g, l._initted = (!l._op || l._pt) && !ie, E && i <= 0 && F.render(fl, !0, !0);
}, aS = function(l, i, r, u, f, h, p, d) {
  var g = (l._pt && l._ptCache || (l._ptCache = {}))[i], y, S, E, b;
  if (!g)
    for (g = l._ptCache[i] = [], E = l._ptLookup, b = l._targets.length; b--; ) {
      if (y = E[b][i], y && y.d && y.d._pt)
        for (y = y.d._pt; y && y.p !== i && y.fp !== i; )
          y = y._next;
      if (!y)
        return vh = 1, l.vars[i] = "+=0", Yh(l, p), vh = 0, d ? qu(i + " not eligible for reset. Try splitting into individual properties") : 1;
      g.push(y);
    }
  for (b = g.length; b--; )
    S = g[b], y = S._pt || S, y.s = (u || u === 0) && !f ? u : y.s + (u || 0) + h * y.c, y.c = r - y.s, S.e && (S.e = At(r) + an(S.e)), S.b && (S.b = y.s + an(S.b));
}, iS = function(l, i) {
  var r = l[0] ? Oi(l[0]).harness : 0, u = r && r.aliases, f, h, p, d;
  if (!u)
    return i;
  f = Er({}, i);
  for (h in u)
    if (h in f)
      for (d = u[h].split(","), p = d.length; p--; )
        f[d[p]] = f[h];
  return f;
}, rS = function(l, i, r, u) {
  var f = i.ease || u || "power1.inOut", h, p;
  if (rn(i))
    p = r[l] || (r[l] = []), i.forEach(function(d, g) {
      return p.push({
        t: g / (i.length - 1) * 100,
        v: d,
        e: f
      });
    });
  else
    for (h in i)
      p = r[h] || (r[h] = []), h === "ease" || p.push({
        t: parseFloat(l),
        v: i[h],
        e: f
      });
}, Lu = function(l, i, r, u, f) {
  return _t(l) ? l.call(i, r, u, f) : Yt(l) && ~l.indexOf("random(") ? Gu(l) : l;
}, Ay = Lh + "repeat,repeatDelay,yoyo,repeatRefresh,yoyoEase,easeReverse,autoRevert", Ey = {};
On(Ay + ",id,stagger,delay,duration,paused,scrollTrigger", function(o) {
  return Ey[o] = 1;
});
var Rt = /* @__PURE__ */ (function(o) {
  Z0(l, o);
  function l(r, u, f, h) {
    var p;
    typeof u == "number" && (f.duration = u, u = f, f = null), p = o.call(this, h ? u : ju(u)) || this;
    var d = p.vars, g = d.duration, y = d.delay, S = d.immediateRender, E = d.stagger, b = d.overwrite, R = d.keyframes, A = d.defaults, C = d.scrollTrigger, j = u.parent || ft, K = (rn(r) || $0(r) ? ha(r[0]) : "length" in u) ? [r] : hl(r), H, F, q, le, X, I, G, ce;
    if (p._targets = K.length ? Hh(K) : qu("GSAP target " + r + " not found. https://gsap.com", !Wn.nullTargetWarn) || [], p._ptLookup = [], p._overwrite = b, R || E || hc(g) || hc(y)) {
      u = p.vars;
      var be = u.easeReverse || u.yoyoEase;
      if (H = p.timeline = new zn({
        data: "nested",
        defaults: A || {},
        targets: j && j.data === "nested" ? j.vars.targets : K
      }), H.kill(), H.parent = H._dp = oa(p), H._start = 0, E || hc(g) || hc(y)) {
        if (le = K.length, G = E && fy(E), Ll(E))
          for (X in E)
            ~Ay.indexOf(X) && (ce || (ce = {}), ce[X] = E[X]);
        for (F = 0; F < le; F++)
          q = xc(u, Ey), q.stagger = 0, be && (q.easeReverse = be), ce && Er(q, ce), I = K[F], q.duration = +Lu(g, oa(p), F, I, K), q.delay = (+Lu(y, oa(p), F, I, K) || 0) - p._delay, !E && le === 1 && q.delay && (p._delay = y = q.delay, p._start += y, q.delay = 0), H.to(I, q, G ? G(F, I, K) : 0), H._ease = Ue.none;
        H.duration() ? g = y = 0 : p.timeline = 0;
      } else if (R) {
        ju(Pn(H.vars.defaults, {
          ease: "none"
        })), H._ease = Ri(R.ease || u.ease || "none");
        var ve = 0, _e, ue, Se;
        if (rn(R))
          R.forEach(function(L) {
            return H.to(K, L, ">");
          }), H.duration();
        else {
          q = {};
          for (X in R)
            X === "ease" || X === "easeEach" || rS(X, R[X], q, R.easeEach);
          for (X in q)
            for (_e = q[X].sort(function(L, Y) {
              return L.t - Y.t;
            }), ve = 0, F = 0; F < _e.length; F++)
              ue = _e[F], Se = {
                ease: ue.e,
                duration: (ue.t - (F ? _e[F - 1].t : 0)) / 100 * g
              }, Se[X] = ue.v, H.to(K, Se, ve), ve += Se.duration;
          H.duration() < g && H.to({}, {
            duration: g - H.duration()
          });
        }
      }
      g || p.duration(g = H.duration());
    } else
      p.timeline = 0;
    return b === !0 && !Rh && ($a = oa(p), ft.killTweensOf(K), $a = 0), jl(j, oa(p), f), u.reversed && p.reverse(), u.paused && p.paused(!0), (S || !g && !R && p._start === ot(j._time) && kn(S) && Ub(oa(p)) && j.data !== "nested") && (p._tTime = -lt, p.render(Math.max(0, -y) || 0)), C && uy(oa(p), C), p;
  }
  var i = l.prototype;
  return i.render = function(u, f, h) {
    var p = this._time, d = this._tDur, g = this._dur, y = u < 0, S = u > d - lt && !y ? d : u < lt ? 0 : u, E, b, R, A, C, j, K, H;
    if (!g)
      Hb(this, u, f, h);
    else if (S !== this._tTime || !u || h || !this._initted && this._tTime || this._startAt && this._zTime < 0 !== y || this._lazy) {
      if (E = S, H = this.timeline, this._repeat) {
        if (A = g + this._rDelay, this._repeat < -1 && y)
          return this.totalTime(A * 100 + u, f, h);
        if (E = ot(S % A), S === d ? (R = this._repeat, E = g) : (C = ot(S / A), R = ~~C, R && R === C ? (E = g, R--) : E > g && (E = g)), j = this._yoyo && R & 1, j && (E = g - E), C = wr(this._tTime, A), E === p && !h && this._initted && R === C)
          return this._tTime = S, this;
        R !== C && this.vars.repeatRefresh && !j && !this._lock && E !== A && this._initted && (this._lock = h = 1, this.render(ot(A * R), !0).invalidate()._lock = 0);
      }
      if (!this._initted) {
        if (sy(this, y ? u : E, h, f, S))
          return this._tTime = 0, this;
        if (p !== this._time && !(h && this.vars.repeatRefresh && R !== C))
          return this;
        if (g !== this._dur)
          return this.render(u, f, h);
      }
      if (this._rEase) {
        var F = E < p;
        if (F !== this._inv) {
          var q = F ? p : g - p;
          this._inv = F, this._from && (this.ratio = 1 - this.ratio), this._invRatio = this.ratio, this._invTime = p, this._invRecip = q ? (F ? -1 : 1) / q : 0, this._invScale = F ? -this.ratio : 1 - this.ratio, this._invEase = F ? this._rEase : this._ease;
        }
        this.ratio = K = this._invRatio + this._invScale * this._invEase((E - this._invTime) * this._invRecip);
      } else
        this.ratio = K = this._ease(E / g);
      if (this._from && (this.ratio = K = 1 - K), this._tTime = S, this._time = E, !this._act && this._ts && (this._act = 1, this._lazy = 0), !p && S && !f && !C && (Jn(this, "onStart"), this._tTime !== S))
        return this;
      for (b = this._pt; b; )
        b.r(K, b.d), b = b._next;
      H && H.render(u < 0 ? u : H._dur * H._ease(E / this._dur), f, h) || this._startAt && (this._zTime = u), this._onUpdate && !f && (y && ph(this, u, f, h), Jn(this, "onUpdate")), this._repeat && R !== C && this.vars.onRepeat && !f && this.parent && Jn(this, "onRepeat"), (S === this._tDur || !S) && this._tTime === S && (y && !this._onUpdate && ph(this, u, !0, !0), (u || !g) && (S === this._tDur && this._ts > 0 || !S && this._ts < 0) && Pa(this, 1), !f && !(y && !p) && (S || p || j) && (Jn(this, S === d ? "onComplete" : "onReverseComplete", !0), this._prom && !(S < d && this.timeScale() > 0) && this._prom()));
    }
    return this;
  }, i.targets = function() {
    return this._targets;
  }, i.invalidate = function(u) {
    return (!u || !this.vars.runBackwards) && (this._startAt = 0), this._pt = this._op = this._onUpdate = this._lazy = this.ratio = 0, this._ptLookup = [], this.timeline && this.timeline.invalidate(u), o.prototype.invalidate.call(this, u);
  }, i.resetTo = function(u, f, h, p, d) {
    Xu || $n.wake(), this._ts || this.play();
    var g = Math.min(this._dur, (this._dp._time - this._start) * this._ts), y;
    return this._initted || Yh(this, g), y = this._ease(g / this._dur), aS(this, u, f, h, p, y, g, d) ? this.resetTo(u, f, h, p, 1) : (Dc(this, 0), this.parent || iy(this._dp, this, "_first", "_last", this._dp._sort ? "_start" : 0), this.render(0));
  }, i.kill = function(u, f) {
    if (f === void 0 && (f = "all"), !u && (!f || f === "all"))
      return this._lazy = this._pt = 0, this.parent ? Ru(this) : this.scrollTrigger && this.scrollTrigger.kill(!!en), this;
    if (this.timeline) {
      var h = this.timeline.totalDuration();
      return this.timeline.killTweensOf(u, f, $a && $a.vars.overwrite !== !0)._first || Ru(this), this.parent && h !== this.timeline.totalDuration() && zr(this, this._dur * this.timeline._tDur / h, 0, 1), this;
    }
    var p = this._targets, d = u ? hl(u) : p, g = this._ptLookup, y = this._pt, S, E, b, R, A, C, j;
    if ((!f || f === "all") && Nb(p, d))
      return f === "all" && (this._pt = 0), Ru(this);
    for (S = this._op = this._op || [], f !== "all" && (Yt(f) && (A = {}, On(f, function(K) {
      return A[K] = 1;
    }), f = A), f = iS(p, f)), j = p.length; j--; )
      if (~d.indexOf(p[j])) {
        E = g[j], f === "all" ? (S[j] = f, R = E, b = {}) : (b = S[j] = S[j] || {}, R = f);
        for (A in R)
          C = E && E[A], C && ((!("kill" in C.d) || C.d.kill(A) === !0) && Rc(this, C, "_pt"), delete E[A]), b !== "all" && (b[A] = 1);
      }
    return this._initted && !this._pt && y && Ru(this), this;
  }, l.to = function(u, f) {
    return new l(u, f, arguments[2]);
  }, l.from = function(u, f) {
    return Uu(1, arguments);
  }, l.delayedCall = function(u, f, h, p) {
    return new l(f, 0, {
      immediateRender: !1,
      lazy: !1,
      overwrite: !1,
      delay: u,
      onComplete: f,
      onReverseComplete: f,
      onCompleteParams: h,
      onReverseCompleteParams: h,
      callbackScope: p
    });
  }, l.fromTo = function(u, f, h) {
    return Uu(2, arguments);
  }, l.set = function(u, f) {
    return f.duration = 0, f.repeatDelay || (f.repeat = 0), new l(u, f);
  }, l.killTweensOf = function(u, f, h) {
    return ft.killTweensOf(u, f, h);
  }, l;
})(Qu);
Pn(Rt.prototype, {
  _targets: [],
  _lazy: 0,
  _startAt: 0,
  _op: 0,
  _onInit: 0
});
On("staggerTo,staggerFrom,staggerFromTo", function(o) {
  Rt[o] = function() {
    var l = new zn(), i = gh.call(arguments, 0);
    return i.splice(o === "staggerFromTo" ? 5 : 4, 0, 0), l[o].apply(l, i);
  };
});
var Gh = function(l, i, r) {
  return l[i] = r;
}, wy = function(l, i, r) {
  return l[i](r);
}, uS = function(l, i, r, u) {
  return l[i](u.fp, r);
}, sS = function(l, i, r) {
  return l.setAttribute(i, r);
}, Xh = function(l, i) {
  return _t(l[i]) ? wy : Ch(l[i]) && l.setAttribute ? sS : Gh;
}, zy = function(l, i) {
  return i.set(i.t, i.p, Math.round((i.s + i.c * l) * 1e6) / 1e6, i);
}, cS = function(l, i) {
  return i.set(i.t, i.p, !!(i.s + i.c * l), i);
}, ky = function(l, i) {
  var r = i._pt, u = "";
  if (!l && i.b)
    u = i.b;
  else if (l === 1 && i.e)
    u = i.e;
  else {
    for (; r; )
      u = r.p + (r.m ? r.m(r.s + r.c * l) : Math.round((r.s + r.c * l) * 1e4) / 1e4) + u, r = r._next;
    u += i.c;
  }
  i.set(i.t, i.p, u, i);
}, Qh = function(l, i) {
  for (var r = i._pt; r; )
    r.r(l, r.d), r = r._next;
}, oS = function(l, i, r, u) {
  for (var f = this._pt, h; f; )
    h = f._next, f.p === u && f.modifier(l, i, r), f = h;
}, fS = function(l) {
  for (var i = this._pt, r, u; i; )
    u = i._next, i.p === l && !i.op || i.op === l ? Rc(this, i, "_pt") : i.dep || (r = 1), i = u;
  return !r;
}, hS = function(l, i, r, u) {
  u.mSet(l, i, u.m.call(u.tween, r, u.mt), u);
}, Oy = function(l) {
  for (var i = l._pt, r, u, f, h; i; ) {
    for (r = i._next, u = f; u && u.pr > i.pr; )
      u = u._next;
    (i._prev = u ? u._prev : h) ? i._prev._next = i : f = i, (i._next = u) ? u._prev = i : h = i, i = r;
  }
  l._pt = f;
}, Mn = /* @__PURE__ */ (function() {
  function o(i, r, u, f, h, p, d, g, y) {
    this.t = r, this.s = f, this.c = h, this.p = u, this.r = p || zy, this.d = d || this, this.set = g || Gh, this.pr = y || 0, this._next = i, i && (i._prev = this);
  }
  var l = o.prototype;
  return l.modifier = function(r, u, f) {
    this.mSet = this.mSet || this.set, this.set = hS, this.m = r, this.mt = f, this.tween = u;
  }, o;
})();
On(Lh + "parent,duration,ease,delay,overwrite,runBackwards,startAt,yoyo,immediateRender,repeat,repeatDelay,data,paused,reversed,lazy,callbackScope,stringFilter,id,yoyoEase,stagger,inherit,repeatRefresh,keyframes,autoRevert,scrollTrigger,easeReverse", function(o) {
  return Uh[o] = 1;
});
In.TweenMax = In.TweenLite = Rt;
In.TimelineLite = In.TimelineMax = zn;
ft = new zn({
  sortChildren: !1,
  defaults: Bu,
  autoRemoveChildren: !0,
  id: "root",
  smoothChildTiming: !0
});
Wn.stringFilter = by;
var Ci = [], vc = {}, dS = [], r0 = 0, pS = 0, Ff = function(l) {
  return (vc[l] || dS).map(function(i) {
    return i();
  });
}, bh = function() {
  var l = Date.now(), i = [];
  l - r0 > 2 && (Ff("matchMediaInit"), Ci.forEach(function(r) {
    var u = r.queries, f = r.conditions, h, p, d, g;
    for (p in u)
      h = Nl.matchMedia(u[p]).matches, h && (d = 1), h !== f[p] && (f[p] = h, g = 1);
    g && (r.revert(), d && i.push(r));
  }), Ff("matchMediaRevert"), i.forEach(function(r) {
    return r.onMatch(r, function(u) {
      return r.add(null, u);
    });
  }), r0 = l, Ff("matchMedia"));
}, My = /* @__PURE__ */ (function() {
  function o(i, r) {
    this.selector = r && yh(r), this.data = [], this._r = [], this.isReverted = !1, this.id = pS++, i && this.add(i);
  }
  var l = o.prototype;
  return l.add = function(r, u, f) {
    _t(r) && (f = u, u = r, r = _t);
    var h = this, p = function() {
      var g = ct, y = h.selector, S;
      return g && g !== h && g.data.push(h), f && (h.selector = yh(f)), ct = h, S = u.apply(h, arguments), _t(S) && h._r.push(S), ct = g, h.selector = y, h.isReverted = !1, S;
    };
    return h.last = p, r === _t ? p(h, function(d) {
      return h.add(null, d);
    }) : r ? h[r] = p : p;
  }, l.ignore = function(r) {
    var u = ct;
    ct = null, r(this), ct = u;
  }, l.getTweens = function() {
    var r = [];
    return this.data.forEach(function(u) {
      return u instanceof o ? r.push.apply(r, u.getTweens()) : u instanceof Rt && !(u.parent && u.parent.data === "nested") && r.push(u);
    }), r;
  }, l.clear = function() {
    this._r.length = this.data.length = 0;
  }, l.kill = function(r, u) {
    var f = this;
    if (r ? (function() {
      for (var p = f.getTweens(), d = f.data.length, g; d--; )
        g = f.data[d], g.data === "isFlip" && (g.revert(), g.getChildren(!0, !0, !1).forEach(function(y) {
          return p.splice(p.indexOf(y), 1);
        }));
      for (p.map(function(y) {
        return {
          g: y._dur || y._delay || y._sat && !y._sat.vars.immediateRender ? y.globalTime(0) : -1 / 0,
          t: y
        };
      }).sort(function(y, S) {
        return S.g - y.g || -1 / 0;
      }).forEach(function(y) {
        return y.t.revert(r);
      }), d = f.data.length; d--; )
        g = f.data[d], g instanceof zn ? g.data !== "nested" && (g.scrollTrigger && g.scrollTrigger.revert(), g.kill()) : !(g instanceof Rt) && g.revert && g.revert(r);
      f._r.forEach(function(y) {
        return y(r, f);
      }), f.isReverted = !0;
    })() : this.data.forEach(function(p) {
      return p.kill && p.kill();
    }), this.clear(), u)
      for (var h = Ci.length; h--; )
        Ci[h].id === this.id && Ci.splice(h, 1);
  }, l.revert = function(r) {
    this.kill(r || {});
  }, o;
})(), mS = /* @__PURE__ */ (function() {
  function o(i) {
    this.contexts = [], this.scope = i, ct && ct.data.push(this);
  }
  var l = o.prototype;
  return l.add = function(r, u, f) {
    Ll(r) || (r = {
      matches: r
    });
    var h = new My(0, f || this.scope), p = h.conditions = {}, d, g, y;
    ct && !h.selector && (h.selector = ct.selector), this.contexts.push(h), u = h.add("onMatch", u), h.queries = r;
    for (g in r)
      g === "all" ? y = 1 : (d = Nl.matchMedia(r[g]), d && (Ci.indexOf(h) < 0 && Ci.push(h), (p[g] = d.matches) && (y = 1), d.addListener ? d.addListener(bh) : d.addEventListener("change", bh)));
    return y && u(h, function(S) {
      return h.add(null, S);
    }), this;
  }, l.revert = function(r) {
    this.kill(r || {});
  }, l.kill = function(r) {
    this.contexts.forEach(function(u) {
      return u.kill(r, !0);
    });
  }, o;
})(), Ac = {
  registerPlugin: function() {
    for (var l = arguments.length, i = new Array(l), r = 0; r < l; r++)
      i[r] = arguments[r];
    i.forEach(function(u) {
      return yy(u);
    });
  },
  timeline: function(l) {
    return new zn(l);
  },
  getTweensOf: function(l, i) {
    return ft.getTweensOf(l, i);
  },
  getProperty: function(l, i, r, u) {
    Yt(l) && (l = hl(l)[0]);
    var f = Oi(l || {}).get, h = r ? ay : ly;
    return r === "native" && (r = ""), l && (i ? h((Kn[i] && Kn[i].get || f)(l, i, r, u)) : function(p, d, g) {
      return h((Kn[p] && Kn[p].get || f)(l, p, d, g));
    });
  },
  quickSetter: function(l, i, r) {
    if (l = hl(l), l.length > 1) {
      var u = l.map(function(y) {
        return Cn.quickSetter(y, i, r);
      }), f = u.length;
      return function(y) {
        for (var S = f; S--; )
          u[S](y);
      };
    }
    l = l[0] || {};
    var h = Kn[i], p = Oi(l), d = p.harness && (p.harness.aliases || {})[i] || i, g = h ? function(y) {
      var S = new h();
      br._pt = 0, S.init(l, r ? y + r : y, br, 0, [l]), S.render(1, S), br._pt && Qh(1, br);
    } : p.set(l, d);
    return h ? g : function(y) {
      return g(l, d, r ? y + r : y, p, 1);
    };
  },
  quickTo: function(l, i, r) {
    var u, f = Cn.to(l, Pn((u = {}, u[i] = "+=0.1", u.paused = !0, u.stagger = 0, u), r || {})), h = function(d, g, y) {
      return f.resetTo(i, d, g, y);
    };
    return h.tween = f, h;
  },
  isTweening: function(l) {
    return ft.getTweensOf(l, !0).length > 0;
  },
  defaults: function(l) {
    return l && l.ease && (l.ease = Ri(l.ease, Bu.ease)), t0(Bu, l || {});
  },
  config: function(l) {
    return t0(Wn, l || {});
  },
  registerEffect: function(l) {
    var i = l.name, r = l.effect, u = l.plugins, f = l.defaults, h = l.extendTimeline;
    (u || "").split(",").forEach(function(p) {
      return p && !Kn[p] && !In[p] && qu(i + " effect requires " + p + " plugin.");
    }), Zf[i] = function(p, d, g) {
      return r(hl(p), Pn(d || {}, f), g);
    }, h && (zn.prototype[i] = function(p, d, g) {
      return this.add(Zf[i](p, Ll(d) ? d : (g = d) && {}, this), g);
    });
  },
  registerEase: function(l, i) {
    Ue[l] = Ri(i);
  },
  parseEase: function(l, i) {
    return arguments.length ? Ri(l, i) : Ue;
  },
  getById: function(l) {
    return ft.getById(l);
  },
  exportRoot: function(l, i) {
    l === void 0 && (l = {});
    var r = new zn(l), u, f;
    for (r.smoothChildTiming = kn(l.smoothChildTiming), ft.remove(r), r._dp = 0, r._time = r._tTime = ft._time, u = ft._first; u; )
      f = u._next, (i || !(!u._dur && u instanceof Rt && u.vars.onComplete === u._targets[0])) && jl(r, u, u._start - u._delay), u = f;
    return jl(ft, r, 0), r;
  },
  context: function(l, i) {
    return l ? new My(l, i) : ct;
  },
  matchMedia: function(l) {
    return new mS(l);
  },
  matchMediaRefresh: function() {
    return Ci.forEach(function(l) {
      var i = l.conditions, r, u;
      for (u in i)
        i[u] && (i[u] = !1, r = 1);
      r && l.revert();
    }) || bh();
  },
  addEventListener: function(l, i) {
    var r = vc[l] || (vc[l] = []);
    ~r.indexOf(i) || r.push(i);
  },
  removeEventListener: function(l, i) {
    var r = vc[l], u = r && r.indexOf(i);
    u >= 0 && r.splice(u, 1);
  },
  utils: {
    wrap: Zb,
    wrapYoyo: Kb,
    distribute: fy,
    random: dy,
    snap: hy,
    normalize: Vb,
    getUnit: an,
    clamp: Yb,
    splitColor: _y,
    toArray: hl,
    selector: yh,
    mapRange: my,
    pipe: Xb,
    unitize: Qb,
    interpolate: $b,
    shuffle: oy
  },
  install: I0,
  effects: Zf,
  ticker: $n,
  updateRoot: zn.updateRoot,
  plugins: Kn,
  globalTimeline: ft,
  core: {
    PropTween: Mn,
    globals: P0,
    Tween: Rt,
    Timeline: zn,
    Animation: Qu,
    getCache: Oi,
    _removeLinkedListItem: Rc,
    reverting: function() {
      return en;
    },
    context: function(l) {
      return l && ct && (ct.data.push(l), l._ctx = ct), ct;
    },
    suppressOverwrites: function(l) {
      return Rh = l;
    }
  }
};
On("to,from,fromTo,delayedCall,set,killTweensOf", function(o) {
  return Ac[o] = Rt[o];
});
$n.add(zn.updateRoot);
br = Ac.to({}, {
  duration: 0
});
var gS = function(l, i) {
  for (var r = l._pt; r && r.p !== i && r.op !== i && r.fp !== i; )
    r = r._next;
  return r;
}, yS = function(l, i) {
  var r = l._targets, u, f, h;
  for (u in i)
    for (f = r.length; f--; )
      h = l._ptLookup[f][u], h && (h = h.d) && (h._pt && (h = gS(h, u)), h && h.modifier && h.modifier(i[u], l, r[f], u));
}, Wf = function(l, i) {
  return {
    name: l,
    headless: 1,
    rawVars: 1,
    //don't pre-process function-based values or "random()" strings.
    init: function(u, f, h) {
      h._onInit = function(p) {
        var d, g;
        if (Yt(f) && (d = {}, On(f, function(y) {
          return d[y] = 1;
        }), f = d), i) {
          d = {};
          for (g in f)
            d[g] = i(f[g]);
          f = d;
        }
        yS(p, f);
      };
    }
  };
}, Cn = Ac.registerPlugin({
  name: "attr",
  init: function(l, i, r, u, f) {
    var h, p, d;
    this.tween = r;
    for (h in i)
      d = l.getAttribute(h) || "", p = this.add(l, "setAttribute", (d || 0) + "", i[h], u, f, 0, 0, h), p.op = h, p.b = d, this._props.push(h);
  },
  render: function(l, i) {
    for (var r = i._pt; r; )
      en ? r.set(r.t, r.p, r.b, r) : r.r(l, r.d), r = r._next;
  }
}, {
  name: "endArray",
  headless: 1,
  init: function(l, i) {
    for (var r = i.length; r--; )
      this.add(l, r, l[r] || 0, i[r], 0, 0, 0, 0, 0, 1);
  }
}, Wf("roundProps", _h), Wf("modifiers"), Wf("snap", hy)) || Ac;
Rt.version = zn.version = Cn.version = "3.15.0";
W0 = 1;
Dh() && kr();
Ue.Power0;
Ue.Power1;
Ue.Power2;
Ue.Power3;
Ue.Power4;
Ue.Linear;
Ue.Quad;
Ue.Cubic;
Ue.Quart;
Ue.Quint;
Ue.Strong;
Ue.Elastic;
Ue.Back;
Ue.SteppedEase;
Ue.Bounce;
Ue.Sine;
Ue.Expo;
Ue.Circ;
var u0, Ja, xr, Vh, ki, s0, Zh, _S = function() {
  return typeof window < "u";
}, da = {}, wi = 180 / Math.PI, Tr = Math.PI / 180, gr = Math.atan2, c0 = 1e8, Kh = /([A-Z])/g, vS = /(left|right|width|margin|padding|x)/i, bS = /[\s,\(]\S/, Ul = {
  autoAlpha: "opacity,visibility",
  scale: "scaleX,scaleY",
  alpha: "opacity"
}, Sh = function(l, i) {
  return i.set(i.t, i.p, Math.round((i.s + i.c * l) * 1e4) / 1e4 + i.u, i);
}, SS = function(l, i) {
  return i.set(i.t, i.p, l === 1 ? i.e : Math.round((i.s + i.c * l) * 1e4) / 1e4 + i.u, i);
}, xS = function(l, i) {
  return i.set(i.t, i.p, l ? Math.round((i.s + i.c * l) * 1e4) / 1e4 + i.u : i.b, i);
}, TS = function(l, i) {
  return i.set(i.t, i.p, l === 1 ? i.e : l ? Math.round((i.s + i.c * l) * 1e4) / 1e4 + i.u : i.b, i);
}, AS = function(l, i) {
  var r = i.s + i.c * l;
  i.set(i.t, i.p, ~~(r + (r < 0 ? -0.5 : 0.5)) + i.u, i);
}, Ry = function(l, i) {
  return i.set(i.t, i.p, l ? i.e : i.b, i);
}, Cy = function(l, i) {
  return i.set(i.t, i.p, l !== 1 ? i.b : i.e, i);
}, ES = function(l, i, r) {
  return l.style[i] = r;
}, wS = function(l, i, r) {
  return l.style.setProperty(i, r);
}, zS = function(l, i, r) {
  return l._gsap[i] = r;
}, kS = function(l, i, r) {
  return l._gsap.scaleX = l._gsap.scaleY = r;
}, OS = function(l, i, r, u, f) {
  var h = l._gsap;
  h.scaleX = h.scaleY = r, h.renderTransform(f, h);
}, MS = function(l, i, r, u, f) {
  var h = l._gsap;
  h[i] = r, h.renderTransform(f, h);
}, ht = "transform", Rn = ht + "Origin", RS = function o(l, i) {
  var r = this, u = this.target, f = u.style, h = u._gsap;
  if (l in da && f) {
    if (this.tfm = this.tfm || {}, l !== "transform")
      l = Ul[l] || l, ~l.indexOf(",") ? l.split(",").forEach(function(p) {
        return r.tfm[p] = fa(u, p);
      }) : this.tfm[l] = h.x ? h[l] : fa(u, l), l === Rn && (this.tfm.zOrigin = h.zOrigin);
    else
      return Ul.transform.split(",").forEach(function(p) {
        return o.call(r, p, i);
      });
    if (this.props.indexOf(ht) >= 0)
      return;
    h.svg && (this.svgo = u.getAttribute("data-svg-origin"), this.props.push(Rn, i, "")), l = ht;
  }
  (f || i) && this.props.push(l, i, f[l]);
}, Dy = function(l) {
  l.translate && (l.removeProperty("translate"), l.removeProperty("scale"), l.removeProperty("rotate"));
}, CS = function() {
  var l = this.props, i = this.target, r = i.style, u = i._gsap, f, h;
  for (f = 0; f < l.length; f += 3)
    l[f + 1] ? l[f + 1] === 2 ? i[l[f]](l[f + 2]) : i[l[f]] = l[f + 2] : l[f + 2] ? r[l[f]] = l[f + 2] : r.removeProperty(l[f].substr(0, 2) === "--" ? l[f] : l[f].replace(Kh, "-$1").toLowerCase());
  if (this.tfm) {
    for (h in this.tfm)
      u[h] = this.tfm[h];
    u.svg && (u.renderTransform(), i.setAttribute("data-svg-origin", this.svgo || "")), f = Zh(), (!f || !f.isStart) && !r[ht] && (Dy(r), u.zOrigin && r[Rn] && (r[Rn] += " " + u.zOrigin + "px", u.zOrigin = 0, u.renderTransform()), u.uncache = 1);
  }
}, Ny = function(l, i) {
  var r = {
    target: l,
    props: [],
    revert: CS,
    save: RS
  };
  return l._gsap || Cn.core.getCache(l), i && l.style && l.nodeType && i.split(",").forEach(function(u) {
    return r.save(u);
  }), r;
}, jy, xh = function(l, i) {
  var r = Ja.createElementNS ? Ja.createElementNS((i || "http://www.w3.org/1999/xhtml").replace(/^https/, "http"), l) : Ja.createElement(l);
  return r && r.style ? r : Ja.createElement(l);
}, Fn = function o(l, i, r) {
  var u = getComputedStyle(l);
  return u[i] || u.getPropertyValue(i.replace(Kh, "-$1").toLowerCase()) || u.getPropertyValue(i) || !r && o(l, Or(i) || i, 1) || "";
}, o0 = "O,Moz,ms,Ms,Webkit".split(","), Or = function(l, i, r) {
  var u = i || ki, f = u.style, h = 5;
  if (l in f && !r)
    return l;
  for (l = l.charAt(0).toUpperCase() + l.substr(1); h-- && !(o0[h] + l in f); )
    ;
  return h < 0 ? null : (h === 3 ? "ms" : h >= 0 ? o0[h] : "") + l;
}, Th = function() {
  _S() && window.document && (u0 = window, Ja = u0.document, xr = Ja.documentElement, ki = xh("div") || {
    style: {}
  }, xh("div"), ht = Or(ht), Rn = ht + "Origin", ki.style.cssText = "border-width:0;line-height:0;position:absolute;padding:0", jy = !!Or("perspective"), Zh = Cn.core.reverting, Vh = 1);
}, f0 = function(l) {
  var i = l.ownerSVGElement, r = xh("svg", i && i.getAttribute("xmlns") || "http://www.w3.org/2000/svg"), u = l.cloneNode(!0), f;
  u.style.display = "block", r.appendChild(u), xr.appendChild(r);
  try {
    f = u.getBBox();
  } catch {
  }
  return r.removeChild(u), xr.removeChild(r), f;
}, h0 = function(l, i) {
  for (var r = i.length; r--; )
    if (l.hasAttribute(i[r]))
      return l.getAttribute(i[r]);
}, Uy = function(l) {
  var i, r;
  try {
    i = l.getBBox();
  } catch {
    i = f0(l), r = 1;
  }
  return i && (i.width || i.height) || r || (i = f0(l)), i && !i.width && !i.x && !i.y ? {
    x: +h0(l, ["x", "cx", "x1"]) || 0,
    y: +h0(l, ["y", "cy", "y1"]) || 0,
    width: 0,
    height: 0
  } : i;
}, Ly = function(l) {
  return !!(l.getCTM && (!l.parentNode || l.ownerSVGElement) && Uy(l));
}, ei = function(l, i) {
  if (i) {
    var r = l.style, u;
    i in da && i !== Rn && (i = ht), r.removeProperty ? (u = i.substr(0, 2), (u === "ms" || i.substr(0, 6) === "webkit") && (i = "-" + i), r.removeProperty(u === "--" ? i : i.replace(Kh, "-$1").toLowerCase())) : r.removeAttribute(i);
  }
}, Fa = function(l, i, r, u, f, h) {
  var p = new Mn(l._pt, i, r, 0, 1, h ? Cy : Ry);
  return l._pt = p, p.b = u, p.e = f, l._props.push(r), p;
}, d0 = {
  deg: 1,
  rad: 1,
  turn: 1
}, DS = {
  grid: 1,
  flex: 1
}, ti = function o(l, i, r, u) {
  var f = parseFloat(r) || 0, h = (r + "").trim().substr((f + "").length) || "px", p = ki.style, d = vS.test(i), g = l.tagName.toLowerCase() === "svg", y = (g ? "client" : "offset") + (d ? "Width" : "Height"), S = 100, E = u === "px", b = u === "%", R, A, C, j;
  if (u === h || !f || d0[u] || d0[h])
    return f;
  if (h !== "px" && !E && (f = o(l, i, r, "px")), j = l.getCTM && Ly(l), (b || h === "%") && (da[i] || ~i.indexOf("adius")))
    return R = j ? l.getBBox()[d ? "width" : "height"] : l[y], At(b ? f / R * S : f / 100 * R);
  if (p[d ? "width" : "height"] = S + (E ? h : u), A = u !== "rem" && ~i.indexOf("adius") || u === "em" && l.appendChild && !g ? l : l.parentNode, j && (A = (l.ownerSVGElement || {}).parentNode), (!A || A === Ja || !A.appendChild) && (A = Ja.body), C = A._gsap, C && b && C.width && d && C.time === $n.time && !C.uncache)
    return At(f / C.width * S);
  if (b && (i === "height" || i === "width")) {
    var K = l.style[i];
    l.style[i] = S + u, R = l[y], K ? l.style[i] = K : ei(l, i);
  } else
    (b || h === "%") && !DS[Fn(A, "display")] && (p.position = Fn(l, "position")), A === l && (p.position = "static"), A.appendChild(ki), R = ki[y], A.removeChild(ki), p.position = "absolute";
  return d && b && (C = Oi(A), C.time = $n.time, C.width = A[y]), At(E ? R * f / S : R && f ? S / R * f : 0);
}, fa = function(l, i, r, u) {
  var f;
  return Vh || Th(), i in Ul && i !== "transform" && (i = Ul[i], ~i.indexOf(",") && (i = i.split(",")[0])), da[i] && i !== "transform" ? (f = Zu(l, u), f = i !== "transformOrigin" ? f[i] : f.svg ? f.origin : wc(Fn(l, Rn)) + " " + f.zOrigin + "px") : (f = l.style[i], (!f || f === "auto" || u || ~(f + "").indexOf("calc(")) && (f = Ec[i] && Ec[i](l, i, r) || Fn(l, i) || ty(l, i) || (i === "opacity" ? 1 : 0))), r && !~(f + "").trim().indexOf(" ") ? ti(l, i, f, r) + r : f;
}, NS = function(l, i, r, u) {
  if (!r || r === "none") {
    var f = Or(i, l, 1), h = f && Fn(l, f, 1);
    h && h !== r ? (i = f, r = h) : i === "borderColor" && (r = Fn(l, "borderTopColor"));
  }
  var p = new Mn(this._pt, l.style, i, 0, 1, ky), d = 0, g = 0, y, S, E, b, R, A, C, j, K, H, F, q;
  if (p.b = r, p.e = u, r += "", u += "", u.substring(0, 6) === "var(--" && (u = Fn(l, u.substring(4, u.indexOf(")")))), u === "auto" && (A = l.style[i], l.style[i] = u, u = Fn(l, i) || u, A ? l.style[i] = A : ei(l, i)), y = [r, u], by(y), r = y[0], u = y[1], E = r.match(vr) || [], q = u.match(vr) || [], q.length) {
    for (; S = vr.exec(u); )
      C = S[0], K = u.substring(d, S.index), R ? R = (R + 1) % 5 : (K.substr(-5) === "rgba(" || K.substr(-5) === "hsla(") && (R = 1), C !== (A = E[g++] || "") && (b = parseFloat(A) || 0, F = A.substr((b + "").length), C.charAt(1) === "=" && (C = Sr(b, C) + F), j = parseFloat(C), H = C.substr((j + "").length), d = vr.lastIndex - H.length, H || (H = H || Wn.units[i] || F, d === u.length && (u += H, p.e += H)), F !== H && (b = ti(l, i, A, H) || 0), p._pt = {
        _next: p._pt,
        p: K || g === 1 ? K : ",",
        //note: SVG spec allows omission of comma/space when a negative sign is wedged between two numbers, like 2.5-5.3 instead of 2.5,-5.3 but when tweening, the negative value may switch to positive, so we insert the comma just in case.
        s: b,
        c: j - b,
        m: R && R < 4 || i === "zIndex" ? Math.round : 0
      });
    p.c = d < u.length ? u.substring(d, u.length) : "";
  } else
    p.r = i === "display" && u === "none" ? Cy : Ry;
  return F0.test(u) && (p.e = 0), this._pt = p, p;
}, p0 = {
  top: "0%",
  bottom: "100%",
  left: "0%",
  right: "100%",
  center: "50%"
}, jS = function(l) {
  var i = l.split(" "), r = i[0], u = i[1] || "50%";
  return (r === "top" || r === "bottom" || u === "left" || u === "right") && (l = r, r = u, u = l), i[0] = p0[r] || r, i[1] = p0[u] || u, i.join(" ");
}, US = function(l, i) {
  if (i.tween && i.tween._time === i.tween._dur) {
    var r = i.t, u = r.style, f = i.u, h = r._gsap, p, d, g;
    if (f === "all" || f === !0)
      u.cssText = "", d = 1;
    else
      for (f = f.split(","), g = f.length; --g > -1; )
        p = f[g], da[p] && (d = 1, p = p === "transformOrigin" ? Rn : ht), ei(r, p);
    d && (ei(r, ht), h && (h.svg && r.removeAttribute("transform"), u.scale = u.rotate = u.translate = "none", Zu(r, 1), h.uncache = 1, Dy(u)));
  }
}, Ec = {
  clearProps: function(l, i, r, u, f) {
    if (f.data !== "isFromStart") {
      var h = l._pt = new Mn(l._pt, i, r, 0, 0, US);
      return h.u = u, h.pr = -10, h.tween = f, l._props.push(r), 1;
    }
  }
  /* className feature (about 0.4kb gzipped).
  , className(plugin, target, property, endValue, tween) {
  	let _renderClassName = (ratio, data) => {
  			data.css.render(ratio, data.css);
  			if (!ratio || ratio === 1) {
  				let inline = data.rmv,
  					target = data.t,
  					p;
  				target.setAttribute("class", ratio ? data.e : data.b);
  				for (p in inline) {
  					_removeProperty(target, p);
  				}
  			}
  		},
  		_getAllStyles = (target) => {
  			let styles = {},
  				computed = getComputedStyle(target),
  				p;
  			for (p in computed) {
  				if (isNaN(p) && p !== "cssText" && p !== "length") {
  					styles[p] = computed[p];
  				}
  			}
  			_setDefaults(styles, _parseTransform(target, 1));
  			return styles;
  		},
  		startClassList = target.getAttribute("class"),
  		style = target.style,
  		cssText = style.cssText,
  		cache = target._gsap,
  		classPT = cache.classPT,
  		inlineToRemoveAtEnd = {},
  		data = {t:target, plugin:plugin, rmv:inlineToRemoveAtEnd, b:startClassList, e:(endValue.charAt(1) !== "=") ? endValue : startClassList.replace(new RegExp("(?:\\s|^)" + endValue.substr(2) + "(?![\\w-])"), "") + ((endValue.charAt(0) === "+") ? " " + endValue.substr(2) : "")},
  		changingVars = {},
  		startVars = _getAllStyles(target),
  		transformRelated = /(transform|perspective)/i,
  		endVars, p;
  	if (classPT) {
  		classPT.r(1, classPT.d);
  		_removeLinkedListItem(classPT.d.plugin, classPT, "_pt");
  	}
  	target.setAttribute("class", data.e);
  	endVars = _getAllStyles(target, true);
  	target.setAttribute("class", startClassList);
  	for (p in endVars) {
  		if (endVars[p] !== startVars[p] && !transformRelated.test(p)) {
  			changingVars[p] = endVars[p];
  			if (!style[p] && style[p] !== "0") {
  				inlineToRemoveAtEnd[p] = 1;
  			}
  		}
  	}
  	cache.classPT = plugin._pt = new PropTween(plugin._pt, target, "className", 0, 0, _renderClassName, data, 0, -11);
  	if (style.cssText !== cssText) { //only apply if things change. Otherwise, in cases like a background-image that's pulled dynamically, it could cause a refresh. See https://gsap.com/forums/topic/20368-possible-gsap-bug-switching-classnames-in-chrome/.
  		style.cssText = cssText; //we recorded cssText before we swapped classes and ran _getAllStyles() because in cases when a className tween is overwritten, we remove all the related tweening properties from that class change (otherwise class-specific stuff can't override properties we've directly set on the target's style object due to specificity).
  	}
  	_parseTransform(target, true); //to clear the caching of transforms
  	data.css = new gsap.plugins.css();
  	data.css.init(target, changingVars, tween);
  	plugin._props.push(...data.css._props);
  	return 1;
  }
  */
}, Vu = [1, 0, 0, 1, 0, 0], Hy = {}, By = function(l) {
  return l === "matrix(1, 0, 0, 1, 0, 0)" || l === "none" || !l;
}, m0 = function(l) {
  var i = Fn(l, ht);
  return By(i) ? Vu : i.substr(7).match(J0).map(At);
}, $h = function(l, i) {
  var r = l._gsap || Oi(l), u = l.style, f = m0(l), h, p, d, g;
  return r.svg && l.getAttribute("transform") ? (d = l.transform.baseVal.consolidate().matrix, f = [d.a, d.b, d.c, d.d, d.e, d.f], f.join(",") === "1,0,0,1,0,0" ? Vu : f) : (f === Vu && !l.offsetParent && l !== xr && !r.svg && (d = u.display, u.display = "block", h = l.parentNode, (!h || !l.offsetParent && !l.getBoundingClientRect().width) && (g = 1, p = l.nextElementSibling, xr.appendChild(l)), f = m0(l), d ? u.display = d : ei(l, "display"), g && (p ? h.insertBefore(l, p) : h ? h.appendChild(l) : xr.removeChild(l))), i && f.length > 6 ? [f[0], f[1], f[4], f[5], f[12], f[13]] : f);
}, Ah = function(l, i, r, u, f, h) {
  var p = l._gsap, d = f || $h(l, !0), g = p.xOrigin || 0, y = p.yOrigin || 0, S = p.xOffset || 0, E = p.yOffset || 0, b = d[0], R = d[1], A = d[2], C = d[3], j = d[4], K = d[5], H = i.split(" "), F = parseFloat(H[0]) || 0, q = parseFloat(H[1]) || 0, le, X, I, G;
  r ? d !== Vu && (X = b * C - R * A) && (I = F * (C / X) + q * (-A / X) + (A * K - C * j) / X, G = F * (-R / X) + q * (b / X) - (b * K - R * j) / X, F = I, q = G) : (le = Uy(l), F = le.x + (~H[0].indexOf("%") ? F / 100 * le.width : F), q = le.y + (~(H[1] || H[0]).indexOf("%") ? q / 100 * le.height : q)), u || u !== !1 && p.smooth ? (j = F - g, K = q - y, p.xOffset = S + (j * b + K * A) - j, p.yOffset = E + (j * R + K * C) - K) : p.xOffset = p.yOffset = 0, p.xOrigin = F, p.yOrigin = q, p.smooth = !!u, p.origin = i, p.originIsAbsolute = !!r, l.style[Rn] = "0px 0px", h && (Fa(h, p, "xOrigin", g, F), Fa(h, p, "yOrigin", y, q), Fa(h, p, "xOffset", S, p.xOffset), Fa(h, p, "yOffset", E, p.yOffset)), l.setAttribute("data-svg-origin", F + " " + q);
}, Zu = function(l, i) {
  var r = l._gsap || new xy(l);
  if ("x" in r && !i && !r.uncache)
    return r;
  var u = l.style, f = r.scaleX < 0, h = "px", p = "deg", d = getComputedStyle(l), g = Fn(l, Rn) || "0", y, S, E, b, R, A, C, j, K, H, F, q, le, X, I, G, ce, be, ve, _e, ue, Se, L, Y, ie, se, ze, z, V, te, P, pe;
  return y = S = E = A = C = j = K = H = F = 0, b = R = 1, r.svg = !!(l.getCTM && Ly(l)), d.translate && ((d.translate !== "none" || d.scale !== "none" || d.rotate !== "none") && (u[ht] = (d.translate !== "none" ? "translate3d(" + (d.translate + " 0 0").split(" ").slice(0, 3).join(", ") + ") " : "") + (d.rotate !== "none" ? "rotate(" + d.rotate + ") " : "") + (d.scale !== "none" ? "scale(" + d.scale.split(" ").join(",") + ") " : "") + (d[ht] !== "none" ? d[ht] : "")), u.scale = u.rotate = u.translate = "none"), X = $h(l, r.svg), r.svg && (r.uncache ? (ie = l.getBBox(), g = r.xOrigin - ie.x + "px " + (r.yOrigin - ie.y) + "px", Y = "") : Y = !i && l.getAttribute("data-svg-origin"), Ah(l, Y || g, !!Y || r.originIsAbsolute, r.smooth !== !1, X)), q = r.xOrigin || 0, le = r.yOrigin || 0, X !== Vu && (be = X[0], ve = X[1], _e = X[2], ue = X[3], y = Se = X[4], S = L = X[5], X.length === 6 ? (b = Math.sqrt(be * be + ve * ve), R = Math.sqrt(ue * ue + _e * _e), A = be || ve ? gr(ve, be) * wi : 0, K = _e || ue ? gr(_e, ue) * wi + A : 0, K && (R *= Math.abs(Math.cos(K * Tr))), r.svg && (y -= q - (q * be + le * _e), S -= le - (q * ve + le * ue))) : (pe = X[6], te = X[7], ze = X[8], z = X[9], V = X[10], P = X[11], y = X[12], S = X[13], E = X[14], I = gr(pe, V), C = I * wi, I && (G = Math.cos(-I), ce = Math.sin(-I), Y = Se * G + ze * ce, ie = L * G + z * ce, se = pe * G + V * ce, ze = Se * -ce + ze * G, z = L * -ce + z * G, V = pe * -ce + V * G, P = te * -ce + P * G, Se = Y, L = ie, pe = se), I = gr(-_e, V), j = I * wi, I && (G = Math.cos(-I), ce = Math.sin(-I), Y = be * G - ze * ce, ie = ve * G - z * ce, se = _e * G - V * ce, P = ue * ce + P * G, be = Y, ve = ie, _e = se), I = gr(ve, be), A = I * wi, I && (G = Math.cos(I), ce = Math.sin(I), Y = be * G + ve * ce, ie = Se * G + L * ce, ve = ve * G - be * ce, L = L * G - Se * ce, be = Y, Se = ie), C && Math.abs(C) + Math.abs(A) > 359.9 && (C = A = 0, j = 180 - j), b = At(Math.sqrt(be * be + ve * ve + _e * _e)), R = At(Math.sqrt(L * L + pe * pe)), I = gr(Se, L), K = Math.abs(I) > 2e-4 ? I * wi : 0, F = P ? 1 / (P < 0 ? -P : P) : 0), r.svg && (Y = l.getAttribute("transform"), r.forceCSS = l.setAttribute("transform", "") || !By(Fn(l, ht)), Y && l.setAttribute("transform", Y))), Math.abs(K) > 90 && Math.abs(K) < 270 && (f ? (b *= -1, K += A <= 0 ? 180 : -180, A += A <= 0 ? 180 : -180) : (R *= -1, K += K <= 0 ? 180 : -180)), i = i || r.uncache, r.x = y - ((r.xPercent = y && (!i && r.xPercent || (Math.round(l.offsetWidth / 2) === Math.round(-y) ? -50 : 0))) ? l.offsetWidth * r.xPercent / 100 : 0) + h, r.y = S - ((r.yPercent = S && (!i && r.yPercent || (Math.round(l.offsetHeight / 2) === Math.round(-S) ? -50 : 0))) ? l.offsetHeight * r.yPercent / 100 : 0) + h, r.z = E + h, r.scaleX = At(b), r.scaleY = At(R), r.rotation = At(A) + p, r.rotationX = At(C) + p, r.rotationY = At(j) + p, r.skewX = K + p, r.skewY = H + p, r.transformPerspective = F + h, (r.zOrigin = parseFloat(g.split(" ")[2]) || !i && r.zOrigin || 0) && (u[Rn] = wc(g)), r.xOffset = r.yOffset = 0, r.force3D = Wn.force3D, r.renderTransform = r.svg ? HS : jy ? qy : LS, r.uncache = 0, r;
}, wc = function(l) {
  return (l = l.split(" "))[0] + " " + l[1];
}, If = function(l, i, r) {
  var u = an(i);
  return At(parseFloat(i) + parseFloat(ti(l, "x", r + "px", u))) + u;
}, LS = function(l, i) {
  i.z = "0px", i.rotationY = i.rotationX = "0deg", i.force3D = 0, qy(l, i);
}, Ti = "0deg", Au = "0px", Ai = ") ", qy = function(l, i) {
  var r = i || this, u = r.xPercent, f = r.yPercent, h = r.x, p = r.y, d = r.z, g = r.rotation, y = r.rotationY, S = r.rotationX, E = r.skewX, b = r.skewY, R = r.scaleX, A = r.scaleY, C = r.transformPerspective, j = r.force3D, K = r.target, H = r.zOrigin, F = "", q = j === "auto" && l && l !== 1 || j === !0;
  if (H && (S !== Ti || y !== Ti)) {
    var le = parseFloat(y) * Tr, X = Math.sin(le), I = Math.cos(le), G;
    le = parseFloat(S) * Tr, G = Math.cos(le), h = If(K, h, X * G * -H), p = If(K, p, -Math.sin(le) * -H), d = If(K, d, I * G * -H + H);
  }
  C !== Au && (F += "perspective(" + C + Ai), (u || f) && (F += "translate(" + u + "%, " + f + "%) "), (q || h !== Au || p !== Au || d !== Au) && (F += d !== Au || q ? "translate3d(" + h + ", " + p + ", " + d + ") " : "translate(" + h + ", " + p + Ai), g !== Ti && (F += "rotate(" + g + Ai), y !== Ti && (F += "rotateY(" + y + Ai), S !== Ti && (F += "rotateX(" + S + Ai), (E !== Ti || b !== Ti) && (F += "skew(" + E + ", " + b + Ai), (R !== 1 || A !== 1) && (F += "scale(" + R + ", " + A + Ai), K.style[ht] = F || "translate(0, 0)";
}, HS = function(l, i) {
  var r = i || this, u = r.xPercent, f = r.yPercent, h = r.x, p = r.y, d = r.rotation, g = r.skewX, y = r.skewY, S = r.scaleX, E = r.scaleY, b = r.target, R = r.xOrigin, A = r.yOrigin, C = r.xOffset, j = r.yOffset, K = r.forceCSS, H = parseFloat(h), F = parseFloat(p), q, le, X, I, G;
  d = parseFloat(d), g = parseFloat(g), y = parseFloat(y), y && (y = parseFloat(y), g += y, d += y), d || g ? (d *= Tr, g *= Tr, q = Math.cos(d) * S, le = Math.sin(d) * S, X = Math.sin(d - g) * -E, I = Math.cos(d - g) * E, g && (y *= Tr, G = Math.tan(g - y), G = Math.sqrt(1 + G * G), X *= G, I *= G, y && (G = Math.tan(y), G = Math.sqrt(1 + G * G), q *= G, le *= G)), q = At(q), le = At(le), X = At(X), I = At(I)) : (q = S, I = E, le = X = 0), (H && !~(h + "").indexOf("px") || F && !~(p + "").indexOf("px")) && (H = ti(b, "x", h, "px"), F = ti(b, "y", p, "px")), (R || A || C || j) && (H = At(H + R - (R * q + A * X) + C), F = At(F + A - (R * le + A * I) + j)), (u || f) && (G = b.getBBox(), H = At(H + u / 100 * G.width), F = At(F + f / 100 * G.height)), G = "matrix(" + q + "," + le + "," + X + "," + I + "," + H + "," + F + ")", b.setAttribute("transform", G), K && (b.style[ht] = G);
}, BS = function(l, i, r, u, f) {
  var h = 360, p = Yt(f), d = parseFloat(f) * (p && ~f.indexOf("rad") ? wi : 1), g = d - u, y = u + g + "deg", S, E;
  return p && (S = f.split("_")[1], S === "short" && (g %= h, g !== g % (h / 2) && (g += g < 0 ? h : -h)), S === "cw" && g < 0 ? g = (g + h * c0) % h - ~~(g / h) * h : S === "ccw" && g > 0 && (g = (g - h * c0) % h - ~~(g / h) * h)), l._pt = E = new Mn(l._pt, i, r, u, g, SS), E.e = y, E.u = "deg", l._props.push(r), E;
}, g0 = function(l, i) {
  for (var r in i)
    l[r] = i[r];
  return l;
}, qS = function(l, i, r) {
  var u = g0({}, r._gsap), f = "perspective,force3D,transformOrigin,svgOrigin", h = r.style, p, d, g, y, S, E, b, R;
  u.svg ? (g = r.getAttribute("transform"), r.setAttribute("transform", ""), h[ht] = i, p = Zu(r, 1), ei(r, ht), r.setAttribute("transform", g)) : (g = getComputedStyle(r)[ht], h[ht] = i, p = Zu(r, 1), h[ht] = g);
  for (d in da)
    g = u[d], y = p[d], g !== y && f.indexOf(d) < 0 && (b = an(g), R = an(y), S = b !== R ? ti(r, d, g, R) : parseFloat(g), E = parseFloat(y), l._pt = new Mn(l._pt, p, d, S, E - S, Sh), l._pt.u = R || 0, l._props.push(d));
  g0(p, u);
};
On("padding,margin,Width,Radius", function(o, l) {
  var i = "Top", r = "Right", u = "Bottom", f = "Left", h = (l < 3 ? [i, r, u, f] : [i + f, i + r, u + r, u + f]).map(function(p) {
    return l < 2 ? o + p : "border" + p + o;
  });
  Ec[l > 1 ? "border" + o : o] = function(p, d, g, y, S) {
    var E, b;
    if (arguments.length < 4)
      return E = h.map(function(R) {
        return fa(p, R, g);
      }), b = E.join(" "), b.split(E[0]).length === 5 ? E[0] : b;
    E = (y + "").split(" "), b = {}, h.forEach(function(R, A) {
      return b[R] = E[A] = E[A] || E[(A - 1) / 2 | 0];
    }), p.init(d, b, S);
  };
});
var Yy = {
  name: "css",
  register: Th,
  targetTest: function(l) {
    return l.style && l.nodeType;
  },
  init: function(l, i, r, u, f) {
    var h = this._props, p = l.style, d = r.vars.startAt, g, y, S, E, b, R, A, C, j, K, H, F, q, le, X, I, G;
    Vh || Th(), this.styles = this.styles || Ny(l), I = this.styles.props, this.tween = r;
    for (A in i)
      if (A !== "autoRound" && (y = i[A], !(Kn[A] && Ty(A, i, r, u, l, f)))) {
        if (b = typeof y, R = Ec[A], b === "function" && (y = y.call(r, u, l, f), b = typeof y), b === "string" && ~y.indexOf("random(") && (y = Gu(y)), R)
          R(this, l, A, y, r) && (X = 1);
        else if (A.substr(0, 2) === "--")
          g = (getComputedStyle(l).getPropertyValue(A) + "").trim(), y += "", Ia.lastIndex = 0, Ia.test(g) || (C = an(g), j = an(y), j ? C !== j && (g = ti(l, A, g, j) + j) : C && (y += C)), this.add(p, "setProperty", g, y, u, f, 0, 0, A), h.push(A), I.push(A, 0, p[A]);
        else if (b !== "undefined") {
          if (d && A in d ? (g = typeof d[A] == "function" ? d[A].call(r, u, l, f) : d[A], Yt(g) && ~g.indexOf("random(") && (g = Gu(g)), an(g + "") || g === "auto" || (g += Wn.units[A] || an(fa(l, A)) || ""), (g + "").charAt(1) === "=" && (g = fa(l, A))) : g = fa(l, A), E = parseFloat(g), K = b === "string" && y.charAt(1) === "=" && y.substr(0, 2), K && (y = y.substr(2)), S = parseFloat(y), A in Ul && (A === "autoAlpha" && (E === 1 && fa(l, "visibility") === "hidden" && S && (E = 0), I.push("visibility", 0, p.visibility), Fa(this, p, "visibility", E ? "inherit" : "hidden", S ? "inherit" : "hidden", !S)), A !== "scale" && A !== "transform" && (A = Ul[A], ~A.indexOf(",") && (A = A.split(",")[0]))), H = A in da, H) {
            if (this.styles.save(A), G = y, b === "string" && y.substring(0, 6) === "var(--") {
              if (y = Fn(l, y.substring(4, y.indexOf(")"))), y.substring(0, 5) === "calc(") {
                var ce = l.style.perspective;
                l.style.perspective = y, y = Fn(l, "perspective"), ce ? l.style.perspective = ce : ei(l, "perspective");
              }
              S = parseFloat(y);
            }
            if (F || (q = l._gsap, q.renderTransform && !i.parseTransform || Zu(l, i.parseTransform), le = i.smoothOrigin !== !1 && q.smooth, F = this._pt = new Mn(this._pt, p, ht, 0, 1, q.renderTransform, q, 0, -1), F.dep = 1), A === "scale")
              this._pt = new Mn(this._pt, q, "scaleY", q.scaleY, (K ? Sr(q.scaleY, K + S) : S) - q.scaleY || 0, Sh), this._pt.u = 0, h.push("scaleY", A), A += "X";
            else if (A === "transformOrigin") {
              I.push(Rn, 0, p[Rn]), y = jS(y), q.svg ? Ah(l, y, 0, le, 0, this) : (j = parseFloat(y.split(" ")[2]) || 0, j !== q.zOrigin && Fa(this, q, "zOrigin", q.zOrigin, j), Fa(this, p, A, wc(g), wc(y)));
              continue;
            } else if (A === "svgOrigin") {
              Ah(l, y, 1, le, 0, this);
              continue;
            } else if (A in Hy) {
              BS(this, q, A, E, K ? Sr(E, K + y) : y);
              continue;
            } else if (A === "smoothOrigin") {
              Fa(this, q, "smooth", q.smooth, y);
              continue;
            } else if (A === "force3D") {
              q[A] = y;
              continue;
            } else if (A === "transform") {
              qS(this, y, l);
              continue;
            }
          } else A in p || (A = Or(A) || A);
          if (H || (S || S === 0) && (E || E === 0) && !bS.test(y) && A in p)
            C = (g + "").substr((E + "").length), S || (S = 0), j = an(y) || (A in Wn.units ? Wn.units[A] : C), C !== j && (E = ti(l, A, g, j)), this._pt = new Mn(this._pt, H ? q : p, A, E, (K ? Sr(E, K + S) : S) - E, !H && (j === "px" || A === "zIndex") && i.autoRound !== !1 ? AS : Sh), this._pt.u = j || 0, H && G !== y ? (this._pt.b = g, this._pt.e = G, this._pt.r = TS) : C !== j && j !== "%" && (this._pt.b = g, this._pt.r = xS);
          else if (A in p)
            NS.call(this, l, A, g, K ? K + y : y);
          else if (A in l)
            this.add(l, A, g || l[A], K ? K + y : y, u, f);
          else if (A !== "parseTransform") {
            jh(A, y);
            continue;
          }
          H || (A in p ? I.push(A, 0, p[A]) : typeof l[A] == "function" ? I.push(A, 2, l[A]()) : I.push(A, 1, g || l[A])), h.push(A);
        }
      }
    X && Oy(this);
  },
  render: function(l, i) {
    if (i.tween._time || !Zh())
      for (var r = i._pt; r; )
        r.r(l, r.d), r = r._next;
    else
      i.styles.revert();
  },
  get: fa,
  aliases: Ul,
  getSetter: function(l, i, r) {
    var u = Ul[i];
    return u && u.indexOf(",") < 0 && (i = u), i in da && i !== Rn && (l._gsap.x || fa(l, "x")) ? r && s0 === r ? i === "scale" ? kS : zS : (s0 = r || {}) && (i === "scale" ? OS : MS) : l.style && !Ch(l.style[i]) ? ES : ~i.indexOf("-") ? wS : Xh(l, i);
  },
  core: {
    _removeProperty: ei,
    _getMatrix: $h
  }
};
Cn.utils.checkPrefix = Or;
Cn.core.getStyleSaver = Ny;
(function(o, l, i, r) {
  var u = On(o + "," + l + "," + i, function(f) {
    da[f] = 1;
  });
  On(l, function(f) {
    Wn.units[f] = "deg", Hy[f] = 1;
  }), Ul[u[13]] = o + "," + l, On(r, function(f) {
    var h = f.split(":");
    Ul[h[1]] = u[h[0]];
  });
})("x,y,z,scale,scaleX,scaleY,xPercent,yPercent", "rotation,rotationX,rotationY,skewX,skewY", "transform,transformOrigin,svgOrigin,force3D,smoothOrigin,transformPerspective", "0:translateX,1:translateY,2:translateZ,8:rotate,8:rotationZ,8:rotateZ,9:rotateX,10:rotateY");
On("x,y,z,top,right,bottom,left,width,height,fontSize,padding,margin,perspective", function(o) {
  Wn.units[o] = "px";
});
Cn.registerPlugin(Yy);
var Ku = Cn.registerPlugin(Yy) || Cn;
Ku.core.Tween;
let y0 = typeof document < "u" ? re.useLayoutEffect : re.useEffect, _0 = (o) => o && !Array.isArray(o) && typeof o == "object", dc = [], YS = {}, Gy = Ku;
const $u = (o, l = dc) => {
  let i = YS;
  _0(o) ? (i = o, o = null, l = "dependencies" in i ? i.dependencies : dc) : _0(l) && (i = l, l = "dependencies" in i ? i.dependencies : dc), o && typeof o != "function" && console.warn("First parameter must be a function or config object");
  const { scope: r, revertOnUpdate: u } = i, f = re.useRef(!1), h = re.useRef(Gy.context(() => {
  }, r)), p = re.useRef((g) => h.current.add(null, g)), d = l && l.length && !u;
  return d && y0(() => (f.current = !0, () => h.current.revert()), dc), y0(() => {
    if (o && h.current.add(o, r), !d || !f.current)
      return () => h.current.revert();
  }, l), { context: h.current, contextSafe: p.current };
};
$u.register = (o) => {
  Gy = o;
};
$u.headless = !0;
function Jh() {
  return { async: !1, breaks: !1, extensions: null, gfm: !0, hooks: null, pedantic: !1, renderer: null, silent: !1, tokenizer: null, walkTokens: null };
}
var ji = Jh();
function Xy(o) {
  ji = o;
}
var Hu = { exec: () => null };
function Ye(o, l = "") {
  let i = typeof o == "string" ? o : o.source, r = { replace: (u, f) => {
    let h = typeof f == "string" ? f : f.source;
    return h = h.replace(pn.caret, "$1"), i = i.replace(u, h), r;
  }, getRegex: () => new RegExp(i, l) };
  return r;
}
var GS = (() => {
  try {
    return !!new RegExp("(?<=1)(?<!1)");
  } catch {
    return !1;
  }
})(), pn = { codeRemoveIndent: /^(?: {1,4}| {0,3}\t)/gm, outputLinkReplace: /\\([\[\]])/g, indentCodeCompensation: /^(\s+)(?:```)/, beginningSpace: /^\s+/, endingHash: /#$/, startingSpaceChar: /^ /, endingSpaceChar: / $/, nonSpaceChar: /[^ ]/, newLineCharGlobal: /\n/g, tabCharGlobal: /\t/g, multipleSpaceGlobal: /\s+/g, blankLine: /^[ \t]*$/, doubleBlankLine: /\n[ \t]*\n[ \t]*$/, blockquoteStart: /^ {0,3}>/, blockquoteSetextReplace: /\n {0,3}((?:=+|-+) *)(?=\n|$)/g, blockquoteSetextReplace2: /^ {0,3}>[ \t]?/gm, listReplaceTabs: /^\t+/, listReplaceNesting: /^ {1,4}(?=( {4})*[^ ])/g, listIsTask: /^\[[ xX]\] +\S/, listReplaceTask: /^\[[ xX]\] +/, listTaskCheckbox: /\[[ xX]\]/, anyLine: /\n.*\n/, hrefBrackets: /^<(.*)>$/, tableDelimiter: /[:|]/, tableAlignChars: /^\||\| *$/g, tableRowBlankLine: /\n[ \t]*$/, tableAlignRight: /^ *-+: *$/, tableAlignCenter: /^ *:-+: *$/, tableAlignLeft: /^ *:-+ *$/, startATag: /^<a /i, endATag: /^<\/a>/i, startPreScriptTag: /^<(pre|code|kbd|script)(\s|>)/i, endPreScriptTag: /^<\/(pre|code|kbd|script)(\s|>)/i, startAngleBracket: /^</, endAngleBracket: />$/, pedanticHrefTitle: /^([^'"]*[^\s])\s+(['"])(.*)\2/, unicodeAlphaNumeric: /[\p{L}\p{N}]/u, escapeTest: /[&<>"']/, escapeReplace: /[&<>"']/g, escapeTestNoEncode: /[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/, escapeReplaceNoEncode: /[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/g, unescapeTest: /&(#(?:\d+)|(?:#x[0-9A-Fa-f]+)|(?:\w+));?/ig, caret: /(^|[^\[])\^/g, percentDecode: /%25/g, findPipe: /\|/g, splitPipe: / \|/, slashPipe: /\\\|/g, carriageReturn: /\r\n|\r/g, spaceLine: /^ +$/gm, notSpaceStart: /^\S*/, endingNewline: /\n$/, listItemRegex: (o) => new RegExp(`^( {0,3}${o})((?:[	 ][^\\n]*)?(?:\\n|$))`), nextBulletRegex: (o) => new RegExp(`^ {0,${Math.min(3, o - 1)}}(?:[*+-]|\\d{1,9}[.)])((?:[ 	][^\\n]*)?(?:\\n|$))`), hrRegex: (o) => new RegExp(`^ {0,${Math.min(3, o - 1)}}((?:- *){3,}|(?:_ *){3,}|(?:\\* *){3,})(?:\\n+|$)`), fencesBeginRegex: (o) => new RegExp(`^ {0,${Math.min(3, o - 1)}}(?:\`\`\`|~~~)`), headingBeginRegex: (o) => new RegExp(`^ {0,${Math.min(3, o - 1)}}#`), htmlBeginRegex: (o) => new RegExp(`^ {0,${Math.min(3, o - 1)}}<(?:[a-z].*>|!--)`, "i") }, XS = /^(?:[ \t]*(?:\n|$))+/, QS = /^((?: {4}| {0,3}\t)[^\n]+(?:\n(?:[ \t]*(?:\n|$))*)?)+/, VS = /^ {0,3}(`{3,}(?=[^`\n]*(?:\n|$))|~{3,})([^\n]*)(?:\n|$)(?:|([\s\S]*?)(?:\n|$))(?: {0,3}\1[~`]* *(?=\n|$)|$)/, Wu = /^ {0,3}((?:-[\t ]*){3,}|(?:_[ \t]*){3,}|(?:\*[ \t]*){3,})(?:\n+|$)/, ZS = /^ {0,3}(#{1,6})(?=\s|$)(.*)(?:\n+|$)/, Fh = /(?:[*+-]|\d{1,9}[.)])/, Qy = /^(?!bull |blockCode|fences|blockquote|heading|html|table)((?:.|\n(?!\s*?\n|bull |blockCode|fences|blockquote|heading|html|table))+?)\n {0,3}(=+|-+) *(?:\n+|$)/, Vy = Ye(Qy).replace(/bull/g, Fh).replace(/blockCode/g, /(?: {4}| {0,3}\t)/).replace(/fences/g, / {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g, / {0,3}>/).replace(/heading/g, / {0,3}#{1,6}/).replace(/html/g, / {0,3}<[^\n>]+>\n/).replace(/\|table/g, "").getRegex(), KS = Ye(Qy).replace(/bull/g, Fh).replace(/blockCode/g, /(?: {4}| {0,3}\t)/).replace(/fences/g, / {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g, / {0,3}>/).replace(/heading/g, / {0,3}#{1,6}/).replace(/html/g, / {0,3}<[^\n>]+>\n/).replace(/table/g, / {0,3}\|?(?:[:\- ]*\|)+[\:\- ]*\n/).getRegex(), Wh = /^([^\n]+(?:\n(?!hr|heading|lheading|blockquote|fences|list|html|table| +\n)[^\n]+)*)/, $S = /^[^\n]+/, Ih = /(?!\s*\])(?:\\[\s\S]|[^\[\]\\])+/, JS = Ye(/^ {0,3}\[(label)\]: *(?:\n[ \t]*)?([^<\s][^\s]*|<.*?>)(?:(?: +(?:\n[ \t]*)?| *\n[ \t]*)(title))? *(?:\n+|$)/).replace("label", Ih).replace("title", /(?:"(?:\\"?|[^"\\])*"|'[^'\n]*(?:\n[^'\n]+)*\n?'|\([^()]*\))/).getRegex(), FS = Ye(/^( {0,3}bull)([ \t][^\n]+?)?(?:\n|$)/).replace(/bull/g, Fh).getRegex(), Nc = "address|article|aside|base|basefont|blockquote|body|caption|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption|figure|footer|form|frame|frameset|h[1-6]|head|header|hr|html|iframe|legend|li|link|main|menu|menuitem|meta|nav|noframes|ol|optgroup|option|p|param|search|section|summary|table|tbody|td|tfoot|th|thead|title|tr|track|ul", Ph = /<!--(?:-?>|[\s\S]*?(?:-->|$))/, WS = Ye("^ {0,3}(?:<(script|pre|style|textarea)[\\s>][\\s\\S]*?(?:</\\1>[^\\n]*\\n+|$)|comment[^\\n]*(\\n+|$)|<\\?[\\s\\S]*?(?:\\?>\\n*|$)|<![A-Z][\\s\\S]*?(?:>\\n*|$)|<!\\[CDATA\\[[\\s\\S]*?(?:\\]\\]>\\n*|$)|</?(tag)(?: +|\\n|/?>)[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$)|<(?!script|pre|style|textarea)([a-z][\\w-]*)(?:attribute)*? */?>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$)|</(?!script|pre|style|textarea)[a-z][\\w-]*\\s*>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$))", "i").replace("comment", Ph).replace("tag", Nc).replace("attribute", / +[a-zA-Z:_][\w.:-]*(?: *= *"[^"\n]*"| *= *'[^'\n]*'| *= *[^\s"'=<>`]+)?/).getRegex(), Zy = Ye(Wh).replace("hr", Wu).replace("heading", " {0,3}#{1,6}(?:\\s|$)").replace("|lheading", "").replace("|table", "").replace("blockquote", " {0,3}>").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list", " {0,3}(?:[*+-]|1[.)]) ").replace("html", "</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag", Nc).getRegex(), IS = Ye(/^( {0,3}> ?(paragraph|[^\n]*)(?:\n|$))+/).replace("paragraph", Zy).getRegex(), ed = { blockquote: IS, code: QS, def: JS, fences: VS, heading: ZS, hr: Wu, html: WS, lheading: Vy, list: FS, newline: XS, paragraph: Zy, table: Hu, text: $S }, v0 = Ye("^ *([^\\n ].*)\\n {0,3}((?:\\| *)?:?-+:? *(?:\\| *:?-+:? *)*(?:\\| *)?)(?:\\n((?:(?! *\\n|hr|heading|blockquote|code|fences|list|html).*(?:\\n|$))*)\\n*|$)").replace("hr", Wu).replace("heading", " {0,3}#{1,6}(?:\\s|$)").replace("blockquote", " {0,3}>").replace("code", "(?: {4}| {0,3}	)[^\\n]").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list", " {0,3}(?:[*+-]|1[.)]) ").replace("html", "</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag", Nc).getRegex(), PS = { ...ed, lheading: KS, table: v0, paragraph: Ye(Wh).replace("hr", Wu).replace("heading", " {0,3}#{1,6}(?:\\s|$)").replace("|lheading", "").replace("table", v0).replace("blockquote", " {0,3}>").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list", " {0,3}(?:[*+-]|1[.)]) ").replace("html", "</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag", Nc).getRegex() }, ex = { ...ed, html: Ye(`^ *(?:comment *(?:\\n|\\s*$)|<(tag)[\\s\\S]+?</\\1> *(?:\\n{2,}|\\s*$)|<tag(?:"[^"]*"|'[^']*'|\\s[^'"/>\\s]*)*?/?> *(?:\\n{2,}|\\s*$))`).replace("comment", Ph).replace(/tag/g, "(?!(?:a|em|strong|small|s|cite|q|dfn|abbr|data|time|code|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo|span|br|wbr|ins|del|img)\\b)\\w+(?!:|[^\\w\\s@]*@)\\b").getRegex(), def: /^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +(["(][^\n]+[")]))? *(?:\n+|$)/, heading: /^(#{1,6})(.*)(?:\n+|$)/, fences: Hu, lheading: /^(.+?)\n {0,3}(=+|-+) *(?:\n+|$)/, paragraph: Ye(Wh).replace("hr", Wu).replace("heading", ` *#{1,6} *[^
]`).replace("lheading", Vy).replace("|table", "").replace("blockquote", " {0,3}>").replace("|fences", "").replace("|list", "").replace("|html", "").replace("|tag", "").getRegex() }, tx = /^\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/, nx = /^(`+)([^`]|[^`][\s\S]*?[^`])\1(?!`)/, Ky = /^( {2,}|\\)\n(?!\s*$)/, lx = /^(`+|[^`])(?:(?= {2,}\n)|[\s\S]*?(?:(?=[\\<!\[`*_]|\b_|$)|[^ ](?= {2,}\n)))/, jc = /[\p{P}\p{S}]/u, td = /[\s\p{P}\p{S}]/u, $y = /[^\s\p{P}\p{S}]/u, ax = Ye(/^((?![*_])punctSpace)/, "u").replace(/punctSpace/g, td).getRegex(), Jy = /(?!~)[\p{P}\p{S}]/u, ix = /(?!~)[\s\p{P}\p{S}]/u, rx = /(?:[^\s\p{P}\p{S}]|~)/u, ux = Ye(/link|precode-code|html/, "g").replace("link", /\[(?:[^\[\]`]|(?<a>`+)[^`]+\k<a>(?!`))*?\]\((?:\\[\s\S]|[^\\\(\)]|\((?:\\[\s\S]|[^\\\(\)])*\))*\)/).replace("precode-", GS ? "(?<!`)()" : "(^^|[^`])").replace("code", /(?<b>`+)[^`]+\k<b>(?!`)/).replace("html", /<(?! )[^<>]*?>/).getRegex(), Fy = /^(?:\*+(?:((?!\*)punct)|[^\s*]))|^_+(?:((?!_)punct)|([^\s_]))/, sx = Ye(Fy, "u").replace(/punct/g, jc).getRegex(), cx = Ye(Fy, "u").replace(/punct/g, Jy).getRegex(), Wy = "^[^_*]*?__[^_*]*?\\*[^_*]*?(?=__)|[^*]+(?=[^*])|(?!\\*)punct(\\*+)(?=[\\s]|$)|notPunctSpace(\\*+)(?!\\*)(?=punctSpace|$)|(?!\\*)punctSpace(\\*+)(?=notPunctSpace)|[\\s](\\*+)(?!\\*)(?=punct)|(?!\\*)punct(\\*+)(?!\\*)(?=punct)|notPunctSpace(\\*+)(?=notPunctSpace)", ox = Ye(Wy, "gu").replace(/notPunctSpace/g, $y).replace(/punctSpace/g, td).replace(/punct/g, jc).getRegex(), fx = Ye(Wy, "gu").replace(/notPunctSpace/g, rx).replace(/punctSpace/g, ix).replace(/punct/g, Jy).getRegex(), hx = Ye("^[^_*]*?\\*\\*[^_*]*?_[^_*]*?(?=\\*\\*)|[^_]+(?=[^_])|(?!_)punct(_+)(?=[\\s]|$)|notPunctSpace(_+)(?!_)(?=punctSpace|$)|(?!_)punctSpace(_+)(?=notPunctSpace)|[\\s](_+)(?!_)(?=punct)|(?!_)punct(_+)(?!_)(?=punct)", "gu").replace(/notPunctSpace/g, $y).replace(/punctSpace/g, td).replace(/punct/g, jc).getRegex(), dx = Ye(/\\(punct)/, "gu").replace(/punct/g, jc).getRegex(), px = Ye(/^<(scheme:[^\s\x00-\x1f<>]*|email)>/).replace("scheme", /[a-zA-Z][a-zA-Z0-9+.-]{1,31}/).replace("email", /[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+(@)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?![-_])/).getRegex(), mx = Ye(Ph).replace("(?:-->|$)", "-->").getRegex(), gx = Ye("^comment|^</[a-zA-Z][\\w:-]*\\s*>|^<[a-zA-Z][\\w-]*(?:attribute)*?\\s*/?>|^<\\?[\\s\\S]*?\\?>|^<![a-zA-Z]+\\s[\\s\\S]*?>|^<!\\[CDATA\\[[\\s\\S]*?\\]\\]>").replace("comment", mx).replace("attribute", /\s+[a-zA-Z:_][\w.:-]*(?:\s*=\s*"[^"]*"|\s*=\s*'[^']*'|\s*=\s*[^\s"'=<>`]+)?/).getRegex(), zc = /(?:\[(?:\\[\s\S]|[^\[\]\\])*\]|\\[\s\S]|`+[^`]*?`+(?!`)|[^\[\]\\`])*?/, yx = Ye(/^!?\[(label)\]\(\s*(href)(?:(?:[ \t]*(?:\n[ \t]*)?)(title))?\s*\)/).replace("label", zc).replace("href", /<(?:\\.|[^\n<>\\])+>|[^ \t\n\x00-\x1f]*/).replace("title", /"(?:\\"?|[^"\\])*"|'(?:\\'?|[^'\\])*'|\((?:\\\)?|[^)\\])*\)/).getRegex(), Iy = Ye(/^!?\[(label)\]\[(ref)\]/).replace("label", zc).replace("ref", Ih).getRegex(), Py = Ye(/^!?\[(ref)\](?:\[\])?/).replace("ref", Ih).getRegex(), _x = Ye("reflink|nolink(?!\\()", "g").replace("reflink", Iy).replace("nolink", Py).getRegex(), b0 = /[hH][tT][tT][pP][sS]?|[fF][tT][pP]/, nd = { _backpedal: Hu, anyPunctuation: dx, autolink: px, blockSkip: ux, br: Ky, code: nx, del: Hu, emStrongLDelim: sx, emStrongRDelimAst: ox, emStrongRDelimUnd: hx, escape: tx, link: yx, nolink: Py, punctuation: ax, reflink: Iy, reflinkSearch: _x, tag: gx, text: lx, url: Hu }, vx = { ...nd, link: Ye(/^!?\[(label)\]\((.*?)\)/).replace("label", zc).getRegex(), reflink: Ye(/^!?\[(label)\]\s*\[([^\]]*)\]/).replace("label", zc).getRegex() }, Eh = { ...nd, emStrongRDelimAst: fx, emStrongLDelim: cx, url: Ye(/^((?:protocol):\/\/|www\.)(?:[a-zA-Z0-9\-]+\.?)+[^\s<]*|^email/).replace("protocol", b0).replace("email", /[A-Za-z0-9._+-]+(@)[a-zA-Z0-9-_]+(?:\.[a-zA-Z0-9-_]*[a-zA-Z0-9])+(?![-_])/).getRegex(), _backpedal: /(?:[^?!.,:;*_'"~()&]+|\([^)]*\)|&(?![a-zA-Z0-9]+;$)|[?!.,:;*_'"~)]+(?!$))+/, del: /^(~~?)(?=[^\s~])((?:\\[\s\S]|[^\\])*?(?:\\[\s\S]|[^\s~\\]))\1(?=[^~]|$)/, text: Ye(/^([`~]+|[^`~])(?:(?= {2,}\n)|(?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)|[\s\S]*?(?:(?=[\\<!\[`*~_]|\b_|protocol:\/\/|www\.|$)|[^ ](?= {2,}\n)|[^a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-](?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)))/).replace("protocol", b0).getRegex() }, bx = { ...Eh, br: Ye(Ky).replace("{2,}", "*").getRegex(), text: Ye(Eh.text).replace("\\b_", "\\b_| {2,}\\n").replace(/\{2,\}/g, "*").getRegex() }, pc = { normal: ed, gfm: PS, pedantic: ex }, Eu = { normal: nd, gfm: Eh, breaks: bx, pedantic: vx }, Sx = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }, S0 = (o) => Sx[o];
function ca(o, l) {
  if (l) {
    if (pn.escapeTest.test(o)) return o.replace(pn.escapeReplace, S0);
  } else if (pn.escapeTestNoEncode.test(o)) return o.replace(pn.escapeReplaceNoEncode, S0);
  return o;
}
function x0(o) {
  try {
    o = encodeURI(o).replace(pn.percentDecode, "%");
  } catch {
    return null;
  }
  return o;
}
function T0(o, l) {
  let i = o.replace(pn.findPipe, (f, h, p) => {
    let d = !1, g = h;
    for (; --g >= 0 && p[g] === "\\"; ) d = !d;
    return d ? "|" : " |";
  }), r = i.split(pn.splitPipe), u = 0;
  if (r[0].trim() || r.shift(), r.length > 0 && !r.at(-1)?.trim() && r.pop(), l) if (r.length > l) r.splice(l);
  else for (; r.length < l; ) r.push("");
  for (; u < r.length; u++) r[u] = r[u].trim().replace(pn.slashPipe, "|");
  return r;
}
function wu(o, l, i) {
  let r = o.length;
  if (r === 0) return "";
  let u = 0;
  for (; u < r && o.charAt(r - u - 1) === l; )
    u++;
  return o.slice(0, r - u);
}
function xx(o, l) {
  if (o.indexOf(l[1]) === -1) return -1;
  let i = 0;
  for (let r = 0; r < o.length; r++) if (o[r] === "\\") r++;
  else if (o[r] === l[0]) i++;
  else if (o[r] === l[1] && (i--, i < 0)) return r;
  return i > 0 ? -2 : -1;
}
function A0(o, l, i, r, u) {
  let f = l.href, h = l.title || null, p = o[1].replace(u.other.outputLinkReplace, "$1");
  r.state.inLink = !0;
  let d = { type: o[0].charAt(0) === "!" ? "image" : "link", raw: i, href: f, title: h, text: p, tokens: r.inlineTokens(p) };
  return r.state.inLink = !1, d;
}
function Tx(o, l, i) {
  let r = o.match(i.other.indentCodeCompensation);
  if (r === null) return l;
  let u = r[1];
  return l.split(`
`).map((f) => {
    let h = f.match(i.other.beginningSpace);
    if (h === null) return f;
    let [p] = h;
    return p.length >= u.length ? f.slice(u.length) : f;
  }).join(`
`);
}
var kc = class {
  options;
  rules;
  lexer;
  constructor(o) {
    this.options = o || ji;
  }
  space(o) {
    let l = this.rules.block.newline.exec(o);
    if (l && l[0].length > 0) return { type: "space", raw: l[0] };
  }
  code(o) {
    let l = this.rules.block.code.exec(o);
    if (l) {
      let i = l[0].replace(this.rules.other.codeRemoveIndent, "");
      return { type: "code", raw: l[0], codeBlockStyle: "indented", text: this.options.pedantic ? i : wu(i, `
`) };
    }
  }
  fences(o) {
    let l = this.rules.block.fences.exec(o);
    if (l) {
      let i = l[0], r = Tx(i, l[3] || "", this.rules);
      return { type: "code", raw: i, lang: l[2] ? l[2].trim().replace(this.rules.inline.anyPunctuation, "$1") : l[2], text: r };
    }
  }
  heading(o) {
    let l = this.rules.block.heading.exec(o);
    if (l) {
      let i = l[2].trim();
      if (this.rules.other.endingHash.test(i)) {
        let r = wu(i, "#");
        (this.options.pedantic || !r || this.rules.other.endingSpaceChar.test(r)) && (i = r.trim());
      }
      return { type: "heading", raw: l[0], depth: l[1].length, text: i, tokens: this.lexer.inline(i) };
    }
  }
  hr(o) {
    let l = this.rules.block.hr.exec(o);
    if (l) return { type: "hr", raw: wu(l[0], `
`) };
  }
  blockquote(o) {
    let l = this.rules.block.blockquote.exec(o);
    if (l) {
      let i = wu(l[0], `
`).split(`
`), r = "", u = "", f = [];
      for (; i.length > 0; ) {
        let h = !1, p = [], d;
        for (d = 0; d < i.length; d++) if (this.rules.other.blockquoteStart.test(i[d])) p.push(i[d]), h = !0;
        else if (!h) p.push(i[d]);
        else break;
        i = i.slice(d);
        let g = p.join(`
`), y = g.replace(this.rules.other.blockquoteSetextReplace, `
    $1`).replace(this.rules.other.blockquoteSetextReplace2, "");
        r = r ? `${r}
${g}` : g, u = u ? `${u}
${y}` : y;
        let S = this.lexer.state.top;
        if (this.lexer.state.top = !0, this.lexer.blockTokens(y, f, !0), this.lexer.state.top = S, i.length === 0) break;
        let E = f.at(-1);
        if (E?.type === "code") break;
        if (E?.type === "blockquote") {
          let b = E, R = b.raw + `
` + i.join(`
`), A = this.blockquote(R);
          f[f.length - 1] = A, r = r.substring(0, r.length - b.raw.length) + A.raw, u = u.substring(0, u.length - b.text.length) + A.text;
          break;
        } else if (E?.type === "list") {
          let b = E, R = b.raw + `
` + i.join(`
`), A = this.list(R);
          f[f.length - 1] = A, r = r.substring(0, r.length - E.raw.length) + A.raw, u = u.substring(0, u.length - b.raw.length) + A.raw, i = R.substring(f.at(-1).raw.length).split(`
`);
          continue;
        }
      }
      return { type: "blockquote", raw: r, tokens: f, text: u };
    }
  }
  list(o) {
    let l = this.rules.block.list.exec(o);
    if (l) {
      let i = l[1].trim(), r = i.length > 1, u = { type: "list", raw: "", ordered: r, start: r ? +i.slice(0, -1) : "", loose: !1, items: [] };
      i = r ? `\\d{1,9}\\${i.slice(-1)}` : `\\${i}`, this.options.pedantic && (i = r ? i : "[*+-]");
      let f = this.rules.other.listItemRegex(i), h = !1;
      for (; o; ) {
        let d = !1, g = "", y = "";
        if (!(l = f.exec(o)) || this.rules.block.hr.test(o)) break;
        g = l[0], o = o.substring(g.length);
        let S = l[2].split(`
`, 1)[0].replace(this.rules.other.listReplaceTabs, (A) => " ".repeat(3 * A.length)), E = o.split(`
`, 1)[0], b = !S.trim(), R = 0;
        if (this.options.pedantic ? (R = 2, y = S.trimStart()) : b ? R = l[1].length + 1 : (R = l[2].search(this.rules.other.nonSpaceChar), R = R > 4 ? 1 : R, y = S.slice(R), R += l[1].length), b && this.rules.other.blankLine.test(E) && (g += E + `
`, o = o.substring(E.length + 1), d = !0), !d) {
          let A = this.rules.other.nextBulletRegex(R), C = this.rules.other.hrRegex(R), j = this.rules.other.fencesBeginRegex(R), K = this.rules.other.headingBeginRegex(R), H = this.rules.other.htmlBeginRegex(R);
          for (; o; ) {
            let F = o.split(`
`, 1)[0], q;
            if (E = F, this.options.pedantic ? (E = E.replace(this.rules.other.listReplaceNesting, "  "), q = E) : q = E.replace(this.rules.other.tabCharGlobal, "    "), j.test(E) || K.test(E) || H.test(E) || A.test(E) || C.test(E)) break;
            if (q.search(this.rules.other.nonSpaceChar) >= R || !E.trim()) y += `
` + q.slice(R);
            else {
              if (b || S.replace(this.rules.other.tabCharGlobal, "    ").search(this.rules.other.nonSpaceChar) >= 4 || j.test(S) || K.test(S) || C.test(S)) break;
              y += `
` + E;
            }
            !b && !E.trim() && (b = !0), g += F + `
`, o = o.substring(F.length + 1), S = q.slice(R);
          }
        }
        u.loose || (h ? u.loose = !0 : this.rules.other.doubleBlankLine.test(g) && (h = !0)), u.items.push({ type: "list_item", raw: g, task: !!this.options.gfm && this.rules.other.listIsTask.test(y), loose: !1, text: y, tokens: [] }), u.raw += g;
      }
      let p = u.items.at(-1);
      if (p) p.raw = p.raw.trimEnd(), p.text = p.text.trimEnd();
      else return;
      u.raw = u.raw.trimEnd();
      for (let d of u.items) {
        if (this.lexer.state.top = !1, d.tokens = this.lexer.blockTokens(d.text, []), d.task) {
          if (d.text = d.text.replace(this.rules.other.listReplaceTask, ""), d.tokens[0]?.type === "text" || d.tokens[0]?.type === "paragraph") {
            d.tokens[0].raw = d.tokens[0].raw.replace(this.rules.other.listReplaceTask, ""), d.tokens[0].text = d.tokens[0].text.replace(this.rules.other.listReplaceTask, "");
            for (let y = this.lexer.inlineQueue.length - 1; y >= 0; y--) if (this.rules.other.listIsTask.test(this.lexer.inlineQueue[y].src)) {
              this.lexer.inlineQueue[y].src = this.lexer.inlineQueue[y].src.replace(this.rules.other.listReplaceTask, "");
              break;
            }
          }
          let g = this.rules.other.listTaskCheckbox.exec(d.raw);
          if (g) {
            let y = { type: "checkbox", raw: g[0] + " ", checked: g[0] !== "[ ]" };
            d.checked = y.checked, u.loose ? d.tokens[0] && ["paragraph", "text"].includes(d.tokens[0].type) && "tokens" in d.tokens[0] && d.tokens[0].tokens ? (d.tokens[0].raw = y.raw + d.tokens[0].raw, d.tokens[0].text = y.raw + d.tokens[0].text, d.tokens[0].tokens.unshift(y)) : d.tokens.unshift({ type: "paragraph", raw: y.raw, text: y.raw, tokens: [y] }) : d.tokens.unshift(y);
          }
        }
        if (!u.loose) {
          let g = d.tokens.filter((S) => S.type === "space"), y = g.length > 0 && g.some((S) => this.rules.other.anyLine.test(S.raw));
          u.loose = y;
        }
      }
      if (u.loose) for (let d of u.items) {
        d.loose = !0;
        for (let g of d.tokens) g.type === "text" && (g.type = "paragraph");
      }
      return u;
    }
  }
  html(o) {
    let l = this.rules.block.html.exec(o);
    if (l) return { type: "html", block: !0, raw: l[0], pre: l[1] === "pre" || l[1] === "script" || l[1] === "style", text: l[0] };
  }
  def(o) {
    let l = this.rules.block.def.exec(o);
    if (l) {
      let i = l[1].toLowerCase().replace(this.rules.other.multipleSpaceGlobal, " "), r = l[2] ? l[2].replace(this.rules.other.hrefBrackets, "$1").replace(this.rules.inline.anyPunctuation, "$1") : "", u = l[3] ? l[3].substring(1, l[3].length - 1).replace(this.rules.inline.anyPunctuation, "$1") : l[3];
      return { type: "def", tag: i, raw: l[0], href: r, title: u };
    }
  }
  table(o) {
    let l = this.rules.block.table.exec(o);
    if (!l || !this.rules.other.tableDelimiter.test(l[2])) return;
    let i = T0(l[1]), r = l[2].replace(this.rules.other.tableAlignChars, "").split("|"), u = l[3]?.trim() ? l[3].replace(this.rules.other.tableRowBlankLine, "").split(`
`) : [], f = { type: "table", raw: l[0], header: [], align: [], rows: [] };
    if (i.length === r.length) {
      for (let h of r) this.rules.other.tableAlignRight.test(h) ? f.align.push("right") : this.rules.other.tableAlignCenter.test(h) ? f.align.push("center") : this.rules.other.tableAlignLeft.test(h) ? f.align.push("left") : f.align.push(null);
      for (let h = 0; h < i.length; h++) f.header.push({ text: i[h], tokens: this.lexer.inline(i[h]), header: !0, align: f.align[h] });
      for (let h of u) f.rows.push(T0(h, f.header.length).map((p, d) => ({ text: p, tokens: this.lexer.inline(p), header: !1, align: f.align[d] })));
      return f;
    }
  }
  lheading(o) {
    let l = this.rules.block.lheading.exec(o);
    if (l) return { type: "heading", raw: l[0], depth: l[2].charAt(0) === "=" ? 1 : 2, text: l[1], tokens: this.lexer.inline(l[1]) };
  }
  paragraph(o) {
    let l = this.rules.block.paragraph.exec(o);
    if (l) {
      let i = l[1].charAt(l[1].length - 1) === `
` ? l[1].slice(0, -1) : l[1];
      return { type: "paragraph", raw: l[0], text: i, tokens: this.lexer.inline(i) };
    }
  }
  text(o) {
    let l = this.rules.block.text.exec(o);
    if (l) return { type: "text", raw: l[0], text: l[0], tokens: this.lexer.inline(l[0]) };
  }
  escape(o) {
    let l = this.rules.inline.escape.exec(o);
    if (l) return { type: "escape", raw: l[0], text: l[1] };
  }
  tag(o) {
    let l = this.rules.inline.tag.exec(o);
    if (l) return !this.lexer.state.inLink && this.rules.other.startATag.test(l[0]) ? this.lexer.state.inLink = !0 : this.lexer.state.inLink && this.rules.other.endATag.test(l[0]) && (this.lexer.state.inLink = !1), !this.lexer.state.inRawBlock && this.rules.other.startPreScriptTag.test(l[0]) ? this.lexer.state.inRawBlock = !0 : this.lexer.state.inRawBlock && this.rules.other.endPreScriptTag.test(l[0]) && (this.lexer.state.inRawBlock = !1), { type: "html", raw: l[0], inLink: this.lexer.state.inLink, inRawBlock: this.lexer.state.inRawBlock, block: !1, text: l[0] };
  }
  link(o) {
    let l = this.rules.inline.link.exec(o);
    if (l) {
      let i = l[2].trim();
      if (!this.options.pedantic && this.rules.other.startAngleBracket.test(i)) {
        if (!this.rules.other.endAngleBracket.test(i)) return;
        let f = wu(i.slice(0, -1), "\\");
        if ((i.length - f.length) % 2 === 0) return;
      } else {
        let f = xx(l[2], "()");
        if (f === -2) return;
        if (f > -1) {
          let h = (l[0].indexOf("!") === 0 ? 5 : 4) + l[1].length + f;
          l[2] = l[2].substring(0, f), l[0] = l[0].substring(0, h).trim(), l[3] = "";
        }
      }
      let r = l[2], u = "";
      if (this.options.pedantic) {
        let f = this.rules.other.pedanticHrefTitle.exec(r);
        f && (r = f[1], u = f[3]);
      } else u = l[3] ? l[3].slice(1, -1) : "";
      return r = r.trim(), this.rules.other.startAngleBracket.test(r) && (this.options.pedantic && !this.rules.other.endAngleBracket.test(i) ? r = r.slice(1) : r = r.slice(1, -1)), A0(l, { href: r && r.replace(this.rules.inline.anyPunctuation, "$1"), title: u && u.replace(this.rules.inline.anyPunctuation, "$1") }, l[0], this.lexer, this.rules);
    }
  }
  reflink(o, l) {
    let i;
    if ((i = this.rules.inline.reflink.exec(o)) || (i = this.rules.inline.nolink.exec(o))) {
      let r = (i[2] || i[1]).replace(this.rules.other.multipleSpaceGlobal, " "), u = l[r.toLowerCase()];
      if (!u) {
        let f = i[0].charAt(0);
        return { type: "text", raw: f, text: f };
      }
      return A0(i, u, i[0], this.lexer, this.rules);
    }
  }
  emStrong(o, l, i = "") {
    let r = this.rules.inline.emStrongLDelim.exec(o);
    if (!(!r || r[3] && i.match(this.rules.other.unicodeAlphaNumeric)) && (!(r[1] || r[2]) || !i || this.rules.inline.punctuation.exec(i))) {
      let u = [...r[0]].length - 1, f, h, p = u, d = 0, g = r[0][0] === "*" ? this.rules.inline.emStrongRDelimAst : this.rules.inline.emStrongRDelimUnd;
      for (g.lastIndex = 0, l = l.slice(-1 * o.length + u); (r = g.exec(l)) != null; ) {
        if (f = r[1] || r[2] || r[3] || r[4] || r[5] || r[6], !f) continue;
        if (h = [...f].length, r[3] || r[4]) {
          p += h;
          continue;
        } else if ((r[5] || r[6]) && u % 3 && !((u + h) % 3)) {
          d += h;
          continue;
        }
        if (p -= h, p > 0) continue;
        h = Math.min(h, h + p + d);
        let y = [...r[0]][0].length, S = o.slice(0, u + r.index + y + h);
        if (Math.min(u, h) % 2) {
          let b = S.slice(1, -1);
          return { type: "em", raw: S, text: b, tokens: this.lexer.inlineTokens(b) };
        }
        let E = S.slice(2, -2);
        return { type: "strong", raw: S, text: E, tokens: this.lexer.inlineTokens(E) };
      }
    }
  }
  codespan(o) {
    let l = this.rules.inline.code.exec(o);
    if (l) {
      let i = l[2].replace(this.rules.other.newLineCharGlobal, " "), r = this.rules.other.nonSpaceChar.test(i), u = this.rules.other.startingSpaceChar.test(i) && this.rules.other.endingSpaceChar.test(i);
      return r && u && (i = i.substring(1, i.length - 1)), { type: "codespan", raw: l[0], text: i };
    }
  }
  br(o) {
    let l = this.rules.inline.br.exec(o);
    if (l) return { type: "br", raw: l[0] };
  }
  del(o) {
    let l = this.rules.inline.del.exec(o);
    if (l) return { type: "del", raw: l[0], text: l[2], tokens: this.lexer.inlineTokens(l[2]) };
  }
  autolink(o) {
    let l = this.rules.inline.autolink.exec(o);
    if (l) {
      let i, r;
      return l[2] === "@" ? (i = l[1], r = "mailto:" + i) : (i = l[1], r = i), { type: "link", raw: l[0], text: i, href: r, tokens: [{ type: "text", raw: i, text: i }] };
    }
  }
  url(o) {
    let l;
    if (l = this.rules.inline.url.exec(o)) {
      let i, r;
      if (l[2] === "@") i = l[0], r = "mailto:" + i;
      else {
        let u;
        do
          u = l[0], l[0] = this.rules.inline._backpedal.exec(l[0])?.[0] ?? "";
        while (u !== l[0]);
        i = l[0], l[1] === "www." ? r = "http://" + l[0] : r = l[0];
      }
      return { type: "link", raw: l[0], text: i, href: r, tokens: [{ type: "text", raw: i, text: i }] };
    }
  }
  inlineText(o) {
    let l = this.rules.inline.text.exec(o);
    if (l) {
      let i = this.lexer.state.inRawBlock;
      return { type: "text", raw: l[0], text: l[0], escaped: i };
    }
  }
}, Tl = class wh {
  tokens;
  options;
  state;
  inlineQueue;
  tokenizer;
  constructor(l) {
    this.tokens = [], this.tokens.links = /* @__PURE__ */ Object.create(null), this.options = l || ji, this.options.tokenizer = this.options.tokenizer || new kc(), this.tokenizer = this.options.tokenizer, this.tokenizer.options = this.options, this.tokenizer.lexer = this, this.inlineQueue = [], this.state = { inLink: !1, inRawBlock: !1, top: !0 };
    let i = { other: pn, block: pc.normal, inline: Eu.normal };
    this.options.pedantic ? (i.block = pc.pedantic, i.inline = Eu.pedantic) : this.options.gfm && (i.block = pc.gfm, this.options.breaks ? i.inline = Eu.breaks : i.inline = Eu.gfm), this.tokenizer.rules = i;
  }
  static get rules() {
    return { block: pc, inline: Eu };
  }
  static lex(l, i) {
    return new wh(i).lex(l);
  }
  static lexInline(l, i) {
    return new wh(i).inlineTokens(l);
  }
  lex(l) {
    l = l.replace(pn.carriageReturn, `
`), this.blockTokens(l, this.tokens);
    for (let i = 0; i < this.inlineQueue.length; i++) {
      let r = this.inlineQueue[i];
      this.inlineTokens(r.src, r.tokens);
    }
    return this.inlineQueue = [], this.tokens;
  }
  blockTokens(l, i = [], r = !1) {
    for (this.options.pedantic && (l = l.replace(pn.tabCharGlobal, "    ").replace(pn.spaceLine, "")); l; ) {
      let u;
      if (this.options.extensions?.block?.some((h) => (u = h.call({ lexer: this }, l, i)) ? (l = l.substring(u.raw.length), i.push(u), !0) : !1)) continue;
      if (u = this.tokenizer.space(l)) {
        l = l.substring(u.raw.length);
        let h = i.at(-1);
        u.raw.length === 1 && h !== void 0 ? h.raw += `
` : i.push(u);
        continue;
      }
      if (u = this.tokenizer.code(l)) {
        l = l.substring(u.raw.length);
        let h = i.at(-1);
        h?.type === "paragraph" || h?.type === "text" ? (h.raw += (h.raw.endsWith(`
`) ? "" : `
`) + u.raw, h.text += `
` + u.text, this.inlineQueue.at(-1).src = h.text) : i.push(u);
        continue;
      }
      if (u = this.tokenizer.fences(l)) {
        l = l.substring(u.raw.length), i.push(u);
        continue;
      }
      if (u = this.tokenizer.heading(l)) {
        l = l.substring(u.raw.length), i.push(u);
        continue;
      }
      if (u = this.tokenizer.hr(l)) {
        l = l.substring(u.raw.length), i.push(u);
        continue;
      }
      if (u = this.tokenizer.blockquote(l)) {
        l = l.substring(u.raw.length), i.push(u);
        continue;
      }
      if (u = this.tokenizer.list(l)) {
        l = l.substring(u.raw.length), i.push(u);
        continue;
      }
      if (u = this.tokenizer.html(l)) {
        l = l.substring(u.raw.length), i.push(u);
        continue;
      }
      if (u = this.tokenizer.def(l)) {
        l = l.substring(u.raw.length);
        let h = i.at(-1);
        h?.type === "paragraph" || h?.type === "text" ? (h.raw += (h.raw.endsWith(`
`) ? "" : `
`) + u.raw, h.text += `
` + u.raw, this.inlineQueue.at(-1).src = h.text) : this.tokens.links[u.tag] || (this.tokens.links[u.tag] = { href: u.href, title: u.title }, i.push(u));
        continue;
      }
      if (u = this.tokenizer.table(l)) {
        l = l.substring(u.raw.length), i.push(u);
        continue;
      }
      if (u = this.tokenizer.lheading(l)) {
        l = l.substring(u.raw.length), i.push(u);
        continue;
      }
      let f = l;
      if (this.options.extensions?.startBlock) {
        let h = 1 / 0, p = l.slice(1), d;
        this.options.extensions.startBlock.forEach((g) => {
          d = g.call({ lexer: this }, p), typeof d == "number" && d >= 0 && (h = Math.min(h, d));
        }), h < 1 / 0 && h >= 0 && (f = l.substring(0, h + 1));
      }
      if (this.state.top && (u = this.tokenizer.paragraph(f))) {
        let h = i.at(-1);
        r && h?.type === "paragraph" ? (h.raw += (h.raw.endsWith(`
`) ? "" : `
`) + u.raw, h.text += `
` + u.text, this.inlineQueue.pop(), this.inlineQueue.at(-1).src = h.text) : i.push(u), r = f.length !== l.length, l = l.substring(u.raw.length);
        continue;
      }
      if (u = this.tokenizer.text(l)) {
        l = l.substring(u.raw.length);
        let h = i.at(-1);
        h?.type === "text" ? (h.raw += (h.raw.endsWith(`
`) ? "" : `
`) + u.raw, h.text += `
` + u.text, this.inlineQueue.pop(), this.inlineQueue.at(-1).src = h.text) : i.push(u);
        continue;
      }
      if (l) {
        let h = "Infinite loop on byte: " + l.charCodeAt(0);
        if (this.options.silent) {
          console.error(h);
          break;
        } else throw new Error(h);
      }
    }
    return this.state.top = !0, i;
  }
  inline(l, i = []) {
    return this.inlineQueue.push({ src: l, tokens: i }), i;
  }
  inlineTokens(l, i = []) {
    let r = l, u = null;
    if (this.tokens.links) {
      let d = Object.keys(this.tokens.links);
      if (d.length > 0) for (; (u = this.tokenizer.rules.inline.reflinkSearch.exec(r)) != null; ) d.includes(u[0].slice(u[0].lastIndexOf("[") + 1, -1)) && (r = r.slice(0, u.index) + "[" + "a".repeat(u[0].length - 2) + "]" + r.slice(this.tokenizer.rules.inline.reflinkSearch.lastIndex));
    }
    for (; (u = this.tokenizer.rules.inline.anyPunctuation.exec(r)) != null; ) r = r.slice(0, u.index) + "++" + r.slice(this.tokenizer.rules.inline.anyPunctuation.lastIndex);
    let f;
    for (; (u = this.tokenizer.rules.inline.blockSkip.exec(r)) != null; ) f = u[2] ? u[2].length : 0, r = r.slice(0, u.index + f) + "[" + "a".repeat(u[0].length - f - 2) + "]" + r.slice(this.tokenizer.rules.inline.blockSkip.lastIndex);
    r = this.options.hooks?.emStrongMask?.call({ lexer: this }, r) ?? r;
    let h = !1, p = "";
    for (; l; ) {
      h || (p = ""), h = !1;
      let d;
      if (this.options.extensions?.inline?.some((y) => (d = y.call({ lexer: this }, l, i)) ? (l = l.substring(d.raw.length), i.push(d), !0) : !1)) continue;
      if (d = this.tokenizer.escape(l)) {
        l = l.substring(d.raw.length), i.push(d);
        continue;
      }
      if (d = this.tokenizer.tag(l)) {
        l = l.substring(d.raw.length), i.push(d);
        continue;
      }
      if (d = this.tokenizer.link(l)) {
        l = l.substring(d.raw.length), i.push(d);
        continue;
      }
      if (d = this.tokenizer.reflink(l, this.tokens.links)) {
        l = l.substring(d.raw.length);
        let y = i.at(-1);
        d.type === "text" && y?.type === "text" ? (y.raw += d.raw, y.text += d.text) : i.push(d);
        continue;
      }
      if (d = this.tokenizer.emStrong(l, r, p)) {
        l = l.substring(d.raw.length), i.push(d);
        continue;
      }
      if (d = this.tokenizer.codespan(l)) {
        l = l.substring(d.raw.length), i.push(d);
        continue;
      }
      if (d = this.tokenizer.br(l)) {
        l = l.substring(d.raw.length), i.push(d);
        continue;
      }
      if (d = this.tokenizer.del(l)) {
        l = l.substring(d.raw.length), i.push(d);
        continue;
      }
      if (d = this.tokenizer.autolink(l)) {
        l = l.substring(d.raw.length), i.push(d);
        continue;
      }
      if (!this.state.inLink && (d = this.tokenizer.url(l))) {
        l = l.substring(d.raw.length), i.push(d);
        continue;
      }
      let g = l;
      if (this.options.extensions?.startInline) {
        let y = 1 / 0, S = l.slice(1), E;
        this.options.extensions.startInline.forEach((b) => {
          E = b.call({ lexer: this }, S), typeof E == "number" && E >= 0 && (y = Math.min(y, E));
        }), y < 1 / 0 && y >= 0 && (g = l.substring(0, y + 1));
      }
      if (d = this.tokenizer.inlineText(g)) {
        l = l.substring(d.raw.length), d.raw.slice(-1) !== "_" && (p = d.raw.slice(-1)), h = !0;
        let y = i.at(-1);
        y?.type === "text" ? (y.raw += d.raw, y.text += d.text) : i.push(d);
        continue;
      }
      if (l) {
        let y = "Infinite loop on byte: " + l.charCodeAt(0);
        if (this.options.silent) {
          console.error(y);
          break;
        } else throw new Error(y);
      }
    }
    return i;
  }
}, Oc = class {
  options;
  parser;
  constructor(o) {
    this.options = o || ji;
  }
  space(o) {
    return "";
  }
  code({ text: o, lang: l, escaped: i }) {
    let r = (l || "").match(pn.notSpaceStart)?.[0], u = o.replace(pn.endingNewline, "") + `
`;
    return r ? '<pre><code class="language-' + ca(r) + '">' + (i ? u : ca(u, !0)) + `</code></pre>
` : "<pre><code>" + (i ? u : ca(u, !0)) + `</code></pre>
`;
  }
  blockquote({ tokens: o }) {
    return `<blockquote>
${this.parser.parse(o)}</blockquote>
`;
  }
  html({ text: o }) {
    return o;
  }
  def(o) {
    return "";
  }
  heading({ tokens: o, depth: l }) {
    return `<h${l}>${this.parser.parseInline(o)}</h${l}>
`;
  }
  hr(o) {
    return `<hr>
`;
  }
  list(o) {
    let l = o.ordered, i = o.start, r = "";
    for (let h = 0; h < o.items.length; h++) {
      let p = o.items[h];
      r += this.listitem(p);
    }
    let u = l ? "ol" : "ul", f = l && i !== 1 ? ' start="' + i + '"' : "";
    return "<" + u + f + `>
` + r + "</" + u + `>
`;
  }
  listitem(o) {
    return `<li>${this.parser.parse(o.tokens)}</li>
`;
  }
  checkbox({ checked: o }) {
    return "<input " + (o ? 'checked="" ' : "") + 'disabled="" type="checkbox"> ';
  }
  paragraph({ tokens: o }) {
    return `<p>${this.parser.parseInline(o)}</p>
`;
  }
  table(o) {
    let l = "", i = "";
    for (let u = 0; u < o.header.length; u++) i += this.tablecell(o.header[u]);
    l += this.tablerow({ text: i });
    let r = "";
    for (let u = 0; u < o.rows.length; u++) {
      let f = o.rows[u];
      i = "";
      for (let h = 0; h < f.length; h++) i += this.tablecell(f[h]);
      r += this.tablerow({ text: i });
    }
    return r && (r = `<tbody>${r}</tbody>`), `<table>
<thead>
` + l + `</thead>
` + r + `</table>
`;
  }
  tablerow({ text: o }) {
    return `<tr>
${o}</tr>
`;
  }
  tablecell(o) {
    let l = this.parser.parseInline(o.tokens), i = o.header ? "th" : "td";
    return (o.align ? `<${i} align="${o.align}">` : `<${i}>`) + l + `</${i}>
`;
  }
  strong({ tokens: o }) {
    return `<strong>${this.parser.parseInline(o)}</strong>`;
  }
  em({ tokens: o }) {
    return `<em>${this.parser.parseInline(o)}</em>`;
  }
  codespan({ text: o }) {
    return `<code>${ca(o, !0)}</code>`;
  }
  br(o) {
    return "<br>";
  }
  del({ tokens: o }) {
    return `<del>${this.parser.parseInline(o)}</del>`;
  }
  link({ href: o, title: l, tokens: i }) {
    let r = this.parser.parseInline(i), u = x0(o);
    if (u === null) return r;
    o = u;
    let f = '<a href="' + o + '"';
    return l && (f += ' title="' + ca(l) + '"'), f += ">" + r + "</a>", f;
  }
  image({ href: o, title: l, text: i, tokens: r }) {
    r && (i = this.parser.parseInline(r, this.parser.textRenderer));
    let u = x0(o);
    if (u === null) return ca(i);
    o = u;
    let f = `<img src="${o}" alt="${i}"`;
    return l && (f += ` title="${ca(l)}"`), f += ">", f;
  }
  text(o) {
    return "tokens" in o && o.tokens ? this.parser.parseInline(o.tokens) : "escaped" in o && o.escaped ? o.text : ca(o.text);
  }
}, ld = class {
  strong({ text: o }) {
    return o;
  }
  em({ text: o }) {
    return o;
  }
  codespan({ text: o }) {
    return o;
  }
  del({ text: o }) {
    return o;
  }
  html({ text: o }) {
    return o;
  }
  text({ text: o }) {
    return o;
  }
  link({ text: o }) {
    return "" + o;
  }
  image({ text: o }) {
    return "" + o;
  }
  br() {
    return "";
  }
  checkbox({ raw: o }) {
    return o;
  }
}, Al = class zh {
  options;
  renderer;
  textRenderer;
  constructor(l) {
    this.options = l || ji, this.options.renderer = this.options.renderer || new Oc(), this.renderer = this.options.renderer, this.renderer.options = this.options, this.renderer.parser = this, this.textRenderer = new ld();
  }
  static parse(l, i) {
    return new zh(i).parse(l);
  }
  static parseInline(l, i) {
    return new zh(i).parseInline(l);
  }
  parse(l) {
    let i = "";
    for (let r = 0; r < l.length; r++) {
      let u = l[r];
      if (this.options.extensions?.renderers?.[u.type]) {
        let h = u, p = this.options.extensions.renderers[h.type].call({ parser: this }, h);
        if (p !== !1 || !["space", "hr", "heading", "code", "table", "blockquote", "list", "html", "def", "paragraph", "text"].includes(h.type)) {
          i += p || "";
          continue;
        }
      }
      let f = u;
      switch (f.type) {
        case "space": {
          i += this.renderer.space(f);
          break;
        }
        case "hr": {
          i += this.renderer.hr(f);
          break;
        }
        case "heading": {
          i += this.renderer.heading(f);
          break;
        }
        case "code": {
          i += this.renderer.code(f);
          break;
        }
        case "table": {
          i += this.renderer.table(f);
          break;
        }
        case "blockquote": {
          i += this.renderer.blockquote(f);
          break;
        }
        case "list": {
          i += this.renderer.list(f);
          break;
        }
        case "checkbox": {
          i += this.renderer.checkbox(f);
          break;
        }
        case "html": {
          i += this.renderer.html(f);
          break;
        }
        case "def": {
          i += this.renderer.def(f);
          break;
        }
        case "paragraph": {
          i += this.renderer.paragraph(f);
          break;
        }
        case "text": {
          i += this.renderer.text(f);
          break;
        }
        default: {
          let h = 'Token with "' + f.type + '" type was not found.';
          if (this.options.silent) return console.error(h), "";
          throw new Error(h);
        }
      }
    }
    return i;
  }
  parseInline(l, i = this.renderer) {
    let r = "";
    for (let u = 0; u < l.length; u++) {
      let f = l[u];
      if (this.options.extensions?.renderers?.[f.type]) {
        let p = this.options.extensions.renderers[f.type].call({ parser: this }, f);
        if (p !== !1 || !["escape", "html", "link", "image", "strong", "em", "codespan", "br", "del", "text"].includes(f.type)) {
          r += p || "";
          continue;
        }
      }
      let h = f;
      switch (h.type) {
        case "escape": {
          r += i.text(h);
          break;
        }
        case "html": {
          r += i.html(h);
          break;
        }
        case "link": {
          r += i.link(h);
          break;
        }
        case "image": {
          r += i.image(h);
          break;
        }
        case "checkbox": {
          r += i.checkbox(h);
          break;
        }
        case "strong": {
          r += i.strong(h);
          break;
        }
        case "em": {
          r += i.em(h);
          break;
        }
        case "codespan": {
          r += i.codespan(h);
          break;
        }
        case "br": {
          r += i.br(h);
          break;
        }
        case "del": {
          r += i.del(h);
          break;
        }
        case "text": {
          r += i.text(h);
          break;
        }
        default: {
          let p = 'Token with "' + h.type + '" type was not found.';
          if (this.options.silent) return console.error(p), "";
          throw new Error(p);
        }
      }
    }
    return r;
  }
}, Du = class {
  options;
  block;
  constructor(o) {
    this.options = o || ji;
  }
  static passThroughHooks = /* @__PURE__ */ new Set(["preprocess", "postprocess", "processAllTokens", "emStrongMask"]);
  static passThroughHooksRespectAsync = /* @__PURE__ */ new Set(["preprocess", "postprocess", "processAllTokens"]);
  preprocess(o) {
    return o;
  }
  postprocess(o) {
    return o;
  }
  processAllTokens(o) {
    return o;
  }
  emStrongMask(o) {
    return o;
  }
  provideLexer() {
    return this.block ? Tl.lex : Tl.lexInline;
  }
  provideParser() {
    return this.block ? Al.parse : Al.parseInline;
  }
}, Ax = class {
  defaults = Jh();
  options = this.setOptions;
  parse = this.parseMarkdown(!0);
  parseInline = this.parseMarkdown(!1);
  Parser = Al;
  Renderer = Oc;
  TextRenderer = ld;
  Lexer = Tl;
  Tokenizer = kc;
  Hooks = Du;
  constructor(...o) {
    this.use(...o);
  }
  walkTokens(o, l) {
    let i = [];
    for (let r of o) switch (i = i.concat(l.call(this, r)), r.type) {
      case "table": {
        let u = r;
        for (let f of u.header) i = i.concat(this.walkTokens(f.tokens, l));
        for (let f of u.rows) for (let h of f) i = i.concat(this.walkTokens(h.tokens, l));
        break;
      }
      case "list": {
        let u = r;
        i = i.concat(this.walkTokens(u.items, l));
        break;
      }
      default: {
        let u = r;
        this.defaults.extensions?.childTokens?.[u.type] ? this.defaults.extensions.childTokens[u.type].forEach((f) => {
          let h = u[f].flat(1 / 0);
          i = i.concat(this.walkTokens(h, l));
        }) : u.tokens && (i = i.concat(this.walkTokens(u.tokens, l)));
      }
    }
    return i;
  }
  use(...o) {
    let l = this.defaults.extensions || { renderers: {}, childTokens: {} };
    return o.forEach((i) => {
      let r = { ...i };
      if (r.async = this.defaults.async || r.async || !1, i.extensions && (i.extensions.forEach((u) => {
        if (!u.name) throw new Error("extension name required");
        if ("renderer" in u) {
          let f = l.renderers[u.name];
          f ? l.renderers[u.name] = function(...h) {
            let p = u.renderer.apply(this, h);
            return p === !1 && (p = f.apply(this, h)), p;
          } : l.renderers[u.name] = u.renderer;
        }
        if ("tokenizer" in u) {
          if (!u.level || u.level !== "block" && u.level !== "inline") throw new Error("extension level must be 'block' or 'inline'");
          let f = l[u.level];
          f ? f.unshift(u.tokenizer) : l[u.level] = [u.tokenizer], u.start && (u.level === "block" ? l.startBlock ? l.startBlock.push(u.start) : l.startBlock = [u.start] : u.level === "inline" && (l.startInline ? l.startInline.push(u.start) : l.startInline = [u.start]));
        }
        "childTokens" in u && u.childTokens && (l.childTokens[u.name] = u.childTokens);
      }), r.extensions = l), i.renderer) {
        let u = this.defaults.renderer || new Oc(this.defaults);
        for (let f in i.renderer) {
          if (!(f in u)) throw new Error(`renderer '${f}' does not exist`);
          if (["options", "parser"].includes(f)) continue;
          let h = f, p = i.renderer[h], d = u[h];
          u[h] = (...g) => {
            let y = p.apply(u, g);
            return y === !1 && (y = d.apply(u, g)), y || "";
          };
        }
        r.renderer = u;
      }
      if (i.tokenizer) {
        let u = this.defaults.tokenizer || new kc(this.defaults);
        for (let f in i.tokenizer) {
          if (!(f in u)) throw new Error(`tokenizer '${f}' does not exist`);
          if (["options", "rules", "lexer"].includes(f)) continue;
          let h = f, p = i.tokenizer[h], d = u[h];
          u[h] = (...g) => {
            let y = p.apply(u, g);
            return y === !1 && (y = d.apply(u, g)), y;
          };
        }
        r.tokenizer = u;
      }
      if (i.hooks) {
        let u = this.defaults.hooks || new Du();
        for (let f in i.hooks) {
          if (!(f in u)) throw new Error(`hook '${f}' does not exist`);
          if (["options", "block"].includes(f)) continue;
          let h = f, p = i.hooks[h], d = u[h];
          Du.passThroughHooks.has(f) ? u[h] = (g) => {
            if (this.defaults.async && Du.passThroughHooksRespectAsync.has(f)) return (async () => {
              let S = await p.call(u, g);
              return d.call(u, S);
            })();
            let y = p.call(u, g);
            return d.call(u, y);
          } : u[h] = (...g) => {
            if (this.defaults.async) return (async () => {
              let S = await p.apply(u, g);
              return S === !1 && (S = await d.apply(u, g)), S;
            })();
            let y = p.apply(u, g);
            return y === !1 && (y = d.apply(u, g)), y;
          };
        }
        r.hooks = u;
      }
      if (i.walkTokens) {
        let u = this.defaults.walkTokens, f = i.walkTokens;
        r.walkTokens = function(h) {
          let p = [];
          return p.push(f.call(this, h)), u && (p = p.concat(u.call(this, h))), p;
        };
      }
      this.defaults = { ...this.defaults, ...r };
    }), this;
  }
  setOptions(o) {
    return this.defaults = { ...this.defaults, ...o }, this;
  }
  lexer(o, l) {
    return Tl.lex(o, l ?? this.defaults);
  }
  parser(o, l) {
    return Al.parse(o, l ?? this.defaults);
  }
  parseMarkdown(o) {
    return (l, i) => {
      let r = { ...i }, u = { ...this.defaults, ...r }, f = this.onError(!!u.silent, !!u.async);
      if (this.defaults.async === !0 && r.async === !1) return f(new Error("marked(): The async option was set to true by an extension. Remove async: false from the parse options object to return a Promise."));
      if (typeof l > "u" || l === null) return f(new Error("marked(): input parameter is undefined or null"));
      if (typeof l != "string") return f(new Error("marked(): input parameter is of type " + Object.prototype.toString.call(l) + ", string expected"));
      if (u.hooks && (u.hooks.options = u, u.hooks.block = o), u.async) return (async () => {
        let h = u.hooks ? await u.hooks.preprocess(l) : l, p = await (u.hooks ? await u.hooks.provideLexer() : o ? Tl.lex : Tl.lexInline)(h, u), d = u.hooks ? await u.hooks.processAllTokens(p) : p;
        u.walkTokens && await Promise.all(this.walkTokens(d, u.walkTokens));
        let g = await (u.hooks ? await u.hooks.provideParser() : o ? Al.parse : Al.parseInline)(d, u);
        return u.hooks ? await u.hooks.postprocess(g) : g;
      })().catch(f);
      try {
        u.hooks && (l = u.hooks.preprocess(l));
        let h = (u.hooks ? u.hooks.provideLexer() : o ? Tl.lex : Tl.lexInline)(l, u);
        u.hooks && (h = u.hooks.processAllTokens(h)), u.walkTokens && this.walkTokens(h, u.walkTokens);
        let p = (u.hooks ? u.hooks.provideParser() : o ? Al.parse : Al.parseInline)(h, u);
        return u.hooks && (p = u.hooks.postprocess(p)), p;
      } catch (h) {
        return f(h);
      }
    };
  }
  onError(o, l) {
    return (i) => {
      if (i.message += `
Please report this to https://github.com/markedjs/marked.`, o) {
        let r = "<p>An error occurred:</p><pre>" + ca(i.message + "", !0) + "</pre>";
        return l ? Promise.resolve(r) : r;
      }
      if (l) return Promise.reject(i);
      throw i;
    };
  }
}, Di = new Ax();
function Je(o, l) {
  return Di.parse(o, l);
}
Je.options = Je.setOptions = function(o) {
  return Di.setOptions(o), Je.defaults = Di.defaults, Xy(Je.defaults), Je;
};
Je.getDefaults = Jh;
Je.defaults = ji;
Je.use = function(...o) {
  return Di.use(...o), Je.defaults = Di.defaults, Xy(Je.defaults), Je;
};
Je.walkTokens = function(o, l) {
  return Di.walkTokens(o, l);
};
Je.parseInline = Di.parseInline;
Je.Parser = Al;
Je.parser = Al.parse;
Je.Renderer = Oc;
Je.TextRenderer = ld;
Je.Lexer = Tl;
Je.lexer = Tl.lex;
Je.Tokenizer = kc;
Je.Hooks = Du;
Je.parse = Je;
Je.options;
Je.setOptions;
Je.use;
Je.walkTokens;
Je.parseInline;
Al.parse;
Tl.lex;
function E0(o, l) {
  (l == null || l > o.length) && (l = o.length);
  for (var i = 0, r = Array(l); i < l; i++) r[i] = o[i];
  return r;
}
function Ex(o) {
  if (Array.isArray(o)) return o;
}
function wx(o, l) {
  var i = o == null ? null : typeof Symbol < "u" && o[Symbol.iterator] || o["@@iterator"];
  if (i != null) {
    var r, u, f, h, p = [], d = !0, g = !1;
    try {
      if (f = (i = i.call(o)).next, l !== 0) for (; !(d = (r = f.call(i)).done) && (p.push(r.value), p.length !== l); d = !0) ;
    } catch (y) {
      g = !0, u = y;
    } finally {
      try {
        if (!d && i.return != null && (h = i.return(), Object(h) !== h)) return;
      } finally {
        if (g) throw u;
      }
    }
    return p;
  }
}
function zx() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function kx(o, l) {
  return Ex(o) || wx(o, l) || Ox(o, l) || zx();
}
function Ox(o, l) {
  if (o) {
    if (typeof o == "string") return E0(o, l);
    var i = {}.toString.call(o).slice(8, -1);
    return i === "Object" && o.constructor && (i = o.constructor.name), i === "Map" || i === "Set" ? Array.from(o) : i === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(i) ? E0(o, l) : void 0;
  }
}
const e_ = Object.entries, w0 = Object.setPrototypeOf, Mx = Object.isFrozen, Rx = Object.getPrototypeOf, Cx = Object.getOwnPropertyDescriptor;
let jt = Object.freeze, Gt = Object.seal, _r = Object.create, t_ = typeof Reflect < "u" && Reflect, kh = t_.apply, Oh = t_.construct;
jt || (jt = function(l) {
  return l;
});
Gt || (Gt = function(l) {
  return l;
});
kh || (kh = function(l, i) {
  for (var r = arguments.length, u = new Array(r > 2 ? r - 2 : 0), f = 2; f < r; f++)
    u[f - 2] = arguments[f];
  return l.apply(i, u);
});
Oh || (Oh = function(l) {
  for (var i = arguments.length, r = new Array(i > 1 ? i - 1 : 0), u = 1; u < i; u++)
    r[u - 1] = arguments[u];
  return new l(...r);
});
const zi = Ct(Array.prototype.forEach), Dx = Ct(Array.prototype.lastIndexOf), z0 = Ct(Array.prototype.pop), zu = Ct(Array.prototype.push), Nx = Ct(Array.prototype.splice), Ar = Array.isArray, Nu = Ct(String.prototype.toLowerCase), Pf = Ct(String.prototype.toString), k0 = Ct(String.prototype.match), ku = Ct(String.prototype.replace), O0 = Ct(String.prototype.indexOf), jx = Ct(String.prototype.trim), Ux = Ct(Number.prototype.toString), Lx = Ct(Boolean.prototype.toString), M0 = typeof BigInt > "u" ? null : Ct(BigInt.prototype.toString), R0 = typeof Symbol > "u" ? null : Ct(Symbol.prototype.toString), wn = Ct(Object.prototype.hasOwnProperty), Ou = Ct(Object.prototype.toString), ln = Ct(RegExp.prototype.test), Ei = Hx(TypeError);
function Ct(o) {
  return function(l) {
    l instanceof RegExp && (l.lastIndex = 0);
    for (var i = arguments.length, r = new Array(i > 1 ? i - 1 : 0), u = 1; u < i; u++)
      r[u - 1] = arguments[u];
    return kh(o, l, r);
  };
}
function Hx(o) {
  return function() {
    for (var l = arguments.length, i = new Array(l), r = 0; r < l; r++)
      i[r] = arguments[r];
    return Oh(o, i);
  };
}
function He(o, l) {
  let i = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : Nu;
  if (w0 && w0(o, null), !Ar(l))
    return o;
  let r = l.length;
  for (; r--; ) {
    let u = l[r];
    if (typeof u == "string") {
      const f = i(u);
      f !== u && (Mx(l) || (l[r] = f), u = f);
    }
    o[u] = !0;
  }
  return o;
}
function Bx(o) {
  for (let l = 0; l < o.length; l++)
    wn(o, l) || (o[l] = null);
  return o;
}
function Zn(o) {
  const l = _r(null);
  for (const r of e_(o)) {
    var i = kx(r, 2);
    const u = i[0], f = i[1];
    wn(o, u) && (Ar(f) ? l[u] = Bx(f) : f && typeof f == "object" && f.constructor === Object ? l[u] = Zn(f) : l[u] = f);
  }
  return l;
}
function qx(o) {
  switch (typeof o) {
    case "string":
      return o;
    case "number":
      return Ux(o);
    case "boolean":
      return Lx(o);
    case "bigint":
      return M0 ? M0(o) : "0";
    case "symbol":
      return R0 ? R0(o) : "Symbol()";
    case "undefined":
      return Ou(o);
    case "function":
    case "object": {
      if (o === null)
        return Ou(o);
      const l = o, i = xl(l, "toString");
      if (typeof i == "function") {
        const r = i(l);
        return typeof r == "string" ? r : Ou(r);
      }
      return Ou(o);
    }
    default:
      return Ou(o);
  }
}
function xl(o, l) {
  for (; o !== null; ) {
    const r = Cx(o, l);
    if (r) {
      if (r.get)
        return Ct(r.get);
      if (typeof r.value == "function")
        return Ct(r.value);
    }
    o = Rx(o);
  }
  function i() {
    return null;
  }
  return i;
}
function Yx(o) {
  try {
    return ln(o, ""), !0;
  } catch {
    return !1;
  }
}
const C0 = jt(["a", "abbr", "acronym", "address", "area", "article", "aside", "audio", "b", "bdi", "bdo", "big", "blink", "blockquote", "body", "br", "button", "canvas", "caption", "center", "cite", "code", "col", "colgroup", "content", "data", "datalist", "dd", "decorator", "del", "details", "dfn", "dialog", "dir", "div", "dl", "dt", "element", "em", "fieldset", "figcaption", "figure", "font", "footer", "form", "h1", "h2", "h3", "h4", "h5", "h6", "head", "header", "hgroup", "hr", "html", "i", "img", "input", "ins", "kbd", "label", "legend", "li", "main", "map", "mark", "marquee", "menu", "menuitem", "meter", "nav", "nobr", "ol", "optgroup", "option", "output", "p", "picture", "pre", "progress", "q", "rp", "rt", "ruby", "s", "samp", "search", "section", "select", "shadow", "slot", "small", "source", "spacer", "span", "strike", "strong", "style", "sub", "summary", "sup", "table", "tbody", "td", "template", "textarea", "tfoot", "th", "thead", "time", "tr", "track", "tt", "u", "ul", "var", "video", "wbr"]), eh = jt(["svg", "a", "altglyph", "altglyphdef", "altglyphitem", "animatecolor", "animatemotion", "animatetransform", "circle", "clippath", "defs", "desc", "ellipse", "enterkeyhint", "exportparts", "filter", "font", "g", "glyph", "glyphref", "hkern", "image", "inputmode", "line", "lineargradient", "marker", "mask", "metadata", "mpath", "part", "path", "pattern", "polygon", "polyline", "radialgradient", "rect", "stop", "style", "switch", "symbol", "text", "textpath", "title", "tref", "tspan", "view", "vkern"]), th = jt(["feBlend", "feColorMatrix", "feComponentTransfer", "feComposite", "feConvolveMatrix", "feDiffuseLighting", "feDisplacementMap", "feDistantLight", "feDropShadow", "feFlood", "feFuncA", "feFuncB", "feFuncG", "feFuncR", "feGaussianBlur", "feImage", "feMerge", "feMergeNode", "feMorphology", "feOffset", "fePointLight", "feSpecularLighting", "feSpotLight", "feTile", "feTurbulence"]), Gx = jt(["animate", "color-profile", "cursor", "discard", "font-face", "font-face-format", "font-face-name", "font-face-src", "font-face-uri", "foreignobject", "hatch", "hatchpath", "mesh", "meshgradient", "meshpatch", "meshrow", "missing-glyph", "script", "set", "solidcolor", "unknown", "use"]), nh = jt(["math", "menclose", "merror", "mfenced", "mfrac", "mglyph", "mi", "mlabeledtr", "mmultiscripts", "mn", "mo", "mover", "mpadded", "mphantom", "mroot", "mrow", "ms", "mspace", "msqrt", "mstyle", "msub", "msup", "msubsup", "mtable", "mtd", "mtext", "mtr", "munder", "munderover", "mprescripts"]), Xx = jt(["maction", "maligngroup", "malignmark", "mlongdiv", "mscarries", "mscarry", "msgroup", "mstack", "msline", "msrow", "semantics", "annotation", "annotation-xml", "mprescripts", "none"]), D0 = jt(["#text"]), N0 = jt(["accept", "action", "align", "alt", "autocapitalize", "autocomplete", "autopictureinpicture", "autoplay", "background", "bgcolor", "border", "capture", "cellpadding", "cellspacing", "checked", "cite", "class", "clear", "color", "cols", "colspan", "command", "commandfor", "controls", "controlslist", "coords", "crossorigin", "datetime", "decoding", "default", "dir", "disabled", "disablepictureinpicture", "disableremoteplayback", "download", "draggable", "enctype", "enterkeyhint", "exportparts", "face", "for", "headers", "height", "hidden", "high", "href", "hreflang", "id", "inert", "inputmode", "integrity", "ismap", "kind", "label", "lang", "list", "loading", "loop", "low", "max", "maxlength", "media", "method", "min", "minlength", "multiple", "muted", "name", "nonce", "noshade", "novalidate", "nowrap", "open", "optimum", "part", "pattern", "placeholder", "playsinline", "popover", "popovertarget", "popovertargetaction", "poster", "preload", "pubdate", "radiogroup", "readonly", "rel", "required", "rev", "reversed", "role", "rows", "rowspan", "spellcheck", "scope", "selected", "shape", "size", "sizes", "slot", "span", "srclang", "start", "src", "srcset", "step", "style", "summary", "tabindex", "title", "translate", "type", "usemap", "valign", "value", "width", "wrap", "xmlns"]), lh = jt(["accent-height", "accumulate", "additive", "alignment-baseline", "amplitude", "ascent", "attributename", "attributetype", "azimuth", "basefrequency", "baseline-shift", "begin", "bias", "by", "class", "clip", "clippathunits", "clip-path", "clip-rule", "color", "color-interpolation", "color-interpolation-filters", "color-profile", "color-rendering", "cx", "cy", "d", "dx", "dy", "diffuseconstant", "direction", "display", "divisor", "dominant-baseline", "dur", "edgemode", "elevation", "end", "exponent", "fill", "fill-opacity", "fill-rule", "filter", "filterunits", "flood-color", "flood-opacity", "font-family", "font-size", "font-size-adjust", "font-stretch", "font-style", "font-variant", "font-weight", "fx", "fy", "g1", "g2", "glyph-name", "glyphref", "gradientunits", "gradienttransform", "height", "href", "id", "image-rendering", "in", "in2", "intercept", "k", "k1", "k2", "k3", "k4", "kerning", "keypoints", "keysplines", "keytimes", "lang", "lengthadjust", "letter-spacing", "kernelmatrix", "kernelunitlength", "lighting-color", "local", "marker-end", "marker-mid", "marker-start", "markerheight", "markerunits", "markerwidth", "maskcontentunits", "maskunits", "max", "mask", "mask-type", "media", "method", "mode", "min", "name", "numoctaves", "offset", "operator", "opacity", "order", "orient", "orientation", "origin", "overflow", "paint-order", "path", "pathlength", "patterncontentunits", "patterntransform", "patternunits", "pointer-events", "points", "preservealpha", "preserveaspectratio", "primitiveunits", "r", "rx", "ry", "radius", "refx", "refy", "repeatcount", "repeatdur", "restart", "result", "rotate", "scale", "seed", "shape-rendering", "slope", "specularconstant", "specularexponent", "spreadmethod", "startoffset", "stddeviation", "stitchtiles", "stop-color", "stop-opacity", "stroke-dasharray", "stroke-dashoffset", "stroke-linecap", "stroke-linejoin", "stroke-miterlimit", "stroke-opacity", "stroke", "stroke-width", "style", "surfacescale", "systemlanguage", "tabindex", "tablevalues", "targetx", "targety", "transform", "transform-origin", "text-anchor", "text-decoration", "text-orientation", "text-rendering", "textlength", "type", "u1", "u2", "unicode", "values", "vector-effect", "viewbox", "visibility", "version", "vert-adv-y", "vert-origin-x", "vert-origin-y", "width", "word-spacing", "wrap", "writing-mode", "xchannelselector", "ychannelselector", "x", "x1", "x2", "xmlns", "y", "y1", "y2", "z", "zoomandpan"]), j0 = jt(["accent", "accentunder", "align", "bevelled", "close", "columnalign", "columnlines", "columnspacing", "columnspan", "denomalign", "depth", "dir", "display", "displaystyle", "encoding", "fence", "frame", "height", "href", "id", "largeop", "length", "linethickness", "lquote", "lspace", "mathbackground", "mathcolor", "mathsize", "mathvariant", "maxsize", "minsize", "movablelimits", "notation", "numalign", "open", "rowalign", "rowlines", "rowspacing", "rowspan", "rspace", "rquote", "scriptlevel", "scriptminsize", "scriptsizemultiplier", "selection", "separator", "separators", "stretchy", "subscriptshift", "supscriptshift", "symmetric", "voffset", "width", "xmlns"]), mc = jt(["xlink:href", "xml:id", "xlink:title", "xml:space", "xmlns:xlink"]), Qx = Gt(/{{[\w\W]*|^[\w\W]*}}/g), Vx = Gt(/<%[\w\W]*|^[\w\W]*%>/g), Zx = Gt(/\${[\w\W]*/g), Kx = Gt(/^data-[\-\w.\u00B7-\uFFFF]+$/), $x = Gt(/^aria-[\-\w]+$/), U0 = Gt(
  /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp|matrix):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i
  // eslint-disable-line no-useless-escape
), Jx = Gt(/^(?:\w+script|data):/i), Fx = Gt(
  /[\u0000-\u0020\u00A0\u1680\u180E\u2000-\u2029\u205F\u3000]/g
  // eslint-disable-line no-control-regex
), Wx = Gt(/^html$/i), Ix = Gt(/^[a-z][.\w]*(-[.\w]+)+$/i), L0 = Gt(/<[/\w!]/g), H0 = Gt(/<[/\w]/g), Px = Gt(/<\/no(script|embed|frames)/i), eT = Gt(/\/>/i), Vn = {
  element: 1,
  attribute: 2,
  text: 3,
  cdataSection: 4,
  entityReference: 5,
  // Deprecated
  entityNode: 6,
  // Deprecated
  processingInstruction: 7,
  comment: 8,
  document: 9,
  documentType: 10,
  documentFragment: 11,
  notation: 12
  // Deprecated
}, n_ = ["style", "script", "xmp", "iframe", "noembed", "noframes", "plaintext", "noscript"], tT = jt(He({}, n_)), nT = (function() {
  const o = {};
  return zi(n_, (l) => {
    o[l] = Gt(new RegExp("</" + l + "(?=[\\t\\n\\f\\r />])", "i"));
  }), jt(o);
})(), lT = function() {
  return typeof window > "u" ? null : window;
}, aT = function(l, i) {
  if (typeof l != "object" || typeof l.createPolicy != "function")
    return null;
  let r = null;
  const u = "data-tt-policy-suffix";
  i && i.hasAttribute(u) && (r = i.getAttribute(u));
  const f = "dompurify" + (r ? "#" + r : "");
  try {
    return l.createPolicy(f, {
      createHTML(h) {
        return h;
      },
      createScriptURL(h) {
        return h;
      }
    });
  } catch {
    return console.warn("TrustedTypes policy " + f + " could not be created."), null;
  }
}, B0 = function() {
  return {
    afterSanitizeAttributes: [],
    afterSanitizeElements: [],
    afterSanitizeShadowDOM: [],
    beforeSanitizeAttributes: [],
    beforeSanitizeElements: [],
    beforeSanitizeShadowDOM: [],
    uponSanitizeAttribute: [],
    uponSanitizeElement: [],
    uponSanitizeShadowNode: []
  };
}, Za = function(l, i, r, u) {
  return wn(l, i) && Ar(l[i]) ? He(u.base ? Zn(u.base) : {}, l[i], u.transform) : r;
}, ah = function(l, i, r) {
  const u = wn(l, i) ? l[i] : void 0;
  return u && typeof u == "object" ? Zn(u) : r();
};
function l_() {
  let o = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : lT();
  const l = (ee) => l_(ee);
  if (l.version = "3.4.14", l.removed = [], !o || !o.document || o.document.nodeType !== Vn.document || !o.Element)
    return l.isSupported = !1, l;
  let i = o.document;
  const r = i, u = r.currentScript;
  o.DocumentFragment;
  const f = o.HTMLTemplateElement, h = o.Node, p = o.Element, d = o.NodeFilter, g = o.NamedNodeMap;
  g === void 0 && (o.NamedNodeMap || o.MozNamedAttrMap), o.HTMLFormElement;
  const y = o.DOMParser, S = o.trustedTypes, E = p.prototype, b = xl(E, "cloneNode"), R = xl(E, "remove"), A = xl(E, "nextSibling"), C = xl(E, "childNodes"), j = xl(E, "parentNode"), K = xl(E, "shadowRoot"), H = xl(E, "attributes"), F = h && h.prototype ? xl(h.prototype, "nodeType") : null, q = h && h.prototype ? xl(h.prototype, "nodeName") : null, le = h && h.prototype ? xl(h.prototype, "ownerDocument") : null, X = function(T) {
    return F ? F(T) : T.nodeType;
  }, I = function(T) {
    return q ? q(T) : T.nodeName;
  };
  if (typeof f == "function") {
    const ee = i.createElement("template");
    ee.content && ee.content.ownerDocument && (i = ee.content.ownerDocument);
  }
  let G, ce = "", be, ve = !1, _e = 0;
  const ue = function() {
    if (_e > 0)
      throw Ei('A configured TRUSTED_TYPES_POLICY callback (createHTML or createScriptURL) must not call DOMPurify.sanitize, as that causes infinite recursion. Do not pass a policy whose callbacks wrap DOMPurify as TRUSTED_TYPES_POLICY; see the "DOMPurify and Trusted Types" section of the README.');
  }, Se = function(T) {
    ue(), _e++;
    try {
      return G.createHTML(T);
    } finally {
      _e--;
    }
  }, L = function(T) {
    ue(), _e++;
    try {
      return G.createScriptURL(T);
    } finally {
      _e--;
    }
  }, Y = function() {
    return ve || (be = aT(S, u), ve = !0), be;
  }, ie = i, se = ie.implementation, ze = ie.createNodeIterator, z = ie.createDocumentFragment, V = ie.getElementsByTagName, te = r.importNode;
  let P = B0();
  l.isSupported = typeof e_ == "function" && typeof j == "function" && se && se.createHTMLDocument !== void 0;
  const pe = Qx, Ae = Vx, de = Zx, at = Kx, Qe = $x, Hl = Jx, dl = Fx, Bl = Ix;
  let ke = U0, Oe = null;
  const El = He({}, [...C0, ...eh, ...th, ...nh, ...D0]);
  let Ge = null;
  const pa = He({}, [...N0, ...lh, ...j0, ...mc]);
  let Xt = Object.seal(_r(null, {
    tagNameCheck: {
      writable: !0,
      configurable: !1,
      enumerable: !0,
      value: null
    },
    attributeNameCheck: {
      writable: !0,
      configurable: !1,
      enumerable: !0,
      value: null
    },
    allowCustomizedBuiltInElements: {
      writable: !0,
      configurable: !1,
      enumerable: !0,
      value: !1
    }
  })), Dn = null, pl = null;
  const Qt = Object.seal(_r(null, {
    tagCheck: {
      writable: !0,
      configurable: !1,
      enumerable: !0,
      value: null
    },
    attributeCheck: {
      writable: !0,
      configurable: !1,
      enumerable: !0,
      value: null
    }
  }));
  let li = !0, Nn = !0, vt = !1, ma = !0, jn = !1, mn = !0, gn = !1, Ut = !1, yn = null, wl = null, ql = !1, _n = !1, bt = !1, Vt = !1, St = !0, ga = !1;
  const Ui = "user-content-";
  let Et = !0, vn = !1, Lt = {}, tn = null;
  const un = He({}, [
    "annotation-xml",
    "audio",
    "colgroup",
    "desc",
    "foreignobject",
    "head",
    "iframe",
    "math",
    "mi",
    "mn",
    "mo",
    "ms",
    "mtext",
    "noembed",
    "noframes",
    "noscript",
    "plaintext",
    "script",
    // <selectedcontent> mirrors the selected <option>'s subtree, cloned by
    // the UA (customizable <select>) — including any on* handlers — and the
    // engine re-mirrors synchronously whenever a removal changes which
    // option/selectedcontent is current, even inside DOMPurify's inert
    // DOMParser document. Hoisting its children on removal re-inserts a fresh
    // mirror target ahead of the walk, which the engine refills, looping
    // forever (DoS) and amplifying output. Dropping its content on removal
    // (rather than hoisting) breaks that cascade; the content is a duplicate
    // of the option, which is sanitized on its own. See campaign-3 F1/F6.
    "selectedcontent",
    "style",
    "svg",
    "template",
    "thead",
    "title",
    "video",
    "xmp"
  ]);
  let ml = null;
  const Un = He({}, ["audio", "video", "img", "source", "image", "track"]);
  let ai = null;
  const ya = He({}, ["alt", "class", "for", "id", "label", "name", "pattern", "placeholder", "role", "summary", "title", "value", "style", "xmlns"]), zl = "http://www.w3.org/1998/Math/MathML", sn = "http://www.w3.org/2000/svg", Zt = "http://www.w3.org/1999/xhtml";
  let cn = Zt, Yl = !1, Gl = null;
  const Xl = He({}, [zl, sn, Zt], Pf), _a = jt(["mi", "mo", "mn", "ms", "mtext"]);
  let va = He({}, _a);
  const gl = jt(["annotation-xml"]);
  let on = He({}, gl);
  const dt = He({}, ["title", "style", "font", "a", "script"]);
  let pt = null;
  const el = ["application/xhtml+xml", "text/html"], Ql = "text/html";
  let Pe = null, x = null;
  const Q = i.createElement("form"), ne = function(T) {
    return T instanceof RegExp || T instanceof Function;
  }, Me = function() {
    let T = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    if (x && x === T)
      return;
    (!T || typeof T != "object") && (T = {}), T = Zn(T), pt = // eslint-disable-next-line unicorn/prefer-includes
    el.indexOf(T.PARSER_MEDIA_TYPE) === -1 ? Ql : T.PARSER_MEDIA_TYPE, Pe = pt === "application/xhtml+xml" ? Pf : Nu, Oe = Za(T, "ALLOWED_TAGS", El, {
      transform: Pe
    }), Ge = Za(T, "ALLOWED_ATTR", pa, {
      transform: Pe
    }), Gl = Za(T, "ALLOWED_NAMESPACES", Xl, {
      transform: Pf
    }), ai = Za(T, "ADD_URI_SAFE_ATTR", ya, {
      transform: Pe,
      base: ya
    }), ml = Za(T, "ADD_DATA_URI_TAGS", Un, {
      transform: Pe,
      base: Un
    }), tn = Za(T, "FORBID_CONTENTS", un, {
      transform: Pe
    }), Dn = Za(T, "FORBID_TAGS", Zn({}), {
      transform: Pe
    }), pl = Za(T, "FORBID_ATTR", Zn({}), {
      transform: Pe
    }), Lt = wn(T, "USE_PROFILES") ? T.USE_PROFILES && typeof T.USE_PROFILES == "object" ? Zn(T.USE_PROFILES) : T.USE_PROFILES : !1, li = T.ALLOW_ARIA_ATTR !== !1, Nn = T.ALLOW_DATA_ATTR !== !1, vt = T.ALLOW_UNKNOWN_PROTOCOLS || !1, ma = T.ALLOW_SELF_CLOSE_IN_ATTR !== !1, jn = T.SAFE_FOR_TEMPLATES || !1, mn = T.SAFE_FOR_XML !== !1, gn = T.WHOLE_DOCUMENT || !1, _n = T.RETURN_DOM || !1, bt = T.RETURN_DOM_FRAGMENT || !1, Vt = T.RETURN_TRUSTED_TYPE || !1, ql = T.FORCE_BODY || !1, St = T.SANITIZE_DOM !== !1, ga = T.SANITIZE_NAMED_PROPS || !1, Et = T.KEEP_CONTENT !== !1, vn = T.IN_PLACE || !1, ke = Yx(T.ALLOWED_URI_REGEXP) ? T.ALLOWED_URI_REGEXP : U0, cn = typeof T.NAMESPACE == "string" ? T.NAMESPACE : Zt, va = ah(
      T,
      "MATHML_TEXT_INTEGRATION_POINTS",
      () => He({}, _a)
      // Default built-in map
    ), on = ah(
      T,
      "HTML_INTEGRATION_POINTS",
      () => He({}, gl)
      // Default built-in map
    );
    const O = ah(T, "CUSTOM_ELEMENT_HANDLING", () => _r(null));
    if (Xt = _r(null), wn(O, "tagNameCheck") && ne(O.tagNameCheck) && (Xt.tagNameCheck = O.tagNameCheck), wn(O, "attributeNameCheck") && ne(O.attributeNameCheck) && (Xt.attributeNameCheck = O.attributeNameCheck), wn(O, "allowCustomizedBuiltInElements") && typeof O.allowCustomizedBuiltInElements == "boolean" && (Xt.allowCustomizedBuiltInElements = O.allowCustomizedBuiltInElements), Gt(Xt), jn && (Nn = !1), bt && (_n = !0), Lt && (Oe = He({}, D0), Ge = _r(null), Lt.html === !0 && (He(Oe, C0), He(Ge, N0)), Lt.svg === !0 && (He(Oe, eh), He(Ge, lh), He(Ge, mc)), Lt.svgFilters === !0 && (He(Oe, th), He(Ge, lh), He(Ge, mc)), Lt.mathMl === !0 && (He(Oe, nh), He(Ge, j0), He(Ge, mc))), Qt.tagCheck = null, Qt.attributeCheck = null, wn(T, "ADD_TAGS") && (typeof T.ADD_TAGS == "function" ? Qt.tagCheck = T.ADD_TAGS : Ar(T.ADD_TAGS) && (Oe === El && (Oe = Zn(Oe)), He(Oe, T.ADD_TAGS, Pe))), wn(T, "ADD_ATTR") && (typeof T.ADD_ATTR == "function" ? Qt.attributeCheck = T.ADD_ATTR : Ar(T.ADD_ATTR) && (Ge === pa && (Ge = Zn(Ge)), He(Ge, T.ADD_ATTR, Pe))), wn(T, "ADD_FORBID_CONTENTS") && Ar(T.ADD_FORBID_CONTENTS) && (tn === un && (tn = Zn(tn)), He(tn, T.ADD_FORBID_CONTENTS, Pe)), Et && (Oe["#text"] = !0), gn && He(Oe, ["html", "head", "body"]), Oe.table && (He(Oe, ["tbody"]), delete Dn.tbody), T.TRUSTED_TYPES_POLICY) {
      if (typeof T.TRUSTED_TYPES_POLICY.createHTML != "function")
        throw Ei('TRUSTED_TYPES_POLICY configuration option must provide a "createHTML" hook.');
      if (typeof T.TRUSTED_TYPES_POLICY.createScriptURL != "function")
        throw Ei('TRUSTED_TYPES_POLICY configuration option must provide a "createScriptURL" hook.');
      const W = G;
      G = T.TRUSTED_TYPES_POLICY;
      try {
        ce = Se("");
      } catch (ae) {
        throw G = W, ae;
      }
    } else T.TRUSTED_TYPES_POLICY === null ? (G = void 0, ce = "") : (G === void 0 && (G = Y()), G && typeof ce == "string" && (ce = Se("")));
    jt && jt(T), x = T;
  }, xe = He({}, [...eh, ...th, ...Gx]), Ve = He({}, [...nh, ...Xx]), Ht = function(T, O, W) {
    return O.namespaceURI === Zt ? T === "svg" : O.namespaceURI === zl ? T === "svg" && (W === "annotation-xml" || va[W]) : !!xe[T];
  }, fn = function(T, O, W) {
    return O.namespaceURI === Zt ? T === "math" : O.namespaceURI === sn ? T === "math" && on[W] : !!Ve[T];
  }, ut = function(T, O, W) {
    return O.namespaceURI === sn && !on[W] || O.namespaceURI === zl && !va[W] ? !1 : !Ve[T] && (dt[T] || !xe[T]);
  }, ba = function(T) {
    let O = j(T);
    (!O || !O.tagName) && (O = {
      namespaceURI: cn,
      tagName: "template"
    });
    const W = Nu(T.tagName), ae = Nu(O.tagName);
    return Gl[T.namespaceURI] ? T.namespaceURI === sn ? Ht(W, O, ae) : T.namespaceURI === zl ? fn(W, O, ae) : T.namespaceURI === Zt ? ut(W, O, ae) : !!(pt === "application/xhtml+xml" && Gl[T.namespaceURI]) : !1;
  }, yl = function(T) {
    zu(l.removed, {
      element: T
    });
    try {
      j(T).removeChild(T);
    } catch {
      if (R(T), !j(T))
        throw Ei("a node selected for removal could not be detached from its tree and cannot be safely returned; refusing to sanitize in place");
    }
  }, kl = function(T, O, W) {
    try {
      T.removeAttributeNode(O);
    } catch {
      try {
        T.removeAttribute(W);
      } catch {
      }
    }
  }, _l = function(T) {
    ii(T);
    const O = C(T);
    if (O) {
      const ae = [];
      zi(O, (oe) => {
        zu(ae, oe);
      }), zi(ae, (oe) => {
        try {
          R(oe);
        } catch {
        }
      });
    }
    const W = H(T);
    if (W)
      for (let ae = W.length - 1; ae >= 0; --ae) {
        const oe = W[ae], ge = oe && oe.name;
        typeof ge == "string" && kl(T, oe, ge);
      }
  }, Vl = function(T, O, W) {
    if (!W)
      try {
        W = O.getAttributeNode(T);
      } catch {
        W = null;
      }
    zu(l.removed, {
      attribute: W || null,
      from: O
    });
    try {
      W ? O.removeAttributeNode(W) : O.removeAttribute(T);
    } catch {
      try {
        O.removeAttribute(T);
      } catch {
      }
    }
    if (T === "is")
      if (_n || bt)
        try {
          yl(O);
        } catch {
        }
      else
        try {
          O.setAttribute(T, "");
        } catch {
        }
  }, Iu = function(T) {
    const O = H(T);
    if (O)
      for (let W = O.length - 1; W >= 0; --W) {
        const ae = O[W], oe = ae && ae.name;
        typeof oe != "string" || Ge[Pe(oe)] || kl(T, ae, oe);
      }
  }, ii = function(T) {
    const O = [T];
    for (; O.length > 0; ) {
      const W = O.pop();
      X(W) === Vn.element && Iu(W);
      const oe = C(W);
      if (oe)
        for (let ge = oe.length - 1; ge >= 0; --ge)
          O.push(oe[ge]);
    }
  }, Pu = function(T, O) {
    return mn ? T === "patchsrc" ? !0 : T === "for" && O !== "label" && O !== "output" : !1;
  }, Li = function(T) {
    if (!mn)
      return;
    const O = [T];
    for (; O.length > 0; ) {
      const W = O.pop(), ae = X(W);
      if (ae === Vn.processingInstruction || ae === Vn.comment && ln(H0, W.data)) {
        try {
          R(W);
        } catch {
        }
        continue;
      }
      if (ae === Vn.element) {
        const ge = W, Ze = Pe(I(W));
        try {
          ge.hasAttribute && ge.hasAttribute("patchsrc") && ge.removeAttribute("patchsrc"), ge.hasAttribute && ge.hasAttribute("for") && Pu("for", Ze) && ge.removeAttribute("for");
        } catch {
        }
      }
      const oe = C(W);
      if (oe)
        for (let ge = oe.length - 1; ge >= 0; --ge)
          O.push(oe[ge]);
    }
  }, ri = function(T) {
    let O = null, W = null;
    if (ql)
      T = "<remove></remove>" + T;
    else {
      const ge = k0(T, /^[\r\n\t ]+/);
      W = ge && ge[0];
    }
    pt === "application/xhtml+xml" && cn === Zt && (T = '<html xmlns="http://www.w3.org/1999/xhtml"><head></head><body>' + T + "</body></html>");
    const ae = G ? Se(T) : T;
    if (cn === Zt)
      try {
        O = new y().parseFromString(ae, pt);
      } catch {
      }
    if (!O || !O.documentElement) {
      O = se.createDocument(cn, "template", null);
      try {
        O.documentElement.innerHTML = Yl ? ce : ae;
      } catch {
      }
    }
    const oe = O.body || O.documentElement;
    return T && W && oe.insertBefore(i.createTextNode(W), oe.childNodes[0] || null), cn === Zt ? V.call(O, gn ? "html" : "body")[0] : gn ? O.documentElement : oe;
  }, tl = function(T) {
    const O = le ? le(T) : T.ownerDocument;
    return ze.call(
      O || T,
      T,
      // eslint-disable-next-line no-bitwise
      d.SHOW_ELEMENT | d.SHOW_COMMENT | d.SHOW_TEXT | d.SHOW_PROCESSING_INSTRUCTION | d.SHOW_CDATA_SECTION,
      null
    );
  }, Kt = function(T) {
    return T = ku(T, pe, " "), T = ku(T, Ae, " "), T = ku(T, de, " "), T;
  }, Hi = function(T) {
    var O;
    T.normalize();
    const W = le ? le(T) : T.ownerDocument, ae = ze.call(
      W || T,
      T,
      // eslint-disable-next-line no-bitwise
      d.SHOW_TEXT | d.SHOW_COMMENT | d.SHOW_CDATA_SECTION | d.SHOW_PROCESSING_INSTRUCTION,
      null
    );
    let oe = ae.nextNode();
    for (; oe; )
      oe.data = Kt(oe.data), oe = ae.nextNode();
    const ge = (O = T.querySelectorAll) === null || O === void 0 ? void 0 : O.call(T, "template");
    ge && zi(ge, (Ze) => {
      Ol(Ze.content) && Hi(Ze.content);
    });
  }, Bi = function(T) {
    const O = q ? q(T) : null;
    return typeof O != "string" || Pe(O) !== "form" ? !1 : typeof T.nodeName != "string" || typeof T.textContent != "string" || typeof T.removeChild != "function" || // Realm-safe NamedNodeMap detection: equality against the cached
    // prototype getter. Clobbered .attributes (e.g. <input name="attributes">)
    // makes the direct read diverge from the cached read; a clean form
    // (same-realm OR foreign-realm) has both reads pointing at the same
    // canonical NamedNodeMap.
    T.attributes !== H(T) || typeof T.removeAttribute != "function" || typeof T.setAttribute != "function" || typeof T.namespaceURI != "string" || typeof T.insertBefore != "function" || typeof T.hasChildNodes != "function" || // NodeType clobbering probe. Cached Node.prototype.nodeType getter
    // returns the integer 1 for any Element regardless of realm; direct
    // read on a clobbered form (e.g. <input name="nodeType">) returns
    // the named child element. Cheap addition — nodeType is read from
    // an internal slot, no serialization cost — and removes a residual
    // clobbering surface used by several mXSS / PI / comment branches
    // in _sanitizeElements that compare currentNode.nodeType directly.
    T.nodeType !== F(T) || // HTMLFormElement has [LegacyOverrideBuiltIns]: a descendant named
    // "childNodes" shadows the prototype getter. Direct reads of
    // form.childNodes from a clobbered form return the named child
    // instead of the real NodeList, so any walk that reads it directly
    // skips the form's real children. Compare the direct read to the
    // cached Node.prototype getter — when the form's named-property
    // getter intercepts the read, the two values differ and we flag
    // the form. This catches every clobbering child type (input,
    // select, etc.) regardless of whether the named child happens to
    // carry a numeric .length, which a typeof-based probe would miss
    // (e.g. HTMLSelectElement.length is a defined unsigned-long).
    T.childNodes !== C(T);
  }, Ol = function(T) {
    if (!F || typeof T != "object" || T === null)
      return !1;
    try {
      return F(T) === Vn.documentFragment;
    } catch {
      return !1;
    }
  }, Sa = function(T) {
    if (!F || typeof T != "object" || T === null)
      return !1;
    try {
      return typeof F(T) == "number";
    } catch {
      return !1;
    }
  };
  function hn(ee, T, O) {
    ee.length !== 0 && zi(ee, (W) => {
      W.call(l, T, O, x);
    });
  }
  const Uc = function(T, O) {
    return !!(mn && T.hasChildNodes() && !Sa(T.firstElementChild) && ln(L0, T.textContent) && ln(L0, T.innerHTML) || mn && T.namespaceURI === Zt && tT[O] && (Sa(T.firstElementChild) || typeof T.textContent == "string" && ln(nT[O], T.textContent)) || T.nodeType === Vn.processingInstruction || mn && T.nodeType === Vn.comment && ln(H0, T.data));
  }, $t = function(T, O) {
    if (T instanceof RegExp)
      return ln(T, O);
    if (T instanceof Function) {
      for (var W = arguments.length, ae = new Array(W > 2 ? W - 2 : 0), oe = 2; oe < W; oe++)
        ae[oe - 2] = arguments[oe];
      return !!T(O, ...ae);
    }
    return !1;
  }, Mr = function(T, O, W) {
    if (!Dn[O] && Kl(O) && $t(Xt.tagNameCheck, O))
      return !1;
    if (Et && !tn[O]) {
      const ae = j(T), oe = C(T);
      if (oe && ae) {
        const ge = oe.length;
        for (let Ze = ge - 1; Ze >= 0; --Ze) {
          const et = T === W ? b(oe[Ze], !0) : oe[Ze];
          ae.insertBefore(et, A(T));
        }
      }
    }
    return yl(T), !0;
  }, Rr = function(T, O, W, ae) {
    return T.length === 0 ? O : O === W || O === ae ? Zn(O) : O;
  }, qi = function(T, O) {
    return T === O || j(T) !== null ? !1 : (vn && ii(T), !0);
  }, Zl = function(T, O) {
    if (hn(P.beforeSanitizeElements, T, null), qi(T, O))
      return !0;
    if (Bi(T))
      return yl(T), !0;
    const W = Pe(I(T));
    if (Oe = Rr(P.uponSanitizeElement, Oe, El, yn), hn(P.uponSanitizeElement, T, {
      tagName: W,
      allowedTags: Oe
    }), qi(T, O))
      return !0;
    if (Uc(T, W))
      return yl(T), !0;
    if (Dn[W] || !(Qt.tagCheck instanceof Function && Qt.tagCheck(W)) && !Oe[W]) {
      const oe = Mr(T, W, O);
      return oe === !1 && hn(P.afterSanitizeElements, T, null), oe;
    }
    if (X(T) === Vn.element && !ba(T) || (W === "noscript" || W === "noembed" || W === "noframes") && ln(Px, T.innerHTML))
      return yl(T), !0;
    if (jn && T.nodeType === Vn.text) {
      const oe = Kt(T.textContent);
      T.textContent !== oe && (zu(l.removed, {
        element: T.cloneNode()
      }), T.textContent = oe);
    }
    return hn(P.afterSanitizeElements, T, null), !1;
  }, Cr = function(T, O, W) {
    if (pl[O] || Pu(O, T) || St && (O === "id" || O === "name") && (W in i || W in Q))
      return !1;
    const ae = Ge[O] || Qt.attributeCheck instanceof Function && Qt.attributeCheck(O, T);
    return Nn && ln(at, O) || li && ln(Qe, O) ? !0 : ae ? ai[O] || ln(ke, ku(W, dl, "")) || (O === "src" || O === "xlink:href" || O === "href") && T !== "script" && O0(W, "data:") === 0 && ml[T] || vt && !ln(Hl, ku(W, dl, "")) ? !0 : !W : (
      // Condition a) covers a basically valid custom element tag name whose
      // tag passes the configured tagNameCheck and whose attribute name
      // passes the configured attributeNameCheck ...
      Kl(T) && $t(Xt.tagNameCheck, T) && $t(Xt.attributeNameCheck, O, T) || // Condition b) covers an `is` attribute whose value passes the
      // configured tagNameCheck while customized built-in elements are
      // allowed.
      O === "is" && Xt.allowCustomizedBuiltInElements && $t(Xt.tagNameCheck, W)
    );
  }, es = He({}, ["annotation-xml", "color-profile", "font-face", "font-face-format", "font-face-name", "font-face-src", "font-face-uri", "missing-glyph"]), Kl = function(T) {
    return !es[Nu(T)] && ln(Bl, T);
  }, Lc = function(T, O, W, ae) {
    if (G && typeof S == "object" && typeof S.getAttributeType == "function" && !W)
      switch (S.getAttributeType(T, O)) {
        case "TrustedHTML":
          return Se(ae);
        case "TrustedScriptURL":
          return L(ae);
      }
    return ae;
  }, ts = function(T, O, W, ae) {
    try {
      W ? T.setAttributeNS(W, O, ae) : T.setAttribute(O, ae), Bi(T) ? yl(T) : z0(l.removed);
    } catch {
      Vl(O, T);
    }
  }, Dr = function(T) {
    hn(P.beforeSanitizeAttributes, T, null);
    const O = T.attributes;
    if (!O || Bi(T))
      return;
    Ge = Rr(P.uponSanitizeAttribute, Ge, pa, wl);
    const W = {
      attrName: "",
      attrValue: "",
      keepAttr: !0,
      allowedAttributes: Ge,
      forceKeepAttr: void 0
    };
    let ae = O.length;
    const oe = Pe(T.nodeName);
    for (; ae--; ) {
      const ge = O[ae], Ze = ge.name, et = ge.namespaceURI, Jt = ge.value, wt = Pe(Ze), Ln = Jt;
      let Dt = Ze === "value" ? Ln : jx(Ln);
      if (W.attrName = wt, W.attrValue = Dt, W.keepAttr = !0, W.forceKeepAttr = void 0, hn(P.uponSanitizeAttribute, T, W), Dt = W.attrValue, ga && (wt === "id" || wt === "name") && O0(Dt, Ui) !== 0 && (Vl(Ze, T, ge), Dt = Ui + Dt), mn && ln(/((--!?|])>)|<\/(style|script|title|xmp|textarea|noscript|iframe|noembed|noframes)/i, Dt)) {
        Vl(Ze, T, ge);
        continue;
      }
      if (wt === "attributename" && k0(Dt, "href")) {
        Vl(Ze, T, ge);
        continue;
      }
      if (!W.forceKeepAttr) {
        if (!W.keepAttr) {
          Vl(Ze, T, ge);
          continue;
        }
        if (!ma && ln(eT, Dt)) {
          Vl(Ze, T, ge);
          continue;
        }
        if (jn && (Dt = Kt(Dt)), !Cr(oe, wt, Dt)) {
          Vl(Ze, T, ge);
          continue;
        }
        Dt = Lc(oe, wt, et, Dt), Dt !== Ln && ts(T, Ze, et, Dt);
      }
    }
    hn(P.afterSanitizeAttributes, T, null);
  }, xa = function(T) {
    let O = null;
    const W = tl(T);
    for (hn(P.beforeSanitizeShadowDOM, T, null); O = W.nextNode(); )
      if (hn(P.uponSanitizeShadowNode, O, null), Zl(O, T), Dr(O), Ol(O.content) && xa(O.content), X(O) === Vn.element) {
        const ae = K(O);
        Ol(ae) && (Nr(ae), xa(ae));
      }
    hn(P.afterSanitizeShadowDOM, T, null);
  }, Nr = function(T) {
    const O = [{
      node: T,
      shadow: null
    }];
    for (; O.length > 0; ) {
      const W = O.pop();
      if (W.shadow) {
        xa(W.shadow);
        continue;
      }
      const ae = W.node, ge = X(ae) === Vn.element, Ze = C(ae);
      if (Ze)
        for (let et = Ze.length - 1; et >= 0; --et)
          O.push({
            node: Ze[et],
            shadow: null
          });
      if (ge) {
        const et = q ? q(ae) : null;
        if (typeof et == "string" && Pe(et) === "template") {
          const Jt = ae.content;
          Ol(Jt) && O.push({
            node: Jt,
            shadow: null
          });
        }
      }
      if (ge) {
        const et = K(ae);
        Ol(et) && O.push({
          node: null,
          shadow: et
        }, {
          node: et,
          shadow: null
        });
      }
    }
  };
  return l.sanitize = function(ee) {
    let T = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, O = null, W = null, ae = null, oe = null;
    if (Yl = !ee, Yl && (ee = "<!-->"), typeof ee != "string" && !Sa(ee) && (ee = qx(ee), typeof ee != "string"))
      throw Ei("dirty is not a string, aborting");
    if (!l.isSupported)
      return ee;
    Ut ? (Oe = yn, Ge = wl) : Me(T), (P.uponSanitizeElement.length > 0 || P.uponSanitizeAttribute.length > 0) && (Oe = Zn(Oe)), P.uponSanitizeAttribute.length > 0 && (Ge = Zn(Ge)), l.removed = [];
    const ge = vn && typeof ee != "string" && Sa(ee);
    if (ge) {
      Li(ee);
      const Jt = I(ee);
      if (typeof Jt == "string") {
        const wt = Pe(Jt);
        if (!Oe[wt] || Dn[wt])
          throw _l(ee), Ei("root node is forbidden and cannot be sanitized in-place");
      }
      if (Bi(ee))
        throw _l(ee), Ei("root node is clobbered and cannot be sanitized in-place");
      try {
        Nr(ee);
      } catch (wt) {
        throw _l(ee), wt;
      }
    } else if (Sa(ee))
      O = ri("<!---->"), W = O.ownerDocument.importNode(ee, !0), W.nodeType === Vn.element && W.nodeName === "BODY" || W.nodeName === "HTML" ? O = W : O.appendChild(W), Nr(W);
    else {
      if (!_n && !jn && !gn && // eslint-disable-next-line unicorn/prefer-includes
      ee.indexOf("<") === -1)
        return G && Vt ? Se(ee) : ee;
      if (O = ri(ee), !O)
        return _n ? null : Vt ? ce : "";
    }
    O && ql && yl(O.firstChild);
    const Ze = ge ? ee : O;
    try {
      const Jt = tl(Ze);
      for (; ae = Jt.nextNode(); )
        Zl(ae, Ze), Dr(ae), Ol(ae.content) && xa(ae.content);
    } catch (Jt) {
      throw ge && (_l(ee), zi(l.removed, (wt) => {
        wt.element && ii(wt.element);
      })), Jt;
    }
    if (ge)
      return zi(l.removed, (Jt) => {
        Jt.element && ii(Jt.element);
      }), jn && Hi(ee), ee;
    if (_n) {
      if (jn && Hi(O), bt)
        for (oe = z.call(O.ownerDocument); O.firstChild; )
          oe.appendChild(O.firstChild);
      else
        oe = O;
      return (Ge.shadowroot || Ge.shadowrootmode) && (oe = te.call(r, oe, !0)), oe;
    }
    let et = gn ? O.outerHTML : O.innerHTML;
    return gn && Oe["!doctype"] && O.ownerDocument && O.ownerDocument.doctype && O.ownerDocument.doctype.name && ln(Wx, O.ownerDocument.doctype.name) && (et = "<!DOCTYPE " + O.ownerDocument.doctype.name + `>
` + et), jn && (et = Kt(et)), G && Vt ? Se(et) : et;
  }, l.setConfig = function() {
    let ee = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    Me(ee), Ut = !0, yn = Oe, wl = Ge;
  }, l.clearConfig = function() {
    x = null, Ut = !1, yn = null, wl = null, G = be, ce = "";
  }, l.isValidAttribute = function(ee, T, O) {
    x || Me({});
    const W = Pe(ee), ae = Pe(T);
    return Cr(W, ae, O);
  }, l.addHook = function(ee, T) {
    typeof T == "function" && wn(P, ee) && zu(P[ee], T);
  }, l.removeHook = function(ee, T) {
    if (wn(P, ee)) {
      if (T !== void 0) {
        const O = Dx(P[ee], T);
        return O === -1 ? void 0 : Nx(P[ee], O, 1)[0];
      }
      return z0(P[ee]);
    }
  }, l.removeHooks = function(ee) {
    wn(P, ee) && (P[ee] = []);
  }, l.removeAllHooks = function() {
    P = B0();
  }, l;
}
var iT = l_();
const qt = (o, l = "zh") => typeof o == "string" ? o : o?.[l] || o?.en || o?.zh || "";
function yr(o, l, i) {
  const r = [...l.categories || [], ...l.styles || [], ...l.scenes || []].find((u) => u.value === o);
  return r ? qt(r.title, i) : qt(l.tagLabels?.[o], i) || o;
}
function rT(o, { query: l = "", category: i = "", style: r = "", scene: u = "", favoritesOnly: f = !1, favorites: h = [] } = {}) {
  const p = l.trim().toLowerCase().split(/\s+/).filter(Boolean), d = new Set(h);
  return o.filter((g) => (!i || g.category === i) && (!r || g.styles.includes(r)) && (!u || g.scenes.includes(u)) && (!f || d.has(g.id)) && p.every((y) => `${g.title} ${g.prompt} ${g.category} ${g.sourceLabel} ${g.styles.join(" ")} ${g.scenes.join(" ")}`.toLowerCase().includes(y)));
}
function ih(o) {
  return [...new Set([...String(o).matchAll(/\[([^\[\]\n]{1,100})\]/g)].map((l) => l[1]))];
}
function uT(o, l) {
  return String(o).replace(/\[([^\[\]\n]{1,100})\]/g, (i, r) => String(l[r] || "").trim() || i);
}
function Ju(o, l, i = !1) {
  return typeof l != "string" || !/^\/(?:images|comparison)\//.test(l) || l.includes("..") || /[?#\\]/.test(l) ? "" : l.startsWith("/comparison/") ? o + l.slice(1) : o + (i ? "thumbs/" + l.slice(8).replace(/\.[^.]+$/, ".webp") : l.slice(1));
}
function Mc(o, l, i) {
  if (!/^[0-9a-f]{40}$/.test(i || "")) return "";
  const r = new URL(o, location.href), u = new URL(l, location.href);
  if (u.origin !== r.origin || !u.pathname.startsWith(r.pathname + "images/")) return "";
  const f = u.pathname.slice(r.pathname.length);
  return !/^images\/[a-zA-Z0-9_/-]+\.(?:png|jpg|jpeg|webp)$/i.test(f) || f.includes("..") ? "" : `https://raw.githubusercontent.com/freestylefly/awesome-gpt-image-2/${i}/data/${f}`;
}
function q0(o, l) {
  const i = [...o.matchAll(/\d+/g)].map((u) => Number(u[0])), r = [...l.matchAll(/\d+/g)].map((u) => Number(u[0]));
  for (let u = 0; u < Math.max(i.length, r.length); u++)
    if ((i[u] || 0) !== (r[u] || 0)) return (r[u] || 0) - (i[u] || 0);
  return o.localeCompare(l);
}
function Mu(o) {
  const { prompt: l = "", model: i = "", size: r = "1024x1024", quality: u = "auto", outputFormat: f = "png", outputCompression: h = 90, count: p = 1, autoModel: d = !0 } = o || {};
  return { prompt: l, model: i, size: r, quality: u, outputFormat: f, outputCompression: h, count: p, autoModel: d };
}
async function sT(o) {
  if (!/^image\/(png|jpeg|webp|gif)$/i.test(o.type)) throw new Error("请选择 PNG、JPG、WebP 或 GIF 图片");
  if (o.size > 20 * 1024 * 1024) throw new Error("单张参考图不能超过 20 MB");
  const l = await new Promise((i, r) => {
    const u = new FileReader();
    u.onload = () => i(u.result), u.onerror = () => r(new Error("图片读取失败")), u.readAsDataURL(o);
  });
  return { id: crypto.randomUUID(), name: o.name, size: o.size, dataUrl: l };
}
function cT(o) {
  const {
    id: l,
    userId: i,
    prompt: r,
    createdAt: u,
    completedAt: f,
    elapsedMs: h,
    status: p,
    model: d,
    size: g,
    quality: y,
    outputFormat: S,
    outputCompression: E,
    count: b,
    references: R,
    images: A,
    revisedPrompt: C,
    requestId: j,
    error: K,
    caseId: H
  } = o;
  return {
    id: l,
    userId: i,
    prompt: r,
    createdAt: u,
    completedAt: f,
    elapsedMs: h,
    status: p,
    model: d,
    size: g,
    quality: y,
    outputFormat: S,
    outputCompression: E,
    count: b,
    references: R,
    images: A,
    revisedPrompt: C,
    requestId: j,
    error: K,
    caseId: H
  };
}
function oT() {
  return new Promise((o, l) => {
    const i = indexedDB.open("kuanapi-image-workbench-v2", 1);
    i.onupgradeneeded = () => i.result.createObjectStore("tasks", { keyPath: ["userId", "id"] }).createIndex("userId", "userId"), i.onsuccess = () => o(i.result), i.onerror = () => l(i.error);
  });
}
async function ad(o, l) {
  const i = await oT();
  try {
    return await new Promise((r, u) => {
      const f = i.transaction("tasks", o), h = l(f.objectStore("tasks"));
      f.oncomplete = () => r(h.result), f.onerror = f.onabort = () => u(f.error || h.error || new Error("无法保存图片记录"));
    });
  } finally {
    i.close();
  }
}
const fT = (o) => ad("readwrite", (l) => l.put(cT(o))), hT = (o, l) => ad("readwrite", (i) => i.delete([String(o), l])), dT = (o) => ad("readonly", (l) => l.index("userId").getAll(String(o))).then((l) => l.sort((i, r) => r.createdAt - i.createdAt));
function rh(o, l, i) {
  try {
    return JSON.parse(localStorage.getItem(`kuanapi_image_workbench:${o}:${l}`)) ?? i;
  } catch {
    return i;
  }
}
function uh(o, l, i) {
  localStorage.setItem(`kuanapi_image_workbench:${o}:${l}`, JSON.stringify(i));
}
function pT({ data: o, assetBase: l, language: i, usePrompt: r, download: u, onNotice: f }) {
  const [h, p] = re.useState(0), [d, g] = re.useState("side"), [y, S] = re.useState(50), E = o.cases[h], b = i === "zh", R = (A, C) => {
    const j = Ju(l, A);
    return /* @__PURE__ */ v.jsxs("figure", { children: [
      /* @__PURE__ */ v.jsx("img", { src: j, alt: C, draggable: "false", onError: (K) => {
        const H = Mc(l, j, o.revision);
        H && !K.currentTarget.dataset.originalSource && (K.currentTarget.dataset.originalSource = "1", K.currentTarget.src = H);
      } }),
      /* @__PURE__ */ v.jsxs("figcaption", { children: [
        /* @__PURE__ */ v.jsx("span", { children: C }),
        d === "side" && /* @__PURE__ */ v.jsx(
          "button",
          {
            type: "button",
            className: "kw-icon",
            "aria-label": b ? "下载对比原图" : "Download comparison original",
            onClick: () => u(j, A.split("/").pop()),
            children: /* @__PURE__ */ v.jsx(ch, { size: 17 })
          }
        )
      ] })
    ] }, A + C);
  };
  return /* @__PURE__ */ v.jsxs("section", { className: "kw-comparison", children: [
    /* @__PURE__ */ v.jsxs("header", { children: [
      /* @__PURE__ */ v.jsx("h2", { children: qt(E.title, i) }),
      /* @__PURE__ */ v.jsx(
        "select",
        {
          "aria-label": b ? "选择对比案例" : "Comparison case",
          value: h,
          onChange: (A) => {
            p(Number(A.target.value)), S(50);
          },
          children: o.cases.map((A, C) => /* @__PURE__ */ v.jsx("option", { value: C, children: qt(A.title, i) }, A.id))
        }
      )
    ] }),
    /* @__PURE__ */ v.jsx("p", { className: "kw-comparison-notice", children: E.result ? b ? "上游作者单次复现记录，原图条件未知，不代表本服务实测。" : "One recreation by the upstream author; original conditions are unknown. Not a benchmark of this service." : b ? "交互示意：两侧使用同一图片，不代表模型对比实测。" : "Interface demo: both sides use the same image, not a model benchmark." }),
    /* @__PURE__ */ v.jsxs("div", { className: "kw-comparison-modes", role: "group", "aria-label": b ? "对比方式" : "Comparison layout", children: [
      /* @__PURE__ */ v.jsxs("button", { type: "button", className: "kw-secondary", "aria-pressed": d === "side", onClick: () => g("side"), children: [
        /* @__PURE__ */ v.jsx(Q0, { size: 17 }),
        b ? "并排" : "Side by side"
      ] }),
      /* @__PURE__ */ v.jsxs("button", { type: "button", className: "kw-secondary", "aria-pressed": d === "slider", onClick: () => g("slider"), children: [
        /* @__PURE__ */ v.jsx(jv, { size: 17 }),
        b ? "滑动" : "Slider"
      ] })
    ] }),
    d === "slider" && /* @__PURE__ */ v.jsx("div", { className: "kw-comparison-actions", children: [E.image, E.result?.image || E.image].map((A, C) => /* @__PURE__ */ v.jsxs("button", { type: "button", className: "kw-secondary", onClick: () => u(Ju(l, A), A.split("/").pop()), children: [
      /* @__PURE__ */ v.jsx(ch, { size: 17 }),
      b ? C ? "下载右侧原图" : "下载左侧原图" : C ? "Download right original" : "Download left original"
    ] }, C)) }),
    /* @__PURE__ */ v.jsxs("div", { className: `kw-comparison-images is-${d}`, style: { "--comparison-position": y + "%" }, children: [
      R(E.image, b ? "图库原图" : "Gallery original"),
      R(E.result?.image || E.image, E.result ? qt(E.result.label, i) : b ? "交互示意" : "Interface demo"),
      d === "slider" && /* @__PURE__ */ v.jsx(
        "input",
        {
          type: "range",
          min: "0",
          max: "100",
          value: y,
          "aria-label": b ? "调整对比分界位置" : "Comparison divider",
          onChange: (A) => S(Number(A.target.value))
        }
      )
    ] }),
    /* @__PURE__ */ v.jsx("p", { children: qt(E.focus, i) }),
    /* @__PURE__ */ v.jsxs("label", { className: "kw-field", children: [
      b ? "完整提示词" : "Complete prompt",
      /* @__PURE__ */ v.jsx("textarea", { readOnly: !0, value: E.prompt, rows: "7" })
    ] }),
    /* @__PURE__ */ v.jsxs("div", { className: "kw-comparison-actions", children: [
      /* @__PURE__ */ v.jsxs("button", { type: "button", className: "kw-generate", onClick: () => r(E.prompt, E), children: [
        /* @__PURE__ */ v.jsx(Ka, { size: 17 }),
        b ? "使用提示词" : "Use prompt"
      ] }),
      /* @__PURE__ */ v.jsxs("button", { type: "button", className: "kw-secondary", onClick: async () => {
        try {
          await navigator.clipboard.writeText(E.prompt), f(b ? "已复制" : "Copied");
        } catch {
          f(b ? "复制失败，请选择文本后复制" : "Select the prompt and copy manually");
        }
      }, children: [
        /* @__PURE__ */ v.jsx(V0, { size: 17 }),
        b ? "复制" : "Copy"
      ] })
    ] }),
    E.result && /* @__PURE__ */ v.jsx("dl", { className: "kw-comparison-parameters", children: E.result.parameters[i].map((A) => /* @__PURE__ */ v.jsxs("div", { children: [
      /* @__PURE__ */ v.jsx("dt", { children: A.label }),
      /* @__PURE__ */ v.jsx("dd", { children: A.value })
    ] }, A.label)) })
  ] });
}
const mT = { "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp", "image/gif": "gif", "image/avif": "avif" };
function gT(o, l) {
  let i = String(o || "kuanapi-file").replace(/[\x00-\x1f\x7f<>:"/\\|?*\u202a-\u202e\u2066-\u2069]/g, "_").trim();
  i = i.replace(/[. ]+$/g, "").slice(0, 180) || "kuanapi-file";
  const r = mT[l];
  return r && /\.(?:png|jpe?g|webp|gif|avif)$/i.test(i) && (i = i.replace(/\.[^.]+$/, "." + r)), i;
}
async function a_(o) {
  return typeof o.arrayBuffer == "function" ? o.arrayBuffer() : new Promise((l, i) => {
    const r = new FileReader();
    r.onload = () => l(r.result), r.onerror = () => i(r.error || new Error("文件读取失败。")), r.readAsArrayBuffer(o);
  });
}
async function yT(o) {
  const l = new Uint8Array(await a_(o.slice(0, 16)));
  if (l[0] === 137 && l[1] === 80 && l[2] === 78 && l[3] === 71) return "image/png";
  if (l[0] === 255 && l[1] === 216 && l[2] === 255) return "image/jpeg";
  const i = String.fromCharCode(...l);
  if (i.startsWith("RIFF") && i.slice(8, 12) === "WEBP") return "image/webp";
  if (i.startsWith("GIF87a") || i.startsWith("GIF89a")) return "image/gif";
  if (i.slice(4, 8) === "ftyp" && /avif|avis/.test(i.slice(8))) return "image/avif";
  if (/^\s*<(?:!doctype|html|head|body)/i.test(i)) return "text/html";
  const r = o.type.split(";", 1)[0].toLowerCase();
  return r.startsWith("image/") ? "application/octet-stream" : r || "application/octet-stream";
}
function _T() {
  const o = globalThis.KuanAndroid;
  if (!o) return null;
  if (!["fileSaveCapability", "hasDownloadedFile", "beginFileSave", "appendFileSave", "finishFileSave", "abortFileSave", "openDownloadedFile"].every((i) => typeof o[i] == "function") || o.fileSaveCapability() < 1)
    throw new Error("当前软件不支持本机文件保存，请更新软件后重试。");
  return o;
}
async function vT(o) {
  const l = new Uint8Array(await a_(o));
  let i = "";
  for (let r = 0; r < l.length; r += 32768)
    i += String.fromCharCode(...l.subarray(r, r + 32768));
  return btoa(i);
}
async function bT(o, l) {
  const i = "gallery-" + (crypto.randomUUID?.() || Date.now() + "-" + Math.random().toString(16).slice(2));
  await new Promise((r, u) => {
    const f = () => {
      clearTimeout(d), globalThis.removeEventListener("kuan:gallery-permission", h), l.removeEventListener("abort", p);
    }, h = (g) => {
      g.detail?.id === i && (f(), g.detail.granted ? r() : u(new Error("未允许保存到系统相册；原图仍保留在本机，可授权后重试。")));
    }, p = () => {
      f(), u(l.reason || new DOMException("Aborted", "AbortError"));
    }, d = setTimeout(() => {
      f(), u(new Error("等待相册权限确认超时，请重试。"));
    }, 6e4);
    if (globalThis.addEventListener("kuan:gallery-permission", h), l.addEventListener("abort", p, { once: !0 }), l.aborted) {
      p();
      return;
    }
    try {
      o.requestGalleryPermission(i) && (f(), r());
    } catch (g) {
      f(), u(g);
    }
  });
}
function ET({ ownerId: o, getOwner: l = () => o, timeoutMs: i = 12e4 } = {}) {
  const r = /* @__PURE__ */ new Map();
  let u = !1;
  const f = () => {
    if (u || !o || String(l()) !== String(o))
      throw new DOMException("Download account changed or page closed", "AbortError");
  }, h = (d) => {
    if (d) throw new Error(String(d));
  }, p = (d, g, { fallbackUrl: y } = {}) => {
    const S = String(d);
    if (r.has(S)) return r.get(S).promise;
    const E = new AbortController(), R = (async () => {
      f();
      const A = new URL(S, location.href);
      if (!["https:", "http:", "blob:", "data:"].includes(A.protocol)) throw new Error("不支持的下载地址。");
      if (A.protocol === "http:" && location.protocol === "https:") {
        if (A.host !== location.host) throw new Error("拒绝通过不安全的 HTTP 链接下载文件。");
        A.protocol = "https:";
      }
      const C = _T(), j = C && /\.(?:png|jpe?g|webp|gif|avif)$/i.test(g);
      if (j && (!["gallerySaveCapability", "requestGalleryPermission", "saveDownloadedImageToGallery", "openDownloadedImageFromGallery"].every((I) => typeof C[I] == "function") || C.gallerySaveCapability() < 1))
        throw new Error("保存到系统相册需要新版安卓安装包，请先更新软件。");
      const K = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(A.href + (y ? `
` + y : ""))), H = String(o) + ":image-studio:" + Array.from(new Uint8Array(K), (I) => I.toString(16).padStart(2, "0")).join(""), F = async (I) => {
        await bT(C, E.signal), f();
        const G = JSON.parse(C.saveDownloadedImageToGallery(H));
        if (G.error) throw new Error(G.error);
        if (!G.saved || !G.album) throw new Error("相册保存未得到确认，请重试。");
        return I && G.alreadySaved ? (C.openDownloadedImageFromGallery(H), { ...G, opened: !0 }) : G;
      };
      if (f(), C?.hasDownloadedFile(H))
        return j ? F(!0) : (C.openDownloadedFile(H), { opened: !0, saved: !0 });
      let q, le = !1;
      const X = () => {
        if (E.signal.aborted) throw le ? new DOMException("下载超时，请重试。", "TimeoutError") : E.signal.reason || new DOMException("Aborted", "AbortError");
      };
      try {
        q = setTimeout(() => {
          le = !0, E.abort();
        }, i);
        let I, G;
        const ce = [A.href];
        if (y) {
          const ue = new URL(y);
          if (ue.origin !== "https://raw.githubusercontent.com" || !ue.pathname.startsWith("/freestylefly/awesome-gpt-image-2/"))
            throw new Error("无效的图库原图来源。");
          ce.push(ue.href);
        }
        for (const [ue, Se] of ce.entries())
          try {
            const L = new URL(Se), Y = await fetch(Se, {
              signal: E.signal,
              credentials: L.origin === location.origin ? "same-origin" : "omit",
              referrerPolicy: "no-referrer"
            });
            if (!Y.ok) throw new Error(`文件下载失败（HTTP ${Y.status}）。`);
            if (Y.url && location.protocol === "https:" && new URL(Y.url).protocol === "http:")
              throw new Error("下载被重定向到不安全的 HTTP 地址。");
            if (I = await Y.blob(), f(), X(), !I.size) throw new Error("下载返回了空文件。");
            if (G = await yT(I), G === "text/html" || G === "application/xhtml+xml") throw new Error("下载返回了网页或登录页，没有返回原文件。");
            if (/\.(?:png|jpe?g|webp|gif|avif)$/i.test(g) && !G.startsWith("image/"))
              throw new Error("下载没有返回有效的原图。");
            break;
          } catch (L) {
            if (X(), u || String(l()) !== String(o) || ue === ce.length - 1) throw L;
          }
        const be = gT(g, G);
        if (C) {
          h(C.beginFileSave(H, be, G, I.size));
          try {
            for (let ue = 0; ue < I.size; ue += 262144)
              f(), X(), h(C.appendFileSave(H, await vT(I.slice(ue, ue + 262144)))), await new Promise((Se) => setTimeout(Se, 0));
            if (f(), X(), h(C.finishFileSave(H)), !C.hasDownloadedFile(H)) throw new Error("本机文件保存未能确认，请重试。");
            return j ? { ...await F(!1), name: be } : { saved: !0, name: be };
          } catch (ue) {
            try {
              C.abortFileSave(H);
            } catch {
            }
            throw ue;
          }
        }
        const ve = URL.createObjectURL(I), _e = document.createElement("a");
        _e.href = ve, _e.download = be, _e.rel = "noopener";
        try {
          document.body.appendChild(_e), _e.click();
        } finally {
          _e.remove(), setTimeout(() => URL.revokeObjectURL(ve), 6e4);
        }
        return { started: !0, name: be };
      } finally {
        clearTimeout(q);
      }
    })().finally(() => {
      r.get(S)?.promise === R && r.delete(S);
    });
    return r.set(S, { promise: R, controller: E }), R;
  };
  return p.dispose = () => {
    u = !0;
    for (const d of r.values()) d.controller.abort();
  }, p;
}
Ku.registerPlugin($u);
const Y0 = { prompt: "", model: "", autoModel: !0, size: "1024x1024", quality: "auto", outputFormat: "png", outputCompression: 90, count: 1 }, ST = {
  zh: {
    title: "图像工作台",
    brand: "宽 API",
    back: "返回对话",
    gallery: "案例库",
    templates: "工业模板",
    history: "生成记录",
    guide: "风格指南",
    editor: "编辑提示词",
    closeEditor: "收起编辑器",
    prompt: "提示词",
    promptPlaceholder: "描述你想创作的画面，或从右侧选择一个案例…",
    generate: "生成图像",
    model: "生图模型",
    auto: "自动 · 最新可用",
    size: "画幅",
    custom: "自定义",
    quality: "画质",
    format: "格式",
    count: "数量",
    refs: "参考图片",
    search: "搜索案例、画面、提示词…",
    all: "全部",
    category: "分类",
    style: "风格",
    scene: "场景",
    favorites: "收藏",
    use: "使用提示词",
    copy: "复制",
    copied: "已复制",
    connection: "连接设置",
    api: "API Key",
    base: "Base URL",
    connected: "已绑定当前账号",
    refresh: "刷新连接和模型",
    examples: "关联案例",
    constraints: "核心约束",
    pitfalls: "避坑指南",
    variants: "模板版本",
    variables: "填入变量",
    close: "关闭",
    empty: "没有匹配的内容",
    noHistory: "还没有生成记录",
    newest: "最新收录",
    featured: "精选优先",
    results: "个结果",
    stop: "停止",
    download: "下载原图",
    reference: "作为参考图",
    retry: "再次生成",
    failed: "生成失败",
    cancelled: "已停止",
    running: "正在生成",
    interrupted: "上次生成已中断，未自动重发",
    completed: "已完成",
    delete: "删除",
    confirm: "确认删除",
    network: "暂时无法连接",
    retryLoad: "重新连接",
    settings: "生成参数",
    guideDownload: "下载完整模板",
    credits: "内容来源",
    read: "查看详情",
    more: "加载更多",
    clear: "清空筛选",
    library: "完整案例、模板与风格规则",
    variant: "变体",
    favoriteOnly: "只看收藏",
    keep: "保留当前提示词",
    replace: "替换提示词",
    archive: "下载风格资料",
    compare: "2.5 对比",
    downloading: "正在下载",
    saved: "已保存到本机，再次点击可打开",
    albumSaved: "已保存到系统相册「宽api」，再次点击可打开",
    started: "已交给浏览器下载",
    openFile: "打开本机文件",
    selected: "已选案例",
    balance: "余额",
    storageError: "记录未能保存到此设备，请及时下载图片",
    notice: "素材与提示词来自 awesome-gpt-image-2，遵循 MIT 许可；原始作者信息保留在案例中。"
  },
  en: {
    title: "Image Studio",
    brand: "KuanAPI",
    back: "Back to chat",
    gallery: "Gallery",
    templates: "Templates",
    history: "History",
    guide: "Style guide",
    editor: "Edit prompt",
    closeEditor: "Close editor",
    prompt: "Prompt",
    promptPlaceholder: "Describe your image, or choose a case from the gallery…",
    generate: "Generate image",
    model: "Image model",
    auto: "Auto · latest available",
    size: "Aspect ratio",
    custom: "Custom",
    quality: "Quality",
    format: "Format",
    count: "Images",
    refs: "Reference images",
    search: "Search cases, styles, prompts…",
    all: "All",
    category: "Category",
    style: "Style",
    scene: "Scene",
    favorites: "Favorites",
    use: "Use prompt",
    copy: "Copy",
    copied: "Copied",
    connection: "Connection",
    api: "API key",
    base: "Base URL",
    connected: "Current account connected",
    refresh: "Refresh connection & models",
    examples: "Related cases",
    constraints: "Core constraints",
    pitfalls: "Pitfalls",
    variants: "Template versions",
    variables: "Fill variables",
    close: "Close",
    empty: "No matching items",
    noHistory: "No images yet",
    newest: "Newest",
    featured: "Featured first",
    results: "results",
    stop: "Stop",
    download: "Download original",
    reference: "Use as reference",
    retry: "Generate again",
    failed: "Failed",
    cancelled: "Stopped",
    running: "Generating",
    interrupted: "Generation interrupted; it was not resubmitted",
    completed: "Completed",
    delete: "Delete",
    confirm: "Confirm delete",
    network: "Unable to connect",
    retryLoad: "Reconnect",
    settings: "Generation settings",
    guideDownload: "Download full templates",
    credits: "Attribution",
    read: "View details",
    more: "Load more",
    clear: "Clear filters",
    library: "Cases, templates and style rules",
    variant: "Variant",
    favoriteOnly: "Favorites only",
    keep: "Keep current prompt",
    replace: "Replace prompt",
    archive: "Download style resources",
    compare: "Image 2.5",
    downloading: "Downloading",
    saved: "Saved on this device. Click again to open.",
    albumSaved: "Saved to the KuanAPI system album. Click again to open.",
    started: "Download sent to the browser",
    openFile: "Open local file",
    selected: "Selected case",
    balance: "Balance",
    storageError: "Unable to save on this device. Download your images.",
    notice: "Cases and prompts from awesome-gpt-image-2 under the MIT license. Original creators are credited on each case."
  }
};
function yt({ icon: o, label: l, onClick: i, active: r = !1, ...u }) {
  return /* @__PURE__ */ v.jsx("button", { type: "button", className: `kw-icon ${r ? "active" : ""}`, "aria-label": l, title: l, onClick: i, ...u, children: /* @__PURE__ */ v.jsx(o, { size: 18 }) });
}
function sh({ value: o, t: l, onNotice: i }) {
  const [r, u] = re.useState(!1);
  return re.useEffect(() => {
    if (r) {
      const f = setTimeout(() => u(!1), 1600);
      return () => clearTimeout(f);
    }
  }, [r]), /* @__PURE__ */ v.jsx(yt, { icon: r ? X0 : V0, label: r ? l.copied : l.copy, onClick: async () => {
    try {
      await navigator.clipboard.writeText(o), u(!0);
    } catch {
      i("复制失败，请选择文本后复制");
    }
  } });
}
function xT({ onDelete: o, t: l }) {
  const [i, r] = re.useState(!1);
  return re.useEffect(() => {
    if (i) {
      const u = setTimeout(() => r(!1), 3500);
      return () => clearTimeout(u);
    }
  }, [i]), /* @__PURE__ */ v.jsxs(
    "button",
    {
      type: "button",
      className: `kw-delete ${i ? "armed" : ""}`,
      title: l.delete,
      "aria-label": i ? l.confirm : l.delete,
      onClick: () => i ? o() : r(!0),
      children: [
        /* @__PURE__ */ v.jsx(yb, { size: 16 }),
        i && /* @__PURE__ */ v.jsx("span", { children: l.confirm })
      ]
    }
  );
}
function gc({ item: o, assetBase: l, sourceRevision: i, full: r = !1, ...u }) {
  const [f, h] = re.useState(!1), [p, d] = re.useState(!1);
  return re.useEffect(() => {
    h(!1), d(!1);
  }, [o.image]), f ? /* @__PURE__ */ v.jsxs("div", { className: "kw-image-missing", children: [
    /* @__PURE__ */ v.jsx(oh, { size: 28 }),
    /* @__PURE__ */ v.jsx("span", { children: o.title })
  ] }) : /* @__PURE__ */ v.jsx("img", { src: p || Ju(l, o.image, !r), alt: o.imageAlt || o.title || "", loading: r ? "eager" : "lazy", decoding: "async", onError: () => {
    const g = Mc(l, Ju(l, o.image), i);
    !p && g ? d(g) : h(!0);
  }, ...u });
}
function TT({ bridge: o, assetBase: l, native: i }) {
  const r = re.useRef(null), u = re.useRef(null), f = re.useRef(null), h = re.useRef(null), p = re.useRef(null), d = re.useRef(/* @__PURE__ */ new Map()), g = re.useRef(!0), y = re.useRef(null), [S, E] = re.useState(navigator.language.toLowerCase().startsWith("zh") ? "zh" : "en"), b = ST[S], R = i && !matchMedia("(prefers-color-scheme: dark)").matches ? "light" : "dark", [A, C] = re.useState(R), [j, K] = re.useState(null), [H, F] = re.useState(null), [q, le] = re.useState(null), [X, I] = re.useState(null), [G, ce] = re.useState({}), [be, ve] = re.useState(""), [_e, ue] = re.useState(""), [Se, L] = re.useState(!1), [Y, ie] = re.useState("gallery"), [se, ze] = re.useState(Y0), [z, V] = re.useState([]), [te, P] = re.useState([]), [pe, Ae] = re.useState([]), [de, at] = re.useState({ query: "", category: "", style: "", scene: "", favoritesOnly: !1 }), [Qe, Hl] = re.useState("newest"), [dl, Bl] = re.useState(30), [ke, Oe] = re.useState(null), [El, Ge] = re.useState(0), [pa, Xt] = re.useState({}), [Dn, pl] = re.useState(!1), [Qt, li] = re.useState(!1), [Nn, vt] = re.useState(!1), [ma, jn] = re.useState(!1), [mn, gn] = re.useState(""), [Ut, yn] = re.useState(null), [wl, ql] = re.useState(null), [_n, bt] = re.useState(Date.now()), Vt = async (x = !1) => {
    L(!0), ve("");
    try {
      const Q = await o.initialize();
      if (!g.current) return;
      y.current = Q, K(Q);
      const ne = [...Q.models].sort(q0);
      if (x) {
        const Me = Mu(rh(Q.userId, "draft", Y0));
        ze({ ...Me, model: Me.autoModel || !ne.includes(Me.model) ? ne[0] || "" : Me.model }), C(rh(Q.userId, "theme", R)), Ae(rh(Q.userId, "favorites", []));
        const xe = await dT(Q.userId).catch(() => (ue(b.storageError), []));
        g.current && (o.generationStatus && xe.some((Ve) => Ve.status === "generating") && ie("history"), P(o.generationStatus ? xe : xe.map((Ve) => Ve.status === "generating" ? { ...Ve, status: "interrupted", error: b.interrupted } : Ve)));
      } else ze((Me) => ({ ...Me, model: Me.autoModel || !ne.includes(Me.model) ? ne[0] || "" : Me.model }));
    } catch (Q) {
      g.current && ve(Q.message || b.network);
    } finally {
      g.current && L(!1);
    }
  };
  re.useEffect(() => {
    g.current = !0;
    const x = new AbortController();
    return Promise.all(["cases.json", "style-library.json", "content-version.json", "comparison.json"].map((Q) => fetch(l + Q, { signal: x.signal }).then((ne) => {
      if (!ne.ok) throw new Error("内容库加载失败");
      return ne.json();
    }))).then(([Q, ne, Me, xe]) => {
      F({ ...Q, sourceRevision: Me.revision }), le(ne), I(xe);
      const Ve = new URLSearchParams(location.search).get("case");
      if (/^[1-9]\d*$/.test(Ve || "")) {
        const Ht = Q.cases.find((fn) => String(fn.id) === Ve);
        Ht && Oe(Ht);
      }
    }).catch((Q) => {
      Q.name !== "AbortError" && ve(Q.message);
    }), Vt(!0), () => {
      g.current = !1, x.abort(), d.current.forEach((Q) => Q.abort()), d.current.clear(), y.current = null;
    };
  }, []), re.useEffect(() => {
    if (!j) return;
    const x = setTimeout(() => {
      try {
        uh(j.userId, "draft", Mu(se));
      } catch {
        ue(b.storageError);
      }
    }, 400);
    return () => clearTimeout(x);
  }, [se, j?.userId]), re.useEffect(() => {
    if (j)
      try {
        uh(j.userId, "favorites", pe), uh(j.userId, "theme", A);
      } catch {
        ue(b.storageError);
      }
  }, [pe, A, j?.userId]), re.useEffect(() => {
    if (!_e) return;
    const x = setTimeout(() => ue(""), 4500);
    return () => clearTimeout(x);
  }, [_e]), re.useEffect(() => {
    if (!te.some((Q) => Q.status === "generating")) return;
    const x = setInterval(() => bt(Date.now()), 1e3);
    return () => clearInterval(x);
  }, [te]), re.useEffect(() => {
    const x = (Q) => {
      !i && d.current.size && (Q.preventDefault(), Q.returnValue = "");
    };
    return window.addEventListener("beforeunload", x), () => window.removeEventListener("beforeunload", x);
  }, [i]), re.useEffect(() => {
    const x = (Q) => {
      Q.key === "Escape" && (yn(null), vn(), pl(!1));
    };
    return document.addEventListener("keydown", x), () => document.removeEventListener("keydown", x);
  }, []), re.useEffect(() => {
    Bl(30), u.current?.scrollTo({ top: 0 });
  }, [de, Qe, Y]), re.useEffect(() => {
    if (!p.current) return;
    const x = new IntersectionObserver((Q) => {
      Q.some((ne) => ne.isIntersecting) && Bl((ne) => ne + 24);
    }, { root: u.current, rootMargin: "250px" });
    return x.observe(p.current), () => x.disconnect();
  }, [Y, H, dl]), re.useEffect(() => {
    if (Y !== "guide" || mn) return;
    const x = new AbortController();
    return fetch(l + "templates.md", { signal: x.signal }).then((Q) => Q.text()).then(gn).catch((Q) => {
      Q.name !== "AbortError" && ue(Q.message);
    }), () => x.abort();
  }, [Y, mn]);
  const St = re.useMemo(() => rT(H?.cases || [], { ...de, favorites: pe }).sort((x, Q) => Qe === "featured" && Number(Q.featured) - Number(x.featured) || Q.id - x.id), [H, de, pe, Qe]), ga = re.useMemo(() => (q?.templates || []).filter((x) => (!de.category || x.category === de.category) && (!de.style || x.styles?.includes(de.style)) && (!de.scene || x.scenes?.includes(de.scene)) && (!de.query || `${qt(x.title, S)} ${qt(x.description, S)} ${x.variants?.map((Q) => Q.prompt).join(" ")}`.toLowerCase().includes(de.query.toLowerCase()))), [q, de, S]), Ui = `${Y}:${de.query}:${de.category}:${de.style}:${de.scene}:${de.favoritesOnly}:${Qe}`;
  $u(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const x = r.current?.querySelectorAll(".kw-card");
    x?.length && Ku.fromTo(x, { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: 0.34, stagger: { each: 0.018, from: "start", amount: 0.22 }, ease: "power2.out", clearProps: "transform,opacity" });
  }, { scope: r, dependencies: [Ui, !!H], revertOnUpdate: !0 }), $u(
    () => {
      ke && !matchMedia("(prefers-reduced-motion: reduce)").matches && Ku.fromTo(".kw-inspector", { x: 20, opacity: 0.5 }, { x: 0, opacity: 1, duration: 0.25, clearProps: "transform,opacity" });
    },
    { scope: r, dependencies: [ke?.id], revertOnUpdate: !0 }
  );
  const Et = (x) => ze((Q) => ({ ...Q, ...x })), vn = () => {
    Oe(null);
    const x = new URL(location.href);
    x.searchParams.has("case") && (x.searchParams.delete("case"), history.replaceState({}, "", x.pathname + x.search + x.hash));
  }, Lt = (x) => {
    Oe(x), Ge(0), Xt({});
  }, tn = ke?.variants?.[El]?.prompt || ke?.prompt || "", un = uT(tn, pa), ml = (x, Q) => {
    if (se.prompt.trim() && se.prompt !== x) {
      ql({ prompt: x, item: Q });
      return;
    }
    ya(x);
  }, Un = () => {
    vt(!0), (!i || !matchMedia("(max-width:700px)").matches) && requestAnimationFrame(() => h.current?.focus());
  }, ai = (x) => {
    h.current?.blur(), vt(!1), pl(!1), vn(), ie(x);
  }, ya = (x, Q) => {
    Et({ prompt: x }), ql(null), vn(), Un();
  }, zl = (x) => Ae((Q) => Q.includes(x) ? Q.filter((ne) => ne !== x) : [...Q, x]), sn = async (x) => {
    try {
      return await fT(x), !0;
    } catch {
      return g.current && ue(b.storageError), !1;
    }
  }, Zt = (x) => {
    g.current && P((Q) => [x, ...Q.filter((ne) => ne.id !== x.id)]);
  }, cn = async (x) => {
    try {
      if (z.length + x.length > 6) throw new Error(S === "zh" ? "最多添加 6 张参考图" : "Up to 6 reference images");
      if (z.reduce((ne, Me) => ne + Me.size, 0) + x.reduce((ne, Me) => ne + Me.size, 0) > 64 * 1024 * 1024) throw new Error("参考图合计不能超过 64 MB");
      const Q = await Promise.all(x.map(sT));
      V((ne) => [...ne, ...Q]), vt(!0);
    } catch (Q) {
      ue(Q.message);
    }
  }, Yl = async () => {
    if (!i) {
      f.current.click();
      return;
    }
    try {
      const x = await o.pickFiles();
      x.length && await cn(x);
    } catch (x) {
      ue(x.message);
    }
  }, Gl = async (x = null) => {
    const Q = y.current;
    if (!Q || !se.prompt.trim() && !x) return;
    const ne = x || se;
    if (!Q.models.includes(ne.model)) {
      ue(S === "zh" ? "当前分组没有所选生图模型，请切换分组或模型。" : "This group does not offer the selected image model.");
      return;
    }
    const Me = o.validate(ne.size, ne.model);
    if (Me) {
      ue(Me);
      return;
    }
    const xe = {
      ...Mu(ne),
      id: crypto.randomUUID(),
      userId: String(Q.userId),
      createdAt: Date.now(),
      status: "generating",
      references: structuredClone(x?.references || z),
      images: []
    }, Ve = new AbortController();
    d.current.set(xe.id, Ve), bt(xe.createdAt), Zt(xe), ai("history"), u.current?.scrollTo({ top: 0 });
    try {
      const Ht = await sn(xe);
      if (o.generationStatus && !Ht) throw new Error(b.storageError);
      if (Ve.signal.aborted) throw new DOMException("Aborted", "AbortError");
      const fn = await o.generate({ ...Mu(ne), taskId: xe.id, referenceImages: xe.references.map((ut) => ut.dataUrl), signal: Ve.signal });
      if (o.generationStatus) {
        fn.status !== "generating" && Xl(xe, fn);
        return;
      }
      if (Ve.signal.aborted) throw new DOMException("Aborted", "AbortError");
      if (!fn.images?.length) throw new Error("接口未返回图片");
      Object.assign(xe, fn, { status: "completed", completedAt: Date.now(), elapsedMs: Date.now() - xe.createdAt }), Zt({ ...xe }), await sn(xe), o.profile?.().then((ut) => {
        g.current && K((ba) => ba && { ...ba, balance: ut.balance });
      }).catch(() => {
      });
    } catch (Ht) {
      Object.assign(xe, {
        status: Ve.signal.aborted ? "cancelled" : "failed",
        error: Ve.signal.aborted ? b.cancelled : Ht.message,
        completedAt: Date.now(),
        elapsedMs: Date.now() - xe.createdAt
      }), Zt({ ...xe }), await sn(xe);
    } finally {
      d.current.delete(xe.id);
    }
  }, Xl = async (x, Q) => {
    const { status: ne } = Q || {};
    if (!["completed", "failed", "cancelled", "interrupted"].includes(ne)) return;
    const Me = Number(Q.completedAt) || Date.now(), xe = {
      ...x,
      ...Q.result,
      status: ne,
      error: Q.error || (ne === "interrupted" ? b.interrupted : ne === "cancelled" ? b.cancelled : ""),
      completedAt: Me,
      elapsedMs: Math.max(0, Me - x.createdAt)
    };
    Zt(xe), await sn(xe), ne === "completed" && o.profile?.().then((Ve) => {
      g.current && K((Ht) => Ht && { ...Ht, balance: Ve.balance });
    }).catch(() => {
    });
  };
  re.useEffect(() => {
    if (!o.generationStatus || !te.some((xe) => xe.status === "generating")) return;
    let x = !0, Q = !1;
    const Me = setInterval(async () => {
      if (!Q) {
        Q = !0;
        try {
          for (const xe of te) {
            if (!x) break;
            if (xe.status !== "generating" || d.current.has(xe.id)) continue;
            const Ve = await o.generationStatus(xe.id);
            x && await Xl(xe, Ve);
          }
        } catch (xe) {
          x && ue(xe.message);
        } finally {
          Q = !1;
        }
      }
    }, 650);
    return () => {
      x = !1, clearInterval(Me);
    };
  }, [te]);
  const _a = (x) => {
    if (o.stopGeneration) {
      const Q = te.find((ne) => ne.id === x);
      d.current.get(x)?.abort(), Q && o.stopGeneration(x).then((ne) => Xl(Q, ne)).catch((ne) => ue(ne.message));
      return;
    }
    d.current.get(x)?.abort(), P((Q) => Q.map((ne) => ne.id === x ? { ...ne, status: "cancelled", error: b.cancelled } : ne));
  }, va = async (x) => {
    try {
      await hT(j.userId, x.id), P((Q) => Q.filter((ne) => ne.id !== x.id));
    } catch (Q) {
      ue(Q.message);
    }
  }, gl = async (x, Q) => {
    if (G[x] !== "pending") {
      ce((ne) => ({ ...ne, [x]: "pending" }));
      try {
        const ne = await o.download(x, Q, { fallbackUrl: Mc(l, x, H?.sourceRevision) });
        g.current && (ce((Me) => ({ ...Me, [x]: ne?.saved ? "ready" : "" })), !ne?.opened && !ne?.cancelled && ue(ne?.album ? b.albumSaved : ne?.saved ? b.saved : b.started));
      } catch (ne) {
        g.current && (ce((Me) => ({ ...Me, [x]: "" })), ne.name !== "AbortError" && ue(ne.message || "下载失败"));
      }
    }
  }, on = (x, Q) => /* @__PURE__ */ v.jsx(
    yt,
    {
      icon: G[x] === "pending" ? $g : G[x] === "ready" ? Vv : ch,
      label: G[x] === "pending" ? b.downloading : G[x] === "ready" ? b.openFile : b.download,
      disabled: G[x] === "pending",
      "aria-busy": G[x] === "pending",
      onClick: () => gl(x, Q)
    }
  ), dt = async (x) => {
    try {
      const Q = await fetch(x).then((ne) => {
        if (!ne.ok) throw new Error("图片读取失败");
        return ne.blob();
      });
      await cn([new File([Q], "reference.png", { type: Q.type || "image/png" })]), yn(null);
    } catch (Q) {
      ue(Q.message);
    }
  }, pt = [["gallery", oh], ["templates", ab], ["compare", Q0], ["history", $v], ["guide", Zg]], el = se.model ? o.validate(se.size, se.model) : "", [Ql, Pe] = se.size.split("x");
  return /* @__PURE__ */ v.jsxs("div", { ref: r, className: "kuan-image-workbench", "data-theme": A, "data-host": i ? "android" : void 0, "data-editor": Nn ? "open" : void 0, children: [
    /* @__PURE__ */ v.jsxs("header", { className: "kw-header", children: [
      !i && /* @__PURE__ */ v.jsxs("div", { className: "kw-brand", children: [
        /* @__PURE__ */ v.jsx(yt, { icon: wv, label: b.back, onClick: () => o.back() }),
        /* @__PURE__ */ v.jsx("img", { src: "/logo.png", alt: "" }),
        /* @__PURE__ */ v.jsxs("div", { children: [
          /* @__PURE__ */ v.jsx("strong", { children: b.brand }),
          /* @__PURE__ */ v.jsx("span", { children: b.title })
        ] })
      ] }),
      /* @__PURE__ */ v.jsx("nav", { "aria-label": b.title, children: pt.map(([x, Q]) => /* @__PURE__ */ v.jsxs("button", { type: "button", className: Y === x ? "active" : "", "aria-label": b[x], title: b[x], "aria-current": Y === x ? "page" : void 0, onClick: () => ai(x), children: [
        /* @__PURE__ */ v.jsx(Q, { size: 17 }),
        /* @__PURE__ */ v.jsx("span", { children: b[x] }),
        x === "history" && te.some((ne) => ne.status === "generating") && /* @__PURE__ */ v.jsx("i", {})
      ] }, x)) }),
      /* @__PURE__ */ v.jsxs("div", { className: "kw-header-actions", children: [
        /* @__PURE__ */ v.jsx("span", { className: "kw-balance", children: j && `$${Number(j.balance || 0).toFixed(2)}` }),
        /* @__PURE__ */ v.jsx(yt, { icon: A === "dark" ? mb : nb, label: A === "dark" ? "Light theme" : "Dark theme", onClick: () => C(A === "dark" ? "light" : "dark") }),
        /* @__PURE__ */ v.jsx("button", { type: "button", className: "kw-language", onClick: () => E(S === "zh" ? "en" : "zh"), children: S === "zh" ? "EN" : "中" }),
        /* @__PURE__ */ v.jsx(yt, { icon: Wv, label: b.connection, active: Dn, onClick: () => {
          pl(!Dn), li(!1);
        } })
      ] })
    ] }),
    Dn && /* @__PURE__ */ v.jsxs("section", { className: "kw-connection", "aria-label": b.connection, children: [
      /* @__PURE__ */ v.jsxs("div", { children: [
        /* @__PURE__ */ v.jsx("span", { className: `kw-dot ${j ? "ready" : ""}` }),
        /* @__PURE__ */ v.jsx("strong", { children: j ? b.connected : b.network }),
        /* @__PURE__ */ v.jsx("small", { children: j?.groupName })
      ] }),
      /* @__PURE__ */ v.jsxs("label", { children: [
        b.base,
        /* @__PURE__ */ v.jsx("input", { readOnly: !0, value: j?.baseUrl || "" })
      ] }),
      !i && /* @__PURE__ */ v.jsxs("label", { children: [
        b.api,
        /* @__PURE__ */ v.jsxs("span", { className: "kw-secret", children: [
          /* @__PURE__ */ v.jsx("input", { readOnly: !0, type: Qt ? "text" : "password", value: j?.apiKey || "" }),
          /* @__PURE__ */ v.jsx(yt, { icon: Qt ? Yv : Xv, label: Qt ? "Hide API key" : "Show API key", onClick: () => li(!Qt) })
        ] })
      ] }),
      /* @__PURE__ */ v.jsxs("button", { type: "button", className: "kw-secondary", onClick: () => Vt(), disabled: Se, children: [
        /* @__PURE__ */ v.jsx(Jg, { size: 16, className: Se ? "spinning" : "" }),
        b.refresh
      ] })
    ] }),
    be && /* @__PURE__ */ v.jsxs("div", { className: "kw-error", role: "alert", children: [
      /* @__PURE__ */ v.jsx("span", { children: be }),
      /* @__PURE__ */ v.jsx("button", { type: "button", onClick: () => Vt(), children: b.retryLoad })
    ] }),
    /* @__PURE__ */ v.jsxs("div", { className: "kw-layout", children: [
      /* @__PURE__ */ v.jsxs("aside", { className: `kw-composer ${Nn ? "expanded" : ""}`, children: [
        /* @__PURE__ */ v.jsxs("button", { type: "button", className: "kw-mobile-composer", "aria-expanded": Nn, "aria-controls": "studio-prompt-fields", "aria-label": Nn ? b.closeEditor : b.editor, onClick: () => {
          Nn ? (h.current?.blur(), vt(!1)) : (vn(), pl(!1), Un());
        }, children: [
          /* @__PURE__ */ v.jsx(fc, { size: 18 }),
          /* @__PURE__ */ v.jsx("span", { children: Nn ? b.editor : se.prompt || b.editor }),
          Nn ? /* @__PURE__ */ v.jsx(Dv, { size: 17 }) : /* @__PURE__ */ v.jsx(Rv, { size: 17 })
        ] }),
        /* @__PURE__ */ v.jsxs("div", { id: "studio-prompt-fields", className: "kw-composer-body", children: [
          /* @__PURE__ */ v.jsxs("div", { className: "kw-section-title", children: [
            /* @__PURE__ */ v.jsx("h1", { children: b.prompt }),
            /* @__PURE__ */ v.jsxs("div", { children: [
              /* @__PURE__ */ v.jsx(yt, { icon: Ka, label: S === "zh" ? "新建提示词" : "New prompt", onClick: () => {
                Et({ prompt: "" }), V([]), h.current?.focus();
              } }),
              /* @__PURE__ */ v.jsx(sh, { value: se.prompt, t: b, onNotice: ue })
            ] })
          ] }),
          /* @__PURE__ */ v.jsx(
            "textarea",
            {
              ref: h,
              className: "kw-prompt",
              "aria-label": b.prompt,
              placeholder: b.promptPlaceholder,
              value: se.prompt,
              onChange: (x) => Et({ prompt: x.target.value }),
              onPaste: (x) => {
                const Q = [...x.clipboardData.files];
                Q.length && (x.preventDefault(), cn(Q));
              }
            }
          ),
          /* @__PURE__ */ v.jsxs("div", { className: "kw-prompt-meta", children: [
            /* @__PURE__ */ v.jsx("span", { children: se.prompt.length.toLocaleString() }),
            /* @__PURE__ */ v.jsx("span", { children: se.model || b.model })
          ] }),
          /* @__PURE__ */ v.jsxs("div", { className: "kw-reference-area", onDragOver: (x) => x.preventDefault(), onDrop: (x) => {
            x.preventDefault(), cn([...x.dataTransfer.files]);
          }, children: [
            /* @__PURE__ */ v.jsxs("div", { className: "kw-section-title", children: [
              /* @__PURE__ */ v.jsxs("h2", { children: [
                b.refs,
                /* @__PURE__ */ v.jsxs("small", { children: [
                  z.length,
                  "/6"
                ] })
              ] }),
              /* @__PURE__ */ v.jsx(yt, { icon: vb, label: b.refs, onClick: () => void Yl() })
            ] }),
            !i && /* @__PURE__ */ v.jsx("input", { ref: f, type: "file", accept: "image/png,image/jpeg,image/webp,image/gif", multiple: !0, hidden: !0, onChange: (x) => {
              cn([...x.target.files]), x.target.value = "";
            } }),
            /* @__PURE__ */ v.jsxs("div", { className: "kw-refs", children: [
              z.map((x) => /* @__PURE__ */ v.jsxs("div", { children: [
                /* @__PURE__ */ v.jsx("img", { src: x.dataUrl, alt: x.name }),
                /* @__PURE__ */ v.jsx(yt, { icon: Tu, label: b.delete, onClick: () => V((Q) => Q.filter((ne) => ne.id !== x.id)) })
              ] }, x.id)),
              !z.length && /* @__PURE__ */ v.jsx("button", { type: "button", className: "kw-ref-add", "aria-label": b.refs, title: b.refs, onClick: () => void Yl(), children: /* @__PURE__ */ v.jsx(Ka, { size: 21 }) })
            ] })
          ] }),
          /* @__PURE__ */ v.jsxs("div", { className: "kw-section-title", children: [
            /* @__PURE__ */ v.jsx("h2", { children: b.settings }),
            /* @__PURE__ */ v.jsx(Wg, { size: 16 })
          ] }),
          /* @__PURE__ */ v.jsxs("label", { className: "kw-field", children: [
            b.model,
            /* @__PURE__ */ v.jsxs("select", { value: se.autoModel ? "__auto__" : se.model, onChange: (x) => Et({ autoModel: x.target.value === "__auto__", model: x.target.value === "__auto__" ? [...j?.models || []].sort(q0)[0] || "" : x.target.value }), children: [
              /* @__PURE__ */ v.jsx("option", { value: "__auto__", children: b.auto }),
              (j?.models || []).map((x) => /* @__PURE__ */ v.jsx("option", { value: x, children: x }, x))
            ] })
          ] }),
          /* @__PURE__ */ v.jsxs("div", { className: "kw-field", children: [
            /* @__PURE__ */ v.jsx("span", { children: b.size }),
            /* @__PURE__ */ v.jsxs("div", { className: "kw-aspects", children: [
              ["1024x1024", "1536x1024", "1024x1536"].map((x, Q) => /* @__PURE__ */ v.jsxs("button", { type: "button", className: se.size === x ? "active" : "", title: x, onClick: () => Et({ size: x }), children: [
                /* @__PURE__ */ v.jsx("span", { className: `kw-ratio ratio-${Q}` }),
                /* @__PURE__ */ v.jsx("small", { children: ["1:1", "3:2", "2:3"][Q] })
              ] }, x)),
              /* @__PURE__ */ v.jsxs("button", { type: "button", className: ["1024x1024", "1536x1024", "1024x1536"].includes(se.size) ? "" : "active", onClick: () => Et({ size: "1280x720" }), children: [
                /* @__PURE__ */ v.jsx(cb, { size: 17 }),
                /* @__PURE__ */ v.jsx("small", { children: b.custom })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ v.jsxs("div", { className: "kw-dimensions", children: [
            /* @__PURE__ */ v.jsxs("label", { children: [
              /* @__PURE__ */ v.jsx("span", { children: "W" }),
              /* @__PURE__ */ v.jsx("input", { "aria-label": "Width", type: "number", step: "16", min: "16", value: Ql || "", onChange: (x) => Et({ size: `${x.target.value}x${Pe || 1024}` }) })
            ] }),
            /* @__PURE__ */ v.jsx(yt, { icon: Av, label: "Swap dimensions", onClick: () => Et({ size: `${Pe}x${Ql}` }) }),
            /* @__PURE__ */ v.jsxs("label", { children: [
              /* @__PURE__ */ v.jsx("span", { children: "H" }),
              /* @__PURE__ */ v.jsx("input", { "aria-label": "Height", type: "number", step: "16", min: "16", value: Pe || "", onChange: (x) => Et({ size: `${Ql || 1024}x${x.target.value}` }) })
            ] })
          ] }),
          el && /* @__PURE__ */ v.jsx("p", { className: "kw-field-error", children: el }),
          /* @__PURE__ */ v.jsxs("div", { className: "kw-field-grid", children: [
            /* @__PURE__ */ v.jsxs("label", { className: "kw-field", children: [
              b.quality,
              /* @__PURE__ */ v.jsx("select", { value: se.quality, onChange: (x) => Et({ quality: x.target.value }), children: [["auto", S === "zh" ? "自动" : "Auto"], ["low", S === "zh" ? "快速" : "Fast"], ["medium", S === "zh" ? "标准" : "Standard"], ["high", S === "zh" ? "精细" : "High"]].map(([x, Q]) => /* @__PURE__ */ v.jsx("option", { value: x, children: Q }, x)) })
            ] }),
            /* @__PURE__ */ v.jsxs("label", { className: "kw-field", children: [
              b.format,
              /* @__PURE__ */ v.jsx("select", { value: se.outputFormat, onChange: (x) => Et({ outputFormat: x.target.value }), children: ["png", "jpeg", "webp"].map((x) => /* @__PURE__ */ v.jsx("option", { value: x, children: x.toUpperCase() }, x)) })
            ] })
          ] }),
          se.outputFormat !== "png" && /* @__PURE__ */ v.jsxs("label", { className: "kw-field", children: [
            S === "zh" ? "压缩质量" : "Compression quality",
            " · ",
            se.outputCompression,
            /* @__PURE__ */ v.jsx("input", { type: "range", min: "1", max: "100", value: se.outputCompression, onChange: (x) => Et({ outputCompression: Number(x.target.value) }) })
          ] }),
          /* @__PURE__ */ v.jsxs("div", { className: "kw-count", children: [
            /* @__PURE__ */ v.jsx("span", { children: b.count }),
            /* @__PURE__ */ v.jsx("div", { role: "group", "aria-label": b.count, children: [1, 2, 3, 4].map((x) => /* @__PURE__ */ v.jsx("button", { type: "button", className: se.count === x ? "active" : "", onClick: () => Et({ count: x }), children: x }, x)) })
          ] }),
          /* @__PURE__ */ v.jsxs("div", { className: "kw-connection-status", children: [
            /* @__PURE__ */ v.jsx("span", { className: `kw-dot ${j ? "ready" : ""}` }),
            /* @__PURE__ */ v.jsx("span", { children: j?.groupName || b.network }),
            /* @__PURE__ */ v.jsx("span", { children: j?.baseUrl ? new URL(j.baseUrl).host : "" })
          ] }),
          j && !j.models.length && /* @__PURE__ */ v.jsx("p", { role: "status", children: S === "zh" ? "当前分组没有可用生图模型。" : "No image models are available in this group." })
        ] }),
        /* @__PURE__ */ v.jsx("div", { className: "kw-composer-footer", children: /* @__PURE__ */ v.jsxs("button", { type: "button", className: "kw-generate", disabled: !j || !se.model || !se.prompt.trim() || !!el, onClick: () => Gl(), children: [
          /* @__PURE__ */ v.jsx(fc, { size: 18 }),
          b.generate,
          /* @__PURE__ */ v.jsx(oc, { size: 16 })
        ] }) })
      ] }),
      /* @__PURE__ */ v.jsxs("main", { className: "kw-main", ref: u, children: [
        /* @__PURE__ */ v.jsxs("div", { className: "kw-content-heading", children: [
          /* @__PURE__ */ v.jsxs("div", { children: [
            /* @__PURE__ */ v.jsx("span", { className: "kw-eyebrow", children: Y === "gallery" ? "PROMPT COLLECTION" : Y === "templates" ? "PROMPT SYSTEMS" : Y === "history" ? "YOUR CREATIONS" : "REFERENCE LIBRARY" }),
            /* @__PURE__ */ v.jsxs("h2", { children: [
              b[Y],
              /* @__PURE__ */ v.jsx("span", { children: Y === "gallery" ? H?.totalCases : Y === "templates" ? q?.templates?.length : Y === "history" ? te.length : "" })
            ] })
          ] }),
          (Y === "gallery" || Y === "templates") && /* @__PURE__ */ v.jsx(yt, { icon: Wg, label: b.settings, active: ma, onClick: () => jn(!ma) }),
          Y === "history" && /* @__PURE__ */ v.jsx(yt, { icon: Ka, label: b.generate, onClick: Un })
        ] }),
        (Y === "gallery" || Y === "templates") && /* @__PURE__ */ v.jsxs(v.Fragment, { children: [
          /* @__PURE__ */ v.jsxs("div", { className: "kw-search-row", children: [
            /* @__PURE__ */ v.jsxs("label", { className: "kw-search", children: [
              /* @__PURE__ */ v.jsx(Fg, { size: 17 }),
              /* @__PURE__ */ v.jsx("input", { type: "search", "aria-label": b.search, placeholder: b.search, value: de.query, onChange: (x) => at((Q) => ({ ...Q, query: x.target.value })) })
            ] }),
            Y === "gallery" && /* @__PURE__ */ v.jsx(yt, { icon: Kg, label: b.favoriteOnly, active: de.favoritesOnly, onClick: () => at((x) => ({ ...x, favoritesOnly: !x.favoritesOnly })) })
          ] }),
          /* @__PURE__ */ v.jsxs("div", { className: "kw-category-strip", children: [
            /* @__PURE__ */ v.jsx("button", { type: "button", className: de.category ? "" : "active", onClick: () => at((x) => ({ ...x, category: "" })), children: b.all }),
            (q?.categories || []).map((x) => /* @__PURE__ */ v.jsx("button", { type: "button", className: de.category === x.value ? "active" : "", onClick: () => at((Q) => ({ ...Q, category: x.value })), children: qt(x.title, S) }, x.value))
          ] }),
          ma && /* @__PURE__ */ v.jsxs("div", { className: "kw-filters", children: [
            [["style", "styles"], ["scene", "scenes"]].map(([x, Q]) => /* @__PURE__ */ v.jsxs("label", { children: [
              b[x],
              /* @__PURE__ */ v.jsxs("select", { value: de[x], onChange: (ne) => at((Me) => ({ ...Me, [x]: ne.target.value })), children: [
                /* @__PURE__ */ v.jsx("option", { value: "", children: b.all }),
                (q?.[Q] || []).map((ne) => /* @__PURE__ */ v.jsx("option", { value: ne.value, children: qt(ne.title, S) }, ne.value))
              ] })
            ] }, x)),
            /* @__PURE__ */ v.jsxs("label", { children: [
              S === "zh" ? "排序" : "Sort",
              /* @__PURE__ */ v.jsxs("select", { value: Qe, onChange: (x) => Hl(x.target.value), children: [
                /* @__PURE__ */ v.jsx("option", { value: "featured", children: b.featured }),
                /* @__PURE__ */ v.jsx("option", { value: "newest", children: b.newest })
              ] })
            ] }),
            /* @__PURE__ */ v.jsxs("button", { type: "button", className: "kw-link", onClick: () => at({ query: "", category: "", style: "", scene: "", favoritesOnly: !1 }), children: [
              /* @__PURE__ */ v.jsx(Tu, { size: 15 }),
              b.clear
            ] })
          ] }),
          /* @__PURE__ */ v.jsxs("div", { className: "kw-result-count", children: [
            (Y === "gallery" ? St : ga).length,
            " ",
            b.results,
            de.style && /* @__PURE__ */ v.jsx("span", { children: yr(de.style, q, S) }),
            de.scene && /* @__PURE__ */ v.jsx("span", { children: yr(de.scene, q, S) })
          ] })
        ] }),
        !H && /* @__PURE__ */ v.jsx("div", { className: "kw-skeletons", children: Array.from({ length: 6 }, (x, Q) => /* @__PURE__ */ v.jsx("div", {}, Q)) }),
        Y === "gallery" && H && /* @__PURE__ */ v.jsx("div", { className: "kw-grid", children: St.slice(0, dl).map((x) => /* @__PURE__ */ v.jsxs("article", { className: "kw-card", children: [
          /* @__PURE__ */ v.jsxs("button", { type: "button", className: "kw-card-image", onClick: () => Lt(x), "aria-label": `${b.read}: ${x.title}`, children: [
            /* @__PURE__ */ v.jsx(gc, { item: x, assetBase: l, sourceRevision: H?.sourceRevision }),
            x.featured && /* @__PURE__ */ v.jsx("span", { className: "kw-featured", children: /* @__PURE__ */ v.jsx(hb, { size: 13 }) })
          ] }),
          /* @__PURE__ */ v.jsxs("div", { className: "kw-card-info", children: [
            /* @__PURE__ */ v.jsxs("div", { children: [
              /* @__PURE__ */ v.jsx("span", { children: yr(x.category, q, S) }),
              /* @__PURE__ */ v.jsx(yt, { icon: Kg, label: b.favorites, active: pe.includes(x.id), onClick: () => zl(x.id) })
            ] }),
            /* @__PURE__ */ v.jsx("h3", { children: /* @__PURE__ */ v.jsx("button", { type: "button", onClick: () => Lt(x), children: x.title }) }),
            /* @__PURE__ */ v.jsxs("footer", { children: [
              /* @__PURE__ */ v.jsx("small", { children: x.sourceLabel }),
              /* @__PURE__ */ v.jsxs("button", { type: "button", onClick: () => ml(x.prompt, x), children: [
                /* @__PURE__ */ v.jsx(Ka, { size: 14 }),
                b.use
              ] })
            ] })
          ] })
        ] }, x.id)) }),
        Y === "templates" && q && /* @__PURE__ */ v.jsx("div", { className: "kw-grid kw-template-grid", children: ga.map((x) => /* @__PURE__ */ v.jsxs("article", { className: "kw-card kw-template", children: [
          /* @__PURE__ */ v.jsxs("button", { type: "button", className: "kw-card-image", onClick: () => Lt(x), children: [
            /* @__PURE__ */ v.jsx(gc, { item: { image: x.cover, title: qt(x.title, S) }, assetBase: l, sourceRevision: H?.sourceRevision }),
            /* @__PURE__ */ v.jsxs("span", { className: "kw-template-number", children: [
              x.variants?.length || 0,
              " ",
              b.variant
            ] })
          ] }),
          /* @__PURE__ */ v.jsxs("div", { className: "kw-card-info", children: [
            /* @__PURE__ */ v.jsx("h3", { children: /* @__PURE__ */ v.jsx("button", { type: "button", onClick: () => Lt(x), children: qt(x.title, S) }) }),
            /* @__PURE__ */ v.jsx("p", { children: qt(x.description, S) }),
            /* @__PURE__ */ v.jsxs("footer", { children: [
              /* @__PURE__ */ v.jsx("span", { children: yr(x.category, q, S) }),
              /* @__PURE__ */ v.jsxs("button", { type: "button", onClick: () => Lt(x), children: [
                b.read,
                /* @__PURE__ */ v.jsx(oc, { size: 14 })
              ] })
            ] })
          ] })
        ] }, x.id)) }),
        (Y === "gallery" && !St.length || Y === "templates" && !ga.length) && H && /* @__PURE__ */ v.jsxs("div", { className: "kw-empty", children: [
          /* @__PURE__ */ v.jsx(Fg, { size: 28 }),
          /* @__PURE__ */ v.jsx("p", { children: b.empty }),
          /* @__PURE__ */ v.jsx("button", { type: "button", className: "kw-secondary", onClick: () => at({ query: "", category: "", style: "", scene: "", favoritesOnly: !1 }), children: b.clear })
        ] }),
        Y === "gallery" && St.length > dl && /* @__PURE__ */ v.jsx("div", { ref: p, className: "kw-more", children: /* @__PURE__ */ v.jsx("button", { type: "button", className: "kw-secondary", onClick: () => Bl((x) => x + 30), children: b.more }) }),
        Y === "history" && /* @__PURE__ */ v.jsxs("div", { className: "kw-tasks", children: [
          !te.length && /* @__PURE__ */ v.jsxs("div", { className: "kw-empty", children: [
            /* @__PURE__ */ v.jsx(oh, { size: 38 }),
            /* @__PURE__ */ v.jsx("h3", { children: b.noHistory }),
            /* @__PURE__ */ v.jsxs("button", { type: "button", className: "kw-secondary", onClick: () => ie("gallery"), children: [
              b.gallery,
              /* @__PURE__ */ v.jsx(oc, { size: 16 })
            ] })
          ] }),
          te.map((x) => /* @__PURE__ */ v.jsxs("article", { className: `kw-task ${x.status}`, children: [
            /* @__PURE__ */ v.jsxs("header", { children: [
              /* @__PURE__ */ v.jsxs("span", { className: "kw-task-status", children: [
                x.status === "generating" ? /* @__PURE__ */ v.jsx($g, { size: 15, className: "spinning" }) : x.status === "completed" ? /* @__PURE__ */ v.jsx(X0, { size: 15 }) : /* @__PURE__ */ v.jsx(Ig, { size: 14 }),
                " ",
                x.status === "generating" ? b.running : b[x.status] || x.status
              ] }),
              /* @__PURE__ */ v.jsxs("small", { children: [
                x.model,
                " · ",
                x.size
              ] }),
              /* @__PURE__ */ v.jsxs("span", { children: [
                Math.floor((x.status === "generating" ? _n - x.createdAt : x.elapsedMs || 0) / 1e3),
                "s"
              ] }),
              x.status === "generating" ? /* @__PURE__ */ v.jsx(yt, { icon: Ig, label: b.stop, onClick: () => _a(x.id) }) : /* @__PURE__ */ v.jsx(xT, { t: b, onDelete: () => va(x) })
            ] }),
            x.status === "generating" && !x.images.length && /* @__PURE__ */ v.jsxs("div", { className: "kw-generating", children: [
              /* @__PURE__ */ v.jsxs("div", { className: "kw-generating-frame", children: [
                /* @__PURE__ */ v.jsx("i", {}),
                /* @__PURE__ */ v.jsx(fc, { size: 28 })
              ] }),
              /* @__PURE__ */ v.jsxs("span", { children: [
                b.running,
                "…"
              ] })
            ] }),
            /* @__PURE__ */ v.jsx("div", { className: "kw-task-images", children: x.images.map((Q, ne) => /* @__PURE__ */ v.jsxs("figure", { children: [
              /* @__PURE__ */ v.jsx("button", { type: "button", onClick: () => yn({ url: Q, task: x, index: ne }), children: /* @__PURE__ */ v.jsx("img", { src: Q, alt: x.prompt, loading: "lazy" }) }),
              /* @__PURE__ */ v.jsxs("figcaption", { children: [
                on(Q, `kuanapi-${x.id}-${ne + 1}.${x.outputFormat}`),
                /* @__PURE__ */ v.jsx(yt, { icon: Ka, label: b.reference, onClick: () => dt(Q) }),
                /* @__PURE__ */ v.jsx(yt, { icon: eb, label: b.read, onClick: () => yn({ url: Q, task: x, index: ne }) })
              ] })
            ] }, ne)) }),
            x.error && /* @__PURE__ */ v.jsx("p", { className: "kw-field-error", children: x.error }),
            /* @__PURE__ */ v.jsxs("details", { children: [
              /* @__PURE__ */ v.jsx("summary", { children: x.prompt }),
              /* @__PURE__ */ v.jsx("pre", { children: x.prompt }),
              x.revisedPrompt && /* @__PURE__ */ v.jsx("pre", { children: x.revisedPrompt })
            ] }),
            /* @__PURE__ */ v.jsxs("footer", { children: [
              /* @__PURE__ */ v.jsx("span", { children: new Date(x.createdAt).toLocaleString(S) }),
              /* @__PURE__ */ v.jsx(sh, { value: x.prompt, t: b, onNotice: ue }),
              /* @__PURE__ */ v.jsxs("button", { type: "button", className: "kw-link", onClick: () => {
                Et(Mu(x)), V(x.references || []), Un();
              }, children: [
                /* @__PURE__ */ v.jsx(fc, { size: 15 }),
                b.use
              ] }),
              x.status !== "generating" && /* @__PURE__ */ v.jsx(yt, { icon: Jg, label: b.retry, onClick: () => Gl(x) })
            ] })
          ] }, x.id))
        ] }),
        Y === "compare" && X && /* @__PURE__ */ v.jsx(pT, { data: X, assetBase: l, language: S, usePrompt: ml, download: gl, onNotice: ue }),
        Y === "guide" && /* @__PURE__ */ v.jsxs("div", { className: "kw-guide", children: [
          /* @__PURE__ */ v.jsxs("div", { className: "kw-guide-actions", children: [
            /* @__PURE__ */ v.jsxs("button", { type: "button", className: "kw-secondary", onClick: () => gl(l + "templates.md", "templates.md"), disabled: G[l + "templates.md"] === "pending", children: [
              /* @__PURE__ */ v.jsx(Bv, { size: 16 }),
              G[l + "templates.md"] === "ready" ? b.openFile : b.guideDownload
            ] }),
            /* @__PURE__ */ v.jsxs("button", { type: "button", className: "kw-secondary", onClick: () => gl(l + "style-library.zip", "style-library.zip"), disabled: G[l + "style-library.zip"] === "pending", children: [
              /* @__PURE__ */ v.jsx(Zg, { size: 16 }),
              G[l + "style-library.zip"] === "ready" ? b.openFile : b.archive
            ] })
          ] }),
          /* @__PURE__ */ v.jsx("div", { className: "kw-markdown", dangerouslySetInnerHTML: { __html: iT.sanitize(Je.parse(mn), { FORBID_TAGS: ["img", "script", "iframe", "form", "a"], FORBID_ATTR: ["style"] }) } }),
          /* @__PURE__ */ v.jsxs("section", { className: "kw-attribution", children: [
            /* @__PURE__ */ v.jsx("h3", { children: b.credits }),
            /* @__PURE__ */ v.jsx("p", { children: b.notice }),
            /* @__PURE__ */ v.jsx("button", { type: "button", className: "kw-link", onClick: () => gl(l + "LICENSE.txt", "LICENSE.txt"), children: "MIT License" })
          ] })
        ] }),
        Y !== "guide" && /* @__PURE__ */ v.jsxs("footer", { className: "kw-source-footer", children: [
          /* @__PURE__ */ v.jsx("span", { children: "awesome-gpt-image-2" }),
          /* @__PURE__ */ v.jsxs("button", { type: "button", onClick: () => ie("guide"), children: [
            b.credits,
            /* @__PURE__ */ v.jsx(oc, { size: 12 })
          ] })
        ] })
      ] }),
      ke && /* @__PURE__ */ v.jsxs("aside", { className: "kw-inspector", "aria-label": b.read, children: [
        /* @__PURE__ */ v.jsxs("header", { children: [
          /* @__PURE__ */ v.jsx("span", { children: ke.variants ? b.templates : `#${ke.id}` }),
          /* @__PURE__ */ v.jsx(yt, { icon: Tu, label: b.close, onClick: vn })
        ] }),
        /* @__PURE__ */ v.jsxs("div", { className: "kw-inspector-scroll", children: [
          /* @__PURE__ */ v.jsx("button", { type: "button", className: "kw-detail-image", onClick: () => yn({ url: Ju(l, ke.image || ke.cover), item: ke }), children: /* @__PURE__ */ v.jsx(gc, { item: { ...ke, image: ke.image || ke.cover, title: qt(ke.title, S) }, assetBase: l, sourceRevision: H?.sourceRevision, full: !0 }) }),
          /* @__PURE__ */ v.jsx("h2", { children: qt(ke.title, S) }),
          /* @__PURE__ */ v.jsx("p", { className: "kw-detail-description", children: qt(ke.description, S) }),
          /* @__PURE__ */ v.jsx("div", { className: "kw-detail-tags", children: [ke.category, ...ke.styles || [], ...ke.scenes || []].map((x) => /* @__PURE__ */ v.jsx("button", { type: "button", onClick: () => {
            at((Q) => ({ ...Q, query: yr(x, q, "en") })), ie("gallery"), Oe(null);
          }, children: yr(x, q, S) }, x)) }),
          ke.variants && /* @__PURE__ */ v.jsxs("label", { className: "kw-field", children: [
            b.variants,
            /* @__PURE__ */ v.jsx("select", { value: El, onChange: (x) => {
              Ge(Number(x.target.value)), Xt({});
            }, children: ke.variants.map((x, Q) => /* @__PURE__ */ v.jsxs("option", { value: Q, children: [
              x.name,
              " ",
              x.language === "json" ? "· JSON" : ""
            ] }, Q)) })
          ] }),
          ih(tn).length > 0 && /* @__PURE__ */ v.jsxs("details", { className: "kw-variables", open: !!ke.variants, children: [
            /* @__PURE__ */ v.jsxs("summary", { children: [
              b.variables,
              /* @__PURE__ */ v.jsx("span", { children: ih(tn).length })
            ] }),
            ih(tn).map((x) => /* @__PURE__ */ v.jsxs("label", { children: [
              x,
              /* @__PURE__ */ v.jsx("input", { value: pa[x] || "", onChange: (Q) => Xt((ne) => ({ ...ne, [x]: Q.target.value })) })
            ] }, x))
          ] }),
          /* @__PURE__ */ v.jsxs("div", { className: "kw-section-title", children: [
            /* @__PURE__ */ v.jsx("h3", { children: b.prompt }),
            /* @__PURE__ */ v.jsx(sh, { value: un, t: b, onNotice: ue })
          ] }),
          /* @__PURE__ */ v.jsx("textarea", { className: "kw-detail-prompt", "aria-label": S === "zh" ? "案例提示词" : "Case prompt", value: un, readOnly: !0 }),
          ke.guidance && /* @__PURE__ */ v.jsxs("section", { children: [
            /* @__PURE__ */ v.jsx("h3", { children: b.constraints }),
            /* @__PURE__ */ v.jsx("ul", { children: (ke.guidance[S] || ke.guidance.en || []).map((x) => /* @__PURE__ */ v.jsx("li", { children: x }, x)) })
          ] }),
          ke.pitfalls && /* @__PURE__ */ v.jsxs("section", { children: [
            /* @__PURE__ */ v.jsx("h3", { children: b.pitfalls }),
            /* @__PURE__ */ v.jsx("ul", { children: (ke.pitfalls[S] || ke.pitfalls.en || []).map((x) => /* @__PURE__ */ v.jsx("li", { children: x }, x)) })
          ] }),
          ke.exampleCases && /* @__PURE__ */ v.jsxs("section", { children: [
            /* @__PURE__ */ v.jsx("h3", { children: b.examples }),
            /* @__PURE__ */ v.jsx("div", { className: "kw-related", children: ke.exampleCases.map((x) => H.cases.find((Q) => Q.id === x)).filter(Boolean).map((x) => /* @__PURE__ */ v.jsx("button", { type: "button", title: x.title, onClick: () => Lt(x), children: /* @__PURE__ */ v.jsx(gc, { item: x, assetBase: l, sourceRevision: H?.sourceRevision }) }, x.id)) })
          ] }),
          ke.sourceLabel && /* @__PURE__ */ v.jsx("small", { children: ke.sourceLabel })
        ] }),
        /* @__PURE__ */ v.jsx("footer", { children: /* @__PURE__ */ v.jsxs("button", { type: "button", className: "kw-generate", disabled: !un, onClick: () => ml(un, ke), children: [
          /* @__PURE__ */ v.jsx(Ka, { size: 17 }),
          b.use
        ] }) })
      ] })
    ] }),
    _e && /* @__PURE__ */ v.jsxs("div", { className: "kw-toast", role: "status", children: [
      /* @__PURE__ */ v.jsx("span", { children: _e }),
      /* @__PURE__ */ v.jsx(yt, { icon: Tu, label: b.close, onClick: () => ue("") })
    ] }),
    wl && /* @__PURE__ */ v.jsxs("div", { className: "kw-replace-confirm", role: "alert", children: [
      /* @__PURE__ */ v.jsx("span", { children: S === "zh" ? "输入框中已有提示词" : "The editor already contains a prompt" }),
      /* @__PURE__ */ v.jsx("button", { type: "button", className: "kw-secondary", onClick: () => ql(null), children: b.keep }),
      /* @__PURE__ */ v.jsx("button", { type: "button", className: "kw-generate", onClick: () => ya(wl.prompt, wl.item), children: b.replace })
    ] }),
    Ut && /* @__PURE__ */ v.jsxs("div", { className: "kw-lightbox", role: "dialog", "aria-modal": "true", "aria-label": b.read, children: [
      /* @__PURE__ */ v.jsxs("header", { children: [
        /* @__PURE__ */ v.jsx("span", { children: Ut.task?.model || qt(Ut.item?.title, S) }),
        on(Ut.url, `kuanapi-image.${Ut.task?.outputFormat || "png"}`),
        Ut.task && /* @__PURE__ */ v.jsx(yt, { icon: Ka, label: b.reference, onClick: () => dt(Ut.url) }),
        /* @__PURE__ */ v.jsx(yt, { icon: Tu, label: b.close, onClick: () => yn(null) })
      ] }),
      /* @__PURE__ */ v.jsx("img", { src: Ut.url, onError: (x) => {
        const Q = Mc(l, Ut.url, H?.sourceRevision);
        Q && !x.currentTarget.dataset.originalSource && (x.currentTarget.dataset.originalSource = "1", x.currentTarget.src = Q);
      }, alt: Ut.task?.prompt || qt(Ut.item?.title, S) || "" }, Ut.url)
    ] })
  ] });
}
class AT extends re.Component {
  state = { failed: !1 };
  static getDerivedStateFromError() {
    return { failed: !0 };
  }
  render() {
    return this.state.failed ? /* @__PURE__ */ v.jsxs("div", { className: "kw-start-error", children: [
      /* @__PURE__ */ v.jsx("h2", { children: "专业生图暂时无法打开" }),
      /* @__PURE__ */ v.jsx("button", { onClick: () => this.props.bridge.back(), children: "返回对话" })
    ] }) : this.props.children;
  }
}
function wT(o, l, { assetBase: i, native: r = !1 }) {
  const u = gv.createRoot(o);
  return u.render(/* @__PURE__ */ v.jsx(AT, { bridge: l, children: /* @__PURE__ */ v.jsx(TT, { bridge: l, assetBase: i, native: r }) })), () => u.unmount();
}
export {
  ET as createStudioDownloader,
  wT as mountStudio
};
