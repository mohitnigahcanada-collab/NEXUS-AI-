// @bun
var __create = Object.create;
var __getProtoOf = Object.getPrototypeOf;
var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
function __accessProp(key) {
  return this[key];
}
var __toESMCache_node;
var __toESMCache_esm;
var __toESM = (mod, isNodeMode, target) => {
  var canCache = mod != null && typeof mod === "object";
  if (canCache) {
    var cache = isNodeMode ? __toESMCache_node ??= new WeakMap : __toESMCache_esm ??= new WeakMap;
    var cached = cache.get(mod);
    if (cached)
      return cached;
  }
  target = mod != null ? __create(__getProtoOf(mod)) : {};
  const to = isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target;
  for (let key of __getOwnPropNames(mod))
    if (!__hasOwnProp.call(to, key))
      __defProp(to, key, {
        get: __accessProp.bind(mod, key),
        enumerable: true
      });
  if (canCache)
    cache.set(mod, to);
  return to;
};
var __commonJS = (cb, mod) => () => (mod || cb((mod = { exports: {} }).exports, mod), mod.exports);
var __jsonParse = (a) => JSON.parse(a);

// node_modules/hono/dist/compose.js
var compose = (middleware, onError, onNotFound) => {
  return (context, next) => {
    let index = -1;
    return dispatch(0);
    async function dispatch(i) {
      if (i <= index) {
        throw new Error("next() called multiple times");
      }
      index = i;
      let res;
      let isError = false;
      let handler;
      if (middleware[i]) {
        handler = middleware[i][0][0];
        context.req.routeIndex = i;
      } else {
        handler = i === middleware.length && next || undefined;
      }
      if (handler) {
        try {
          res = await handler(context, () => dispatch(i + 1));
        } catch (err) {
          if (err instanceof Error && onError) {
            context.error = err;
            res = await onError(err, context);
            isError = true;
          } else {
            throw err;
          }
        }
      } else {
        if (context.finalized === false && onNotFound) {
          res = await onNotFound(context);
        }
      }
      if (res && (context.finalized === false || isError)) {
        context.res = res;
      }
      return context;
    }
  };
};

// node_modules/hono/dist/request/constants.js
var GET_MATCH_RESULT = /* @__PURE__ */ Symbol();

// node_modules/hono/dist/utils/body.js
var parseBody = async (request, options = /* @__PURE__ */ Object.create(null)) => {
  const { all = false, dot = false } = options;
  const headers = request instanceof HonoRequest ? request.raw.headers : request.headers;
  const contentType = headers.get("Content-Type");
  if (contentType?.startsWith("multipart/form-data") || contentType?.startsWith("application/x-www-form-urlencoded")) {
    return parseFormData(request, { all, dot });
  }
  return {};
};
async function parseFormData(request, options) {
  const formData = await request.formData();
  if (formData) {
    return convertFormDataToBodyData(formData, options);
  }
  return {};
}
function convertFormDataToBodyData(formData, options) {
  const form = /* @__PURE__ */ Object.create(null);
  formData.forEach((value, key) => {
    const shouldParseAllValues = options.all || key.endsWith("[]");
    if (!shouldParseAllValues) {
      form[key] = value;
    } else {
      handleParsingAllValues(form, key, value);
    }
  });
  if (options.dot) {
    Object.entries(form).forEach(([key, value]) => {
      const shouldParseDotValues = key.includes(".");
      if (shouldParseDotValues) {
        handleParsingNestedValues(form, key, value);
        delete form[key];
      }
    });
  }
  return form;
}
var handleParsingAllValues = (form, key, value) => {
  if (form[key] !== undefined) {
    if (Array.isArray(form[key])) {
      form[key].push(value);
    } else {
      form[key] = [form[key], value];
    }
  } else {
    if (!key.endsWith("[]")) {
      form[key] = value;
    } else {
      form[key] = [value];
    }
  }
};
var handleParsingNestedValues = (form, key, value) => {
  if (/(?:^|\.)__proto__\./.test(key)) {
    return;
  }
  let nestedForm = form;
  const keys = key.split(".");
  keys.forEach((key2, index) => {
    if (index === keys.length - 1) {
      nestedForm[key2] = value;
    } else {
      if (!nestedForm[key2] || typeof nestedForm[key2] !== "object" || Array.isArray(nestedForm[key2]) || nestedForm[key2] instanceof File) {
        nestedForm[key2] = /* @__PURE__ */ Object.create(null);
      }
      nestedForm = nestedForm[key2];
    }
  });
};

// node_modules/hono/dist/utils/url.js
var splitPath = (path) => {
  const paths = path.split("/");
  if (paths[0] === "") {
    paths.shift();
  }
  return paths;
};
var splitRoutingPath = (routePath) => {
  const { groups, path } = extractGroupsFromPath(routePath);
  const paths = splitPath(path);
  return replaceGroupMarks(paths, groups);
};
var extractGroupsFromPath = (path) => {
  const groups = [];
  path = path.replace(/\{[^}]+\}/g, (match, index) => {
    const mark = `@${index}`;
    groups.push([mark, match]);
    return mark;
  });
  return { groups, path };
};
var replaceGroupMarks = (paths, groups) => {
  for (let i = groups.length - 1;i >= 0; i--) {
    const [mark] = groups[i];
    for (let j = paths.length - 1;j >= 0; j--) {
      if (paths[j].includes(mark)) {
        paths[j] = paths[j].replace(mark, groups[i][1]);
        break;
      }
    }
  }
  return paths;
};
var patternCache = {};
var getPattern = (label, next) => {
  if (label === "*") {
    return "*";
  }
  const match = label.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);
  if (match) {
    const cacheKey = `${label}#${next}`;
    if (!patternCache[cacheKey]) {
      if (match[2]) {
        patternCache[cacheKey] = next && next[0] !== ":" && next[0] !== "*" ? [cacheKey, match[1], new RegExp(`^${match[2]}(?=/${next})`)] : [label, match[1], new RegExp(`^${match[2]}$`)];
      } else {
        patternCache[cacheKey] = [label, match[1], true];
      }
    }
    return patternCache[cacheKey];
  }
  return null;
};
var tryDecode = (str, decoder) => {
  try {
    return decoder(str);
  } catch {
    return str.replace(/(?:%[0-9A-Fa-f]{2})+/g, (match) => {
      try {
        return decoder(match);
      } catch {
        return match;
      }
    });
  }
};
var tryDecodeURI = (str) => tryDecode(str, decodeURI);
var getPath = (request) => {
  const url = request.url;
  const start = url.indexOf("/", url.indexOf(":") + 4);
  let i = start;
  for (;i < url.length; i++) {
    const charCode = url.charCodeAt(i);
    if (charCode === 37) {
      const queryIndex = url.indexOf("?", i);
      const hashIndex = url.indexOf("#", i);
      const end = queryIndex === -1 ? hashIndex === -1 ? undefined : hashIndex : hashIndex === -1 ? queryIndex : Math.min(queryIndex, hashIndex);
      const path = url.slice(start, end);
      return tryDecodeURI(path.includes("%25") ? path.replace(/%25/g, "%2525") : path);
    } else if (charCode === 63 || charCode === 35) {
      break;
    }
  }
  return url.slice(start, i);
};
var getPathNoStrict = (request) => {
  const result = getPath(request);
  return result.length > 1 && result.at(-1) === "/" ? result.slice(0, -1) : result;
};
var mergePath = (base, sub, ...rest) => {
  if (rest.length) {
    sub = mergePath(sub, ...rest);
  }
  return `${base?.[0] === "/" ? "" : "/"}${base}${sub === "/" ? "" : `${base?.at(-1) === "/" ? "" : "/"}${sub?.[0] === "/" ? sub.slice(1) : sub}`}`;
};
var checkOptionalParameter = (path) => {
  if (path.charCodeAt(path.length - 1) !== 63 || !path.includes(":")) {
    return null;
  }
  const segments = path.split("/");
  const results = [];
  let basePath = "";
  segments.forEach((segment) => {
    if (segment !== "" && !/\:/.test(segment)) {
      basePath += "/" + segment;
    } else if (/\:/.test(segment)) {
      if (/\?/.test(segment)) {
        if (results.length === 0 && basePath === "") {
          results.push("/");
        } else {
          results.push(basePath);
        }
        const optionalSegment = segment.replace("?", "");
        basePath += "/" + optionalSegment;
        results.push(basePath);
      } else {
        basePath += "/" + segment;
      }
    }
  });
  return results.filter((v, i, a) => a.indexOf(v) === i);
};
var _decodeURI = (value) => {
  if (!/[%+]/.test(value)) {
    return value;
  }
  if (value.indexOf("+") !== -1) {
    value = value.replace(/\+/g, " ");
  }
  return value.indexOf("%") !== -1 ? tryDecode(value, decodeURIComponent_) : value;
};
var _getQueryParam = (url, key, multiple) => {
  let encoded;
  if (!multiple && key && !/[%+]/.test(key)) {
    let keyIndex2 = url.indexOf("?", 8);
    if (keyIndex2 === -1) {
      return;
    }
    if (!url.startsWith(key, keyIndex2 + 1)) {
      keyIndex2 = url.indexOf(`&${key}`, keyIndex2 + 1);
    }
    while (keyIndex2 !== -1) {
      const trailingKeyCode = url.charCodeAt(keyIndex2 + key.length + 1);
      if (trailingKeyCode === 61) {
        const valueIndex = keyIndex2 + key.length + 2;
        const endIndex = url.indexOf("&", valueIndex);
        return _decodeURI(url.slice(valueIndex, endIndex === -1 ? undefined : endIndex));
      } else if (trailingKeyCode == 38 || isNaN(trailingKeyCode)) {
        return "";
      }
      keyIndex2 = url.indexOf(`&${key}`, keyIndex2 + 1);
    }
    encoded = /[%+]/.test(url);
    if (!encoded) {
      return;
    }
  }
  const results = {};
  encoded ??= /[%+]/.test(url);
  let keyIndex = url.indexOf("?", 8);
  while (keyIndex !== -1) {
    const nextKeyIndex = url.indexOf("&", keyIndex + 1);
    let valueIndex = url.indexOf("=", keyIndex);
    if (valueIndex > nextKeyIndex && nextKeyIndex !== -1) {
      valueIndex = -1;
    }
    let name = url.slice(keyIndex + 1, valueIndex === -1 ? nextKeyIndex === -1 ? undefined : nextKeyIndex : valueIndex);
    if (encoded) {
      name = _decodeURI(name);
    }
    keyIndex = nextKeyIndex;
    if (name === "") {
      continue;
    }
    let value;
    if (valueIndex === -1) {
      value = "";
    } else {
      value = url.slice(valueIndex + 1, nextKeyIndex === -1 ? undefined : nextKeyIndex);
      if (encoded) {
        value = _decodeURI(value);
      }
    }
    if (multiple) {
      if (!(results[name] && Array.isArray(results[name]))) {
        results[name] = [];
      }
      results[name].push(value);
    } else {
      results[name] ??= value;
    }
  }
  return key ? results[key] : results;
};
var getQueryParam = _getQueryParam;
var getQueryParams = (url, key) => {
  return _getQueryParam(url, key, true);
};
var decodeURIComponent_ = decodeURIComponent;

