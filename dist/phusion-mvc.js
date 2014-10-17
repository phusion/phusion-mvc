
/*
 * A simple complete hash routing solution for JS driven web applications.
 *
 * It will allow users to define routes like:
 *
 * articles/:article_id/comments/:comment_id
 *
 * That will trigger when a user visits the application with an url like:
 *
 * http://blog.myapp.com/#/articles/4/comments/2?hilight=towels
 *
 */

(function() {
  var Browser, RouteListener, Router, dloc, dlocHashEmpty;

  if (this.BrowRoute == null) {
    this.BrowRoute = {};
  }

  dloc = document.location;

  dlocHashEmpty = function() {
    return dloc.hash === "" || dloc.hash === "#";
  };

  this.BrowRoute.Browser = Browser = (function() {
    Browser.prototype.onHashChanged = function(onChangeEvent) {
      var hash;
      if (this.stopped) {
        return;
      }
      if (dloc.hash[0] = '#') {
        hash = dloc.hash.substr(1);
      } else {
        hash = dloc.hash;
      }
      return this.handler(hash, onChangeEvent);
    };

    function Browser(history, handler) {
      var callback;
      this.hash = dloc.hash;
      this.history = history;
      this.handler = handler;
      this.stopped = false;
      if (('onhashchange' in window) && (!('documentMode' in document) || document.documentMode > 7)) {
        callback = (function(_this) {
          return function(e) {
            return _this.onHashChanged(e);
          };
        })(this);
        if (this.history) {
          window.onpopstate = callback;
        } else {
          window.onhashchange = callback;
        }
        this.mode = "modern";
      } else {
        this.installIEHack();
        this.mode = "legacy";
      }
      this.mode;
    }

    Browser.prototype.stop = function() {
      return this.stopped = true;
    };

    Browser.prototype.fire = function() {
      if (this.mode === "modern") {
        if (this.history) {
          return window.onpopstate();
        } else {
          return window.onhashchange();
        }
      } else {
        return this.onHashChanged();
      }
    };

    Browser.prototype.setHash = function(s) {
      if (this.mode === "legacy") {
        this.writeFrame(s);
      }
      if (this.history) {
        window.history.pushState({}, document.title, "#" + s);
        return this.fire();
      } else {
        if (s[0] === "/") {
          return dloc.hash = s;
        } else {
          return dloc.hash = "/" + s;
        }
      }
    };

    Browser.prototype.installIEHack = function() {
      var frame;
      throw "IE support is untested, remove this line and carefully test. Please send results to author.";
      window._IERouteListener = this;
      frame = document.createElement("iframe");
      frame.id = "state-frame";
      frame.style.display = "none";
      document.body.appendChild(frame);
      if (('onpropertychange' in document) && ('attachEvent' in document)) {
        return document.attachEvent("onpropertychange", (function(_this) {
          return function() {
            if (event.propertyName === "location") {
              return _this.check();
            }
          };
        })(this));
      } else {
        return window.setInterval(((function(_this) {
          return function() {
            return _this.check();
          };
        })(this)), 50);
      }
    };

    Browser.prototype.writeFrame = function(s) {
      var d, f;
      f = document.getElementById("state-frame");
      d = f.contentDocument || f.contentWindow.document;
      d.open();
      d.write("<script>_hash = '" + s + "'; onload = parent._IERouteListener.syncHash;<script>");
      return d.close();
    };

    Browser.prototype.syncHash = function() {
      var s;
      s = this._hash;
      if (s !== dloc.hash) {
        return dloc.hash = s;
      }
    };

    Browser.prototype.check = function() {
      var h;
      h = dloc.hash;
      if (h !== this.hash) {
        this.hash = h;
        return this.onHashChanged();
      }
    };

    return Browser;

  })();

  if (this.BrowRoute == null) {
    this.BrowRoute = {};
  }

  this.BrowRoute.RouteListener = RouteListener = (function() {
    function RouteListener(route, paramsObject) {
      this.route = route;
      this.paramsObject = paramsObject != null ? paramsObject : false;
      this.variableNames = [];
      this.callbacks = [];
      this.compile();
    }

    RouteListener.prototype.matches = function(url) {
      var name, options, params, parts, results, _i, _len, _ref;
      if (url[0] === '#') {
        url = url.substr(1);
      }
      parts = url.split("?", 2);
      results = this.regex.exec(parts[0]);
      options = this.parseOptions(parts[1]);
      if (results != null) {
        if (this.paramsObject) {
          params = {};
          results.shift();
          _ref = this.variableNames;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            name = _ref[_i];
            params[name] = results.shift();
          }
          return results = [params, options];
        } else {
          results.push(options);
          return results.slice(1);
        }
      } else {
        return false;
      }
    };

    RouteListener.prototype.trigger = function(url) {
      var cb, matches, _i, _len, _ref, _results;
      if (matches = this.matches(url)) {
        _ref = this.callbacks;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          cb = _ref[_i];
          _results.push(cb.apply(null, matches));
        }
        return _results;
      }
    };

    RouteListener.prototype.variableRegex = "([a-zA-Z0-9-]+)";

    RouteListener.prototype.variableNameRegex = /^([a-zA-Z0-9-_]+)/;

    RouteListener.prototype.globbingVariableRegex = "([a-zA-Z0-9-]+)";

    RouteListener.prototype.optionalScopeBeginRegex = "(?:";

    RouteListener.prototype.optionalScopeEndRegex = ")?";

    RouteListener.prototype.escapeCharacter = function(next) {
      return '\\' + next;
    };

    RouteListener.prototype.readVariableName = function(string, i) {
      var result;
      result = this.variableNameRegex.exec(string);
      if (!(result != null ? result[0] : void 0)) {
        throw "Expected variable name consisting of letters and numbers at position " + i + " in route: " + this.route;
      }
      return result[0];
    };

    RouteListener.prototype.compile = function() {
      var c, i, next, optional_scope, result, result_array, variable_name;
      result_array = [];
      optional_scope = 0;
      i = 0;
      while (i < this.route.length) {
        c = this.route[i];
        switch (c) {
          case ':':
            variable_name = this.readVariableName(this.route.substr(i + 1), i);
            this.variableNames.push(variable_name);
            i += variable_name.length;
            result_array.push(this.variableRegex);
            break;
          case '*':
            variable_name = this.readVariableName(this.route.substr(i + 1), i);
            this.variableNames.push(variable_name);
            i += variable_name.length;
            result_array.push(this.globbingVariableRegex);
            break;
          case '(':
            optional_scope += 1;
            result_array.push(this.optionalScopeBeginRegex);
            break;
          case ')':
            optional_scope -= 1;
            if (optional_scope < 0) {
              throw "Unexpected ')' while parsing route: " + this.route;
            }
            result_array.push(this.optionalScopeEndRegex);
            break;
          case '\\':
            next = this.route[i + 1];
            i += 1;
            result_array.push(this.escapeCharacter(next));
            break;
          default:
            result_array.push(c);
        }
        i += 1;
      }
      result = "^" + result_array.join("") + "$";
      return this.regex = new RegExp(result);
    };

    RouteListener.prototype.parseOptions = function(string) {
      var items, length, name, pair, splits, v, value, _i, _len;
      if (!string) {
        return {};
      }
      string = string.replace(/&+/g, '&').replace(/^\?*&*|&+$/g, '');
      if (!string) {
        return {};
      }
      items = {};
      splits = string.split('&');
      length = splits.length;
      for (_i = 0, _len = splits.length; _i < _len; _i++) {
        pair = splits[_i];
        v = pair.split('=');
        name = this.decodeQuery(v.shift());
        value = v.length ? this.decodeQuery(v.join("=")) : null;
        if (items[name]) {
          if (typeof items[name] === 'string') {
            items[name] = [items[name]];
          }
          items[name].push(value);
        } else {
          items[name] = value;
        }
      }
      return items;
    };

    RouteListener.prototype.decodeQuery = function(string) {
      var e;
      try {
        return decodeURIComponent(string.replace(/\+/g, '%20'));
      } catch (_error) {
        e = _error;
        return string;
      }
    };

    return RouteListener;

  })();

  if (this.BrowRoute == null) {
    this.BrowRoute = {};
  }


  /*
   * Example usage:
   *
   * var router = new BrowRouter()
   *
   * router.on("articles/:article_id/comments/:comment_id",
   *    function(article_id, comment_id, options) {
   *        // silly example using JQuery
   *        $('.view.active').removeClass('active');
   *        $('.views.CommentView').addClass('active');
   *        var comment = Comments[article_id][comment_id];
   *        $('.views.CommentView').render(comment, options);
   *    });
   *
   */

  this.BrowRoute.Router = Router = (function() {

    /*
    	 * Constructs a BrowRouter that will listen to browser navigations
    	 * and trigger registered routes. Won't start listening until the
    	 * start method has been invoked.
    	 *
    	 * If you'd like to receive params as an object instead of a list
    	 * arguments pass true into the constructor.
     */
    function Router(paramsObject) {
      this.paramsObject = paramsObject != null ? paramsObject : false;
      this.routes = {};
    }

    Router.prototype.start = function(runCurrent) {
      if (runCurrent == null) {
        runCurrent = true;
      }
      this.browser = new Browser(true, (function(_this) {
        return function(url) {
          return _this.dispatch(url);
        };
      })(this));
      if (runCurrent) {
        return this.dispatch(document.location.hash);
      }
    };


    /*
    	 * Register a route
     */

    Router.prototype.on = function(route, callback) {
      var _base;
      (_base = this.routes)[route] || (_base[route] = new RouteListener(route, this.paramsObject));
      return this.routes[route].callbacks.push(callback);
    };

    Router.prototype.stopAll = function() {
      delete this.routes;
      this.routes = {};
      if (this.browser != null) {
        return this.browser.stop();
      }
    };

    Router.prototype.stop = function(route, callback) {
      var cb, i, index, listener, _i, _len, _ref;
      listener = this.routes[route];
      index = -1;
      _ref = listener.callbacks;
      for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
        cb = _ref[i];
        if (cb === callback) {
          index = i;
        }
      }
      if (index > -1) {
        listener.callbacks.splice(index, 1);
      }
      if (listener.callbacks.length === 0) {
        return delete this.routes[route];
      }
    };


    /*
    	 * Trigger on an url
     */

    Router.prototype.dispatch = function(url) {
      var r, v, _ref, _results;
      _ref = this.routes;
      _results = [];
      for (r in _ref) {
        v = _ref[r];
        _results.push(v.trigger(url));
      }
      return _results;
    };

    return Router;

  })();

}).call(this);

