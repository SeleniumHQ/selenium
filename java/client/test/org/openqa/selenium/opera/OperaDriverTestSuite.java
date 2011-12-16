package org.openqa.selenium.opera;

import static org.openqa.selenium.testing.Ignore.Driver.OPERA;

import com.opera.core.systems.OperaDriver;

import junit.framework.Test;
import junit.framework.TestSuite;

import org.openqa.selenium.TestSuiteBuilder;

public class OperaDriverTestSuite extends TestSuite {

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
