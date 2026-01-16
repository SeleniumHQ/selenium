/**
 * @license
 * Copyright The Closure Library Authors.
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Class for parsing strings into URLs using browser native
 * resolution.
 *
 * Use `resolveUrl` to resolve a url string with an optional base url string to
 * URL. Will throw an error if the resulting URL would not be valid. This can
 * be used in place of the [URL Web API][1] while providing support in IE and
 * working around various inconsistencies in Edge.
 *
 * Use `resolveRelativeUrl` to resolve any relative URL into an absolute URL for
 * the current location.
 *
 * Use `createUrl` to easily construct a new URL from an existing URL.
 *
 * This package attempts to follow the [WHATWG URL standard][2] where
 * possible, deviating only when there are significant advantages to doing so
 * such as splitting out searchParams from a property to a function call to
 * allow the compiler to remove the relevant polyfill code if unused, or
 * removing functionality that can cause confusion, unexpected
 * results, or unnecessary code size increases to the package. This package
 * also adds checks that are missing in some browsers (e.g. throwing errors when
 * a potential URL doesn't have a protocol or hostname), and generally tries to
 * ensure consistency among browsers while still accurately reporting how a
 * browser will interpret a given URL.
 *
 * Unlike goog.URI, this package is NOT intended to be used with URLs that are
 * "special", and is only guaranteed to return useful results for the schemes
 * listed in the spec (http(s), ws(s), ftp, file, blob). Various browsers
 * (Chrome included) do not correctly parse special URLs and the results will
 * be inaccurate in those cases. If you need to parse URLs using these
 * protocols, prefer to use goog.Uri (or goog.uri.utils) instead.
 * [1]: https://developer.mozilla.org/en-US/docs/Web/API/URL
 * [2]: https://url.spec.whatwg.org/
 */
goog.module('goog.url');
goog.module.declareLegacyNamespace();

const ConstString = goog.require('goog.string.Const');
const Tagname = goog.require('goog.dom.TagName');
const safe = goog.require('goog.dom.safe');
const uncheckedConversions = goog.require('goog.html.uncheckedconversions');
const {assert} = goog.require('goog.asserts');
const {concat: iterableConcat, map: iterableMap} = goog.require('goog.collections.iters');
const {createElement} = goog.require('goog.dom');

// Capture the native URL constructor before users have a chance to clobber it.
/** @type {?typeof URL} */
const NATIVE_URL = goog.global['URL'];

/** @define {boolean} */
const ASSUME_COMPLIANT_URL_API = goog.define(
    'ASSUME_COMPLIANT_URL_API',
    // TODO(user) narrow this down if earlier featureset years allow,
    // if they get defined. FY2020 does NOT include Edge (EdgeHTML), which is
    // good as workarounds are needed for spec compliance and a searchParams
    // polyfill.
    goog.FEATURESET_YEAR >= 2020);

let urlBase = goog.global?.document?.baseURI ||
    // baseURI is not available in IE11 and earlier
    goog.global.location?.href || '';

/**
 * For testing only - this adjusts the base used in `resolveRelativeUrl`.
 * @param {string} base
 * Maybe this should just be visible to allow others using this package to test
 * it?
 * @package
 */
const setUrlBaseForTesting = function(base) {
  urlBase = base;
};

exports.setUrlBaseForTesting = setUrlBaseForTesting;


/**
 * Feature-detection for native URL parsing
 * @type {boolean}
 */
const supportsNativeURLConstructor = {
  // TODO(user) Does this work without JSCompiler?
  /** @return {boolean} */
  valueOf: function() {
    if (ASSUME_COMPLIANT_URL_API) {
      return true;
    }
    try {
      new NATIVE_URL('http://example.com');
      return true;
    } catch (e) {
      return false;
    }
  }
}.valueOf();

/**
 * ReadonlySearchParams partially implements the URLSearchParams interface,
 * excluding all mutability methods and some less-useful methods for reading the
 * underlying data. Exclusions:
 *  - append
 *  - delete
 *  - set
 *  - sort
 *  - values()
 *  - entries()
 *  - forEach(...)
 * @extends {Iterable<!Array<string>>}
 * @record
 */
