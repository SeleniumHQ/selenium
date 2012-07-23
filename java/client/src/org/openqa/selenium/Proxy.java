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

  public ProxyType getProxyType() {
    return this.proxyType;
  }

  /**
   * Explicitly sets the proxy type, useful for forcing direct connection on Linux.
   *
   * @return self-reference
   */
  public Proxy setProxyType(ProxyType proxyType) {
    verifyProxyTypeCompatibility(ProxyType.AUTODETECT);
    this.proxyType = proxyType;
    return this;
  }

  public boolean isAutodetect() {
    return autodetect;
  }

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

  public String getFtpProxy() {
    return ftpProxy;
  }

  public Proxy setFtpProxy(String ftpProxy) {
    verifyProxyTypeCompatibility(ProxyType.MANUAL);
    this.proxyType = ProxyType.MANUAL;
    this.ftpProxy = ftpProxy;
    return this;
  }

  public String getHttpProxy() {
    return httpProxy;
  }

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

  public String getProxyAutoconfigUrl() {
    return proxyAutoconfigUrl;
  }

  public Proxy setProxyAutoconfigUrl(String proxyAutoconfigUrl) {
    verifyProxyTypeCompatibility(ProxyType.PAC);
    this.proxyType = ProxyType.PAC;
    this.proxyAutoconfigUrl = proxyAutoconfigUrl;
    return this;
  }

  public String getSslProxy() {
    return sslProxy;
  }

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