(function() {
  var DataHandler;

  DataHandler = (function() {
    function DataHandler() {
      this.processors = [];
      this.stopped = false;
      this.eventHandlers = {
        data: [],
        error: [],
        timeout: [],
        unauthorized: [],
        stop: []
      };
    }

    DataHandler.prototype.on = function(name, handler) {
      if (this.eventHandlers[name] == null) {
        throw "No such event: \"" + name + "\" on DataHandler";
      }
      return this.eventHandlers[name].push(handler);
    };

    DataHandler.prototype.processData = function(func) {
      return this.processors.push(func);
    };

    DataHandler.prototype.data = function(data) {
      var handler, processor, _i, _j, _len, _len1, _ref, _ref1, _results;
      if (this.stopped) {
        return;
      }
      _ref = this.processors;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        processor = _ref[_i];
        data = processor(data);
        if (data == null) {
          return;
        }
      }
      if ((data == null) || data.length === 0) {
        this.error({
          message: 'Empty data received',
          data: data
        });
        return;
      }
      _ref1 = this.eventHandlers.data;
      _results = [];
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        handler = _ref1[_j];
        _results.push(handler(data));
      }
      return _results;
    };

    DataHandler.prototype.error = function(data) {
      var handler, _i, _len, _ref, _results;
      if (this.stopped) {
        return;
      }
      _ref = this.eventHandlers.error;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        handler = _ref[_i];
        _results.push(handler(data));
      }
      return _results;
    };

    DataHandler.prototype.timeout = function(data) {
      var handler, _i, _len, _ref, _results;
      if (this.stopped) {
        return;
      }
      _ref = this.eventHandlers.timeout;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        handler = _ref[_i];
        _results.push(handler());
      }
      return _results;
    };

    DataHandler.prototype.unauthorized = function() {
      var handler, _i, _len, _ref, _results;
      if (this.stopped) {
        return;
      }
      _ref = this.eventHandlers.unauthorized;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        handler = _ref[_i];
        _results.push(handler());
      }
      return _results;
    };

    DataHandler.prototype.stop = function() {
      var handler, _i, _len, _ref, _results;
      this.stopped = true;
      _ref = this.eventHandlers.stop;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        handler = _ref[_i];
        _results.push(handler());
      }
      return _results;
    };

    return DataHandler;

  })();

  window.DataHandler = DataHandler;

}).call(this);