class ReadonlySearchParams {
  /**
   * @param {string} key The key to retrieve a value for. Must not be
   *     url-encoded.
   * @return {?string} The value. If a key is specified more than once, the
   * first value is returned (as per the spec). All values will be url-decoded
   * already.
   */
  get(key) {};

  /**
   * @param {string} key The key to retrieve all values for. Must not be
   *     url-encoded.
   * @return {!Array<string>} The list of values for this key. Will return the
   *     empty array if there are no values for the key. All values will have
   *     been url-decoded already.
   */
  getAll(key) {};

  /**
   * @param {string} key The key to search for. Must not be url-encoded.
   * @return {boolean} True iff this key exists within the search params.
   */
  has(key) {};

  /**
   * @return {string}
   */
  toString() {};
}

exports.ReadonlySearchParams = ReadonlySearchParams;

/**
 * A polyfill implementation of ReadonlySearchParams that is only used in older
 * browsers that don't natively support searchParams. This includes IE and Edge
 * (EdgeHTML).
 * @implements {ReadonlySearchParams}
 */
class SearchParamsImpl {
  /**
   * @param {string} search The search string from URL resolution. May
   *     optionally begin with '?', and is expected to be URL-encoded.
   */
  constructor(search) {
    /** @private @const {!Map<string, !Array<string>>} */
    this.paramMap_ = new Map();
    if (search.indexOf('?') == 0) {
      search = search.substring(1);
    }
    const params = search.split('&');
    for (let p of params) {
      let key = p;
      let val = '';
      const keyValueSplit = p.split('=');
      const isKV = keyValueSplit.length > 1;
      if (isKV) {
        key = decodeURIComponent(keyValueSplit[0].replace('+', ' '));
        val = decodeURIComponent(keyValueSplit[1].replace('+', ' '));
      }
      let entries = this.paramMap_.get(key);
      if (entries == null) {
        entries = [];
        this.paramMap_.set(key, entries);
      }
      entries.push(val);
    }
  }

  /**
   * @override
   */
  get(key) {
    const values = this.paramMap_.get(key);
    return values && values.length ? values[0] : null;
  }

  /**
   * @override
   */
  getAll(key) {
    // As per the spec, this returns the "empty sequence" if the key is not
    // found.
    return [...(this.paramMap_.get(key) || [])];
  }

  /**
   * @override
   */
  has(key) {
    return this.paramMap_.has(key);
  }

  /**
   * @return {!IteratorIterable<!Array<string>>}
   */
  [Symbol.iterator]() {
    return iterableConcat(...iterableMap(this.paramMap_, (e) => {
      const key = /** @const {string} */ (e[0]);
      const values = /** @const {!Array<string>} */ (e[1]);
      return iterableMap(values, (v) => {
        return [key, v];
      });
    }));
  }

  /**
   * @override
   */
  toString() {
    return iterableSearchParamsToString(this);
  }
}

/**
 * @param {!Iterable<!Array<string>>} iterable The iterable which acts like a
 *     URLSearchParams object (each iteration returns another key and value).
 *     Note that both keys and values must NOT be already URL encoded.
 * @return {string} The serialized SearchParams, with all keys and values
 *     correctly encoded.
 */
const iterableSearchParamsToString = function(iterable) {
  // Some characters are not form-encoded properly by encodeURIComponent, so we
  // enumerate their replacements here for use later.
  const encode = (s) => {
    // Form encoding is defined [in the spec][1] but there are some values that
    // are not encoded the right way by encodeURIComponent. Thus, we replace
    // their representation in the resulting encoded string with their actual
    // encoding.
    // [1]: https://url.spec.whatwg.org/#urlencoded-serializing
    return encodeURIComponent(s).replace(/[!()~']|(%20)/g, (c) => {
      return {
        '!': '%21',
        '(': '%28',
        ')': '%29',
        '%20': '+',
        '\'': '%27',
        '~': '%7E',
      }[c];
    });
  };
  return Array
      .from(
          iterable,
          (keyValuePair) =>
              encode(keyValuePair[0]) + '=' + encode(keyValuePair[1]))
      .join('&');
};

