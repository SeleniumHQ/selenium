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

import static org.hamcrest.Matchers.instanceOf;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNull;
import static org.junit.Assert.assertThat;
import static org.junit.Assert.assertTrue;
import static org.openqa.selenium.remote.CapabilityType.PROXY;
import static org.openqa.selenium.testing.TestUtilities.catchThrowable;

import org.junit.Ignore;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.JUnit4;
import org.openqa.selenium.Proxy.ProxyType;
import org.openqa.selenium.remote.BeanToJsonConverter;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.JsonToBeanConverter;

import java.util.HashMap;
import java.util.Map;

@RunWith(JUnit4.class)
public class ProxyTest {

  @Test
  public void testNotInitializedProxy() {
    Proxy proxy = new Proxy();

    assertEquals(ProxyType.UNSPECIFIED, proxy.getProxyType());

    assertNull(proxy.getFtpProxy());
    assertNull(proxy.getHttpProxy());
    assertNull(proxy.getSslProxy());
    assertNull(proxy.getSocksProxy());
    assertNull(proxy.getSocksVersion());
    assertNull(proxy.getSocksUsername());
    assertNull(proxy.getSocksPassword());
    assertNull(proxy.getNoProxy());
    assertNull(proxy.getProxyAutoconfigUrl());
    assertFalse(proxy.isAutodetect());
  }

  @Test
  public void testCanNotChangeAlreadyInitializedProxyType() {
    final Proxy proxy = new Proxy();
    proxy.setProxyType(ProxyType.DIRECT);

    Throwable t = catchThrowable(() -> proxy.setAutodetect(true));
    assertThat(t, instanceOf(IllegalStateException.class));

    Throwable t2 = catchThrowable(() -> proxy.setSocksPassword(""));
    assertThat(t2, instanceOf(IllegalStateException.class));

    Throwable t3 = catchThrowable(() -> proxy.setSocksUsername(""));
    assertThat(t3, instanceOf(IllegalStateException.class));

    Throwable t4 = catchThrowable(() -> proxy.setSocksProxy(""));
    assertThat(t4, instanceOf(IllegalStateException.class));

    Throwable t5 = catchThrowable(() -> proxy.setFtpProxy(""));
    assertThat(t5, instanceOf(IllegalStateException.class));

    Throwable t6 = catchThrowable(() -> proxy.setHttpProxy(""));
    assertThat(t6, instanceOf(IllegalStateException.class));

    Throwable t7 = catchThrowable(() -> proxy.setNoProxy(""));
    assertThat(t7, instanceOf(IllegalStateException.class));

    Throwable t8 = catchThrowable(() -> proxy.setProxyAutoconfigUrl(""));
    assertThat(t8, instanceOf(IllegalStateException.class));

    Throwable t9 = catchThrowable(() -> proxy.setProxyType(ProxyType.SYSTEM));
    assertThat(t9, instanceOf(IllegalStateException.class));

    Throwable t10 = catchThrowable(() -> proxy.setSslProxy(""));
    assertThat(t10, instanceOf(IllegalStateException.class));

    final Proxy proxy2 = new Proxy();
    proxy2.setProxyType(ProxyType.AUTODETECT);

    Throwable t11 = catchThrowable(() -> proxy2.setProxyType(ProxyType.SYSTEM));
    assertThat(t11, instanceOf(IllegalStateException.class));

    Throwable t12 = catchThrowable(() -> proxy.setSocksVersion(5));
    assertThat(t12, instanceOf(IllegalStateException.class));
  }

  @Test
  public void testManualProxy() {
    Proxy proxy = new Proxy();

    proxy.
        setHttpProxy("http.proxy:1234").
        setFtpProxy("ftp.proxy").
        setSslProxy("ssl.proxy").
        setNoProxy("localhost,127.0.0.*").
        setSocksProxy("socks.proxy:65555").
        setSocksVersion(5).
        setSocksUsername("test1").
        setSocksPassword("test2");

    assertEquals(ProxyType.MANUAL, proxy.getProxyType());
    assertEquals("ftp.proxy", proxy.getFtpProxy());
    assertEquals("http.proxy:1234", proxy.getHttpProxy());
    assertEquals("ssl.proxy", proxy.getSslProxy());
    assertEquals("socks.proxy:65555", proxy.getSocksProxy());
    assertEquals(Integer.valueOf(5), proxy.getSocksVersion());
    assertEquals("test1", proxy.getSocksUsername());
    assertEquals("test2", proxy.getSocksPassword());
    assertEquals("localhost,127.0.0.*", proxy.getNoProxy());

    assertNull(proxy.getProxyAutoconfigUrl());
    assertFalse(proxy.isAutodetect());
  }

