package org.openqa.selenium.server;

import static org.junit.Assert.assertTrue;
import static org.openqa.selenium.net.PortProber.pollPort;

import org.junit.AfterClass;
import org.junit.BeforeClass;
import org.junit.Ignore;
import org.junit.Test;
import org.openqa.selenium.Build;
import org.openqa.selenium.net.PortProber;
import org.openqa.selenium.os.CommandLine;
import org.openqa.selenium.server.TrustEverythingSSLTrustManager;

import junit.framework.TestCase;
import org.apache.commons.io.IOUtils;
import org.openqa.selenium.testing.InProject;

import java.io.File;
import java.io.StringWriter;
import java.net.InetSocketAddress;
import java.net.Proxy;
import java.net.URL;
import java.net.URLConnection;

import javax.net.ssl.HttpsURLConnection;

public class SeleniumServerProxyTest {

  private static CommandLine command;
  private static int port;

  @BeforeClass
  public static void startServer() {
    new Build().of("selenium-server-standalone").go();
    File serverJar = InProject.locate(
        "build/java/server/src/org/openqa/grid/selenium/selenium-standalone.jar");
    port = PortProber.findFreePort();
    command = new CommandLine("java", "-jar",
        serverJar.getAbsolutePath(), "-port", "" + port);
    command.executeAsync();

    pollPort(port);
  }

  @AfterClass
  public static void killServer() {
    command.destroy();
  }

  @Test @Ignore
  public void testProxiesSeleniumStaticResourcesWithUpstreamProxy()
      throws Exception {

    URL target = new URL("http://www.google.com/selenium-server/core/Blank.html");
    URLConnection client =
        target.openConnection(new Proxy(Proxy.Type.HTTP, new InetSocketAddress("127.0.0.1", port)));

    StringWriter responseWriter = new StringWriter();
    IOUtils.copy(client.getInputStream(), responseWriter);
    String response = responseWriter.toString();
    assertTrue(response.contains("<body>"));

    target = new URL("https://www.google.com/selenium-server/core/Blank.html");
    client =
        target.openConnection(new Proxy(Proxy.Type.HTTP, new InetSocketAddress("127.0.0.1", port)));
    TrustEverythingSSLTrustManager.trustAllSSLCertificates((HttpsURLConnection) client);

    responseWriter = new StringWriter();
    IOUtils.copy(client.getInputStream(), responseWriter);
    response = responseWriter.toString();
    assertTrue(response.contains("<body>"));
  }
}
