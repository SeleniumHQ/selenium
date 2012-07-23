/*
Copyright 2007-2012 Selenium committers
Copyright 2012 Software Freedom Conservancy

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

package org.openqa.selenium;

import java.util.Map;

/**
 * Configuration parameters for using proxies in WebDriver. Generally you should pass an object of
 * this type to a WebDriver constructor, or in some cases to the profile object used in the
 * WebDriver construction.  For simplicity, setting values here commits the proxy to a certain
 * configuration. That is, it is an error to set an <code>httpProxy</code> manually and then turn on
 * proxy autodetect.
 */
public class Proxy {

  // TODO: SOCKS.

  public enum ProxyType {
    // Keep these in sync with the Firefox preferences numbers:
    // http://kb.mozillazine.org/Network.proxy.type
    DIRECT,      // Direct connection, no proxy (default on Windows).
    MANUAL,      // Manual proxy settings (e.g., for httpProxy).
    PAC,         // Proxy auto configuration from URL.
    RESERVED_1,  // Never used.
    AUTODETECT,  // Proxy auto detection (presumably with WPAD).
    SYSTEM,      // Use system settings (default on Linux).
    UNSPECIFIED
  }

  private ProxyType proxyType = ProxyType.UNSPECIFIED;
  private boolean autodetect = false;
  private String ftpProxy;
  private String httpProxy;
  private String noProxy;
  private String proxyAutoconfigUrl;
  private String sslProxy;

  public Proxy() {
    // Empty default constructor
  }

  public Proxy(Map<String, ?> raw) {
    if (raw.containsKey("proxyType") && raw.get("proxyType") != null) {
      setProxyType(ProxyType.valueOf(((String) raw.get("proxyType")).toUpperCase()));
    }
    if (raw.containsKey("ftpProxy") && raw.get("ftpProxy") != null) {
      setFtpProxy((String) raw.get("ftpProxy"));
    }
    if (raw.containsKey("httpProxy") && raw.get("httpProxy") != null) {
      setHttpProxy((String) raw.get("httpProxy"));
    }
    if (raw.containsKey("noProxy") && raw.get("noProxy") != null) {
      setNoProxy((String) raw.get("noProxy"));
    }
    if (raw.containsKey("proxyAutoconfigUrl") && raw.get("proxyAutoconfigUrl") != null) {
      setProxyAutoconfigUrl((String) raw.get("proxyAutoconfigUrl"));
    }
    if (raw.containsKey("sslProxy") && raw.get("sslProxy") != null) {
      setSslProxy((String) raw.get("sslProxy"));
    }
    if (raw.containsKey("autodetect") && raw.get("autodetect") != null) {
      setAutodetect((Boolean) raw.get("autodetect"));
    }
  }

  /**
   * Gets the {@link ProxyType}.  This can signal if set to use a direct connection (without proxy),
   * manually set proxy settings, auto-configured proxy settings, or whether to use the default
   * system proxy settings.  It defaults to {@link ProxyType#UNSPECIFIED}.
   *
   * @return the proxy type employed
   */
  public ProxyType getProxyType() {
    return this.proxyType;
  }

  /**
   * Explicitly sets the proxy type, useful for forcing direct connection on Linux.
   *
   * @return reference to self
   */
  public Proxy setProxyType(ProxyType proxyType) {
    verifyProxyTypeCompatibility(ProxyType.AUTODETECT);
    this.proxyType = proxyType;
    return this;
  }

  /**
   * Whether to autodetect proxy settings.
   *
   * @return true if set to autodetect proxy settings, false otherwise
   */
  public boolean isAutodetect() {
    return autodetect;
  }

  /**
   * Specifies whether to autodetect proxy settings.
   *
   * @param autodetect set to true to use proxy auto detection, false to leave proxy settings
   *                   unspecified
   * @return reference to self
   */
  public Proxy setAutodetect(boolean autodetect) {
    if (this.autodetect == autodetect) {
      return this;
    }
    if (autodetect) {
      verifyProxyTypeCompatibility(ProxyType.AUTODETECT);
      this.proxyType = ProxyType.AUTODETECT;
    } else {
      this.proxyType = ProxyType.UNSPECIFIED;
    }
    this.autodetect = autodetect;
    return this;
  }

  /**
   * Gets the FTP proxy.
   *
   * @return the FTP proxy hostname, or null if not set
   */
  public String getFtpProxy() {
    return ftpProxy;
  }

  /**
   * Specify which proxy to use for FTP connections.
   *
   * @param ftpProxy the proxy host, expected format is <code>hostname.com:1234</code>
   * @return reference to self
   */
  public Proxy setFtpProxy(String ftpProxy) {
    verifyProxyTypeCompatibility(ProxyType.MANUAL);
    this.proxyType = ProxyType.MANUAL;
    this.ftpProxy = ftpProxy;
    return this;
  }

  /**
   * Gets the HTTP proxy.
   *
   * @return the HTTP proxy hostname, or null if not set
   */
  public String getHttpProxy() {
    return httpProxy;
  }

  /**
   * Specify which proxy to use for HTTP connections.
   *
   * @param httpProxy the proxy host, expected format is <code>hostname:1234</code>
   * @return reference to self
   */
  public Proxy setHttpProxy(String httpProxy) {
    verifyProxyTypeCompatibility(ProxyType.MANUAL);
    this.proxyType = ProxyType.MANUAL;
    this.httpProxy = httpProxy;
    return this;
  }

  public String getNoProxy() {
    return noProxy;
  }

  public Proxy setNoProxy(String noProxy) {
    verifyProxyTypeCompatibility(ProxyType.MANUAL);
    this.proxyType = ProxyType.MANUAL;
    this.noProxy = noProxy;
    return this;
  }

  /**
   * Gets the proxy auto-configuration URL.
   *
   * @return the proxy auto-configuration URL
   */
  public String getProxyAutoconfigUrl() {
    return proxyAutoconfigUrl;
  }

  /**
   * Specifies the URL to be used for proxy auto-configuration.  Expected format is
   * <code>http://hostname.com:1234/pacfile</code>.  This is required if {@link #getProxyType()} is
   * set to {@link ProxyType#PAC}, ignored otherwise.
   *
   * @param proxyAutoconfigUrl the URL for proxy auto-configuration
   * @return reference to self
   */
  public Proxy setProxyAutoconfigUrl(String proxyAutoconfigUrl) {
    verifyProxyTypeCompatibility(ProxyType.PAC);
    this.proxyType = ProxyType.PAC;
    this.proxyAutoconfigUrl = proxyAutoconfigUrl;
    return this;
  }

  /**
   * Gets the SSL tunnel proxy.
   *
   * @return the SSL tunnel proxy hostname, null otherwise
   */
  public String getSslProxy() {
    return sslProxy;
  }

  /**
   * Specify which proxy to use for SSL connections.
   *
   * @param sslProxy the proxy host, expected format is <code>hostname.com:1234</code>
   * @return reference to self
   */
  public Proxy setSslProxy(String sslProxy) {
    verifyProxyTypeCompatibility(ProxyType.MANUAL);
    this.proxyType = ProxyType.MANUAL;
    this.sslProxy = sslProxy;
    return this;
  }

  private void verifyProxyTypeCompatibility(ProxyType compatibleProxy) {
    if (proxyType != ProxyType.UNSPECIFIED && proxyType != compatibleProxy) {
      throw new IllegalStateException(String.format(
          "Specified proxy type (%s) not compatible with current setting (%s)",
          compatibleProxy, proxyType));
    }
  }

}