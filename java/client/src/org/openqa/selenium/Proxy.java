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

package org.openqa.selenium;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

/**
 * Configuration parameters for using proxies in WebDriver. Generally you should pass an object of
 * this type to a WebDriver constructor, or in some cases to the profile object used in the
 * WebDriver construction.  For simplicity, setting values here commits the proxy to a certain
 * configuration.  That is, it is an error to set an <code>httpProxy</code> manually and then turn
 * on proxy autodetect.
 */
public class Proxy {

  public enum ProxyType {
    // Keep these in sync with the Firefox preferences numbers:
    // http://kb.mozillazine.org/Network.proxy.type

    DIRECT,      // Direct connection, no proxy (default on Windows)
    MANUAL,      // Manual proxy settings (e.g. for httpProxy)
    PAC,         // Proxy auto-configuration from URL

    RESERVED_1,  // Never used (but reserved in Firefox)

    AUTODETECT,  // Proxy auto-detection (presumably with WPAD)
    SYSTEM,      // Use system settings (default on Linux)

    UNSPECIFIED
  }

  private ProxyType proxyType = ProxyType.UNSPECIFIED;
  private boolean autodetect = false;
  private String ftpProxy;
  private String httpProxy;
  private String noProxy;
  private String sslProxy;
  private String socksProxy;
  private Integer socksVersion;
  private String socksUsername;
  private String socksPassword;
  private String proxyAutoconfigUrl;

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
      Object rawData = raw.get("noProxy");
      if (rawData instanceof List) {
        // w3c
        setNoProxy(String.join(", ", (List) rawData));
      } else {
        // legacy
        setNoProxy((String) rawData);
      }
    }
    if (raw.containsKey("sslProxy") && raw.get("sslProxy") != null) {
      setSslProxy((String) raw.get("sslProxy"));
    }
    if (raw.containsKey("socksProxy") && raw.get("socksProxy") != null) {
      setSocksProxy((String) raw.get("socksProxy"));
    }
    if (raw.containsKey("socksVersion") && raw.get("socksVersion") != null) {
      setSocksVersion(((Number) raw.get("socksVersion")).intValue());
    }
    if (raw.containsKey("socksUsername") && raw.get("socksUsername") != null) {
      setSocksUsername((String) raw.get("socksUsername"));
    }
    if (raw.containsKey("socksPassword") && raw.get("socksPassword") != null) {
      setSocksPassword((String) raw.get("socksPassword"));
    }
    if (raw.containsKey("proxyAutoconfigUrl") && raw.get("proxyAutoconfigUrl") != null) {
      setProxyAutoconfigUrl((String) raw.get("proxyAutoconfigUrl"));
    }
    if (raw.containsKey("autodetect") && raw.get("autodetect") != null) {
      setAutodetect((Boolean) raw.get("autodetect"));
    }
  }

  public Map<String, Object> toJson() {
    Map<String, Object> m = new HashMap<>();

    if (proxyType != ProxyType.UNSPECIFIED) {
      m.put("proxyType", proxyType.toString());
    }
    if (ftpProxy != null) {
      m.put("ftpProxy", ftpProxy);
    }
    if (httpProxy != null) {
      m.put("httpProxy", httpProxy);
    }
    if (noProxy != null) {
      m.put("noProxy", Arrays.asList(noProxy.split(",\\s*")));
    }
    if (sslProxy != null) {
      m.put("sslProxy", sslProxy);
    }
    if (socksProxy != null) {
      m.put("socksProxy", socksProxy);
    }
    if (socksVersion != null) {
      m.put("socksVersion", socksVersion);
    }
    if (socksUsername != null) {
      m.put("socksUsername", socksUsername);
    }
    if (socksPassword != null) {
      m.put("socksPassword", socksPassword);
    }
    if (proxyAutoconfigUrl != null) {
      m.put("proxyAutoconfigUrl", proxyAutoconfigUrl);
    }
    if (autodetect) {
      m.put("autodetect", true);
    }
    return m;
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
   * @param proxyType type of proxy being used
   * @return reference to self
   */
  public Proxy setProxyType(ProxyType proxyType) {
    verifyProxyTypeCompatibility(proxyType);
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
   * @return the FTP proxy hostname if present, or null if not set
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
   * @return the HTTP proxy hostname if present, or null if not set
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

  /**
   * Gets proxy bypass (noproxy) addresses.
   *
   * @return The proxy bypass (noproxy) addresses
   */
  public String getNoProxy() {
    return noProxy;
  }

  /**
   * Sets proxy bypass (noproxy) addresses
   *
   * @param noProxy The proxy bypass (noproxy) addresses separated by commas
   * @return reference to self
   */
  public Proxy setNoProxy(String noProxy) {
    verifyProxyTypeCompatibility(ProxyType.MANUAL);
    this.proxyType = ProxyType.MANUAL;
    this.noProxy = noProxy;
    return this;
  }

  /**
   * Gets the SSL tunnel proxy.
   *
   * @return the SSL tunnel proxy hostname if present, null otherwise
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

  /**
   * Gets the SOCKS proxy.
   *
   * @return the SOCKS proxy if present, null otherwise
   */
  public String getSocksProxy() {
    return socksProxy;
  }

  /**
   * Specifies which proxy to use for SOCKS.
   *
   * @param socksProxy the proxy host, expected format is <code>hostname.com:1234</code>
   * @return reference to self
   */
  public Proxy setSocksProxy(String socksProxy) {
    verifyProxyTypeCompatibility(ProxyType.MANUAL);
    this.proxyType = ProxyType.MANUAL;
    this.socksProxy = socksProxy;
    return this;
  }

  /**
   * Gets the SOCKS version (4 or 5).
   *
   * @return the SOCKS version if present, null otherwise
   */
  public Integer getSocksVersion() {
    return socksVersion;
  }

  /**
   * Specifies which version of SOCKS to use (4 or 5).
   *
   * @param socksVersion SOCKS version, 4 or 5
   * @return reference to self
   */
  public Proxy setSocksVersion(Integer socksVersion) {
    verifyProxyTypeCompatibility(ProxyType.MANUAL);
    this.proxyType = ProxyType.MANUAL;
    this.socksVersion = socksVersion;
    return this;
  }

  /**
   * Gets the SOCKS proxy's username.  Supported by SOCKS v5 and above.
   *
   * @return the SOCKS proxy's username
   */
  public String getSocksUsername() {
    return socksUsername;
  }

  /**
   * Specifies a username for the SOCKS proxy. Supported by SOCKS v5 and above.
   *
   * @param username username for the SOCKS proxy
   * @return reference to self
   */
  public Proxy setSocksUsername(String username) {
    verifyProxyTypeCompatibility(ProxyType.MANUAL);
    this.proxyType = ProxyType.MANUAL;
    this.socksUsername = username;
    return this;
  }

  /**
   * Gets the SOCKS proxy's password. Supported by SOCKS v5 and above.
   *
   * @return the SOCKS proxy's password
   */
  public String getSocksPassword() {
    return socksPassword;
  }

  /**
   * Specifies a password for the SOCKS proxy. Supported by SOCKS v5 and above.
   *
   * @param password password for the SOCKS proxy
   * @return reference to self
   */
  public Proxy setSocksPassword(String password) {
    verifyProxyTypeCompatibility(ProxyType.MANUAL);
    this.proxyType = ProxyType.MANUAL;
    this.socksPassword = password;
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

  private void verifyProxyTypeCompatibility(ProxyType compatibleProxy) {
    if (proxyType != ProxyType.UNSPECIFIED && proxyType != compatibleProxy) {
      throw new IllegalStateException(String.format(
          "Specified proxy type (%s) not compatible with current setting (%s)",
          compatibleProxy, proxyType));
    }
  }

  @SuppressWarnings({"unchecked"})
  public static Proxy extractFrom(Capabilities capabilities) {
    Object rawProxy = capabilities.getCapability("proxy");
    Proxy proxy = null;
    if (rawProxy != null) {
      if (rawProxy instanceof Proxy) {
        proxy = (Proxy) rawProxy;
      } else if (rawProxy instanceof Map) {
        proxy = new Proxy((Map<String, ?>) rawProxy);
      }
    }
    return proxy;
  }

  @Override
  public String toString() {
    StringBuilder builder = new StringBuilder("Proxy(");

    switch (getProxyType()) {
      case AUTODETECT:
      case DIRECT:
      case MANUAL:
      case SYSTEM:
        builder.append(getProxyType().toString().toLowerCase());
        break;

      case PAC:
        builder.append("pac: ").append(getProxyAutoconfigUrl());
        break;

      case RESERVED_1:
      case UNSPECIFIED:
        break;
    }

    String p = getFtpProxy();
    if (p != null) {
      builder.append(", ftp=").append(p);
    }
    p = getHttpProxy();
    if (p != null) {
      builder.append(", http=").append(p);
    }
    p = getSocksProxy();
    if (p != null) {
      builder.append(", socks=").append(p);
    }
    p = getSslProxy();
    if (p != null) {
      builder.append(", ssl=").append(p);
    }

    builder.append(")");
    return builder.toString();
  }

  @Override
  public boolean equals(Object o) {
    if (this == o) {
      return true;
    }
    if (o == null || getClass() != o.getClass()) {
      return false;
    }
    Proxy proxy = (Proxy) o;
    return isAutodetect() == proxy.isAutodetect() &&
           getProxyType() == proxy.getProxyType() &&
           Objects.equals(getFtpProxy(), proxy.getFtpProxy()) &&
           Objects.equals(getHttpProxy(), proxy.getHttpProxy()) &&
           Objects.equals(getNoProxy(), proxy.getNoProxy()) &&
           Objects.equals(getSslProxy(), proxy.getSslProxy()) &&
           Objects.equals(getSocksProxy(), proxy.getSocksProxy()) &&
           Objects.equals(getSocksVersion(), proxy.getSocksVersion()) &&
           Objects.equals(getSocksUsername(), proxy.getSocksUsername()) &&
           Objects.equals(getSocksPassword(), proxy.getSocksPassword()) &&
           Objects.equals(getProxyAutoconfigUrl(), proxy.getProxyAutoconfigUrl());
  }

  @Override
  public int hashCode() {
    return Objects.hash(
        getProxyType(),
        isAutodetect(),
        getFtpProxy(),
        getHttpProxy(),
        getNoProxy(),
        getSslProxy(),
        getSocksProxy(),
        getSocksVersion(),
        getSocksUsername(),
        getSocksPassword(),
        getProxyAutoconfigUrl());
  }
}
