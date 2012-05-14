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


package org.openqa.selenium.browserlaunchers;

import org.junit.Test;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.io.StringWriter;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

public class ProxyPacTest {
  @Test
  public void testShouldNotReturnAnythingIfNothingIsConfigured() throws IOException {
    DoNotUseProxyPac pac = new DoNotUseProxyPac();

    StringWriter writer = new StringWriter();
    pac.outputTo(writer);

    assertEquals(writer.toString(), EMPTY_PAC, writer.toString());
  }

  @Test
  public void testShouldAllowSpecificUrlsToBeProxied() throws IOException {
    DoNotUseProxyPac pac = new DoNotUseProxyPac();

    pac.mapHost("www.google.com").toProxy("http://localhost:8080");
    String config = captureOutput(pac);

    assertTrue(config, config.contains(
        "if (shExpMatch(host, 'www.google.com')) {"
        + " return 'PROXY http://localhost:8080'; "
        + "}"));
  }

  @Test
  public void testShouldAllowSpecificUrlsToBePassedThroughDirectly() throws IOException {
    DoNotUseProxyPac pac = new DoNotUseProxyPac();

    pac.map("http://seleniumhq.org/cheese").toNoProxy();
    String config = captureOutput(pac);

    assertTrue(config, config.contains(
        "if (shExpMatch(url, 'http://seleniumhq.org/cheese')) {"
        + " return 'DIRECT'; "
        + "}"));
  }

  @Test
  public void testShouldAllowBasicWildCarding() throws IOException {
    DoNotUseProxyPac pac = new DoNotUseProxyPac();

    pac.map("*/selenium-server/*").toProxy("http://localhost:8080/selenium-server/");
    String config = captureOutput(pac);

    assertTrue(config, config.contains(
        "if (shExpMatch(url, '*/selenium-server/*')) {"
        + " return 'PROXY http://localhost:8080/selenium-server/'; "
        + "}"));
  }

  // See: http://support.microsoft.com/kb/274204
  @Test
  public void testShouldUseJsRegexIfIEWouldNotHandleTheMappingUrl() throws IOException {
    DoNotUseProxyPac pac = new DoNotUseProxyPac();

    pac.map("/[a-zA-Z]{4}.microsoft.com/").toProxy("http://localhost:8080/selenium-server/");
    String config = captureOutput(pac);

    assertTrue(config, config.contains(
        "if (/[a-zA-Z]{4}.microsoft.com/.test(url)) {"
        + " return 'PROXY http://localhost:8080/selenium-server/'; "
        + "}"));
  }

  @Test
  public void testFinalLineOfFunctionShouldRedirectToDefaultProxy() throws IOException {
    DoNotUseProxyPac pac = new DoNotUseProxyPac();

    String config = captureOutput(pac);
    assertTrue(config, config.endsWith("{\n}\n"));

    pac.defaults().toProxy("http://localhost:1010");
    config = captureOutput(pac);
    assertTrue(config, config.endsWith("return 'PROXY http://localhost:1010';\n}\n"));

    pac.defaults().toNoProxy();
    config = captureOutput(pac);
    assertTrue(config, config.endsWith("return 'DIRECT';\n}\n"));
  }

  // This is going to be a whole heap of fun.
  @Test
  public void testShouldAllowAPacToBeBasedOffAnExistingPacFile() throws IOException {
    // We should allow people to override the settings in the given pac
    // The strategy will be to rename the method we care about to something else
    // And then include the original (JS) source code. How badly can this fail?

    File example = File.createTempFile("example", "pac");
    example.deleteOnExit();
    FileWriter out = new FileWriter(example);
    out.append(EXAMPLE_PAC);
    out.close();

    DoNotUseProxyPac pac = new DoNotUseProxyPac();
    pac.map("/foobar/*").toNoProxy();
    pac.defaults().toProxy("http://example.com:8080/se-server");
    pac.deriveFrom(example.toURI());
    String converted = captureOutput(pac);

    assertEquals(converted,
        "function originalFindProxyForURL(u, h) {  if (u.contains('fishy') return 'DIRECT'; }\n"
       + "function isFishy() { return false; }\n"
       + "function FindProxyForURL(url, host) {\n"
       + "  if (shExpMatch(url, '/foobar/*')) { return 'DIRECT'; }\n"
       + "\n"
       + "  var value = originalFindProxyForURL(host, url);\n"
       + "  if (value) { return value; }\n"
       + "\n"
       + "  return 'PROXY http://example.com:8080/se-server';\n"
       + "}\n", converted);
  }

  private String captureOutput(DoNotUseProxyPac pac) throws IOException {
    StringWriter writer = new StringWriter();
    pac.outputTo(writer);
    return writer.toString();
  }

  private static final String EMPTY_PAC =
      "function FindProxyForURL(url, host) {\n"
      + "}\n";

  private static final String EXAMPLE_PAC =
      "function FindProxyForURL(u, h) {"
      + "  if (u.contains('fishy') return 'DIRECT'; }\n"
      + ""
      + "function isFishy() { return false; }";
}
