/*
Copyright 2010 Selenium committers
Portions copyright 2011 Software Freedom Conservancy

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

package org.openqa.selenium.browserlaunchers;

import static org.openqa.selenium.remote.CapabilityType.PROXY;
import static org.openqa.selenium.remote.CapabilityType.ForSeleniumServer.AVOIDING_PROXY;
import static org.openqa.selenium.remote.CapabilityType.ForSeleniumServer.ONLY_PROXYING_SELENIUM_TRAFFIC;
import static org.openqa.selenium.remote.CapabilityType.ForSeleniumServer.PROXYING_EVERYTHING;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.Proxy;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.remote.CapabilityType;
import org.openqa.selenium.remote.CapabilityType.ForSeleniumServer;
import org.openqa.selenium.remote.DesiredCapabilities;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.io.Writer;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.Map;

public class Proxies {
  public static final String PROXY_CONFIG = CapabilityType.PROXY;

  public static boolean isProxyRequired(Capabilities capabilities) {
    return capabilities.is("proxyRequired") || capabilities.getCapability(PROXY_CONFIG) != null;
  }


  /**
   * Generate a proxy.pac file, configuring a dynamic proxy.
   * <p/>
   * If proxySeleniumTrafficOnly is true, then the proxy applies only to URLs containing
   * "/selenium-server/". Otherwise the proxy applies to all URLs.
   */
  public static File makeProxyPAC(File parentDir, int port, Capabilities capabilities) {
    return makeProxyPAC(parentDir, port,
        System.getProperty("http.proxyHost"),
        System.getProperty("http.proxyPort"),
        System.getProperty("http.nonProxyHosts"), capabilities);
  }

  public static File makeProxyPAC(File parentDir, int port, String configuredProxy,
      String proxyPort, String nonProxyHosts, Capabilities capabilities) {
    DoNotUseProxyPac pac =
        newProxyPac(port, configuredProxy, proxyPort, nonProxyHosts, capabilities);

    Proxy proxy = extractProxy(capabilities);
    if (proxy != null && proxy.getHttpProxy() != null) {
      pac.defaults().toProxy(proxy.getHttpProxy());
    }

    try {
      File pacFile = new File(parentDir, "proxy.pac");
      Writer out = new FileWriter(pacFile);
      pac.outputTo(out);
      out.close();
      return pacFile;
    } catch (IOException e) {
      throw new WebDriverException("Unable to configure proxy. Selenium will not work.", e);
    }
  }

  @SuppressWarnings({"unchecked"})
  public static Proxy extractProxy(Capabilities capabilities) {
    Object rawProxy = capabilities.getCapability(PROXY);
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

  static DoNotUseProxyPac newProxyPac(int port, String configuredProxy, String proxyPort,
      String nonProxyHosts, Capabilities capabilities) {
    DoNotUseProxyPac existingConfig = (DoNotUseProxyPac) capabilities.getCapability(
        ForSeleniumServer.PROXY_PAC);
    DoNotUseProxyPac pac = existingConfig == null ? new DoNotUseProxyPac() : existingConfig;

    Object tempProxy = capabilities.getCapability(CapabilityType.PROXY);
    if (tempProxy != null) {
      Proxy proxy = extractProxy(capabilities);
      if (proxy.getHttpProxy() != null) {
        pac.defaults().toProxy(proxy.getHttpProxy());
      } else if (proxy.getProxyAutoconfigUrl() != null) {
        URI pacUri = null;
        try {
          pacUri = new URI(proxy.getProxyAutoconfigUrl());
          pac.deriveFrom(pacUri);
        } catch (URISyntaxException e) {
          throw new WebDriverException(e);
        }
      }
    }

    if (configuredProxy != null) {
      String proxyToUse = configuredProxy;
      if (proxyPort != null) {
        proxyToUse += ":" + proxyPort;
      }
      pac.defaults().toProxy(proxyToUse);
    }

    String defaultProxy = "DIRECT";
    if (configuredProxy != null) {
      defaultProxy = "PROXY " + configuredProxy;
      if (proxyPort != null) {
        defaultProxy += ":" + proxyPort;
      }
    }

    String seleniumServerAsProxy = "localhost:" + port + "; " + defaultProxy;
    if (isOnlyProxyingSelenium(capabilities)) {
      pac.map("*/selenium-server/*").toProxy(seleniumServerAsProxy);
      if (nonProxyHosts != null && nonProxyHosts.trim().length() > 0) {
        String[] hosts = nonProxyHosts.split("\\|");
        for (String host : hosts) {
          pac.mapHost(host).toNoProxy();
        }
      }
    } else {
      pac.defaults().toProxy(seleniumServerAsProxy);
    }
    return pac;
  }

  public static boolean isProxyingAllTraffic(Capabilities capabilities) {
    // According to the original logic of Selenium Server, the only time when
    // the selenium sever wouldn't be proxying all traffic was when it was
    // configured to only proxy selenium traffic, was avoid the proxy and had
    // not been asked to proxy everything. Modeling that first before tidying
    // up the logic.
    return !(capabilities.is(ONLY_PROXYING_SELENIUM_TRAFFIC) &&
        capabilities.is(AVOIDING_PROXY) && !capabilities.is(PROXYING_EVERYTHING));
  }

  public static boolean isOnlyProxyingSelenium(Capabilities capabilities) {
    return !isProxyingAllTraffic(capabilities);
  }

  public static Capabilities setProxyEverything(Capabilities source, boolean isProxyingEverything) {
    DesiredCapabilities toReturn = newDesiredCapabilities(source);
    toReturn.setCapability(PROXYING_EVERYTHING, isProxyingEverything);
    return toReturn;
  }

  public static Capabilities setAvoidProxy(Capabilities source, boolean avoidProxy) {
    DesiredCapabilities toReturn = newDesiredCapabilities(source);
    toReturn.setCapability(AVOIDING_PROXY, avoidProxy);
    return toReturn;
  }

  public static Capabilities setOnlyProxySeleniumTraffic(Capabilities source,
      boolean onlyProxySeleniumTraffic) {
    DesiredCapabilities toReturn = newDesiredCapabilities(source);
    toReturn.setCapability(ONLY_PROXYING_SELENIUM_TRAFFIC, onlyProxySeleniumTraffic);
    return toReturn;
  }

  public static Capabilities setProxyRequired(Capabilities source, boolean proxyRequired) {
    DesiredCapabilities toReturn = newDesiredCapabilities(source);
    toReturn.setCapability("proxyRequired", proxyRequired);
    return toReturn;
  }

  private static DesiredCapabilities newDesiredCapabilities(Capabilities source) {
    if (source instanceof DesiredCapabilities) {
      return (DesiredCapabilities) source;
    }
    return new DesiredCapabilities(source);
  }
}