  @Test
  public void testPACProxy() {
    Proxy proxy = new Proxy();
    proxy.setProxyAutoconfigUrl("http://aaa/bbb.pac");

    assertEquals(proxy.getProxyType(), ProxyType.PAC);
    assertEquals("http://aaa/bbb.pac", proxy.getProxyAutoconfigUrl());

    assertNull(proxy.getFtpProxy());
    assertNull(proxy.getHttpProxy());
    assertNull(proxy.getSslProxy());
    assertNull(proxy.getSocksProxy());
    assertNull(proxy.getSocksVersion());
    assertNull(proxy.getSocksUsername());
    assertNull(proxy.getSocksPassword());
    assertNull(proxy.getNoProxy());
    assertFalse(proxy.isAutodetect());
  }

  @Test
  public void testAutodetectProxy() {
    Proxy proxy = new Proxy();
    proxy.setAutodetect(true);

    assertEquals(proxy.getProxyType(), ProxyType.AUTODETECT);
    assertTrue(proxy.isAutodetect());

    assertNull(proxy.getFtpProxy());
    assertNull(proxy.getHttpProxy());
    assertNull(proxy.getSslProxy());
    assertNull(proxy.getSocksProxy());
    assertNull(proxy.getSocksVersion());
    assertNull(proxy.getSocksUsername());
    assertNull(proxy.getSocksPassword());
    assertNull(proxy.getNoProxy());
    assertNull(proxy.getProxyAutoconfigUrl());
  }


  @Test
  public void manualProxyFromMap() {
    Map<String, Object> proxyData = new HashMap<>();
    proxyData.put("proxyType", "manual");
    proxyData.put("httpProxy", "http.proxy:1234");
    proxyData.put("ftpProxy", "ftp.proxy");
    proxyData.put("sslProxy", "ssl.proxy");
    proxyData.put("noProxy", "localhost,127.0.0.*");
    proxyData.put("socksProxy", "socks.proxy:65555");
    proxyData.put("socksVersion", 5);
    proxyData.put("socksUsername", "test1");
    proxyData.put("socksPassword", "test2");

    Proxy proxy = new Proxy(proxyData);

    assertEquals(ProxyType.MANUAL, proxy.getProxyType());
    assertEquals("ftp.proxy", proxy.getFtpProxy());
    assertEquals("http.proxy:1234", proxy.getHttpProxy());
    assertEquals("ssl.proxy", proxy.getSslProxy());
    assertEquals("socks.proxy:65555", proxy.getSocksProxy());
    assertEquals(Integer.valueOf(5), proxy.getSocksVersion());
    assertEquals("test1", proxy.getSocksUsername());
    assertEquals("test2", proxy.getSocksPassword());
    assertEquals("localhost,127.0.0.*", proxy.getNoProxy());

    assertNull(proxy.getProxyAutoconfigUrl());
    assertFalse(proxy.isAutodetect());
  }

  @Test
  public void manualProxyToJson() {
    Proxy proxy = new Proxy();
    proxy.setProxyType(ProxyType.MANUAL);
    proxy.setHttpProxy("http.proxy:1234");
    proxy.setFtpProxy("ftp.proxy");
    proxy.setSslProxy("ssl.proxy");
    proxy.setNoProxy("localhost,127.0.0.*");
    proxy.setSocksProxy("socks.proxy:65555");
    proxy.setSocksVersion(5);
    proxy.setSocksUsername("test1");
    proxy.setSocksPassword("test2");

    Map<String, Object> json = proxy.toJson();

    assertEquals("MANUAL", json.get("proxyType"));
    assertEquals("ftp.proxy", json.get("ftpProxy"));
    assertEquals("http.proxy:1234", json.get("httpProxy"));
    assertEquals("ssl.proxy", json.get("sslProxy"));
    assertEquals("socks.proxy:65555", json.get("socksProxy"));
    assertEquals(5, json.get("socksVersion"));
    assertEquals("test1", json.get("socksUsername"));
    assertEquals("test2", json.get("socksPassword"));
    assertEquals("localhost,127.0.0.*", json.get("noProxy"));
    assertEquals(9, json.entrySet().size());
  }

  @Test
  public void pacProxyFromMap() {
    Map<String, String> proxyData = new HashMap<>();
    proxyData.put("proxyType", "PAC");
    proxyData.put("proxyAutoconfigUrl", "http://aaa/bbb.pac");

    Proxy proxy = new Proxy(proxyData);

    assertEquals(ProxyType.PAC, proxy.getProxyType());
    assertEquals("http://aaa/bbb.pac", proxy.getProxyAutoconfigUrl());

    assertNull(proxy.getFtpProxy());
    assertNull(proxy.getHttpProxy());
    assertNull(proxy.getSslProxy());
    assertNull(proxy.getSocksProxy());
    assertNull(proxy.getSocksVersion());
    assertNull(proxy.getSocksUsername());
    assertNull(proxy.getSocksPassword());
    assertNull(proxy.getNoProxy());
    assertFalse(proxy.isAutodetect());
  }

