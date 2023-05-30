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

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatExceptionOfType;
import static org.openqa.selenium.Proxy.ProxyType.AUTODETECT;
import static org.openqa.selenium.Proxy.ProxyType.DIRECT;
import static org.openqa.selenium.Proxy.ProxyType.MANUAL;
import static org.openqa.selenium.Proxy.ProxyType.PAC;
import static org.openqa.selenium.Proxy.ProxyType.SYSTEM;
import static org.openqa.selenium.Proxy.ProxyType.UNSPECIFIED;
import static org.openqa.selenium.remote.CapabilityType.PROXY;

import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.Proxy.ProxyType;
import org.openqa.selenium.json.Json;

@Tag("UnitTests")
class ProxyTest {

  @Test
  void testNotInitializedProxy() {
    Proxy proxy = new Proxy();

    assertThat(proxy.getProxyType()).isEqualTo(UNSPECIFIED);

    assertThat(proxy.getFtpProxy()).isNull();
    assertThat(proxy.getHttpProxy()).isNull();
    assertThat(proxy.getSslProxy()).isNull();
    assertThat(proxy.getSocksProxy()).isNull();
    assertThat(proxy.getSocksVersion()).isNull();
    assertThat(proxy.getSocksUsername()).isNull();
    assertThat(proxy.getSocksPassword()).isNull();
    assertThat(proxy.getNoProxy()).isNull();
    assertThat(proxy.getProxyAutoconfigUrl()).isNull();
    assertThat(proxy.isAutodetect()).isFalse();
  }

  @Test
  void testCanNotChangeAlreadyInitializedProxyType() {
    final Proxy proxy = new Proxy();
    proxy.setProxyType(DIRECT);

    assertThatExceptionOfType(IllegalStateException.class)
        .isThrownBy(() -> proxy.setAutodetect(true));

    assertThatExceptionOfType(IllegalStateException.class)
        .isThrownBy(() -> proxy.setSocksPassword(""));

    assertThatExceptionOfType(IllegalStateException.class)
        .isThrownBy(() -> proxy.setSocksUsername(""));

    assertThatExceptionOfType(IllegalStateException.class)
        .isThrownBy(() -> proxy.setSocksProxy(""));

    assertThatExceptionOfType(IllegalStateException.class).isThrownBy(() -> proxy.setFtpProxy(""));

    assertThatExceptionOfType(IllegalStateException.class).isThrownBy(() -> proxy.setHttpProxy(""));

    assertThatExceptionOfType(IllegalStateException.class).isThrownBy(() -> proxy.setNoProxy(""));

    assertThatExceptionOfType(IllegalStateException.class)
        .isThrownBy(() -> proxy.setProxyAutoconfigUrl(""));

    assertThatExceptionOfType(IllegalStateException.class)
        .isThrownBy(() -> proxy.setProxyType(SYSTEM));

    assertThatExceptionOfType(IllegalStateException.class).isThrownBy(() -> proxy.setSslProxy(""));

    final Proxy proxy2 = new Proxy();
    proxy2.setProxyType(AUTODETECT);

    assertThatExceptionOfType(IllegalStateException.class)
        .isThrownBy(() -> proxy2.setProxyType(SYSTEM));

    assertThatExceptionOfType(IllegalStateException.class)
        .isThrownBy(() -> proxy.setSocksVersion(5));
  }

