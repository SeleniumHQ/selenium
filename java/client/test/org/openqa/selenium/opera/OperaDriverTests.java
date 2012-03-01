package org.openqa.selenium.opera;

import junit.framework.Test;
import junit.framework.TestSuite;

import org.junit.internal.runners.SuiteMethod;
import org.junit.runner.RunWith;
import org.junit.runners.Suite;
import org.openqa.selenium.StandardSeleniumTests;
import org.openqa.selenium.TestSuiteBuilder;

import static org.openqa.selenium.testing.drivers.Browser.opera;


@RunWith(Suite.class)
@Suite.SuiteClasses({
    StandardSeleniumTests.class,
    OperaDriverTests.LegacyTests.class
})
public class OperaDriverTests {

  @RunWith(SuiteMethod.class)
  public static class LegacyTests extends TestSuite {
  public static Test suite() throws Exception {
    return new TestSuiteBuilder()
        .addSourceDir("java/client/test")
        .using(opera)
        .keepDriverInstance()
        .includeJavascriptTests()
        .create();
  }
  }
}
