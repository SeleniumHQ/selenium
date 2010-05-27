/*
Copyright 2010 WebDriver committers
Copyright 2010Google Inc.
Portions copyright 2007 ThoughtWorks, Inc

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

import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileWriter;
import java.io.IOException;
import java.io.Writer;
import java.util.Map;

import com.thoughtworks.selenium.SeleniumException;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.Proxy;

import static org.openqa.selenium.browserlaunchers.CapabilityType.ForSeleniumServer;
import static org.openqa.selenium.browserlaunchers.CapabilityType.ForSeleniumServer.AVOIDING_PROXY;
import static org.openqa.selenium.browserlaunchers.CapabilityType.ForSeleniumServer.ONLY_PROXYING_SELENIUM_TRAFFIC;
import static org.openqa.selenium.browserlaunchers.CapabilityType.ForSeleniumServer.PROXYING_EVERYTHING;
import static org.openqa.selenium.browserlaunchers.CapabilityType.PROXY;

public class Proxies {

  /**
   * Generate a proxy.pac file, configuring a dynamic proxy. <p/> If
   * proxySeleniumTrafficOnly is true, then the proxy applies only to URLs
   * containing "/selenium-server/". Otherwise the proxy applies to all URLs.
   */
  public static File makeProxyPAC(File parentDir, int port, Capabilities capabilities)
      throws FileNotFoundException {
    return makeProxyPAC(parentDir, port,
        System.getProperty("http.proxyHost"),
        System.getProperty("http.proxyPort"),
        System.getProperty("http.nonProxyHosts"), capabilities);
  }

  public static File makeProxyPAC(File parentDir, int port, String configuredProxy, String proxyPort, String nonProxyHosts, Capabilities capabilities)
      throws FileNotFoundException {
    DoNotUseProxyPac pac = newProxyPac(port, configuredProxy, proxyPort, nonProxyHosts, capabilities);

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
      throw new SeleniumException("Unable to configure proxy. Selenium will not work.");
    }
  }

  public static Proxy extractProxy(Capabilities capabilities) {
    Object rawProxy = capabilities.getCapability(PROXY);
    Proxy proxy = null;
    if (rawProxy != null) {
      if (rawProxy instanceof Proxy) {
        proxy = (Proxy) rawProxy;
      } else if (rawProxy instanceof Map) {
        //noinspection unchecked
        proxy = new Proxy((Map<String, ?>) rawProxy);
      }
    }
    return proxy;
  }

  static DoNotUseProxyPac newProxyPac(int port, String configuredProxy, String proxyPort, String nonProxyHosts, Capabilities capabilities) {
    DoNotUseProxyPac existingConfig = (DoNotUseProxyPac) capabilities.getCapability(
        ForSeleniumServer.PROXY_PAC);
    DoNotUseProxyPac pac = existingConfig == null ? new DoNotUseProxyPac() : existingConfig;

    Object tempProxy = capabilities.getCapability(CapabilityType.PROXY);
    if (tempProxy != null) {
      Proxy proxy = extractProxy(capabilities);
      if (proxy.getHttpProxy() != null) {
        pac.defaults().toProxy(proxy.getHttpProxy());
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
             capabilities.is(AVOIDING_PROXY) &&
             !capabilities.is(PROXYING_EVERYTHING));
  }

  public static boolean isOnlyProxyingSelenium(Capabilities capabilities) {
    return !isProxyingAllTraffic(capabilities);
  }
}