  @Test
  void testManualProxy() {
    Proxy proxy = new Proxy();

    proxy
        .setHttpProxy("http.proxy:1234")
        .setFtpProxy("ftp.proxy")
        .setSslProxy("ssl.proxy")
        .setNoProxy("localhost,127.0.0.*")
        .setSocksProxy("socks.proxy:65555")
        .setSocksVersion(5)
        .setSocksUsername("test1")
        .setSocksPassword("test2");

    assertThat(proxy.getProxyType()).isEqualTo(MANUAL);
    assertThat(proxy.getFtpProxy()).isEqualTo("ftp.proxy");
    assertThat(proxy.getHttpProxy()).isEqualTo("http.proxy:1234");
    assertThat(proxy.getSslProxy()).isEqualTo("ssl.proxy");
    assertThat(proxy.getSocksProxy()).isEqualTo("socks.proxy:65555");
    assertThat(proxy.getSocksVersion()).isEqualTo(Integer.valueOf(5));
    assertThat(proxy.getSocksUsername()).isEqualTo("test1");
    assertThat(proxy.getSocksPassword()).isEqualTo("test2");
    assertThat(proxy.getNoProxy()).isEqualTo("localhost,127.0.0.*");

    assertThat(proxy.getProxyAutoconfigUrl()).isNull();
    assertThat(proxy.isAutodetect()).isFalse();
  }

  @Test
  void testPACProxy() {
    Proxy proxy = new Proxy();
    proxy.setProxyAutoconfigUrl("http://aaa/bbb.pac");

    assertThat(proxy.getProxyType()).isEqualTo(PAC);
    assertThat(proxy.getProxyAutoconfigUrl()).isEqualTo("http://aaa/bbb.pac");

    assertThat(proxy.getFtpProxy()).isNull();
    assertThat(proxy.getHttpProxy()).isNull();
    assertThat(proxy.getSslProxy()).isNull();
    assertThat(proxy.getSocksProxy()).isNull();
    assertThat(proxy.getSocksVersion()).isNull();
    assertThat(proxy.getSocksUsername()).isNull();
    assertThat(proxy.getSocksPassword()).isNull();
    assertThat(proxy.getNoProxy()).isNull();
    assertThat(proxy.isAutodetect()).isFalse();
  }

  @Test
  void testAutodetectProxy() {
    Proxy proxy = new Proxy();
    proxy.setAutodetect(true);

    assertThat(proxy.getProxyType().name()).isEqualTo(AUTODETECT.name());
    assertThat(proxy.isAutodetect()).isTrue();

    assertThat(proxy.getFtpProxy()).isNull();
    assertThat(proxy.getHttpProxy()).isNull();
    assertThat(proxy.getSslProxy()).isNull();
    assertThat(proxy.getSocksProxy()).isNull();
    assertThat(proxy.getSocksVersion()).isNull();
    assertThat(proxy.getSocksUsername()).isNull();
    assertThat(proxy.getSocksPassword()).isNull();
    assertThat(proxy.getNoProxy()).isNull();
    assertThat(proxy.getProxyAutoconfigUrl()).isNull();
  }

  @Test
  void manualProxyFromMap() {
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

    assertThat(proxy.getProxyType()).isEqualTo(MANUAL);
    assertThat(proxy.getFtpProxy()).isEqualTo("ftp.proxy");
    assertThat(proxy.getHttpProxy()).isEqualTo("http.proxy:1234");
    assertThat(proxy.getSslProxy()).isEqualTo("ssl.proxy");
    assertThat(proxy.getSocksProxy()).isEqualTo("socks.proxy:65555");
    assertThat(proxy.getSocksVersion()).isEqualTo(Integer.valueOf(5));
    assertThat(proxy.getSocksUsername()).isEqualTo("test1");
    assertThat(proxy.getSocksPassword()).isEqualTo("test2");
    assertThat(proxy.getNoProxy()).isEqualTo("localhost,127.0.0.*");

    assertThat(proxy.getProxyAutoconfigUrl()).isNull();
    assertThat(proxy.isAutodetect()).isFalse();
  }

  @Test
  void longSocksVersionFromMap() {
    Map<String, Object> proxyData = new HashMap<>();
    long l = 5;
    proxyData.put("proxyType", "manual");
    proxyData.put("httpProxy", "http.proxy:1234");
    proxyData.put("ftpProxy", "ftp.proxy");
    proxyData.put("sslProxy", "ssl.proxy");
    proxyData.put("noProxy", "localhost,127.0.0.*");
    proxyData.put("socksProxy", "socks.proxy:65555");
    proxyData.put("socksVersion", l);
    proxyData.put("socksUsername", "test1");
    proxyData.put("socksPassword", "test2");

    Proxy proxy = new Proxy(proxyData);

    assertThat(proxy.getSocksVersion()).isEqualTo(Integer.valueOf(5));
  }