/**
 * UrlLike mirrors most of the public readonly interface of the URL object in
 * the URL Web API.
 * Notable exclusions:
 *  - toJson()
 *  - searchParams
 *
 * Instead of using the searchParams property, use `getSearchParams` from this
 * package. This allows for the relevant code to be removed when inspection of
 * search parameters is not needed.
 * @record
 */
class UrlLike {
  constructor() {
    /**
     * @const {string}
     */
    this.href;

    /**
     * @const {string}
     */
    this.protocol;

    /**
     * @const {string}
     */
    this.username;

    /**
     * @const {string}
     */
    this.password;

    /**
     * @const {string}
     */
    this.host;

    /**
     * @const {string}
     */
    this.hostname;

    /**
     * @const {string}
     */
    this.port;

    /**
     * @const {string}
     */
    this.origin;

    /**
     * @const {string}
     */
    this.pathname;

    /**
     * @const {string}
     */
    this.search;

    /**
     * @const {string}
     */
    this.hash;
  }

  /** @return {string} */
  toString() {};
}

exports.UrlLike = UrlLike;

/**
 * This function is equivalent to 'new URL(href)' in newer browsers, and will
 * automatically work around the Security Problems in IE, retrying the parse
 * automatically while extracting the userinfo.
 * @param {string} urlStr
 * @return {!UrlLike} A canonicalized version of the information from the URL.
 *     Will throw if the resulting URL is invalid.
 */
const createAnchorElementInIE = function(urlStr) {
  const aTag = createElement(Tagname.A);

  let protocol;
  try {
    safe.setAnchorHref(
        aTag,
        uncheckedConversions.safeUrlFromStringKnownToSatisfyTypeContract(
            ConstString.from(
                'This url is attached to an Anchor tag that is NEVER attached ' +
                ' to the DOM and is not returned from this function.'),
            urlStr));
    // If the URL is actually invalid, trying to read from it will throw.
    protocol = aTag.protocol;
  } catch (e) {
    // We catch and re-throw an error here as the default error in IE is
    // simply 'Invalid argument.' with no useful information.
    throw new Error(`${urlStr} is not a valid URL.`);
  }
  // The anchor tag will be created and assigned some values, but a URL missing
  // a protocol and/or hostname is not valid in a browser and other browsers URL
  // APIs reject them.
  // '' : IE11.719.18362, IE11.0.9600
  // ':' : IE11.??? (web testing version as of 04/03/2020)
  // last char != ':': hunch...
  if (protocol === '' || protocol === ':' ||
      protocol[protocol.length - 1] != ':') {
    throw new Error(`${urlStr} is not a valid URL.`);
  }
  if (!canonicalPortForProtocols.has(protocol)) {
    throw new Error(`${urlStr} is not a valid URL.`);
  }
  if (!aTag.hostname) {
    throw new Error(`${urlStr} is not a valid URL.`);
  }
  const href = aTag.href;
  const urlLike = {
    href,
    protocol: aTag.protocol,
    username: '',
    password: '',
    // Host, origin, and port assigned below after canonicalization.
    hostname: aTag.hostname,
    pathname: '/' + aTag.pathname,
    search: aTag.search,
    hash: aTag.hash,
    toString: () => href,
  };
  // Canonicalize the port out from the URL if it matches
  const canonicalPort = canonicalPortForProtocols.get(aTag.protocol);
  if (canonicalPort === aTag.port) {
    urlLike.host = urlLike.hostname;
    urlLike.port = '';
    // This does not work for blob and file protocol types - they are far more
    // complicated.
    urlLike.origin = urlLike.protocol + '//' + urlLike.hostname;
  } else {
    urlLike.host = aTag.host;
    urlLike.port = aTag.port;
    urlLike.origin =
        urlLike.protocol + '//' + urlLike.hostname + ':' + urlLike.port;
  }
  return urlLike;
};

/**
 * @param {?string} username
 * @param {?string} password
 * @return {string} The serialized userinfo string
 */
const assembleUserInfo = function(username, password) {
  if (username && password) {
    return username + ':' + password + '@';
  } else if (username) {
    return username + '@';
  } else if (password) {
    return ':' + password + '@';
  } else {
    return '';
  }
};

