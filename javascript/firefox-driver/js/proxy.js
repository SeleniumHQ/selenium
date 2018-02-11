// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

goog.provide('fxdriver.proxy');
goog.provide('fxdriver.proxy.ProxyConfig');

goog.require('fxdriver.logging');
goog.require('fxdriver.moz');
goog.require('goog.log');


/**
 * Represents the proxy configuration as sent across the wire.
 *
 * @typedef {{
 *     ftpProxy: string=,
 *     httpProxy: string=,
 *     noProxy: string=,
 *     proxyAutoconfigUrl: string=,
 *     proxyType: string,
 *     sslProxy: string=
 * }}
 */
fxdriver.proxy.ProxyConfig;


/**
 * @private {goog.log.Logger}
 * @const
 */
fxdriver.proxy.LOG_ = fxdriver.logging.getLogger('fxdriver.proxy');


/**
 * Splits a hostport, e.g., 'www.example.com:80' into host and port.
 * @param {string} hostport A hostport.
 * @return {{host: string, port: ?number}} A host and port. If no port is
 *     present in the argument hostport, port is null.
 * @private
 */
fxdriver.proxy.splitHostPort_ = function(hostport) {
  var colonIndex = hostport.lastIndexOf(':');
  if (colonIndex < 0) {
    return {host: hostport, port: null};
  }
  var secondColonIndex = hostport.indexOf(':');
  if (secondColonIndex != colonIndex && !hostport.includes('[')) {
    // The hostport contains multiple colons, but no part of it is bracketed,
    // e.g., '2001:4860:4860::8888'. Treat it as an IPv6 literal with no port.
    return {host: hostport, port: null};
  }

  var host = hostport.slice(0, colonIndex);
  // Strip brackets from bracketed IPv6 hosts, e.g., '[::1]'.
  if (host.startsWith('[') && host.endsWith(']')) {
    host = host.slice(1, -1);
  }
  var portStr = hostport.slice(colonIndex + 1);
  return {host: host, port: parseInt(portStr, 10)};
};


/**
 * Set a specific proxy preference.
 *
 * @param {!nsIPrefBranch} prefs The preferences to use.
 * @param {string} type The network type, such as 'http'.
 * @param {string} setting The value to use.
 * @private
 */
fxdriver.proxy.setProxyPreference_ = function(prefs, type, setting) {
  if (!setting) {
    return;
  }
  var hostAndPort = fxdriver.proxy.splitHostPort_(setting);
  var host = hostAndPort.host;
  var port = hostAndPort.port;
  prefs.setCharPref('network.proxy.' + type, host);
  if (port != null) {
    prefs.setIntPref('network.proxy.' + type + '_port', port);
  }
};


/**
 * @param {!nsIPrefBranch} prefs The preferences to use.
 * @param {!fxdriver.proxy.ProxyConfig} proxy_config The proxy config.
 * @private
 */
fxdriver.proxy.directConfig_ = function(prefs, ignored) {
  goog.log.info(fxdriver.proxy.LOG_,
      'Using a direct connection to the network');
  prefs.setIntPref('network.proxy.type',
    fxdriver.proxy.TYPES_['DIRECT'].value);
};


/**
 * @param {!nsIPrefBranch} prefs The preferences to use.
 * @param {!fxdriver.proxy.ProxyConfig} proxy_config The proxy config.
 * @private
 */
fxdriver.proxy.pacConfig_ = function(prefs, proxy_config) {
  goog.log.info(fxdriver.proxy.LOG_,
      'Using a PAC file to connect to the network: ' +
      proxy_config['proxyAutoconfigUrl']);

  prefs.setIntPref('network.proxy.type', fxdriver.proxy.TYPES_['PAC'].value);

  var fixup = fxdriver.moz.getService(
      '@mozilla.org/docshell/urifixup;1', 'nsIURIFixup');

  var url = fixup.createFixupURI(proxy_config['proxyAutoconfigUrl'], 0).spec;
  prefs.setCharPref('network.proxy.autoconfig_url', url);

};


