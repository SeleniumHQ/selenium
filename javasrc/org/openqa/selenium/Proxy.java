// Copyright 2007-2009 WebDriver committers
package org.openqa.selenium;

import java.util.Map;

/**
 * Configuration parameters for using proxies in WebDriver.
 * <p/>
 * Generally you should pass an object of this type to a WebDriver constructor,
 * or in some cases to the profile object used in the WebDriver construction.
 * <p/>
 * For simplicity, setting values here commits the proxy to a certain
 * configuration. That is, it is an error to set an httpProxy manually and
 * then turn on proxy autodetect.
 */
public class Proxy {
  //TODO: SOCKS.

  public enum ProxyType {
    // Keep these in sync with the Firefox preferences numbers:
    // http://kb.mozillazine.org/Network.proxy.type
    DIRECT,      // Direct connection, no proxy (default on Windows).
    MANUAL,      // Manual proxy settings (e.g., for httpProxy).
    PAC,         // Proxy autoconfiguration from URL.
    RESERVED_1,  // Never used.
    AUTODETECT,  // Proxy autodetection (presumably with WPAD).
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
    if (raw.containsKey("proxyType")) {
      setProxyType(ProxyType.valueOf((String) raw.get("proxyType")));
    }
    if (raw.containsKey("ftpProxy")) {
      setFtpProxy((String) raw.get("ftpProxy"));
    }
    if (raw.containsKey("httpProxy")) {
      setHttpProxy((String) raw.get("httpProxy"));
    }
    if (raw.containsKey("noProxy")) {
      setNoProxy((String) raw.get("noProxy"));
    }
    if (raw.containsKey("proxyAutoconfigUrl")) {
      setProxyAutoconfigUrl((String) raw.get("proxyAutoconfigUrl"));
    }
    if (raw.containsKey("sslProxy")) {
      setSslProxy((String) raw.get("sslProxy"));
    }
    if (raw.containsKey("autodetect")) {
      setAutodetect((Boolean) raw.get("autodetect"));
    }
  }

  public ProxyType getProxyType() {
    return this.proxyType;
  }

  /**
   * Explicitly sets the proxy type, useful for forcing direct connection on Linux.
   *
   * @return
   */
  public Proxy setProxyType(ProxyType proxyType) {
    verifyProxyTypeCompatilibily(ProxyType.AUTODETECT);
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
    verifyProxyTypeCompatilibily(ProxyType.AUTODETECT);
    this.proxyType = ProxyType.AUTODETECT;
    this.autodetect = autodetect;
    return this;
  }

  public String getFtpProxy() {
    return ftpProxy;
  }

  public Proxy setFtpProxy(String ftpProxy) {
    verifyProxyTypeCompatilibily(ProxyType.MANUAL);
    this.proxyType = ProxyType.MANUAL;
    this.ftpProxy = ftpProxy;
    return this;
  }

  public String getHttpProxy() {
    return httpProxy;
  }

  public Proxy setHttpProxy(String httpProxy) {
    verifyProxyTypeCompatilibily(ProxyType.MANUAL);
    this.proxyType = ProxyType.MANUAL;
    this.httpProxy = httpProxy;
    return this;
  }

  public String getNoProxy() {
    return noProxy;
  }

  public Proxy setNoProxy(String noProxy) {
    verifyProxyTypeCompatilibily(ProxyType.MANUAL);
    this.proxyType = ProxyType.MANUAL;
    this.noProxy = noProxy;
    return this;
  }

  public String getProxyAutoconfigUrl() {
    return proxyAutoconfigUrl;
  }

  public Proxy setProxyAutoconfigUrl(String proxyAutoconfigUrl) {
    verifyProxyTypeCompatilibily(ProxyType.PAC);
    this.proxyType = ProxyType.PAC;
    this.proxyAutoconfigUrl = proxyAutoconfigUrl;
    return this;
  }

  public String getSslProxy() {
    return sslProxy;
  }

  public Proxy setSslProxy(String sslProxy) {
    verifyProxyTypeCompatilibily(ProxyType.MANUAL);
    this.proxyType = ProxyType.MANUAL;
    this.sslProxy = sslProxy;
    return this;
  }

  private void verifyProxyTypeCompatilibily(ProxyType compatibleProxy) {
    if (this.proxyType != ProxyType.UNSPECIFIED && this.proxyType != compatibleProxy) {
      throw new IllegalStateException("Proxy autodetect is incompatible with manual settings");
    }
  }
}