/**
 * This function wraps 'new URL(href)' in newer browsers adds common checks for
 * parts of the URL spec (e.g. no protocol, no hostname for well-known protocols
 * like HTTP(s) and WS(S)) that some browsers don't adhere to. It also adds
 * origin construction for browsers that don't support it (Edge).
 * @param {string} urlStr
 * @return {!UrlLike}
 */
const urlParseWithCommonChecks = function(urlStr) {
  let res;
  try {
    res = new NATIVE_URL(urlStr);
  } catch (e) {
    throw new Error(`${urlStr} is not a valid URL.`);
  }
  const canonicalPort = canonicalPortForProtocols.get(res.protocol);
  if (!canonicalPort) {
    throw new Error(`${urlStr} is not a valid URL.`);
  }
  if (!res.hostname) {
    throw new Error(`${urlStr} is not a valid URL.`);
  }
  // For some protocols, Edge doen't know how to construct the origin.
  if (res.origin != 'null') {
    return res;
  }
  // We can't assign to the native object's origin property (it is ignored), so
  // we make a copy here.
  const urlLike = {
    href: res.href,
    protocol: res.protocol,
    username: '',
    password: '',
    host: res.host,
    port: res.port,
    // origin assigned below after canonicalization.
    hostname: res.hostname,
    pathname: res.pathname,
    search: res.search,
    // We don't copy searchParams because Edge doesn't have it anyways.
    hash: res.hash,
  };
  if (canonicalPort === res.port) {
    // This does not work for blob and file protocol types - they are far more
    // complicated.
    urlLike.origin = res.protocol + '//' + res.hostname;
  } else {
    urlLike.origin = res.protocol + '//' + res.hostname + ':' + res.port;
  }
  return urlLike;
};

/**
 * Resolves the given url string (with the optional base) into a URL object
 * according to the [URL spec][https://url.spec.whatwg.org/]. Will throw an
 * error if the resulting URL is invalid or if the browser can't or won't use
 * that URL for some reason. Relative URLs are considered invalid without a base
 * and will throw an error - please use `resolveRelativeUrl` instead for this
 * use-case.
 *
 * Note that calling resolveUrl with both urlStr and baseStr may have surprising
 * behavior. For example, any invocation with both parameters will never use the
 * hash value from baseStr. Similarly, passing a path segment in urlStr will
 * append (or replace) the path in baseStr, but will ALSO exclude the search and
 * hash portions of baseStr from the resulting URL. See the unit tests
 * (specifically testWithBase* test cases) for examples.
 *
 * Compatibility notes:
 * - both IE (all versions) and Edge (EdgeHTML only) disallow URLs to have user
 *   information in them, and parsing those strings will throw an error.
 * - FireFox disallows URLs with just a password in the userinfo.
 * @param {string} urlStr A potential absolute URL as a string, or a relative
 *     URL if baseStr is provided.
 * @param {string=} baseStr An optional base url as a string, only required if
 *     the url is relative.
 * @return {!UrlLike} An object that describes the various parts of the URL if
 *     valid. Throws an error if invalid. While this object is the native URL
 *     object where possible, users should NOT rely on this property and instead
 *     treat it as a simple record.
 */