/**
 * @param {!nsIPrefBranch} prefs The preferences to use.
 * @param {!fxdriver.proxy.ProxyConfig} proxy_config The proxy config.
 * @private
 */
fxdriver.proxy.manualProxyConfig_ = function(prefs, proxy_config) {
  goog.log.info(fxdriver.proxy.LOG_, 'Using manual network config');

  prefs.setIntPref('network.proxy.type',
    fxdriver.proxy.TYPES_['MANUAL'].value);

  fxdriver.proxy.setProxyPreference_(prefs, 'ftp', proxy_config['ftpProxy']);
  fxdriver.proxy.setProxyPreference_(prefs, 'http', proxy_config['httpProxy']);
  fxdriver.proxy.setProxyPreference_(prefs, 'ssl', proxy_config['sslProxy']);
  fxdriver.proxy.setProxyPreference_(prefs, 'socks', proxy_config['socksProxy']);

  if (proxy_config['noProxy']) {
    prefs.setCharPref('network.proxy.no_proxies_on', proxy_config['noProxy']);
  } else {
    prefs.setCharPref('network.proxy.no_proxies_on', '');
  }
};


/**
 * @param {!nsIPrefBranch} prefs The preferences to use.
 * @param {!fxdriver.proxy.ProxyConfig} ignored The ignored proxy config.
 * @private
 */
fxdriver.proxy.autodetectConfig_ = function(prefs, ignored) {
  goog.log.info(fxdriver.proxy.LOG_, 'Autodetecting proxy to use');

  prefs.setIntPref('network.proxy.type',
    fxdriver.proxy.TYPES_['AUTODETECT'].value);
};


/**
 * @param {!nsIPrefBranch} prefs The preferences to use.
 * @param {!fxdriver.proxy.ProxyConfig} ignored The ignored proxy config.
 * @private
 */
fxdriver.proxy.systemConfig_ = function(prefs, ignored) {
  goog.log.info(fxdriver.proxy.LOG_,
      'Using system proxy to connect to the network');

  prefs.setIntPref('network.proxy.type',
    fxdriver.proxy.TYPES_['SYSTEM'].value);
};


/**
 * @private {!Object.<string, Object.<number,
 *   function(!nsIPrefBranch, !ProxyConfig)>>}
 */
fxdriver.proxy.TYPES_ = {
  'DIRECT': { value: 0, config: fxdriver.proxy.directConfig_ },
  'MANUAL': { value: 1, config: fxdriver.proxy.manualProxyConfig_ },
  'PAC': { value: 2, config: fxdriver.proxy.pacConfig_ },
  'AUTODETECT': { value: 4, config: fxdriver.proxy.autodetectConfig_ },
  'SYSTEM': { value: 5, config: fxdriver.proxy.systemConfig_ }
};

/**
 * @param {string=|fxdriver.proxy.ProxyConfig} proxy_config The proxy
 *     configuration to use.
 * @private
 */
fxdriver.proxy.configure_ = function(proxy_config) {
  if (!proxy_config) {
    return;
  }

  if (goog.isString(proxy_config)) {
    proxy_config = /**@type {fxdriver.proxy.ProxyConfig}*/ (JSON.parse(
        proxy_config));
  }

  var type = fxdriver.proxy.TYPES_[
      (proxy_config['proxyType'] || '').toUpperCase()];

  if (!type) {
    goog.log.info(fxdriver.proxy.LOG_,
        'Using Firefox default for network connection');
    return;
  }

  var prefs = /** @type {!nsIPrefBranch} */ (fxdriver.moz.getService(
      '@mozilla.org/preferences-service;1', 'nsIPrefBranch'));

  type.config(prefs, proxy_config);
};


/**
 * @param {string=|fxdriver.proxy.ProxyConfig} proxy_config The proxy
 *     configuration to use.
 */
fxdriver.proxy.configure = function(proxy_config) {
  try {
    fxdriver.proxy.configure_(proxy_config);
  } catch (e) {
    goog.log.info(fxdriver.proxy.LOG_, 'Unable to configure proxy', e);
  }
};
