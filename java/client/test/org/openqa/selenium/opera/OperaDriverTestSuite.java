package org.openqa.selenium.opera;

import static org.openqa.selenium.Ignore.Driver.OPERA;

import org.openqa.selenium.TestSuiteBuilder;

import com.opera.core.systems.OperaDriver;
import junit.framework.Test;
import junit.framework.TestCase;

public class OperaDriverTestSuite extends TestCase {

  public static Test suite() throws Exception {
    return new TestSuiteBuilder()
        .addSourceDir("java/client/test")
        .usingDriver(OperaDriver.class)
        .exclude(OPERA)
        .keepDriverInstance()
        .includeJavascriptTests()
        .create();
  }
}
