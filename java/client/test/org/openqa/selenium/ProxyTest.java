/*
Copyright 2012 Selenium committers
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

import org.junit.Test;
import org.openqa.selenium.Proxy.ProxyType;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNull;
import static org.junit.Assert.fail;

public class ProxyTest {
  @Test
  public void testUnspecified() {
    Proxy proxy = new Proxy();
    assertEquals(ProxyType.UNSPECIFIED, proxy.getProxyType());
    assertFalse(proxy.isAutodetect());
    assertNull(proxy.getHttpProxy());
    assertNull(proxy.getProxyAutoconfigUrl());
  }

  @Test
  public void testDirect() {
    Proxy proxy = new Proxy();
    proxy.setProxyType(ProxyType.DIRECT);
    try {
      proxy.setHttpProxy("foo:1234");
      fail("Should not be able to set manual type for direct proxy");
    } catch (IllegalStateException e) {
      // Test passes.
    }
  }

  @Test
  public void testManual() {
    Proxy proxy = new Proxy();
    proxy.setHttpProxy("foo:1234");
    proxy.setFtpProxy("bar");
    proxy.setSslProxy("baz");
    proxy.setNoProxy("localhost");
    assertEquals(ProxyType.MANUAL, proxy.getProxyType());
    assertFalse(proxy.isAutodetect());
    try {
      proxy.setAutodetect(true);
      fail("Didn't throw expected assertion");
    } catch (IllegalStateException e) {
      // Success - expected.
    }
    try {
      proxy.setProxyAutoconfigUrl("http://aaaa");
      fail("Didn't throw expected assertion");
    } catch (IllegalStateException e) {
      // Success - expected.
    }
  }

  @Test
  public void testPac() {
    Proxy proxy = new Proxy();
    proxy.setProxyAutoconfigUrl("http://aaa/bbb.pac");
    assertEquals(proxy.getProxyType(), ProxyType.PAC);
    assertFalse(proxy.isAutodetect());
    try {
      proxy.setAutodetect(true);
      fail("Didn't throw expected assertion");
    } catch (IllegalStateException e) {
      // Success - expected.
    }
    assertNull(proxy.getHttpProxy());
    try {
      proxy.setHttpProxy("foo");
      fail("Didn't throw expected assertion");
    } catch (IllegalStateException e) {
      // Success - expected.
    }
  }
}
