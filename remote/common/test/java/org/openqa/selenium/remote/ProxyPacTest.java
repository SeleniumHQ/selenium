package org.openqa.selenium.remote;

import junit.framework.TestCase;

import java.io.IOException;
import java.io.StringWriter;

public class ProxyPacTest extends TestCase {
  public void testShouldNotReturnAnythingIfNothingIsConfigured() throws IOException {
    ProxyPac pac = new ProxyPac();

    StringWriter writer = new StringWriter();
    pac.outputTo(writer);

    assertEquals(writer.toString(), EMPTY_PAC, writer.toString());
  }

  public void testShouldAllowSpecificUrlsToBeProxied() throws IOException {
    ProxyPac pac = new ProxyPac();

    pac.mapHost("www.google.com").toProxy("http://localhost:8080");
    String config = captureOutput(pac);

    assertTrue(config, config.contains(
        "if (shExpMatch(host, 'www.google.com')) {"
        + " return 'PROXY http://localhost:8080'; "
        + "}"));
  }

  public void testShouldAllowSpecificUrlsToBePassedThroughDirectly() throws IOException {
    ProxyPac pac = new ProxyPac();

    pac.map("http://seleniumhq.org/cheese").toNoProxy();
    String config = captureOutput(pac);

    assertTrue(config, config.contains(
        "if (shExpMatch(url, 'http://seleniumhq.org/cheese')) {"
        + " return 'DIRECT'; "
        + "}"));
  }

  public void testShouldAllowBasicWildCarding() throws IOException {
    ProxyPac pac = new ProxyPac();

    pac.map("*/selenium-server/*").toProxy("http://localhost:8080/selenium-server/");
    String config = captureOutput(pac);

    assertTrue(config, config.contains(
        "if (shExpMatch(url, '*/selenium-server/*')) {"
        + " return 'PROXY http://localhost:8080/selenium-server/'; "
        + "}"));
  }

  // See: http://support.microsoft.com/kb/274204
  public void testShouldUseJsRegexIfIEWouldNotHandleTheMappingUrl() throws IOException {
    ProxyPac pac = new ProxyPac();

    pac.map("/[a-zA-Z]{4}.microsoft.com/").toProxy("http://localhost:8080/selenium-server/");
    String config = captureOutput(pac);

    assertTrue(config, config.contains(
        "if (/[a-zA-Z]{4}.microsoft.com/.test(url)) {"
        + " return 'PROXY http://localhost:8080/selenium-server/'; "
        + "}"));
  }

  public void testFinalLineOfFunctionShouldRedirectToDefaultProxy() throws IOException {
    ProxyPac pac = new ProxyPac();

    String config = captureOutput(pac);
    assertTrue(config, config.endsWith("{\n}\n"));

    pac.defaults().toProxy("http://localhost:1010");
    config = captureOutput(pac);
    assertTrue(config, config.endsWith("return 'PROXY http://localhost:1010';\n}\n"));

    pac.defaults().toNoProxy();
    config = captureOutput(pac);
    assertTrue(config, config.endsWith("return 'DIRECT';\n}\n"));
  }

  private String captureOutput(ProxyPac pac) throws IOException {
    StringWriter writer = new StringWriter();
    pac.outputTo(writer);
    return writer.toString();
  }

  private static final String EMPTY_PAC =
      "function FindProxyForURL(url, host) {\n"
      + "}\n";
}