const resolveUrl = function(urlStr, baseStr) {
  if (ASSUME_COMPLIANT_URL_API) {
    // Safari throws a TypeError if you call the constructor with a second
    // argument that isn't defined, so we can't pass baseStr all the time.
    return baseStr ? new NATIVE_URL(urlStr, baseStr) : new NATIVE_URL(urlStr);
  }

  // Ideally, this should effectively become
  // if Edge
  // and the else should effectively become
  // if IE

  // TODO(user) Some use of FEATURESET_YEAR near here would help strip
  // down the implementation even more for browsers we are more sure support the
  // URL Web API (including Edge). 2019? Maybe?

  if (supportsNativeURLConstructor) {
    if (!baseStr) {
      return urlParseWithCommonChecks(urlStr);
    }
    // Edge doesn't throw if baseStr is not a valid absolute URL when the
    // urlStr is absolute. This is against the spec, so try and parse this with
    // commonChecks (which will throw if baseStr is not a valid absolute URL).
    const baseUrl = urlParseWithCommonChecks(baseStr);

    // If urlStr is present and absolute, then only those values are used.
    try {
      return urlParseWithCommonChecks(urlStr);
    } catch (e) {
      // urlStr is not absolute. We shall give both pieces to the constructor
      // below and see what it thinks.
    }
    return new NATIVE_URL(urlStr, baseUrl.href);
  } else {
    if (!baseStr) {
      return createAnchorElementInIE(urlStr);
    }
    // It is against the spec to provide a baseStr that is not absolute.
    const baseUrl = createAnchorElementInIE(baseStr);

    // If urlStr is present and absolute, then only those values are used even
    // if baseStr is defined. The spec says we must try and parse baseStr first
    // (and error on it) before we do this though.
    try {
      return createAnchorElementInIE(urlStr);
    } catch (e) {
      // urlStr is not absolute. We shall assemble base pieces + url pieces
      // below.
      // Deliberate fallthrough
    }

    // If the base is present and absolute, check for special characters that
    // help determine what parts of base we use vs the relative parts.
    // This is similar to the [state machine][1] mentioned in the
    // spec except we already know that urlStr is NOT absolute.
    // [1]: https://url.spec.whatwg.org/#relative-state
    const newBaseStr = baseUrl.protocol + '//' +
        assembleUserInfo(baseUrl.username, baseUrl.password) + baseUrl.host;
    let /** string */ href;
    const firstChar = urlStr[0];
    if (firstChar === '/' || firstChar === '\\') {
      href = newBaseStr + urlStr;
    } else if (firstChar === '?') {
      href = newBaseStr + baseUrl.pathname + urlStr;
    } else if (!firstChar || firstChar === '#') {
      href = newBaseStr + baseUrl.pathname + baseUrl.search + urlStr;
    } else {
      // This doesn't start with any of the authority terminating characters,
      // but other browsers treat it implicitly as an extension to the existing
      // path, removing anything after the last '/' and appending urlStr to it.
      const lastPathSeparator = baseUrl.pathname.lastIndexOf('/');
      const path = lastPathSeparator > 0 ?
          baseUrl.pathname.substring(0, lastPathSeparator) :
          '';
      href = newBaseStr + path + '/' + urlStr;
    }
    return createAnchorElementInIE(href);
  }
};

exports.resolveUrl = resolveUrl;

/**
 * Browsers will canonicalize a URL if the scheme has a "canonical" port for it.
 * This maps schemes to their canonical port. These mappings are defined in the
 * [spec][1].
 *
 * [1]: https://url.spec.whatwg.org/#url-miscellaneous
 * @type {!Map<string,string>}
 */
const canonicalPortForProtocols = new Map([
  ['http:', '80'],
  ['https:', '443'],
  ['ws:', '80'],
  ['wss:', '443'],
  ['ftp:', '21'],
]);

/**
 * Returns a URLSearchParams-like object for a given URL object. This is used
 * instead of the native URL object's 'searchParams' property to allow the
 * Closure Compiler to code-strip the polyfill if searchParams are never used.
 * @param {!UrlLike|!URL} url The URL object to derive SearchParams for.
 * @return {!ReadonlySearchParams} The URLSearchParams-like object for the URL.
 * @suppress {strictMissingProperties} url.searchParams on union
 */
const getSearchParams = function(url) {
  if (goog.FEATURESET_YEAR >= 2020 ||
      (supportsNativeURLConstructor && url.searchParams)) {
    return url.searchParams;
  }
  return new SearchParamsImpl(url.search);
};

exports.getSearchParams = getSearchParams;

/**
 * Resolves the given relative URL string without requiring a specific base URL
 * (unlike resolveUrl). Will resolve the relative URL against the current
 * document's BaseURI, and the resulting URL WILL contain properties from
 * this URI.
 * @param {string} relativeURL A string which may be only a relative URL (i.e.
 *     has no protocol, userinfo, hostname, or port).
 * @return {!UrlLike} A URL that is relative to the current document's Base URI
 *     with all the relevant relative parts from the input parameter.
 */
