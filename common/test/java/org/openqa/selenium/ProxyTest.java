package org.openqa.selenium;

import junit.framework.TestCase;

import org.openqa.selenium.Proxy.ProxyType;

public class ProxyTest extends TestCase {
  public void testUnspecified() {
    Proxy proxy = new Proxy();
    assertEquals(ProxyType.UNSPECIFIED, proxy.getProxyType());
    assertFalse(proxy.isAutodetect());
    assertNull(proxy.getHttpProxy());
    assertNull(proxy.getProxyAutoconfigUrl());
  }

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
    } catch (IllegalStateException e) {
    }
    try {
      proxy.setProxyAutoconfigUrl("http://aaaa");
    } catch (IllegalStateException e) {
    }
  }

  public void testPac() {
    Proxy proxy = new Proxy();
    proxy.setProxyAutoconfigUrl("http://aaa/bbb.pac");
    assertEquals(proxy.getProxyType(), ProxyType.PAC);
    assertFalse(proxy.isAutodetect());
    try {
      proxy.setAutodetect(true);
    } catch (IllegalStateException e) {
    }
    assertNull(proxy.getHttpProxy());
    try {
      proxy.setHttpProxy("foo");
    } catch (IllegalStateException e) {
    }

  }
}
