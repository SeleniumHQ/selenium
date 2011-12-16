package org.openqa.selenium.remote;

import junit.framework.Test;
import junit.framework.TestSuite;

import org.openqa.selenium.TestSuiteBuilder;

public class RemoteClientTestSuite extends TestSuite {

  public static Test suite() throws Exception {
    return new TestSuiteBuilder()
        .addSourceDir("java/client/test")
        .usingNoDriver()
        .create();
  }
}