(function() {
  var Model;

  Model = (function() {
    Model.prototype.instanceMembers = {};

    function Model(data) {
      this.update(data);
    }

    Model.prototype.update = function(data) {
      var i, key, klass, v, value, _results;
      _results = [];
      for (key in data) {
        value = data[key];
        if ((klass = this.instanceMembers[key]) != null) {
          if (Array.isArray(value)) {
            if (this[key] == null) {
              this[key] = new Array(value.length);
            }
            _results.push((function() {
              var _i, _len, _results1;
              _results1 = [];
              for (i = _i = 0, _len = value.length; _i < _len; i = ++_i) {
                v = value[i];
                if (this[key][i] != null) {
                  _results1.push(this[key][i].update(v));
                } else {
                  _results1.push(this[key][i] = new window[klass](v));
                }
              }
              return _results1;
            }).call(this));
          } else {
            if (this[key] != null) {
              _results.push(this[key].update(value));
            } else {
              _results.push(this[key] = new window[klass](value));
            }
          }
        } else {
          _results.push(this[key] = value);
        }
      }
      return _results;
    };

    return Model;

  })();

  window.Model = Model;

}).call(this);

(function() {
  var Api, buildQueryString, makeRequest;

  buildQueryString = function(parameters) {
    var key, qs, value;
    qs = [];
    for (key in parameters) {
      value = parameters[key];
      qs.push(encodeURIComponent(key) + "=" + encodeURIComponent(value));
    }
    return qs.join("&");
  };

  makeRequest = function(method, path, params) {
    var dataHandler, timer, xhr;
    xhr = new XMLHttpRequest();
    if ((params != null) && method === 'GET') {
      path += '?' + buildQueryString(params);
    }
    xhr.open(method, path, true);
    if ((params != null) && method !== 'GET') {
      params = JSON.stringify(params);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.send(params);
    } else {
      xhr.send();
    }
    dataHandler = new DataHandler();
    timer = setTimeout(((function(_this) {
      return function() {
        return dataHandler.timeout(path);
      };
    })(this)), 5000);
    xhr.onreadystatechange = (function(_this) {
      return function() {
        var err, response;
        if (xhr.readyState === 4) {
          clearTimeout(timer);
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              response = JSON.parse(xhr.responseText);
            } catch (_error) {
              err = _error;
              dataHandler.error({
                message: 'Request ' + path + ' returned invalid JSON',
                error: err
              });
            }
            if (response != null) {
              return dataHandler.data(response);
            } else {
              return dataHandler.error({
                message: 'Request ' + path + ' returned no data'
              });
            }
          } else {
            if (xhr.status === 401) {
              return dataHandler.unauthorized();
            } else {
              return dataHandler.error({
                status: xhr.status,
                message: 'Request ' + path + ' failed'
              });
            }
          }
        }
      };
    })(this);
    return dataHandler;
  };

  Api = {
    get: function(path, params) {
      return makeRequest("GET", path, params);
    },
    put: function(path, body) {
      return makeRequest("PUT", path, body);
    }
  };

  window.Api = Api;

}).call(this);