// node_modules/hono/dist/request.js
var tryDecodeURIComponent = (str) => tryDecode(str, decodeURIComponent_);
var HonoRequest = class {
  raw;
  #validatedData;
  #matchResult;
  routeIndex = 0;
  path;
  bodyCache = {};
  constructor(request, path = "/", matchResult = [[]]) {
    this.raw = request;
    this.path = path;
    this.#matchResult = matchResult;
    this.#validatedData = {};
  }
  param(key) {
    return key ? this.#getDecodedParam(key) : this.#getAllDecodedParams();
  }
  #getDecodedParam(key) {
    const paramKey = this.#matchResult[0][this.routeIndex][1][key];
    const param = this.#getParamValue(paramKey);
    return param && /\%/.test(param) ? tryDecodeURIComponent(param) : param;
  }
  #getAllDecodedParams() {
    const decoded = {};
    const keys = Object.keys(this.#matchResult[0][this.routeIndex][1]);
    for (const key of keys) {
      const value = this.#getParamValue(this.#matchResult[0][this.routeIndex][1][key]);
      if (value !== undefined) {
        decoded[key] = /\%/.test(value) ? tryDecodeURIComponent(value) : value;
      }
    }
    return decoded;
  }
  #getParamValue(paramKey) {
    return this.#matchResult[1] ? this.#matchResult[1][paramKey] : paramKey;
  }
  query(key) {
    return getQueryParam(this.url, key);
  }
  queries(key) {
    return getQueryParams(this.url, key);
  }
  header(name) {
    if (name) {
      return this.raw.headers.get(name) ?? undefined;
    }
    const headerData = {};
    this.raw.headers.forEach((value, key) => {
      headerData[key] = value;
    });
    return headerData;
  }
  async parseBody(options) {
    return parseBody(this, options);
  }
  #cachedBody = (key) => {
    const { bodyCache, raw } = this;
    const cachedBody = bodyCache[key];
    if (cachedBody) {
      return cachedBody;
    }
    const anyCachedKey = Object.keys(bodyCache)[0];
    if (anyCachedKey) {
      return bodyCache[anyCachedKey].then((body) => {
        if (anyCachedKey === "json") {
          body = JSON.stringify(body);
        }
        return new Response(body)[key]();
      });
    }
    return bodyCache[key] = raw[key]();
  };
  json() {
    return this.#cachedBody("text").then((text) => JSON.parse(text));
  }
  text() {
    return this.#cachedBody("text");
  }
  arrayBuffer() {
    return this.#cachedBody("arrayBuffer");
  }
  bytes() {
    return this.#cachedBody("arrayBuffer").then((buffer) => new Uint8Array(buffer));
  }
  blob() {
    return this.#cachedBody("blob");
  }
  formData() {
    return this.#cachedBody("formData");
  }
  addValidatedData(target, data) {
    this.#validatedData[target] = data;
  }
  valid(target) {
    return this.#validatedData[target];
  }
  get url() {
    return this.raw.url;
  }
  get method() {
    return this.raw.method;
  }
  get [GET_MATCH_RESULT]() {
    return this.#matchResult;
  }
  get matchedRoutes() {
    return this.#matchResult[0].map(([[, route]]) => route);
  }
  get routePath() {
    return this.#matchResult[0].map(([[, route]]) => route)[this.routeIndex].path;
  }
};

// node_modules/hono/dist/utils/html.js
var HtmlEscapedCallbackPhase = {
  Stringify: 1,
  BeforeStream: 2,
  Stream: 3
};
var raw = (value, callbacks) => {
  const escapedString = new String(value);
  escapedString.isEscaped = true;
  escapedString.callbacks = callbacks;
  return escapedString;
};
var resolveCallback = async (str, phase, preserveCallbacks, context, buffer) => {
  if (typeof str === "object" && !(str instanceof String)) {
    if (!(str instanceof Promise)) {
      str = str.toString();
    }
    if (str instanceof Promise) {
      str = await str;
    }
  }
  const callbacks = str.callbacks;
  if (!callbacks?.length) {
    return Promise.resolve(str);
  }
  if (buffer) {
    buffer[0] += str;
  } else {
    buffer = [str];
  }
  const resStr = Promise.all(callbacks.map((c) => c({ phase, buffer, context }))).then((res) => Promise.all(res.filter(Boolean).map((str2) => resolveCallback(str2, phase, false, context, buffer))).then(() => buffer[0]));
  if (preserveCallbacks) {
    return raw(await resStr, callbacks);
  } else {
    return resStr;
  }
};

// node_modules/hono/dist/context.js
var TEXT_PLAIN = "text/plain; charset=UTF-8";
var setDefaultContentType = (contentType, headers) => {
  return {
    "Content-Type": contentType,
    ...headers
  };
};
var createResponseInstance = (body, init) => new Response(body, init);
var Context = class {
  #rawRequest;
  #req;
  env = {};
  #var;
  finalized = false;
  error;
  #status;
  #executionCtx;
  #res;
  #layout;
  #renderer;
  #notFoundHandler;
  #preparedHeaders;
  #matchResult;
  #path;
  constructor(req, options) {
    this.#rawRequest = req;
    if (options) {
      this.#executionCtx = options.executionCtx;
      this.env = options.env;
      this.#notFoundHandler = options.notFoundHandler;
      this.#path = options.path;
      this.#matchResult = options.matchResult;
    }
  }
  get req() {
    this.#req ??= new HonoRequest(this.#rawRequest, this.#path, this.#matchResult);
    return this.#req;
  }
  get event() {
    if (this.#executionCtx && "respondWith" in this.#executionCtx) {
      return this.#executionCtx;
    } else {
      throw Error("This context has no FetchEvent");
    }
  }
  get executionCtx() {
    if (this.#executionCtx) {
      return this.#executionCtx;
    } else {
      throw Error("This context has no ExecutionContext");
    }
  }
  get res() {
    return this.#res ||= createResponseInstance(null, {
      headers: this.#preparedHeaders ??= new Headers
    });
  }
  set res(_res) {
    if (this.#res && _res) {
      _res = createResponseInstance(_res.body, _res);
      for (const [k, v] of this.#res.headers.entries()) {
        if (k === "content-type") {
          continue;
        }
        if (k === "set-cookie") {
          const cookies = this.#res.headers.getSetCookie();
          _res.headers.delete("set-cookie");
          for (const cookie of cookies) {
            _res.headers.append("set-cookie", cookie);
          }
        } else {
          _res.headers.set(k, v);
        }
      }
    }
    this.#res = _res;
    this.finalized = true;
  }
  render = (...args) => {
    this.#renderer ??= (content) => this.html(content);
    return this.#renderer(...args);
  };
  setLayout = (layout) => this.#layout = layout;
  getLayout = () => this.#layout;
  setRenderer = (renderer) => {
    this.#renderer = renderer;
  };
  header = (name, value, options) => {
    if (this.finalized) {
      this.#res = createResponseInstance(this.#res.body, this.#res);
    }
    const headers = this.#res ? this.#res.headers : this.#preparedHeaders ??= new Headers;
    if (value === undefined) {
      headers.delete(name);
    } else if (options?.append) {
      headers.append(name, value);
    } else {
      headers.set(name, value);
    }
  };
  status = (status) => {
    this.#status = status;
  };
  set = (key, value) => {
    this.#var ??= /* @__PURE__ */ new Map;
    this.#var.set(key, value);
  };
  get = (key) => {
    return this.#var ? this.#var.get(key) : undefined;
  };
  get var() {
    if (!this.#var) {
      return {};
    }
    return Object.fromEntries(this.#var);
  }
  #newResponse(data, arg, headers) {
    const responseHeaders = this.#res ? new Headers(this.#res.headers) : this.#preparedHeaders ?? new Headers;
    if (typeof arg === "object" && "headers" in arg) {
      const argHeaders = arg.headers instanceof Headers ? arg.headers : new Headers(arg.headers);
      for (const [key, value] of argHeaders) {
        if (key.toLowerCase() === "set-cookie") {
          responseHeaders.append(key, value);
        } else {
          responseHeaders.set(key, value);
        }
      }
    }
    if (headers) {
      for (const [k, v] of Object.entries(headers)) {
        if (typeof v === "string") {
          responseHeaders.set(k, v);
        } else {
          responseHeaders.delete(k);
          for (const v2 of v) {
            responseHeaders.append(k, v2);
          }
        }
      }
    }
    const status = typeof arg === "number" ? arg : arg?.status ?? this.#status;
    return createResponseInstance(data, { status, headers: responseHeaders });
  }
  newResponse = (...args) => this.#newResponse(...args);
  body = (data, arg, headers) => this.#newResponse(data, arg, headers);
  text = (text, arg, headers) => {
    return !this.#preparedHeaders && !this.#status && !arg && !headers && !this.finalized ? new Response(text) : this.#newResponse(text, arg, setDefaultContentType(TEXT_PLAIN, headers));
  };
  json = (object, arg, headers) => {
    return this.#newResponse(JSON.stringify(object), arg, setDefaultContentType("application/json", headers));
  };
  html = (html, arg, headers) => {
    const res = (html2) => this.#newResponse(html2, arg, setDefaultContentType("text/html; charset=UTF-8", headers));
    return typeof html === "object" ? resolveCallback(html, HtmlEscapedCallbackPhase.Stringify, false, {}).then(res) : res(html);
  };
  redirect = (location, status) => {
    const locationString = String(location);
    this.header("Location", !/[^\x00-\xFF]/.test(locationString) ? locationString : encodeURI(locationString));
    return this.newResponse(null, status ?? 302);
  };
  notFound = () => {
    this.#notFoundHandler ??= () => createResponseInstance();
    return this.#notFoundHandler(this);
  };
};

// node_modules/hono/dist/router.js
var METHOD_NAME_ALL = "ALL";
var METHOD_NAME_ALL_LOWERCASE = "all";
var METHODS = ["get", "post", "put", "delete", "options", "patch"];
var MESSAGE_MATCHER_IS_ALREADY_BUILT = "Can not add a route since the matcher is already built.";
var UnsupportedPathError = class extends Error {
};

// node_modules/hono/dist/utils/constants.js
var COMPOSED_HANDLER = "__COMPOSED_HANDLER";

