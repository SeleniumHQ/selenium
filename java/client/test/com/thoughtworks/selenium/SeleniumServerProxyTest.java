package com.thoughtworks.selenium;

import org.openqa.selenium.server.TrustEverythingSSLTrustManager;

import junit.framework.TestCase;
import org.apache.commons.io.IOUtils;

import java.io.StringWriter;
import java.net.InetSocketAddress;
import java.net.Proxy;
import java.net.URL;
import java.net.URLConnection;

import javax.net.ssl.HttpsURLConnection;

public class SeleniumServerProxyTest extends TestCase {
  public void testProxiesSeleniumStaticResourcesWithUpstreamProxy()
      throws Exception {

    URL target = new URL("http://www.google.com/selenium-server/core/Blank.html");
    URLConnection client =
        target.openConnection(new Proxy(Proxy.Type.HTTP, new InetSocketAddress("127.0.0.1", 4444)));

    StringWriter responseWriter = new StringWriter();
    IOUtils.copy(client.getInputStream(), responseWriter);
    String response = responseWriter.toString();
    assertTrue(response.contains("<body>"));

    target = new URL("https://www.google.com/selenium-server/core/Blank.html");
    client =
        target.openConnection(new Proxy(Proxy.Type.HTTP, new InetSocketAddress("127.0.0.1", 4444)));
    TrustEverythingSSLTrustManager.trustAllSSLCertificates((HttpsURLConnection) client);

    responseWriter = new StringWriter();
    IOUtils.copy(client.getInputStream(), responseWriter);
    response = responseWriter.toString();
    assertTrue(response.contains("<body>"));
  }
}
