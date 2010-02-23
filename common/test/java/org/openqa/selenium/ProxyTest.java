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