// node_modules/hono/dist/hono-base.js
var notFoundHandler = (c) => {
  return c.text("404 Not Found", 404);
};
var errorHandler = (err, c) => {
  if ("getResponse" in err) {
    const res = err.getResponse();
    return c.newResponse(res.body, res);
  }
  console.error(err);
  return c.text("Internal Server Error", 500);
};
var Hono = class _Hono {
  get;
  post;
  put;
  delete;
  options;
  patch;
  all;
  on;
  use;
  router;
  getPath;
  _basePath = "/";
  #path = "/";
  routes = [];
  constructor(options = {}) {
    const allMethods = [...METHODS, METHOD_NAME_ALL_LOWERCASE];
    allMethods.forEach((method) => {
      this[method] = (args1, ...args) => {
        if (typeof args1 === "string") {
          this.#path = args1;
        } else {
          this.#addRoute(method, this.#path, args1);
        }
        args.forEach((handler) => {
          this.#addRoute(method, this.#path, handler);
        });
        return this;
      };
    });
    this.on = (method, path, ...handlers) => {
      for (const p of [path].flat()) {
        this.#path = p;
        for (const m of [method].flat()) {
          handlers.map((handler) => {
            this.#addRoute(m.toUpperCase(), this.#path, handler);
          });
        }
      }
      return this;
    };
    this.use = (arg1, ...handlers) => {
      if (typeof arg1 === "string") {
        this.#path = arg1;
      } else {
        this.#path = "*";
        handlers.unshift(arg1);
      }
      handlers.forEach((handler) => {
        this.#addRoute(METHOD_NAME_ALL, this.#path, handler);
      });
      return this;
    };
    const { strict, ...optionsWithoutStrict } = options;
    Object.assign(this, optionsWithoutStrict);
    this.getPath = strict ?? true ? options.getPath ?? getPath : getPathNoStrict;
  }
  #clone() {
    const clone = new _Hono({
      router: this.router,
      getPath: this.getPath
    });
    clone.errorHandler = this.errorHandler;
    clone.#notFoundHandler = this.#notFoundHandler;
    clone.routes = this.routes;
    return clone;
  }
  #notFoundHandler = notFoundHandler;
  errorHandler = errorHandler;
  route(path, app) {
    const subApp = this.basePath(path);
    app.routes.map((r) => {
      let handler;
      if (app.errorHandler === errorHandler) {
        handler = r.handler;
      } else {
        handler = async (c, next) => (await compose([], app.errorHandler)(c, () => r.handler(c, next))).res;
        handler[COMPOSED_HANDLER] = r.handler;
      }
      subApp.#addRoute(r.method, r.path, handler, r.basePath);
    });
    return this;
  }
  basePath(path) {
    const subApp = this.#clone();
    subApp._basePath = mergePath(this._basePath, path);
    return subApp;
  }
  onError = (handler) => {
    this.errorHandler = handler;
    return this;
  };
  notFound = (handler) => {
    this.#notFoundHandler = handler;
    return this;
  };
  mount(path, applicationHandler, options) {
    let replaceRequest;
    let optionHandler;
    if (options) {
      if (typeof options === "function") {
        optionHandler = options;
      } else {
        optionHandler = options.optionHandler;
        if (options.replaceRequest === false) {
          replaceRequest = (request) => request;
        } else {
          replaceRequest = options.replaceRequest;
        }
      }
    }
    const getOptions = optionHandler ? (c) => {
      const options2 = optionHandler(c);
      return Array.isArray(options2) ? options2 : [options2];
    } : (c) => {
      let executionContext = undefined;
      try {
        executionContext = c.executionCtx;
      } catch {}
      return [c.env, executionContext];
    };
    replaceRequest ||= (() => {
      const mergedPath = mergePath(this._basePath, path);
      const pathPrefixLength = mergedPath === "/" ? 0 : mergedPath.length;
      return (request) => {
        const url = new URL(request.url);
        url.pathname = this.getPath(request).slice(pathPrefixLength) || "/";
        return new Request(url, request);
      };
    })();
    const handler = async (c, next) => {
      const res = await applicationHandler(replaceRequest(c.req.raw), ...getOptions(c));
      if (res) {
        return res;
      }
      await next();
    };
    this.#addRoute(METHOD_NAME_ALL, mergePath(path, "*"), handler);
    return this;
  }
  #addRoute(method, path, handler, baseRoutePath) {
    method = method.toUpperCase();
    path = mergePath(this._basePath, path);
    const r = {
      basePath: baseRoutePath !== undefined ? mergePath(this._basePath, baseRoutePath) : this._basePath,
      path,
      method,
      handler
    };
    this.router.add(method, path, [handler, r]);
    this.routes.push(r);
  }
  #handleError(err, c) {
    if (err instanceof Error) {
      return this.errorHandler(err, c);
    }
    throw err;
  }
  #dispatch(request, executionCtx, env, method) {
    if (method === "HEAD") {
      return (async () => new Response(null, await this.#dispatch(request, executionCtx, env, "GET")))();
    }
    const path = this.getPath(request, { env });
    const matchResult = this.router.match(method, path);
    const c = new Context(request, {
      path,
      matchResult,
      env,
      executionCtx,
      notFoundHandler: this.#notFoundHandler
    });
    if (matchResult[0].length === 1) {
      let res;
      try {
        res = matchResult[0][0][0][0](c, async () => {
          c.res = await this.#notFoundHandler(c);
        });
      } catch (err) {
        return this.#handleError(err, c);
      }
      return res instanceof Promise ? res.then((resolved) => resolved || (c.finalized ? c.res : this.#notFoundHandler(c))).catch((err) => this.#handleError(err, c)) : res ?? this.#notFoundHandler(c);
    }
    const composed = compose(matchResult[0], this.errorHandler, this.#notFoundHandler);
    return (async () => {
      try {
        const context = await composed(c);
        if (!context.finalized) {
          throw new Error("Context is not finalized. Did you forget to return a Response object or `await next()`?");
        }
        return context.res;
      } catch (err) {
        return this.#handleError(err, c);
      }
    })();
  }
  fetch = (request, ...rest) => {
    return this.#dispatch(request, rest[1], rest[0], request.method);
  };
  request = (input, requestInit, Env, executionCtx) => {
    if (input instanceof Request) {
      return this.fetch(requestInit ? new Request(input, requestInit) : input, Env, executionCtx);
    }
    input = input.toString();
    return this.fetch(new Request(/^https?:\/\//.test(input) ? input : `http://localhost${mergePath("/", input)}`, requestInit), Env, executionCtx);
  };
  fire = () => {
    addEventListener("fetch", (event) => {
      event.respondWith(this.#dispatch(event.request, event, undefined, event.request.method));
    });
  };
};

// node_modules/hono/dist/router/reg-exp-router/matcher.js
var emptyParam = [];
function match(method, path) {
  const matchers = this.buildAllMatchers();
  const match2 = (method2, path2) => {
    const matcher = matchers[method2] || matchers[METHOD_NAME_ALL];
    const staticMatch = matcher[2][path2];
    if (staticMatch) {
      return staticMatch;
    }
    const match3 = path2.match(matcher[0]);
    if (!match3) {
      return [[], emptyParam];
    }
    const index = match3.indexOf("", 1);
    return [matcher[1][index], match3];
  };
  this.match = match2;
  return match2(method, path);
}

// node_modules/hono/dist/router/reg-exp-router/node.js
var LABEL_REG_EXP_STR = "[^/]+";
var ONLY_WILDCARD_REG_EXP_STR = ".*";
var TAIL_WILDCARD_REG_EXP_STR = "(?:|/.*)";
var PATH_ERROR = /* @__PURE__ */ Symbol();
var regExpMetaChars = new Set(".\\+*[^]$()");
function compareKey(a, b) {
  if (a.length === 1) {
    return b.length === 1 ? a < b ? -1 : 1 : -1;
  }
  if (b.length === 1) {
    return 1;
  }
  if (a === ONLY_WILDCARD_REG_EXP_STR || a === TAIL_WILDCARD_REG_EXP_STR) {
    return 1;
  } else if (b === ONLY_WILDCARD_REG_EXP_STR || b === TAIL_WILDCARD_REG_EXP_STR) {
    return -1;
  }
  if (a === LABEL_REG_EXP_STR) {
    return 1;
  } else if (b === LABEL_REG_EXP_STR) {
    return -1;
  }
  return a.length === b.length ? a < b ? -1 : 1 : b.length - a.length;
}
var Node = class _Node {
  #index;
  #varIndex;
  #children = /* @__PURE__ */ Object.create(null);
  insert(tokens, index, paramMap, context, pathErrorCheckOnly) {
    if (tokens.length === 0) {
      if (this.#index !== undefined) {
        throw PATH_ERROR;
      }
      if (pathErrorCheckOnly) {
        return;
      }
      this.#index = index;
      return;
    }
    const [token, ...restTokens] = tokens;
    const pattern = token === "*" ? restTokens.length === 0 ? ["", "", ONLY_WILDCARD_REG_EXP_STR] : ["", "", LABEL_REG_EXP_STR] : token === "/*" ? ["", "", TAIL_WILDCARD_REG_EXP_STR] : token.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);
    let node;
    if (pattern) {
      const name = pattern[1];
      let regexpStr = pattern[2] || LABEL_REG_EXP_STR;
      if (name && pattern[2]) {
        if (regexpStr === ".*") {
          throw PATH_ERROR;
        }
        regexpStr = regexpStr.replace(/^\((?!\?:)(?=[^)]+\)$)/, "(?:");
        if (/\((?!\?:)/.test(regexpStr)) {
          throw PATH_ERROR;
        }
      }
      node = this.#children[regexpStr];
      if (!node) {
        if (Object.keys(this.#children).some((k) => k !== ONLY_WILDCARD_REG_EXP_STR && k !== TAIL_WILDCARD_REG_EXP_STR)) {
          throw PATH_ERROR;
        }
        if (pathErrorCheckOnly) {
          return;
        }
        node = this.#children[regexpStr] = new _Node;
        if (name !== "") {
          node.#varIndex = context.varIndex++;
        }
      }
      if (!pathErrorCheckOnly && name !== "") {
        paramMap.push([name, node.#varIndex]);
      }
    } else {
      node = this.#children[token];
      if (!node) {
        if (Object.keys(this.#children).some((k) => k.length > 1 && k !== ONLY_WILDCARD_REG_EXP_STR && k !== TAIL_WILDCARD_REG_EXP_STR)) {
          throw PATH_ERROR;
        }
        if (pathErrorCheckOnly) {
          return;
        }
        node = this.#children[token] = new _Node;
      }
    }
    node.insert(restTokens, index, paramMap, context, pathErrorCheckOnly);
  }
  buildRegExpStr() {
    const childKeys = Object.keys(this.#children).sort(compareKey);
    const strList = childKeys.map((k) => {
      const c = this.#children[k];
      return (typeof c.#varIndex === "number" ? `(${k})@${c.#varIndex}` : regExpMetaChars.has(k) ? `\\${k}` : k) + c.buildRegExpStr();
    });
    if (typeof this.#index === "number") {
      strList.unshift(`#${this.#index}`);
    }
    if (strList.length === 0) {
      return "";
    }
    if (strList.length === 1) {
      return strList[0];
    }
    return "(?:" + strList.join("|") + ")";
  }
};

// node_modules/hono/dist/router/reg-exp-router/trie.js
var Trie = class {
  #context = { varIndex: 0 };
  #root = new Node;
  insert(path, index, pathErrorCheckOnly) {
    const paramAssoc = [];
    const groups = [];
    for (let i = 0;; ) {
      let replaced = false;
      path = path.replace(/\{[^}]+\}/g, (m) => {
        const mark = `@\\${i}`;
        groups[i] = [mark, m];
        i++;
        replaced = true;
        return mark;
      });
      if (!replaced) {
        break;
      }
    }
    const tokens = path.match(/(?::[^\/]+)|(?:\/\*$)|./g) || [];
    for (let i = groups.length - 1;i >= 0; i--) {
      const [mark] = groups[i];
      for (let j = tokens.length - 1;j >= 0; j--) {
        if (tokens[j].indexOf(mark) !== -1) {
          tokens[j] = tokens[j].replace(mark, groups[i][1]);
          break;
        }
      }
    }
    this.#root.insert(tokens, index, paramAssoc, this.#context, pathErrorCheckOnly);
    return paramAssoc;
  }
  buildRegExp() {
    let regexp = this.#root.buildRegExpStr();
    if (regexp === "") {
      return [/^$/, [], []];
    }
    let captureIndex = 0;
    const indexReplacementMap = [];
    const paramReplacementMap = [];
    regexp = regexp.replace(/#(\d+)|@(\d+)|\.\*\$/g, (_, handlerIndex, paramIndex) => {
      if (handlerIndex !== undefined) {
        indexReplacementMap[++captureIndex] = Number(handlerIndex);
        return "$()";
      }
      if (paramIndex !== undefined) {
        paramReplacementMap[Number(paramIndex)] = ++captureIndex;
        return "";
      }
      return "";
    });
    return [new RegExp(`^${regexp}`), indexReplacementMap, paramReplacementMap];
  }
};

// node_modules/hono/dist/router/reg-exp-router/router.js
var nullMatcher = [/^$/, [], /* @__PURE__ */ Object.create(null)];
var wildcardRegExpCache = /* @__PURE__ */ Object.create(null);
function buildWildcardRegExp(path) {
  return wildcardRegExpCache[path] ??= new RegExp(path === "*" ? "" : `^${path.replace(/\/\*$|([.\\+*[^\]$()])/g, (_, metaChar) => metaChar ? `\\${metaChar}` : "(?:|/.*)")}$`);
}
function clearWildcardRegExpCache() {
  wildcardRegExpCache = /* @__PURE__ */ Object.create(null);
}
function buildMatcherFromPreprocessedRoutes(routes) {
  const trie = new Trie;
  const handlerData = [];
  if (routes.length === 0) {
    return nullMatcher;
  }
  const routesWithStaticPathFlag = routes.map((route) => [!/\*|\/:/.test(route[0]), ...route]).sort(([isStaticA, pathA], [isStaticB, pathB]) => isStaticA ? 1 : isStaticB ? -1 : pathA.length - pathB.length);
  const staticMap = /* @__PURE__ */ Object.create(null);
  for (let i = 0, j = -1, len = routesWithStaticPathFlag.length;i < len; i++) {
    const [pathErrorCheckOnly, path, handlers] = routesWithStaticPathFlag[i];
    if (pathErrorCheckOnly) {
      staticMap[path] = [handlers.map(([h]) => [h, /* @__PURE__ */ Object.create(null)]), emptyParam];
    } else {
      j++;
    }
    let paramAssoc;
    try {
      paramAssoc = trie.insert(path, j, pathErrorCheckOnly);
    } catch (e) {
      throw e === PATH_ERROR ? new UnsupportedPathError(path) : e;
    }
    if (pathErrorCheckOnly) {
      continue;
    }
    handlerData[j] = handlers.map(([h, paramCount]) => {
      const paramIndexMap = /* @__PURE__ */ Object.create(null);
      paramCount -= 1;
      for (;paramCount >= 0; paramCount--) {
        const [key, value] = paramAssoc[paramCount];
        paramIndexMap[key] = value;
      }
      return [h, paramIndexMap];
    });
  }
  const [regexp, indexReplacementMap, paramReplacementMap] = trie.buildRegExp();
  for (let i = 0, len = handlerData.length;i < len; i++) {
    for (let j = 0, len2 = handlerData[i].length;j < len2; j++) {
      const map = handlerData[i][j]?.[1];
      if (!map) {
        continue;
      }
      const keys = Object.keys(map);
      for (let k = 0, len3 = keys.length;k < len3; k++) {
        map[keys[k]] = paramReplacementMap[map[keys[k]]];
      }
    }
  }
  const handlerMap = [];
  for (const i in indexReplacementMap) {
    handlerMap[i] = handlerData[indexReplacementMap[i]];
  }
  return [regexp, handlerMap, staticMap];
}
function findMiddleware(middleware, path) {
  if (!middleware) {
    return;
  }
  for (const k of Object.keys(middleware).sort((a, b) => b.length - a.length)) {
    if (buildWildcardRegExp(k).test(path)) {
      return [...middleware[k]];
    }
  }
  return;
}
var RegExpRouter = class {
  name = "RegExpRouter";
  #middleware;
  #routes;
  constructor() {
    this.#middleware = { [METHOD_NAME_ALL]: /* @__PURE__ */ Object.create(null) };
    this.#routes = { [METHOD_NAME_ALL]: /* @__PURE__ */ Object.create(null) };
  }
  add(method, path, handler) {
    const middleware = this.#middleware;
    const routes = this.#routes;
    if (!middleware || !routes) {
      throw new Error(MESSAGE_MATCHER_IS_ALREADY_BUILT);
    }
    if (!middleware[method]) {
      [middleware, routes].forEach((handlerMap) => {
        handlerMap[method] = /* @__PURE__ */ Object.create(null);
        Object.keys(handlerMap[METHOD_NAME_ALL]).forEach((p) => {
          handlerMap[method][p] = [...handlerMap[METHOD_NAME_ALL][p]];
        });
      });
    }
    if (path === "/*") {
      path = "*";
    }
    const paramCount = (path.match(/\/:/g) || []).length;
    if (/\*$/.test(path)) {
      const re = buildWildcardRegExp(path);
      if (method === METHOD_NAME_ALL) {
        Object.keys(middleware).forEach((m) => {
          middleware[m][path] ||= findMiddleware(middleware[m], path) || findMiddleware(middleware[METHOD_NAME_ALL], path) || [];
        });
      } else {
        middleware[method][path] ||= findMiddleware(middleware[method], path) || findMiddleware(middleware[METHOD_NAME_ALL], path) || [];
      }
      Object.keys(middleware).forEach((m) => {
        if (method === METHOD_NAME_ALL || method === m) {
          Object.keys(middleware[m]).forEach((p) => {
            re.test(p) && middleware[m][p].push([handler, paramCount]);
          });
        }
      });
      Object.keys(routes).forEach((m) => {
        if (method === METHOD_NAME_ALL || method === m) {
          Object.keys(routes[m]).forEach((p) => re.test(p) && routes[m][p].push([handler, paramCount]));
        }
      });
      return;
    }
    const paths = checkOptionalParameter(path) || [path];
    for (let i = 0, len = paths.length;i < len; i++) {
      const path2 = paths[i];
      Object.keys(routes).forEach((m) => {
        if (method === METHOD_NAME_ALL || method === m) {
          routes[m][path2] ||= [
            ...findMiddleware(middleware[m], path2) || findMiddleware(middleware[METHOD_NAME_ALL], path2) || []
          ];
          routes[m][path2].push([handler, paramCount - len + i + 1]);
        }
      });
    }
  }
  match = match;
  buildAllMatchers() {
    const matchers = /* @__PURE__ */ Object.create(null);
    Object.keys(this.#routes).concat(Object.keys(this.#middleware)).forEach((method) => {
      matchers[method] ||= this.#buildMatcher(method);
    });
    this.#middleware = this.#routes = undefined;
    clearWildcardRegExpCache();
    return matchers;
  }
  #buildMatcher(method) {
    const routes = [];
    let hasOwnRoute = method === METHOD_NAME_ALL;
    [this.#middleware, this.#routes].forEach((r) => {
      const ownRoute = r[method] ? Object.keys(r[method]).map((path) => [path, r[method][path]]) : [];
      if (ownRoute.length !== 0) {
        hasOwnRoute ||= true;
        routes.push(...ownRoute);
      } else if (method !== METHOD_NAME_ALL) {
        routes.push(...Object.keys(r[METHOD_NAME_ALL]).map((path) => [path, r[METHOD_NAME_ALL][path]]));
      }
    });
    if (!hasOwnRoute) {
      return null;
    } else {
      return buildMatcherFromPreprocessedRoutes(routes);
    }
  }
};

// node_modules/hono/dist/router/reg-exp-router/prepared-router.js
var PreparedRegExpRouter = class {
  name = "PreparedRegExpRouter";
  #matchers;
  #relocateMap;
  constructor(matchers, relocateMap) {
    this.#matchers = matchers;
    this.#relocateMap = relocateMap;
  }
  #addWildcard(method, handlerData) {
    const matcher = this.#matchers[method];
    matcher[1].forEach((list) => list && list.push(handlerData));
    Object.values(matcher[2]).forEach((list) => list[0].push(handlerData));
  }
  #addPath(method, path, handler, indexes, map) {
    const matcher = this.#matchers[method];
    if (!map) {
      matcher[2][path][0].push([handler, {}]);
    } else {
      indexes.forEach((index) => {
        if (typeof index === "number") {
          matcher[1][index].push([handler, map]);
        } else {
          matcher[2][index || path][0].push([handler, map]);
        }
      });
    }
  }
  add(method, path, handler) {
    if (!this.#matchers[method]) {
      const all = this.#matchers[METHOD_NAME_ALL];
      const staticMap = {};
      for (const key in all[2]) {
        staticMap[key] = [all[2][key][0].slice(), emptyParam];
      }
      this.#matchers[method] = [
        all[0],
        all[1].map((list) => Array.isArray(list) ? list.slice() : 0),
        staticMap
      ];
    }
    if (path === "/*" || path === "*") {
      const handlerData = [handler, {}];
      if (method === METHOD_NAME_ALL) {
        for (const m in this.#matchers) {
          this.#addWildcard(m, handlerData);
        }
      } else {
        this.#addWildcard(method, handlerData);
      }
      return;
    }
    const data = this.#relocateMap[path];
    if (!data) {
      throw new Error(`Path ${path} is not registered`);
    }
    for (const [indexes, map] of data) {
      if (method === METHOD_NAME_ALL) {
        for (const m in this.#matchers) {
          this.#addPath(m, path, handler, indexes, map);
        }
      } else {
        this.#addPath(method, path, handler, indexes, map);
      }
    }
  }
  buildAllMatchers() {
    return this.#matchers;
  }
  match = match;
};

// node_modules/hono/dist/router/smart-router/router.js
var SmartRouter = class {
  name = "SmartRouter";
  #routers = [];
  #routes = [];
  constructor(init) {
    this.#routers = init.routers;
  }
  add(method, path, handler) {
    if (!this.#routes) {
      throw new Error(MESSAGE_MATCHER_IS_ALREADY_BUILT);
    }
    this.#routes.push([method, path, handler]);
  }
  match(method, path) {
    if (!this.#routes) {
      throw new Error("Fatal error");
    }
    const routers = this.#routers;
    const routes = this.#routes;
    const len = routers.length;
    let i = 0;
    let res;
    for (;i < len; i++) {
      const router = routers[i];
      try {
        for (let i2 = 0, len2 = routes.length;i2 < len2; i2++) {
          router.add(...routes[i2]);
        }
        res = router.match(method, path);
      } catch (e) {
        if (e instanceof UnsupportedPathError) {
          continue;
        }
        throw e;
      }
      this.match = router.match.bind(router);
      this.#routers = [router];
      this.#routes = undefined;
      break;
    }
    if (i === len) {
      throw new Error("Fatal error");
    }
    this.name = `SmartRouter + ${this.activeRouter.name}`;
    return res;
  }
  get activeRouter() {
    if (this.#routes || this.#routers.length !== 1) {
      throw new Error("No active router has been determined yet.");
    }
    return this.#routers[0];
  }
};

// node_modules/hono/dist/router/trie-router/node.js
var emptyParams = /* @__PURE__ */ Object.create(null);
var hasChildren = (children) => {
  for (const _ in children) {
    return true;
  }
  return false;
};
var Node2 = class _Node2 {
  #methods;
  #children;
  #patterns;
  #order = 0;
  #params = emptyParams;
  constructor(method, handler, children) {
    this.#children = children || /* @__PURE__ */ Object.create(null);
    this.#methods = [];
    if (method && handler) {
      const m = /* @__PURE__ */ Object.create(null);
      m[method] = { handler, possibleKeys: [], score: 0 };
      this.#methods = [m];
    }
    this.#patterns = [];
  }
  insert(method, path, handler) {
    this.#order = ++this.#order;
    let curNode = this;
    const parts = splitRoutingPath(path);
    const possibleKeys = [];
    for (let i = 0, len = parts.length;i < len; i++) {
      const p = parts[i];
      const nextP = parts[i + 1];
      const pattern = getPattern(p, nextP);
      const key = Array.isArray(pattern) ? pattern[0] : p;
      if (key in curNode.#children) {
        curNode = curNode.#children[key];
        if (pattern) {
          possibleKeys.push(pattern[1]);
        }
        continue;
      }
      curNode.#children[key] = new _Node2;
      if (pattern) {
        curNode.#patterns.push(pattern);
        possibleKeys.push(pattern[1]);
      }
      curNode = curNode.#children[key];
    }
    curNode.#methods.push({
      [method]: {
        handler,
        possibleKeys: possibleKeys.filter((v, i, a) => a.indexOf(v) === i),
        score: this.#order
      }
    });
    return curNode;
  }
  #pushHandlerSets(handlerSets, node, method, nodeParams, params) {
    for (let i = 0, len = node.#methods.length;i < len; i++) {
      const m = node.#methods[i];
      const handlerSet = m[method] || m[METHOD_NAME_ALL];
      const processedSet = {};
      if (handlerSet !== undefined) {
        handlerSet.params = /* @__PURE__ */ Object.create(null);
        handlerSets.push(handlerSet);
        if (nodeParams !== emptyParams || params && params !== emptyParams) {
          for (let i2 = 0, len2 = handlerSet.possibleKeys.length;i2 < len2; i2++) {
            const key = handlerSet.possibleKeys[i2];
            const processed = processedSet[handlerSet.score];
            handlerSet.params[key] = params?.[key] && !processed ? params[key] : nodeParams[key] ?? params?.[key];
            processedSet[handlerSet.score] = true;
          }
        }
      }
    }
  }
  search(method, path) {
    const handlerSets = [];
    this.#params = emptyParams;
    const curNode = this;
    let curNodes = [curNode];
    const parts = splitPath(path);
    const curNodesQueue = [];
    const len = parts.length;
    let partOffsets = null;
    for (let i = 0;i < len; i++) {
      const part = parts[i];
      const isLast = i === len - 1;
      const tempNodes = [];
      for (let j = 0, len2 = curNodes.length;j < len2; j++) {
        const node = curNodes[j];
        const nextNode = node.#children[part];
        if (nextNode) {
          nextNode.#params = node.#params;
          if (isLast) {
            if (nextNode.#children["*"]) {
              this.#pushHandlerSets(handlerSets, nextNode.#children["*"], method, node.#params);
            }
            this.#pushHandlerSets(handlerSets, nextNode, method, node.#params);
          } else {
            tempNodes.push(nextNode);
          }
        }
        for (let k = 0, len3 = node.#patterns.length;k < len3; k++) {
          const pattern = node.#patterns[k];
          const params = node.#params === emptyParams ? {} : { ...node.#params };
          if (pattern === "*") {
            const astNode = node.#children["*"];
            if (astNode) {
              this.#pushHandlerSets(handlerSets, astNode, method, node.#params);
              astNode.#params = params;
              tempNodes.push(astNode);
            }
            continue;
          }
          const [key, name, matcher] = pattern;
          if (!part && !(matcher instanceof RegExp)) {
            continue;
          }
          const child = node.#children[key];
          if (matcher instanceof RegExp) {
            if (partOffsets === null) {
              partOffsets = new Array(len);
              let offset = path[0] === "/" ? 1 : 0;
              for (let p = 0;p < len; p++) {
                partOffsets[p] = offset;
                offset += parts[p].length + 1;
              }
            }
            const restPathString = path.substring(partOffsets[i]);
            const m = matcher.exec(restPathString);
            if (m) {
              params[name] = m[0];
              this.#pushHandlerSets(handlerSets, child, method, node.#params, params);
              if (hasChildren(child.#children)) {
                child.#params = params;
                const componentCount = m[0].match(/\//)?.length ?? 0;
                const targetCurNodes = curNodesQueue[componentCount] ||= [];
                targetCurNodes.push(child);
              }
              continue;
            }
          }
          if (matcher === true || matcher.test(part)) {
            params[name] = part;
            if (isLast) {
              this.#pushHandlerSets(handlerSets, child, method, params, node.#params);
              if (child.#children["*"]) {
                this.#pushHandlerSets(handlerSets, child.#children["*"], method, params, node.#params);
              }
            } else {
              child.#params = params;
              tempNodes.push(child);
            }
          }
        }
      }
      const shifted = curNodesQueue.shift();
      curNodes = shifted ? tempNodes.concat(shifted) : tempNodes;
    }
    if (handlerSets.length > 1) {
      handlerSets.sort((a, b) => {
        return a.score - b.score;
      });
    }
    return [handlerSets.map(({ handler, params }) => [handler, params])];
  }
};

// node_modules/hono/dist/router/trie-router/router.js
var TrieRouter = class {
  name = "TrieRouter";
  #node;
  constructor() {
    this.#node = new Node2;
  }
  add(method, path, handler) {
    const results = checkOptionalParameter(path);
    if (results) {
      for (let i = 0, len = results.length;i < len; i++) {
        this.#node.insert(method, results[i], handler);
      }
      return;
    }
    this.#node.insert(method, path, handler);
  }
  match(method, path) {
    return this.#node.search(method, path);
  }
};

// node_modules/hono/dist/hono.js
var Hono2 = class extends Hono {
  constructor(options = {}) {
    super(options);
    this.router = options.router ?? new SmartRouter({
      routers: [new RegExpRouter, new TrieRouter]
    });
  }
};

// node_modules/hono/dist/middleware/cors/index.js
var cors = (options) => {
  const opts = {
    origin: "*",
    allowMethods: ["GET", "HEAD", "PUT", "POST", "DELETE", "PATCH"],
    allowHeaders: [],
    exposeHeaders: [],
    ...options
  };
  const findAllowOrigin = ((optsOrigin) => {
    if (typeof optsOrigin === "string") {
      if (optsOrigin === "*") {
        if (opts.credentials) {
          return (origin) => origin || null;
        }
        return () => optsOrigin;
      } else {
        return (origin) => optsOrigin === origin ? origin : null;
      }
    } else if (typeof optsOrigin === "function") {
      return optsOrigin;
    } else {
      return (origin) => optsOrigin.includes(origin) ? origin : null;
    }
  })(opts.origin);
  const findAllowMethods = ((optsAllowMethods) => {
    if (typeof optsAllowMethods === "function") {
      return optsAllowMethods;
    } else if (Array.isArray(optsAllowMethods)) {
      return () => optsAllowMethods;
    } else {
      return () => [];
    }
  })(opts.allowMethods);
  return async function cors2(c, next) {
    function set(key, value) {
      c.res.headers.set(key, value);
    }
    const allowOrigin = await findAllowOrigin(c.req.header("origin") || "", c);
    if (allowOrigin) {
      set("Access-Control-Allow-Origin", allowOrigin);
    }
    if (opts.credentials) {
      set("Access-Control-Allow-Credentials", "true");
    }
    if (opts.exposeHeaders?.length) {
      set("Access-Control-Expose-Headers", opts.exposeHeaders.join(","));
    }
    if (c.req.method === "OPTIONS") {
      if (opts.origin !== "*" || opts.credentials) {
        set("Vary", "Origin");
      }
      if (opts.maxAge != null) {
        set("Access-Control-Max-Age", opts.maxAge.toString());
      }
      const allowMethods = await findAllowMethods(c.req.header("origin") || "", c);
      if (allowMethods.length) {
        set("Access-Control-Allow-Methods", allowMethods.join(","));
      }
      let headers = opts.allowHeaders;
      if (!headers?.length) {
        const requestHeaders = c.req.header("Access-Control-Request-Headers");
        if (requestHeaders) {
          headers = requestHeaders.split(/\s*,\s*/);
        }
      }
      if (headers?.length) {
        set("Access-Control-Allow-Headers", headers.join(","));
        c.res.headers.append("Vary", "Access-Control-Request-Headers");
      }
      c.res.headers.delete("Content-Length");
      c.res.headers.delete("Content-Type");
      return new Response(null, {
        headers: c.res.headers,
        status: 204,
        statusText: "No Content"
      });
    }
    await next();
    if (opts.origin !== "*" || opts.credentials) {
      c.header("Vary", "Origin", { append: true });
    }
  };
};

// src/providers.ts
var PROVIDERS = {
  "nexus-flash": {
    name: "nexus-flash",
    baseUrl: "https://api.groq.com/openai/v1",
    model: "llama-3.3-70b-versatile",
    keyEnv: "GROQ_API_KEY",
    tier: 1,
    category: "fast",
    costPer1kTokens: 0.0003
  },
  "nexus-air": {
    name: "nexus-air",
    baseUrl: "https://generativelanguage.googleapis.com/v1beta/openai",
    model: "gemini-2.5-flash",
    keyEnv: "GEMINI_API_KEY",
    tier: 2,
    category: "general",
    costPer1kTokens: 0.0001
  },
  "nexus-deep": {
    name: "nexus-deep",
    baseUrl: "https://api.siliconflow.com/v1",
    model: "deepseek-ai/DeepSeek-V3",
    keyEnv: "SILICONFLOW_API_KEY",
    tier: 2,
    category: "reasoning",
    costPer1kTokens: 0.0002
  },
  "nexus-pro": {
    name: "nexus-pro",
    baseUrl: "https://generativelanguage.googleapis.com/v1beta/openai",
    model: "gemini-2.5-pro",
    keyEnv: "GEMINI_API_KEY",
    tier: 3,
    category: "reasoning",
    costPer1kTokens: 0.001
  },
  "nexus-code": {
    name: "nexus-code",
    baseUrl: "https://inference.poolside.ai/v1",
    model: "poolside/laguna-m.1",
    keyEnv: "POOLSIDE_API_KEY",
    tier: 2,
    category: "code",
    costPer1kTokens: 0.0005
  },
  "nexus-core": {
    name: "nexus-core",
    baseUrl: "https://integrate.api.nvidia.com/v1",
    model: "meta/llama-3.3-70b-instruct",
    keyEnv: "NVIDIA_API_KEY",
    tier: 3,
    category: "general",
    costPer1kTokens: 0.0003
  },
  "nexus-lite": {
    name: "nexus-lite",
    baseUrl: "https://api.groq.com/openai/v1",
    model: "llama-3.1-8b-instant",
    keyEnv: "GROQ_API_KEY",
    tier: 4,
    category: "free",
    costPer1kTokens: 0
  }
};
var OPENAI_COST_PER_1K = 0.005;
function getProvider(model) {
  return PROVIDERS[model];
}
function getAllProviders() {
  return Object.values(PROVIDERS);
}

// src/router.ts
var CODE_SIGNALS = /\b(code|debug|fix|error|function|class|import|export|const|let|var|async|await|typescript|python|rust|react|vue|angular|component|api|endpoint|database|sql|git|deploy|docker|build|compile|test|refactor|bug|stack\s*trace|syntax|regex|algorithm|data\s*structure)\b/i;
var REASONING_SIGNALS = /\b(think|analyze|compare|explain\s*why|step\s*by\s*step|reason|evaluate|assess|critique|review|deep\s*dive|pros\s*and\s*cons|trade-?offs|implications|consequences|strategy|plan|architecture|design|research)\b/i;
var FAST_SIGNALS = /\b(quick|short|brief|one\s*word|yes\s*or\s*no|simple|tldr|summarize\s*in|just\s*tell|what\s*is|who\s*is|when\s*did|define|translate|convert)\b/i;
function detectTask(messages) {
  const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
  if (!lastUserMsg)
    return "general";
  const content = lastUserMsg.content;
  if (CODE_SIGNALS.test(content))
    return "code";
  if (REASONING_SIGNALS.test(content))
    return "reasoning";
  if (FAST_SIGNALS.test(content))
    return "fast";
  if (content.length < 50)
    return "fast";
  if (content.length > 500)
    return "reasoning";
  return "general";
}
function taskToModel(task) {
  switch (task) {
    case "code":
      return "nexus-code";
    case "reasoning":
      return "nexus-pro";
    case "fast":
      return "nexus-flash";
    case "general":
      return "nexus-air";
    case "free":
      return "nexus-lite";
  }
}
function autoRoute(messages) {
  const task = detectTask(messages);
  return taskToModel(task);
}

// src/circuit-breaker.ts
var circuits = new Map;
var FAILURE_THRESHOLD = 3;
var RECOVERY_TIME = 5 * 60 * 1000;
function isProviderHealthy(providerName) {
  const state = circuits.get(providerName);
  if (!state)
    return true;
  if (state.open) {
    if (Date.now() - state.lastFailure > RECOVERY_TIME) {
      state.open = false;
      state.failures = 0;
      return true;
    }
    return false;
  }
  return true;
}
function recordFailure(providerName) {
  const state = circuits.get(providerName) || { failures: 0, lastFailure: 0, open: false };
  state.failures++;
  state.lastFailure = Date.now();
  if (state.failures >= FAILURE_THRESHOLD) {
    state.open = true;
  }
  circuits.set(providerName, state);
}
function recordSuccess(providerName) {
  circuits.set(providerName, { failures: 0, lastFailure: 0, open: false });
}
function getCircuitStatus() {
  const status = {};
  for (const [name, state] of circuits.entries()) {
    status[name] = { healthy: !state.open, failures: state.failures };
  }
  return status;
}

// src/db.ts
import { Database } from "bun:sqlite";
import { join } from "path";
import { mkdirSync } from "fs";
var DB_PATH = join(import.meta.dir, "..", "data", "nexus.db");
try {
  mkdirSync(join(import.meta.dir, "..", "data"), { recursive: true });
} catch {}
var db = new Database(DB_PATH);
db.run("PRAGMA journal_mode = WAL");
db.run("PRAGMA synchronous = NORMAL");
db.run(`
  CREATE TABLE IF NOT EXISTS requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    model TEXT NOT NULL,
    tokens INTEGER DEFAULT 0,
    cost REAL DEFAULT 0,
    latency INTEGER DEFAULT 0,
    success INTEGER DEFAULT 1,
    timestamp INTEGER NOT NULL,
    routed_from TEXT
  )
`);
db.run(`
  CREATE TABLE IF NOT EXISTS provider_keys (
    id TEXT PRIMARY KEY,
    provider TEXT NOT NULL,
    api_key_encrypted TEXT NOT NULL,
    label TEXT,
    active INTEGER DEFAULT 1,
    created_at INTEGER NOT NULL,
    last_used INTEGER
  )
`);
db.run(`
  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  )
`);
db.run(`
  CREATE TABLE IF NOT EXISTS benchmarks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    model TEXT NOT NULL,
    latency_p50 INTEGER,
    latency_p95 INTEGER,
    tokens_per_second REAL,
    success_rate REAL,
    tested_at INTEGER NOT NULL
  )
`);
db.run(`
  CREATE TABLE IF NOT EXISTS api_keys (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    key_hash TEXT NOT NULL,
    prefix TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    last_used INTEGER,
    active INTEGER DEFAULT 1
  )
`);
db.run("CREATE INDEX IF NOT EXISTS idx_requests_timestamp ON requests(timestamp)");
db.run("CREATE INDEX IF NOT EXISTS idx_requests_model ON requests(model)");
db.run("CREATE INDEX IF NOT EXISTS idx_benchmarks_model ON benchmarks(model)");
var queries = {
  insertRequest: db.prepare("INSERT INTO requests (model, tokens, cost, latency, success, timestamp, routed_from) VALUES (?, ?, ?, ?, ?, ?, ?)"),
  getRequestsSince: db.prepare("SELECT * FROM requests WHERE timestamp >= ? ORDER BY timestamp DESC"),
  getRequestStats: db.prepare(`
    SELECT 
      model,
      COUNT(*) as total_requests,
      SUM(CASE WHEN success = 1 THEN 1 ELSE 0 END) as successful,
      SUM(tokens) as total_tokens,
      SUM(cost) as total_cost,
      AVG(latency) as avg_latency,
      MIN(latency) as min_latency,
      MAX(latency) as max_latency
    FROM requests 
    WHERE timestamp >= ?
    GROUP BY model
  `),
  getDailyStats: db.prepare(`
    SELECT 
      DATE(timestamp / 1000, 'unixepoch') as day,
      COUNT(*) as requests,
      SUM(tokens) as tokens,
      SUM(cost) as cost,
      AVG(latency) as avg_latency
    FROM requests
    WHERE timestamp >= ?
    GROUP BY day
    ORDER BY day
  `),
  getRecentRequests: db.prepare("SELECT * FROM requests ORDER BY timestamp DESC LIMIT ?"),
  getSetting: db.prepare("SELECT value FROM settings WHERE key = ?"),
  setSetting: db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)"),
  insertApiKey: db.prepare("INSERT INTO api_keys (id, name, key_hash, prefix, created_at) VALUES (?, ?, ?, ?, ?)"),
  getApiKeys: db.prepare("SELECT id, name, prefix, created_at, last_used, active FROM api_keys"),
  getApiKeyByHash: db.prepare("SELECT * FROM api_keys WHERE key_hash = ? AND active = 1"),
  deactivateApiKey: db.prepare("UPDATE api_keys SET active = 0 WHERE id = ?"),
  touchApiKey: db.prepare("UPDATE api_keys SET last_used = ? WHERE id = ?"),
  insertProviderKey: db.prepare("INSERT OR REPLACE INTO provider_keys (id, provider, api_key_encrypted, label, active, created_at) VALUES (?, ?, ?, ?, ?, ?)"),
  getProviderKeys: db.prepare("SELECT id, provider, label, active, created_at, last_used FROM provider_keys"),
  getProviderKey: db.prepare("SELECT * FROM provider_keys WHERE provider = ? AND active = 1"),
  deactivateProviderKey: db.prepare("UPDATE provider_keys SET active = 0 WHERE id = ?"),
  insertBenchmark: db.prepare("INSERT INTO benchmarks (model, latency_p50, latency_p95, tokens_per_second, success_rate, tested_at) VALUES (?, ?, ?, ?, ?, ?)"),
  getLatestBenchmarks: db.prepare(`
    SELECT * FROM benchmarks 
    WHERE tested_at = (SELECT MAX(tested_at) FROM benchmarks)
    ORDER BY model
  `)
};
function recordRequest(data) {
  queries.insertRequest.run(data.model, data.tokens, data.cost, data.latency, data.success ? 1 : 0, data.timestamp, data.routedFrom || null);
}
function getSetting(key, defaultValue = "") {
  const row = queries.getSetting.get(key);
  return row?.value ?? defaultValue;
}
function setSetting(key, value) {
  queries.setSetting.run(key, value);
}

// src/events.ts
class EventBus {
  listeners = new Set;
  subscribe(fn) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }
  emit(event) {
    for (const fn of this.listeners) {
      try {
        fn(event);
      } catch {}
    }
  }
}
var events = new EventBus;