(function() {
  var Router, merge, tap,
    __slice = [].slice;

  merge = function() {
    var objects;
    objects = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    if ((objects != null ? objects.length : void 0) > 0) {
      return tap({}, function(stub) {
        var key, obj, value, _i, _len, _results;
        _results = [];
        for (_i = 0, _len = objects.length; _i < _len; _i++) {
          obj = objects[_i];
          _results.push((function() {
            var _results1;
            _results1 = [];
            for (key in obj) {
              value = obj[key];
              _results1.push(stub[key] = value);
            }
            return _results1;
          })());
        }
        return _results;
      });
    }
  };

  tap = function(obj, func) {
    func(obj);
    return obj;
  };

  Router = (function() {
    function Router() {
      this.router = new BrowRoute.Router(true);
      this.current_route = null;
      this.current_view = null;
      this.previous_route = "/";
      this.params = null;
      addEventListener('registerView', (function(_this) {
        return function(e) {
          return _this.registerView(e.detail);
        };
      })(this));
      addEventListener('polymer-ready', (function(_this) {
        return function(e) {
          return _this.init();
        };
      })(this));
    }

    Router.prototype.init = function() {
      if (document.location.hash === '') {
        document.location.hash = "/";
      }
      return this.router.start();
    };

    Router.prototype.registerView = function(view) {
      return this.router.on(view.route, (function(_this) {
        return function(params, options) {
          var new_route, new_view, previous_view;
          new_view = view;
          new_route = window.location.hash;
          if (new_route === _this.current_route) {
            return;
          }
          _this.params = merge(params, options);
          previous_view = _this.current_view;
          _this.current_view = new_view;
          if ((previous_view != null) && !previous_view.noRouteHistory) {
            _this.previous_route = _this.current_route;
          }
          _this.current_route = new_route;
          new_view.visit(params);
          if ((previous_view != null) && previous_view !== _this.current_view) {
            return previous_view.leave(params, new_view);
          }
        };
      })(this));
    };

    Router.prototype.goBack = function() {
      return window.location.hash = this.previous_route;
    };

    return Router;

  })();

  window.Router || (window.Router = new Router());

}).call(this);