  @Test
  void manualProxyToJson() {
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

    assertThat(json.get("proxyType")).isEqualTo("manual");
    assertThat(json.get("ftpProxy")).isEqualTo("ftp.proxy");
    assertThat(json.get("httpProxy")).isEqualTo("http.proxy:1234");
    assertThat(json.get("sslProxy")).isEqualTo("ssl.proxy");
    assertThat(json.get("socksProxy")).isEqualTo("socks.proxy:65555");
    assertThat(json.get("socksVersion")).isEqualTo(5);
    assertThat(json.get("socksUsername")).isEqualTo("test1");
    assertThat(json.get("socksPassword")).isEqualTo("test2");
    assertThat(json.get("noProxy")).isEqualTo(Arrays.asList("localhost", "127.0.0.*"));
    assertThat(json.entrySet()).hasSize(9);
  }

  @Test
  void pacProxyFromMap() {
    Map<String, String> proxyData = new HashMap<>();
    proxyData.put("proxyType", "PAC");
    proxyData.put("proxyAutoconfigUrl", "http://aaa/bbb.pac");

    Proxy proxy = new Proxy(proxyData);

    assertThat(proxy.getProxyType()).isEqualTo(PAC);
    assertThat(proxy.getProxyAutoconfigUrl()).isEqualTo("http://aaa/bbb.pac");

    assertThat(proxy.getFtpProxy()).isNull();
    assertThat(proxy.getHttpProxy()).isNull();
    assertThat(proxy.getSslProxy()).isNull();
    assertThat(proxy.getSocksProxy()).isNull();
    assertThat(proxy.getSocksVersion()).isNull();
    assertThat(proxy.getSocksUsername()).isNull();
    assertThat(proxy.getSocksPassword()).isNull();
    assertThat(proxy.getNoProxy()).isNull();
    assertThat(proxy.isAutodetect()).isFalse();
  }

  @Test
  void pacProxyToJson() {
    Proxy proxy = new Proxy();
    proxy.setProxyType(ProxyType.PAC);
    proxy.setProxyAutoconfigUrl("http://aaa/bbb.pac");

    Map<String, Object> json = proxy.toJson();

    assertThat(json.get("proxyType")).isEqualTo("pac");
    assertThat(json.get("proxyAutoconfigUrl")).isEqualTo("http://aaa/bbb.pac");
    assertThat(json.entrySet()).hasSize(2);
  }

  @Test
  void autodetectProxyFromMap() {
    Map<String, Object> proxyData = new HashMap<>();
    proxyData.put("proxyType", "AUTODETECT");
    proxyData.put("autodetect", true);

    Proxy proxy = new Proxy(proxyData);

    assertThat(proxy.getProxyType()).isEqualTo(AUTODETECT);
    assertThat(proxy.isAutodetect()).isTrue();

    assertThat(proxy.getFtpProxy()).isNull();
    assertThat(proxy.getHttpProxy()).isNull();
    assertThat(proxy.getSslProxy()).isNull();
    assertThat(proxy.getSocksProxy()).isNull();
    assertThat(proxy.getSocksVersion()).isNull();
    assertThat(proxy.getSocksUsername()).isNull();
    assertThat(proxy.getSocksPassword()).isNull();
    assertThat(proxy.getNoProxy()).isNull();
    assertThat(proxy.getProxyAutoconfigUrl()).isNull();
  }