// src/stats.ts
class StatsTracker {
  recentLogs = [];
  dailySpend = 0;
  dailyBudget = 50;
  startOfDay = this.getStartOfDay();
  constructor() {
    const saved = getSetting("daily_budget", "50");
    this.dailyBudget = parseFloat(saved);
    const todayStart = this.getStartOfDay();
    const rows = queries.getRequestsSince.all(todayStart);
    this.dailySpend = rows.reduce((sum, r) => sum + (r.success ? r.cost : 0), 0);
  }
  getStartOfDay() {
    const now = new Date;
    now.setHours(0, 0, 0, 0);
    return now.getTime();
  }
  setBudget(daily) {
    this.dailyBudget = daily;
    setSetting("daily_budget", daily.toString());
  }
  getBudget() {
    return this.dailyBudget;
  }
  canSpend() {
    this.resetIfNewDay();
    return this.dailySpend < this.dailyBudget;
  }
  budgetRemaining() {
    this.resetIfNewDay();
    return this.dailyBudget - this.dailySpend;
  }
  budgetPercent() {
    return Math.round(this.dailySpend / this.dailyBudget * 100);
  }
  resetIfNewDay() {
    const today = this.getStartOfDay();
    if (today > this.startOfDay) {
      this.dailySpend = 0;
      this.startOfDay = today;
    }
  }
  record(log) {
    this.recentLogs.push(log);
    if (this.recentLogs.length > 500) {
      this.recentLogs = this.recentLogs.slice(-250);
    }
    if (log.success) {
      this.dailySpend += log.cost;
    }
    recordRequest({
      model: log.model,
      tokens: log.tokens,
      cost: log.cost,
      latency: log.latency,
      success: log.success,
      timestamp: log.timestamp,
      routedFrom: log.routedFrom
    });
    events.emit({
      type: log.success ? "request" : "error",
      timestamp: log.timestamp,
      data: {
        model: log.model,
        tokens: log.tokens,
        cost: log.cost,
        latency: log.latency,
        success: log.success
      }
    });
    if (this.budgetPercent() >= 80 && this.budgetPercent() < 82) {
      events.emit({
        type: "budget_warning",
        timestamp: Date.now(),
        data: { percent: this.budgetPercent(), remaining: this.budgetRemaining() }
      });
    }
  }
  getTodayStats() {
    this.resetIfNewDay();
    const todayStart = this.startOfDay;
    const rows = queries.getRequestsSince.all(todayStart);
    const totalRequests = rows.length;
    const successfulRequests = rows.filter((r) => r.success).length;
    const totalTokens = rows.reduce((sum, r) => sum + r.tokens, 0);
    const totalCost = rows.reduce((sum, r) => sum + r.cost, 0);
    const avgLatency = totalRequests > 0 ? Math.round(rows.reduce((sum, r) => sum + r.latency, 0) / totalRequests) : 0;
    const openaiEquivalentCost = totalTokens / 1000 * OPENAI_COST_PER_1K;
    const savings = openaiEquivalentCost - totalCost;
    return {
      requests: totalRequests,
      successful: successfulRequests,
      tokens: totalTokens,
      cost: totalCost,
      avgLatency,
      savings: Math.max(0, savings),
      budgetUsed: this.dailySpend,
      budgetTotal: this.dailyBudget,
      budgetPercent: this.budgetPercent(),
      uptime: totalRequests > 0 ? Math.round(successfulRequests / totalRequests * 100) : 100
    };
  }
  getWeekStats() {
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const rows = queries.getRequestsSince.all(weekAgo);
    const totalTokens = rows.reduce((sum, r) => sum + r.tokens, 0);
    const totalCost = rows.reduce((sum, r) => sum + r.cost, 0);
    const openaiEquivalentCost = totalTokens / 1000 * OPENAI_COST_PER_1K;
    return {
      requests: rows.length,
      tokens: totalTokens,
      cost: totalCost,
      savings: Math.max(0, openaiEquivalentCost - totalCost)
    };
  }
  getModelStats(since) {
    return queries.getRequestStats.all(since);
  }
  getDailyStats(since) {
    return queries.getDailyStats.all(since);
  }
  getRecentLogs(n = 20) {
    return this.recentLogs.slice(-n);
  }
}
var stats = new StatsTracker;

