package org.openqa.selenium.opera;

import com.opera.core.systems.OperaDriver;

import junit.framework.Test;
import junit.framework.TestCase;

import org.openqa.selenium.TestSuiteBuilder;

import static org.openqa.selenium.testing.Ignore.Driver.OPERA;

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