(function() {
  Polymer('phusion-namespace', {
    ready: function() {
      return this.addEventListener('registerView', function(e) {
        return this.registerView(e.detail);
      });
    },
    registerView: function(view) {
      return view.route = this.namespace + view.route;
    }
  });

}).call(this);
;
(function() {
  var clone, tap;

  clone = function(obj) {
    return tap({}, function(stub) {
      var key, value, _results;
      _results = [];
      for (key in obj) {
        value = obj[key];
        _results.push(stub[key] = value);
      }
      return _results;
    });
  };

  tap = function(obj, func) {
    func(obj);
    return obj;
  };

  Polymer('phusion-view', {
    ready: function() {
      this.dataLoaders = [];
      this.addEventListener('registerDataLoader', (function(_this) {
        return function(e) {
          return _this.dataLoaders.push(e.detail);
        };
      })(this));
      return this.asyncFire('registerView', this);
    },
    visit: function(params) {
      if (!this.loaded || JSON.stringify(params) !== JSON.stringify(this.lastParams)) {
        this.loadData(clone(params));
        this.dataLoaders.forEach(function(e) {
          return e.loadData(clone(params));
        });
        this.loaded = true;
      }
      this.lastParams = params;
      return this.show();
    },
    leave: function(params, new_view) {
      this.hide(new_view);
      return setTimeout((function(_this) {
        return function() {
          if (!_this.visible) {
            _this.unloadData();
            _this.dataLoaders.forEach(function(e) {
              return typeof e.unloadData === "function" ? e.unloadData() : void 0;
            });
            return _this.loaded = false;
          }
        };
      })(this), 30000);
    },
    show: function() {
      this.visible = true;
      this.classList.add('active');
      return document.body.className = document.body.className.replace(/not-loaded/, '');
    },
    hide: function() {
      this.visible = false;
      return this.classList.remove('active');
    },
    loadData: function(params) {},
    unloadData: function() {},
    requiresAuthentication: function() {
      return true;
    }
  });

}).call(this);