// src/gateway.ts
function getApiKey(provider) {
  return process.env[provider.keyEnv] || "";
}
function getFallbackChain(originalModel) {
  const allModels = ["nexus-flash", "nexus-air", "nexus-deep", "nexus-core", "nexus-pro", "nexus-code", "nexus-lite"];
  return allModels.filter((m) => m !== originalModel);
}
function buildProviderRequest(provider, body, stream) {
  const key = getApiKey(provider);
  if (!key)
    throw new Error(`No API key for ${provider.keyEnv}`);
  const url = `${provider.baseUrl}/chat/completions`;
  const headers = {
    "Content-Type": "application/json"
  };
  const finalUrl = url;
  headers["Authorization"] = `Bearer ${key}`;
  const requestBody = {
    ...body,
    model: provider.model,
    stream,
    ...stream && { stream_options: { include_usage: true } }
  };
  return { url: finalUrl, headers, body: JSON.stringify(requestBody) };
}
async function callProvider(provider, body) {
  const { url, headers, body: reqBody } = buildProviderRequest(provider, body, false);
  const start = Date.now();
  const response = await fetch(url, {
    method: "POST",
    headers,
    body: reqBody
  });
  const latency = Date.now() - start;
  return { response, latency };
}
async function callProviderStream(provider, body) {
  const { url, headers, body: reqBody } = buildProviderRequest(provider, body, true);
  const startTime = Date.now();
  const response = await fetch(url, {
    method: "POST",
    headers,
    body: reqBody
  });
  return { response, startTime };
}
function createStreamTransformer(brandedModel, provider, startTime) {
  let buffer = "";
  let totalTokens = 0;
  return new TransformStream({
    transform(chunk, controller) {
      const decoder = new TextDecoder;
      const encoder = new TextEncoder;
      buffer += decoder.decode(chunk, { stream: true });
      const lines = buffer.split(`
`);
      buffer = lines.pop() || "";
      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.slice(6).trim();
          if (data === "[DONE]") {
            const latency = Date.now() - startTime;
            const cost = totalTokens / 1000 * provider.costPer1kTokens;
            stats.record({
              model: brandedModel,
              tokens: totalTokens,
              cost,
              latency,
              timestamp: Date.now(),
              success: true
            });
            controller.enqueue(encoder.encode(`data: [DONE]

`));
            continue;
          }
          try {
            const parsed = JSON.parse(data);
            parsed.model = brandedModel;
            if (parsed.usage) {
              totalTokens = parsed.usage.total_tokens || parsed.usage.prompt_tokens + parsed.usage.completion_tokens || 0;
            }
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(parsed)}

`));
          } catch {
            controller.enqueue(encoder.encode(`${line}
`));
          }
        } else if (line.trim() === "") {} else {
          controller.enqueue(encoder.encode(`${line}
`));
        }
      }
    },
    flush(controller) {
      if (buffer.trim()) {
        const encoder = new TextEncoder;
        controller.enqueue(encoder.encode(`${buffer}
`));
      }
      if (totalTokens === 0) {
        const latency = Date.now() - startTime;
        stats.record({
          model: brandedModel,
          tokens: 0,
          cost: 0,
          latency,
          timestamp: Date.now(),
          success: true
        });
      }
    }
  });
}
async function handleChatCompletion(body) {
  if (!stats.canSpend()) {
    return new Response(JSON.stringify({
      error: { message: "Daily budget exceeded. Reset tomorrow or increase budget.", type: "budget_exceeded" }
    }), { status: 429, headers: { "Content-Type": "application/json" } });
  }
  let modelName = body.model;
  if (modelName === "auto" || !getProvider(modelName)) {
    const modelOverride = getSetting("model_override", "auto");
    modelName = getProvider(modelOverride) ? modelOverride : autoRoute(body.messages);
  }
  const isStream = body.stream === true;
  const attempts = [modelName, ...getFallbackChain(modelName)];
  for (const attempt of attempts) {
    const provider = getProvider(attempt);
    if (!provider)
      continue;
    if (!isProviderHealthy(attempt))
      continue;
    if (!getApiKey(provider))
      continue;
    try {
      if (isStream) {
        const { response: response2, startTime } = await callProviderStream(provider, body);
        if (!response2.ok) {
          if (response2.status >= 429) {
            recordFailure(attempt);
            continue;
          }
          recordFailure(attempt);
          continue;
        }
        if (!response2.body) {
          recordFailure(attempt);
          continue;
        }
        recordSuccess(attempt);
        const transformer = createStreamTransformer(attempt, provider, startTime);
        const transformedStream = response2.body.pipeThrough(transformer);
        return new Response(transformedStream, {
          status: 200,
          headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
            "X-Nexus-Model": attempt
          }
        });
      }
      const { response, latency } = await callProvider(provider, body);
      if (!response.ok) {
        if (response.status >= 429) {
          recordFailure(attempt);
          continue;
        }
        recordFailure(attempt);
        continue;
      }
      const data = await response.json();
      recordSuccess(attempt);
      const tokens = data.usage?.total_tokens || 0;
      const cost = tokens / 1000 * provider.costPer1kTokens;
      stats.record({
        model: attempt,
        tokens,
        cost,
        latency,
        timestamp: Date.now(),
        success: true
      });
      data.model = attempt;
      return new Response(JSON.stringify(data), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    } catch (err) {
      recordFailure(attempt);
      stats.record({
        model: attempt,
        tokens: 0,
        cost: 0,
        latency: 0,
        timestamp: Date.now(),
        success: false
      });
      continue;
    }
  }
  const errorResponse = {
    error: { message: "All providers failed. Please try again.", type: "all_providers_failed" }
  };
  if (isStream) {
    const encoder = new TextEncoder;
    const errorChunk = `data: ${JSON.stringify({ error: errorResponse.error })}

data: [DONE]

`;
    return new Response(encoder.encode(errorChunk), {
      status: 503,
      headers: { "Content-Type": "text/event-stream" }
    });
  }
  return new Response(JSON.stringify(errorResponse), {
    status: 503,
    headers: { "Content-Type": "application/json" }
  });
}

// src/api-keys.ts
var KEY_PREFIX = "nxs_";
var KEY_LENGTH = 48;
function generateRandomKey() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  const bytes = crypto.getRandomValues(new Uint8Array(KEY_LENGTH));
  for (const byte of bytes) {
    result += chars[byte % chars.length];
  }
  return `${KEY_PREFIX}${result}`;
}
async function hashKey(key) {
  const encoder = new TextEncoder;
  const data = encoder.encode(key);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, "0")).join("");
}
async function createApiKey(name) {
  const id = crypto.randomUUID();
  const key = generateRandomKey();
  const keyHash = await hashKey(key);
  const prefix = key.slice(0, 8) + "...";
  queries.insertApiKey.run(id, name, keyHash, prefix, Date.now());
  return { id, key, prefix };
}
async function validateApiKey(key) {
  if (!key.startsWith(KEY_PREFIX))
    return false;
  const keyHash = await hashKey(key);
  const row = queries.getApiKeyByHash.get(keyHash);
  if (row) {
    queries.touchApiKey.run(Date.now(), row.id);
    return true;
  }
  return false;
}
function listApiKeys() {
  return queries.getApiKeys.all();
}
function revokeApiKey(id) {
  queries.deactivateApiKey.run(id);
}

// src/benchmark.ts
var BENCHMARK_PROMPT = [
  { role: "user", content: "Respond with exactly: 'Hello, Nexus AI is operational.' Nothing else." }
];
async function benchmarkProvider(provider, runs = 3) {
  const key = process.env[provider.keyEnv];
  if (!key)
    return null;
  const latencies = [];
  let successes = 0;
  let totalTokens = 0;
  let totalTime = 0;
  for (let i = 0;i < runs; i++) {
    try {
      const url = provider.baseUrl.includes("googleapis.com") ? `${provider.baseUrl}/chat/completions?key=${key}` : `${provider.baseUrl}/chat/completions`;
      const headers = { "Content-Type": "application/json" };
      if (!provider.baseUrl.includes("googleapis.com")) {
        headers["Authorization"] = `Bearer ${key}`;
      }
      const start = Date.now();
      const response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify({
          model: provider.model,
          messages: BENCHMARK_PROMPT,
          max_tokens: 30,
          temperature: 0
        })
      });
      const latency = Date.now() - start;
      if (response.ok) {
        const data = await response.json();
        latencies.push(latency);
        successes++;
        const tokens = data.usage?.completion_tokens || 10;
        totalTokens += tokens;
        totalTime += latency;
      }
    } catch {}
    await new Promise((r) => setTimeout(r, 500));
  }
  if (latencies.length === 0)
    return null;
  latencies.sort((a, b) => a - b);
  const p50 = latencies[Math.floor(latencies.length * 0.5)] || 0;
  const p95 = latencies[Math.floor(latencies.length * 0.95)] || latencies[latencies.length - 1] || 0;
  const tps = totalTime > 0 ? totalTokens / totalTime * 1000 : 0;
  return {
    model: provider.name,
    latencyP50: p50,
    latencyP95: p95,
    tokensPerSecond: Math.round(tps * 10) / 10,
    successRate: Math.round(successes / runs * 100),
    testedAt: Date.now()
  };
}
async function runBenchmark() {
  const providers = getAllProviders();
  const results = [];
  events.emit({
    type: "request",
    timestamp: Date.now(),
    data: { action: "benchmark_started", models: providers.map((p) => p.name) }
  });
  for (const provider of providers) {
    const result = await benchmarkProvider(provider);
    if (result) {
      results.push(result);
      queries.insertBenchmark.run(result.model, result.latencyP50, result.latencyP95, result.tokensPerSecond, result.successRate, result.testedAt);
    }
  }
  events.emit({
    type: "request",
    timestamp: Date.now(),
    data: { action: "benchmark_completed", results: results.length }
  });
  return results;
}
function getLatestBenchmarks() {
  const rows = queries.getLatestBenchmarks.all();
  return rows.map((r) => ({
    model: r.model,
    latencyP50: r.latency_p50,
    latencyP95: r.latency_p95,
    tokensPerSecond: r.tokens_per_second,
    successRate: r.success_rate,
    testedAt: r.tested_at
  }));
}

// src/dashboard/index.html
var dashboard_default = __jsonParse("{\"index\":\"dashboard/index.html\",\"files\":[{\"input\":\"dashboard/index.html\",\"path\":\"./index-sx7zt2zk.js\",\"loader\":\"js\",\"isEntry\":true,\"headers\":{\"etag\":\"eZ3n_3oCP3M\",\"content-type\":\"text/javascript;charset=utf-8\"}},{\"input\":\"dashboard/index.html\",\"path\":\"dashboard/index.html\",\"loader\":\"html\",\"isEntry\":true,\"headers\":{\"etag\":\"yfa9v4KBw2U\",\"content-type\":\"text/html;charset=utf-8\"}},{\"input\":\"dashboard/index.html\",\"path\":\"./index-00jc95zd.css\",\"loader\":\"css\",\"isEntry\":true,\"headers\":{\"etag\":\"oOASbOnFH00\",\"content-type\":\"text/css;charset=utf-8\"}}]}");

// src/index.ts
var app = new Hono2;
var PORT = parseInt(process.env.NEXUS_PORT || "4000");
async function loadLocalEnvFile() {
  const envFile = Bun.file(".env");
  if (!await envFile.exists())
    return;
  const text = await envFile.text();
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#"))
      continue;
    const separator = trimmed.indexOf("=");
    if (separator <= 0)
      continue;
    const key = trimmed.slice(0, separator).trim();
    let value = trimmed.slice(separator + 1).trim();
    const quoted = value.startsWith('"') && value.endsWith('"') || value.startsWith("'") && value.endsWith("'");
    if (quoted)
      value = value.slice(1, -1);
    if (/^[A-Za-z_][A-Za-z0-9_]*$/.test(key) && !process.env[key]) {
      process.env[key] = value;
    }
  }
}
await loadLocalEnvFile();
var WS_PATH = "/ws";
app.use("/api/*", cors({ origin: "*" }));
app.post("/v1/chat/completions", async (c) => {
  const body = await c.req.json();
  const authHeader = c.req.header("Authorization");
  if (authHeader?.startsWith("Bearer nxs_")) {
    const key = authHeader.slice(7);
    const valid = await validateApiKey(key);
    if (!valid) {
      return c.json({ error: { message: "Invalid API key", type: "invalid_api_key" } }, 401);
    }
  }
  const result = await handleChatCompletion(body);
  if (result.headers.get("Content-Type") === "text/event-stream") {
    return new Response(result.body, {
      status: result.status,
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "X-Nexus-Model": result.headers.get("X-Nexus-Model") || ""
      }
    });
  }
  const data = await result.json();
  return c.json(data, result.status);
});
app.get("/v1/models", (c) => {
  const models = getAllProviders().map((p) => ({
    id: p.name,
    object: "model",
    created: 1700000000,
    owned_by: "nexus-ai",
    permission: []
  }));
  return c.json({ object: "list", data: models });
});
app.get("/api/stats", (c) => {
  const todayStats = stats.getTodayStats();
  const weekStats = stats.getWeekStats();
  const circuits2 = getCircuitStatus();
  return c.json({
    today: todayStats,
    week: weekStats,
    providers: circuits2
  });
});
app.get("/api/stats/models", (c) => {
  const since = parseInt(c.req.query("since") || String(Date.now() - 24 * 60 * 60 * 1000));
  const modelStats = stats.getModelStats(since);
  return c.json({ models: modelStats });
});
app.get("/api/stats/history", (c) => {
  const days = parseInt(c.req.query("days") || "7");
  const since = Date.now() - days * 24 * 60 * 60 * 1000;
  const daily = stats.getDailyStats(since);
  return c.json({ daily });
});
app.get("/api/activity", (c) => {
  const limit = parseInt(c.req.query("limit") || "20");
  return c.json({ logs: stats.getRecentLogs(limit) });
});
app.get("/api/models", (c) => {
  const circuits2 = getCircuitStatus();
  const benchmarks = getLatestBenchmarks();
  const benchmarkMap = Object.fromEntries(benchmarks.map((b) => [b.model, b]));
  const models = getAllProviders().map((p) => ({
    id: p.name,
    category: p.category,
    tier: p.tier,
    costPer1kTokens: p.costPer1kTokens,
    healthy: circuits2[p.name]?.healthy ?? true,
    failures: circuits2[p.name]?.failures ?? 0,
    hasKey: !!process.env[p.keyEnv],
    benchmark: benchmarkMap[p.name] || null
  }));
  return c.json({ models });
});
app.post("/api/models/:model/test", async (c) => {
  const model = c.req.param("model");
  const provider = PROVIDERS[model];
  if (!provider)
    return c.json({ error: "Model not found" }, 404);
  const key = process.env[provider.keyEnv];
  if (!key)
    return c.json({ error: "No API key configured", healthy: false }, 200);
  try {
    const url = `${provider.baseUrl}/chat/completions`;
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`
    };
    const start = Date.now();
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({
        model: provider.model,
        messages: [{ role: "user", content: "Say ok" }],
        max_tokens: 5
      })
    });
    const latency = Date.now() - start;
    return c.json({ healthy: response.ok, latency, status: response.status });
  } catch (err) {
    return c.json({ healthy: false, error: err.message });
  }
});
app.get("/api/keys", (c) => {
  return c.json({ keys: listApiKeys() });
});
app.post("/api/keys", async (c) => {
  const { name } = await c.req.json();
  if (!name)
    return c.json({ error: "Name is required" }, 400);
  const result = await createApiKey(name);
  return c.json(result, 201);
});
app.delete("/api/keys/:id", (c) => {
  const id = c.req.param("id");
  revokeApiKey(id);
  return c.json({ ok: true });
});
app.get("/api/benchmark", (c) => {
  const results = getLatestBenchmarks();
  return c.json({ benchmarks: results });
});
app.post("/api/benchmark/run", async (c) => {
  const results = await runBenchmark();
  return c.json({ benchmarks: results });
});
app.get("/api/settings", (c) => {
  return c.json({
    dailyBudget: stats.getBudget(),
    modelOverride: getSetting("model_override", "auto"),
    port: PORT,
    version: "1.0.0"
  });
});
app.put("/api/settings", async (c) => {
  const body = await c.req.json();
  if (body.dailyBudget !== undefined) {
    stats.setBudget(body.dailyBudget);
  }
  if (body.modelOverride !== undefined) {
    const modelOverride = String(body.modelOverride);
    if (modelOverride !== "auto" && !PROVIDERS[modelOverride]) {
      return c.json({ error: "Invalid model override" }, 400);
    }
    setSetting("model_override", modelOverride);
  }
  return c.json({ ok: true });
});
app.get("/health", (c) => {
  const todayStats = stats.getTodayStats();
  const weekStats = stats.getWeekStats();
  const circuits2 = getCircuitStatus();
  return c.json({ status: "ok", version: "1.0.0", today: todayStats, week: weekStats, providers: circuits2 });
});
app.get("/v1", (c) => {
  return c.json({
    status: "Nexus AI Gateway is running",
    version: "1.0.0",
    endpoints: {
      chat: "POST /v1/chat/completions",
      models: "GET /v1/models",
      health: "GET /health",
      dashboard: "GET /",
      api: {
        stats: "GET /api/stats",
        models: "GET /api/models",
        keys: "GET /api/keys",
        benchmark: "GET /api/benchmark",
        settings: "GET /api/settings"
      }
    },
    models: ["nexus-flash", "nexus-air", "nexus-deep", "nexus-pro", "nexus-code", "nexus-lite", "auto"]
  });
});
console.log(`
\u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550 NEXUS AI v1.0.0 \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557
\u2551                                                         \u2551
\u2551  Gateway:   http://localhost:${PORT}/v1                  \u2551
\u2551  Dashboard: http://localhost:${PORT}                     \u2551
\u2551                                                         \u2551
\u2551  Models:                                                \u2551
\u2551    nexus-flash  \u2192 Ultra-fast responses                  \u2551
\u2551    nexus-air    \u2192 Balanced & efficient                  \u2551
\u2551    nexus-deep   \u2192 Deep thinking                         \u2551
\u2551    nexus-pro    \u2192 Premium reasoning                     \u2551
\u2551    nexus-code   \u2192 Code specialist                       \u2551
\u2551    nexus-lite   \u2192 Free tier                             \u2551
\u2551    auto         \u2192 Smart routing (recommended)           \u2551
\u2551                                                         \u2551
\u255A\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255D
`);
var wsClients = new Set;
events.subscribe((event) => {
  const message = JSON.stringify(event);
  for (const ws of wsClients) {
    try {
      ws.send(message);
    } catch {
      wsClients.delete(ws);
    }
  }
});
var server = Bun.serve({
  port: PORT,
  hostname: "::",
  routes: {
    "/": dashboard_default,
    "/dashboard": dashboard_default
  },
  fetch(req, server2) {
    const url = new URL(req.url);
    if (url.pathname === WS_PATH) {
      const upgraded = server2.upgrade(req);
      if (upgraded)
        return;
      return new Response("WebSocket upgrade failed", { status: 400 });
    }
    return app.fetch(req);
  },
  websocket: {
    open(ws) {
      wsClients.add(ws);
      ws.send(JSON.stringify({
        type: "init",
        timestamp: Date.now(),
        data: {
          today: stats.getTodayStats(),
          week: stats.getWeekStats(),
          providers: getCircuitStatus()
        }
      }));
    },
    message(ws, message) {
      if (message === "ping")
        ws.send("pong");
    },
    close(ws) {
      wsClients.delete(ws);
    }
  }
});
