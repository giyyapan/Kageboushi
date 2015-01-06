// Generated by CoffeeScript 1.7.1
(function() {
  
/**
 * Implementation of base URI resolving algorithm in rfc2396.
 * - Algorithm from section 5.2
 *   (ignoring difference between undefined and '')
 * - Regular expression from appendix B
 * - Tests from appendix C
 *
 * @param {string} uri the relative URI to resolve
 * @param {string} baseuri the base URI (must be absolute) to resolve against
 */

URI = function(){
    function resolveUri(sUri, sBaseUri) {
	if (sUri == '' || sUri.charAt(0) == '#') return sUri;
	var hUri = getUriComponents(sUri);
	if (hUri.scheme) return sUri;
	var hBaseUri = getUriComponents(sBaseUri);
	hUri.scheme = hBaseUri.scheme;
	if (!hUri.authority) {
	    hUri.authority = hBaseUri.authority;
	    if (hUri.path.charAt(0) != '/') {
		aUriSegments = hUri.path.split('/');
		aBaseUriSegments = hBaseUri.path.split('/');
		aBaseUriSegments.pop();
		var iBaseUriStart = aBaseUriSegments[0] == '' ? 1 : 0;
		for (var i in aUriSegments) {
		    if (aUriSegments[i] == '..')
			if (aBaseUriSegments.length > iBaseUriStart) aBaseUriSegments.pop();
		    else { aBaseUriSegments.push(aUriSegments[i]); iBaseUriStart++; }
		    else if (aUriSegments[i] != '.') aBaseUriSegments.push(aUriSegments[i]);
		}
		if (aUriSegments[i] == '..' || aUriSegments[i] == '.') aBaseUriSegments.push('');
		hUri.path = aBaseUriSegments.join('/');
	    }
	}
	var result = '';
	if (hUri.scheme   ) result += hUri.scheme + ':';
	if (hUri.authority) result += '//' + hUri.authority;
	if (hUri.path     ) result += hUri.path;
	if (hUri.query    ) result += '?' + hUri.query;
	if (hUri.fragment ) result += '#' + hUri.fragment;
	return result;
    }
    uriregexp = new RegExp('^(([^:/?#]+):)?(//([^/?#]*))?([^?#]*)(\\?([^#]*))?(#(.*))?');
    function getUriComponents(uri) {
	var c = uri.match(uriregexp);
	return { scheme: c[2], authority: c[4], path: c[5], query: c[7], fragment: c[9] };
    }
    var URI = {}
    URI.resolve = function(base,target){
        return resolveUri(target,base);
    }
    URI.normalize = function(url){
        return URI.resolve("",url);
    }
    return {URI:URI}
}();
  var Context, Script, exports,
    __slice = [].slice;

  Context = (function() {
    Context.id = 0;

    Context.instances = [];

    Context.getContext = function(id) {
      return this.instances[id];
    };

    Context._httpGet = function(url, callback) {
      var XHR;
      XHR = new XMLHttpRequest();
      XHR.open("GET", url, true);
      XHR.onreadystatechange = (function(_this) {
        return function(err) {
          if (XHR.readyState === 4) {
            callback(null, XHR.responseText);
          }
          if (XHR.readyState === 0) {
            return callback(new Error("Network Error"));
          }
        };
      })(this);
      return XHR.send();
    };

    function Context(option) {
      if (option == null) {
        option = {};
      }
      this.scripts = [];
      this.root = option.root || "./";
      this.ready = false;
      this.id = Context.id++;
      this.globalName = "LeafRequire";
      this.useObjectUrl = false;
      this.version = "0.0.0";
      Context.instances[this.id] = this;
      this.localStoragePrefix = "leaf-require";
    }

    Context.prototype.use = function() {
      var file, files, _i, _len, _results;
      files = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      _results = [];
      for (_i = 0, _len = files.length; _i < _len; _i++) {
        file = files[_i];
        console.log("use", file.path || file);
        _results.push(this.scripts.push(new Script(this, file)));
      }
      return _results;
    };

    Context.prototype.getScript = function(path) {
      var script, _i, _j, _len, _len1, _ref, _ref1;
      _ref = this.scripts;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        script = _ref[_i];
        if (script.scriptPath === path) {
          return script;
        }
      }
      if (path.lastIndexOf(".js") !== path.length - ".js".length) {
        _ref1 = this.scripts;
        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
          script = _ref1[_j];
          if (script.scriptPath === path + ".js") {
            return script;
          }
        }
      }
      return null;
    };

    Context.prototype.setConfig = function(config, callback) {
      var e;
      if (typeof config === "string") {
        return this.setConfigRemote(config, callback);
      } else {
        try {
          this.setConfigSync(config);
          return callback();
        } catch (_error) {
          e = _error;
          return callback(e);
        }
      }
    };

    Context.prototype.setConfigSync = function(config) {
      var file, files, _i, _len;
      config.js = config.js || {};
      files = config.js.files || [];
      this.root = config.js.root || this.root;
      for (_i = 0, _len = files.length; _i < _len; _i++) {
        file = files[_i];
        this.use(file);
      }
      this.name = config.name;
      this.localStoragePrefix = this.name;
      this.mainModule = config.js.main || null;
      this.debug = config.debug || this.debug;
      this.enableCache = config.cache || this.enableCache || !this.debug || false;
      this.version = config.version || this.version || "0.0.0";
      if (this.enableCache) {
        this.prepareCache();
        this.cache.config = config;
        return this.saveCache();
      }
    };

    Context.prototype.loadWithConfigFromCache = function(callback) {
      this.prepareCache();
      if (!this.cache.config) {
        callback(new Error("no config cache available"));
        return;
      }
      this.setConfigSync(this.cache.config);
      return this.load(callback);
    };

    Context.prototype.setConfigRemote = function(src, callback) {
      return Context._httpGet(src, (function(_this) {
        return function(err, content) {
          var config, e;
          if (err) {
            console.error(err);
            callback(new Error("fail to get configs " + src + " due to network error"));
            return;
          }
          try {
            config = JSON.parse(content);
            _this.setConfigSync(config);
            return callback(null);
          } catch (_error) {
            e = _error;
            return callback(e);
          }
        };
      })(this));
    };

    Context.prototype.getRequire = function(path) {
      var script;
      script = this.getScript(path);
      return function(_path) {
        return script.require(_path);
      };
    };

    Context.prototype.setRequire = function(path, module, exports, __require) {
      var script;
      script = this.getScript(path);
      return script.setRequire(module, exports, __require);
    };

    Context.prototype.require = function(path, fromScript) {
      var realPath, script, url;
      url = URI.URI;
      if (fromScript) {
        realPath = url.resolve(fromScript.scriptPath, path);
      } else {
        realPath = url.normalize(path);
      }
      if (realPath.indexOf("/") === 0) {
        realPath = realPath.substring(1);
      }
      script = this.getScript(realPath);
      if (!script) {
        throw new Error("module " + realPath + " not found");
      }
      return script.beRequired();
    };

    Context.prototype.load = function(callback) {
      return this.scripts.forEach((function(_this) {
        return function(script) {
          return script.load(function(err) {
            var allReady;
            if (err) {
              throw new Error("fail to load script " + script.loadPath);
            }
            allReady = _this.scripts.every(function(item) {
              if (!item.isReady) {
                return false;
              }
              return true;
            });
            if (allReady) {
              if (_this.mainModule) {
                _this.require(_this.mainModule);
              }
              return callback();
            }
          });
        };
      })(this));
    };

    Context.prototype.clearCache = function(version) {
      var index, key, keys, _i, _len, _results;
      if (!window.localStorage) {
        return;
      }
      keys = (function() {
        var _i, _ref, _results;
        _results = [];
        for (index = _i = 0, _ref = window.localStorage.length; 0 <= _ref ? _i < _ref : _i > _ref; index = 0 <= _ref ? ++_i : --_i) {
          _results.push(window.localStorage.key(index));
        }
        return _results;
      })();
      _results = [];
      for (_i = 0, _len = keys.length; _i < _len; _i++) {
        key = keys[_i];
        if (key.indexOf(this.localStoragePrefix) === 0) {
          _results.push(window.localStorage.removeItem(key));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    Context.prototype.prepareCache = function() {
      var cache, e;
      if (!window.localStorage) {
        this.cache = {};
        return;
      }
      if (this.cache) {
        return;
      }
      cache = window.localStorage.getItem("" + this.localStoragePrefix + "/cache") || "{}";
      try {
        this.cache = JSON.parse(cache);
      } catch (_error) {
        e = _error;
        this.cache = {};
      }
    };

    Context.prototype.saveCache = function() {
      var cache;
      if (!window.localStorage) {
        return;
      }
      cache = this.cache || {};
      return window.localStorage.setItem("" + this.localStoragePrefix + "/cache", JSON.stringify(cache));
    };

    Context.prototype.saveCacheDelay = function() {
      if (this._saveCacheDelayTimer) {
        clearTimeout(this._saveCacheDelayTimer);
      }
      return this._saveCacheDelayTimer = setTimeout(((function(_this) {
        return function() {
          return _this.saveCache();
        };
      })(this)), 0);
    };

    return Context;

  })();

  Script = (function() {
    function Script(context, file) {
      var url;
      this.context = context;
      url = URI.URI;
      if (typeof file === "string") {
        this.path = file;
      } else {
        this.path = file.path;
        this.hash = file.hash || null;
      }
      this.scriptPath = url.normalize(this.path);
      this.loadPath = url.resolve(this.context.root, this.path);
    }

    Script.prototype._restoreScriptContentFromCache = function() {
      var files;
      this.context.prepareCache();
      files = this.context.cache.files || {};
      return files[this.loadPath];
    };

    Script.prototype._saveScriptContentToCache = function(content) {
      var files;
      this.context.prepareCache();
      console.debug("save to " + this.loadPath + " with hash " + this.hash + " ??");
      files = this.context.cache.files = this.context.cache.files || {};
      files[this.loadPath] = {
        hash: this.hash,
        content: content
      };
      return this.context.saveCacheDelay();
    };

    Script.prototype.require = function(path) {
      return this.context.require(path, this);
    };

    Script.prototype.setRequire = function(module, exports, __require) {
      this._module = module;
      this._exports = exports;
      this._require = __require;
      this.isReady = true;
      if (this._loadCallback) {
        return this._loadCallback();
      }
    };

    Script.prototype.beRequired = function() {
      if (this.exports) {
        return this.exports;
      }
      if (this._isRequiring) {
        return this._module.exports;
      }
      this._isRequiring = true;
      this._require();
      this._isRequiring = false;
      if (this._exports !== this._module.exports) {
        this._exports = this._module.exports;
      }
      this.exports = this._exports;
      return this.exports;
    };

    Script.prototype.load = function(callback) {
      var file;
      this._loadCallback = callback;
      if (this.isReady) {
        callback();
        return;
      }
      if (this.context && this.context.enableCache) {
        file = this._restoreScriptContentFromCache();
        console.debug("try restore " + this.loadPath + " from cache", file);
        console.debug(this.hash, file && file.hash);
        if (file && file.content && !(this.version && this.version !== file.version)) {
          console.debug("cache found and do the restore");
          console.debug("" + this.loadPath + " from cache");
          setTimeout(((function(_this) {
            return function() {
              return _this.parse(file.content);
            };
          })(this)), 0);
          return;
        }
      }
      return Context._httpGet(this.loadPath, (function(_this) {
        return function(err, content) {
          if (err) {
            console.error(err);
            throw new Error("fail to get " + _this.loadPath);
          }
          return _this.parse(content);
        };
      })(this));
    };

    Script.prototype.parse = function(scriptContent) {
      var code, mapDataUrl, script;
      if (this.script) {
        null;
      }
      if (this.context.enableCache) {
        this._saveScriptContentToCache(scriptContent);
      }
      script = document.createElement("script");
      code = "(function(){\n    var require = " + this.context.globalName + ".getContext(" + this.context.id + ").getRequire('" + this.scriptPath + "')\n    var module = {exports:{}};\n    var exports = module.exports\n    var global = window;\n    var __require = function(){\n    \n// " + this.scriptPath + "\n// BY leaf-require\n" + scriptContent + "\n\n}\n" + this.context.globalName + ".getContext(" + this.context.id + ").setRequire('" + this.scriptPath + "',module,exports,__require)\n\n})()";
      if (this.context.debug) {
        mapDataUrl = this.createSourceMapUrl(scriptContent);
        code += "//# sourceMappingURL=" + mapDataUrl;
      }
      this.script = script;
      script.innerHTML = code;
      return document.body.appendChild(script);
    };

    Script.prototype.createSourceMapUrl = function(content) {
      var index, line, map, offset, result, url, _, _i, _j, _len, _ref;
      offset = 9;
      map = {
        "version": 3,
        "file": this.loadPath,
        "sourceRoot": "",
        "sources": [this.loadPath],
        "sourcesContent": [content],
        "names": [],
        "mappings": null
      };
      result = [];
      for (_ = _i = 0; 0 <= offset ? _i < offset : _i > offset; _ = 0 <= offset ? ++_i : --_i) {
        result.push(";");
      }
      _ref = content.split("\n");
      for (index = _j = 0, _len = _ref.length; _j < _len; index = ++_j) {
        line = _ref[index];
        if (index === 0) {
          result.push("AAAA");
        } else {
          result.push(";AACA");
        }
      }
      map.mappings = result.join("");
      url = URL.createObjectURL(new Blob([JSON.stringify(map)], {
        type: "text/json"
      }));
      return url;
    };

    return Script;

  })();

  if (!exports) {
    exports = window;
  }

  exports.LeafRequire = Context;

}).call(this);