  @Test
  public void pacProxyToJson() {
    Proxy proxy = new Proxy();
    proxy.setProxyType(ProxyType.PAC);
    proxy.setProxyAutoconfigUrl("http://aaa/bbb.pac");

    Map<String, Object> json = proxy.toJson();

    assertEquals("PAC", json.get("proxyType"));
    assertEquals("http://aaa/bbb.pac", json.get("proxyAutoconfigUrl"));
    assertEquals(2, json.entrySet().size());
  }

  @Test
  public void autodetectProxyFromMap() {
    Map<String, Object> proxyData = new HashMap<>();
    proxyData.put("proxyType", "AUTODETECT");
    proxyData.put("autodetect", true);

    Proxy proxy = new Proxy(proxyData);

    assertEquals(ProxyType.AUTODETECT, proxy.getProxyType());
    assertTrue(proxy.isAutodetect());

    assertNull(proxy.getFtpProxy());
    assertNull(proxy.getHttpProxy());
    assertNull(proxy.getSslProxy());
    assertNull(proxy.getSocksProxy());
    assertNull(proxy.getSocksVersion());
    assertNull(proxy.getSocksUsername());
    assertNull(proxy.getSocksPassword());
    assertNull(proxy.getNoProxy());
    assertNull(proxy.getProxyAutoconfigUrl());
  }

  @Test
  public void autodetectProxyToJson() {
    Proxy proxy = new Proxy();
    proxy.setProxyType(ProxyType.AUTODETECT);
    proxy.setAutodetect(true);

    Map<String, ?> json = proxy.toJson();

    assertEquals("AUTODETECT", json.get("proxyType"));
    assertTrue((Boolean) json.get("autodetect"));
    assertEquals(2, json.entrySet().size());
  }

  @Test
  public void systemProxyFromMap() {
    Map<String, String> proxyData = new HashMap<>();
    proxyData.put("proxyType", "system");

    Proxy proxy = new Proxy(proxyData);

    assertEquals(ProxyType.SYSTEM, proxy.getProxyType());

    assertNull(proxy.getFtpProxy());
    assertNull(proxy.getHttpProxy());
    assertNull(proxy.getSslProxy());
    assertNull(proxy.getSocksProxy());
    assertNull(proxy.getSocksVersion());
    assertNull(proxy.getSocksUsername());
    assertNull(proxy.getSocksPassword());
    assertNull(proxy.getNoProxy());
    assertFalse(proxy.isAutodetect());
    assertNull(proxy.getProxyAutoconfigUrl());
  }

  @Test
  public void systemProxyToJson() {
    Proxy proxy = new Proxy();
    proxy.setProxyType(ProxyType.SYSTEM);

    Map<String, Object> json = proxy.toJson();

    assertEquals("SYSTEM", json.get("proxyType"));
    assertEquals(1, json.entrySet().size());
  }

  @Test
  public void directProxyFromMap() {
    Map<String, String> proxyData = new HashMap<>();
    proxyData.put("proxyType", "DIRECT");

    Proxy proxy = new Proxy(proxyData);

    assertEquals(ProxyType.DIRECT, proxy.getProxyType());

    assertNull(proxy.getFtpProxy());
    assertNull(proxy.getHttpProxy());
    assertNull(proxy.getSslProxy());
    assertNull(proxy.getSocksProxy());
    assertNull(proxy.getSocksVersion());
    assertNull(proxy.getSocksUsername());
    assertNull(proxy.getSocksPassword());
    assertNull(proxy.getNoProxy());
    assertFalse(proxy.isAutodetect());
    assertNull(proxy.getProxyAutoconfigUrl());
  }

  @Test
  public void directProxyToJson() {
    Proxy proxy = new Proxy();
    proxy.setProxyType(ProxyType.DIRECT);

    Map<String, Object> json = proxy.toJson();

    assertEquals("DIRECT", json.get("proxyType"));
    assertEquals(1, json.entrySet().size());
  }

  @Test
  public void constructingWithNullKeysWorksAsExpected() {
    Map<String, String> rawProxy = new HashMap<>();
    rawProxy.put("ftpProxy", null);
    rawProxy.put("httpProxy", "http://www.example.com");
    rawProxy.put("autodetect", null);
    DesiredCapabilities caps = new DesiredCapabilities();
    caps.setCapability(PROXY, rawProxy);

    Proxy proxy = Proxy.extractFrom(caps);

    assertNull(proxy.getFtpProxy());
    assertFalse(proxy.isAutodetect());
    assertEquals("http://www.example.com", proxy.getHttpProxy());
  }

  @Test
  @Ignore
  public void serialiazesAndDeserializesWithoutError() {
    Proxy proxy = new Proxy();
    proxy.setProxyAutoconfigUrl("http://www.example.com/config.pac");

    DesiredCapabilities caps = new DesiredCapabilities();
    caps.setCapability(PROXY, proxy);

    String rawJson = new BeanToJsonConverter().convert(caps);
    Capabilities converted = new JsonToBeanConverter().convert(Capabilities.class, rawJson);

    Object returnedProxy = converted.getCapability(PROXY);
    assertTrue(returnedProxy instanceof Proxy);
  }
}