const resolveRelativeUrl = function(relativeURL) {
  return resolveUrl(relativeURL, urlBase);
};

exports.resolveRelativeUrl = resolveRelativeUrl;

/**
 * @record
 */
class UrlPrimitivePartsPartial {
  constructor() {
    /** @const {string|undefined} */
    this.protocol;

    /** @const {string|undefined} */
    this.username;

    /** @const {string|undefined} */
    this.password;

    /** @const {string|undefined} */
    this.hostname;

    /** @const {string|undefined} */
    this.port;

    /** @const {string|undefined} */
    this.pathname;

    /** @const {string|undefined} */
    this.search;

    /** @const {!Iterable<!Array<string>>|undefined} */
    this.searchParams;

    /** @const {string|undefined} */
    this.hash;
  }
}

exports.UrlPrimitivePartsPartial = UrlPrimitivePartsPartial;

/**
 * Creates a new URL object from primitve parts, optionally allowing for some of
 * those parts to be taken from a base URL object. Parts only accepts primitive
 * parts of the URL (e.g will NOT accept origin or host) for simplicity, and
 * only accepts either a search OR searchParams property, not both at the same
 * time. The resulting URL-like string is then parsed by `resolveUrl`, and as
 * such this method will also throw an error if the result is not a valid URL
 * (unlike Object.assign and other similar combinations of object properties).
 *
 * This method does some validation of its inputs, and in general is NOT a good
 * way to clone an existing URL object. For that purpose, prefer to use
 * `resolveUrl(existingURLObject.href)`.
 * @param {!UrlPrimitivePartsPartial}
 *     parts The parts that should be combined together to create a new URL.
 * @param {!UrlLike=} base An optional base whose primitive parts are used if
 *     they are not specified in the parts param. If all required primitive
 *     parts (host, protocol) are specified in the parts param, this can be
 *     omitted.
 * @return {!UrlLike} The resulting URL object if valid. Will throw an error if
 *     the resulting combination of parts and base is invalid.
 */
const createUrl = function(parts, base = undefined) {
  assert(
      !(parts.search && parts.searchParams),
      'Only provide search or searchParams, not both');
  // Alas we cannot use Object.assign as the native URL object will not let its
  // properties be copied over.
  let newParts = {};
  if (base) {
    newParts.protocol = base.protocol;
    newParts.username = base.username;
    newParts.password = base.password;
    newParts.hostname = base.hostname;
    newParts.port = base.port;
    newParts.pathname = base.pathname;
    newParts.search = base.search;
    // Note we don't copy over searchParams here as we won't use it anyways.
    // search should be available instead.
    newParts.hash = base.hash;
  }
  Object.assign(newParts, parts);

  // Check for spec compliance
  if (newParts.port && newParts.port[0] === ':') {
    throw new Error('port should not start with \':\'');
  }
  if (newParts.hash && newParts.hash[0] != '#') {
    newParts.hash = '#' + newParts.hash;
  }
  // Manually assign search/searchParams from parts and clean up newParts so it
  // only specifies a search property.
  // precedence is as follows:
  // parts.search
  // parts.searchParams
  // newParts.search (aka base.search)
  if (parts.search) {
    if (parts.search[0] != '?') {
      newParts.search = '?' + parts.search;
    }
    // newParts.search is already equal to parts.search due to Object.assign
    // above. searchParams will be undefined here as it isn't copied from base.
  } else if (parts.searchParams) {
    newParts.search = '?' + iterableSearchParamsToString(parts.searchParams);
    // Not strictly necessary, but clear searchParams now we have serialized it.
    newParts.searchParams = undefined;
  }

  let sb = '';
  if (newParts.protocol) {
    sb += newParts.protocol + '//';
  }

  const userinfo = assembleUserInfo(newParts.username, newParts.password);
  sb += userinfo;
  sb += newParts.hostname || '';
  if (newParts.port) {
    sb += ':' + newParts.port;
  }
  sb += newParts.pathname || '';
  sb += newParts.search || '';
  sb += newParts.hash || '';
  return resolveUrl(sb);
};

exports.createUrl = createUrl;