  @Test
  void autodetectProxyToJson() {
    Proxy proxy = new Proxy();
    proxy.setProxyType(ProxyType.AUTODETECT);
    proxy.setAutodetect(true);

    Map<String, ?> json = proxy.toJson();

    assertThat(json.get("proxyType")).isEqualTo("autodetect");
    assertThat((Boolean) json.get("autodetect")).isTrue();
    assertThat(json.entrySet()).hasSize(2);
  }

  @Test
  void systemProxyFromMap() {
    Map<String, String> proxyData = new HashMap<>();
    proxyData.put("proxyType", "system");

    Proxy proxy = new Proxy(proxyData);

    assertThat(proxy.getProxyType()).isEqualTo(SYSTEM);

    assertThat(proxy.getFtpProxy()).isNull();
    assertThat(proxy.getHttpProxy()).isNull();
    assertThat(proxy.getSslProxy()).isNull();
    assertThat(proxy.getSocksProxy()).isNull();
    assertThat(proxy.getSocksVersion()).isNull();
    assertThat(proxy.getSocksUsername()).isNull();
    assertThat(proxy.getSocksPassword()).isNull();
    assertThat(proxy.getNoProxy()).isNull();
    assertThat(proxy.isAutodetect()).isFalse();
    assertThat(proxy.getProxyAutoconfigUrl()).isNull();
  }

  @Test
  void systemProxyToJson() {
    Proxy proxy = new Proxy();
    proxy.setProxyType(ProxyType.SYSTEM);

    Map<String, Object> json = proxy.toJson();

    assertThat(json.get("proxyType")).isEqualTo("system");
    assertThat(json.entrySet()).hasSize(1);
  }

  @Test
  void directProxyFromMap() {
    Map<String, String> proxyData = new HashMap<>();
    proxyData.put("proxyType", "DIRECT");

    Proxy proxy = new Proxy(proxyData);

    assertThat(proxy.getProxyType()).isEqualTo(DIRECT);

    assertThat(proxy.getFtpProxy()).isNull();
    assertThat(proxy.getHttpProxy()).isNull();
    assertThat(proxy.getSslProxy()).isNull();
    assertThat(proxy.getSocksProxy()).isNull();
    assertThat(proxy.getSocksVersion()).isNull();
    assertThat(proxy.getSocksUsername()).isNull();
    assertThat(proxy.getSocksPassword()).isNull();
    assertThat(proxy.getNoProxy()).isNull();
    assertThat(proxy.isAutodetect()).isFalse();
    assertThat(proxy.getProxyAutoconfigUrl()).isNull();
  }

  @Test
  void directProxyToJson() {
    Proxy proxy = new Proxy();
    proxy.setProxyType(ProxyType.DIRECT);

    Map<String, Object> json = proxy.toJson();

    assertThat(json.get("proxyType")).isEqualTo("direct");
    assertThat(json.entrySet()).hasSize(1);
  }

  @Test
  void constructingWithNullKeysWorksAsExpected() {
    Map<String, String> rawProxy = new HashMap<>();
    rawProxy.put("ftpProxy", null);
    rawProxy.put("httpProxy", "http://www.example.com");
    rawProxy.put("autodetect", null);
    Capabilities caps = new ImmutableCapabilities(PROXY, rawProxy);

    Proxy proxy = Proxy.extractFrom(caps);

    assertThat(proxy.getFtpProxy()).isNull();
    assertThat(proxy.isAutodetect()).isFalse();
    assertThat(proxy.getHttpProxy()).isEqualTo("http://www.example.com");
  }

  @Test
  @Disabled
  public void serializesAndDeserializesWithoutError() {
    Proxy proxy = new Proxy();
    proxy.setProxyAutoconfigUrl("http://www.example.com/config.pac");

    Capabilities caps = new ImmutableCapabilities(PROXY, proxy);

    String rawJson = new Json().toJson(caps);
    Capabilities converted = new Json().toType(rawJson, Capabilities.class);

    Object returnedProxy = converted.getCapability(PROXY);
    assertThat(returnedProxy).isInstanceOf(Proxy.class);
  }
}
