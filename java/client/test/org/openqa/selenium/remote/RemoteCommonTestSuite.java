package org.openqa.selenium.remote;

import junit.framework.Test;
import junit.framework.TestSuite;

import org.openqa.selenium.TestSuiteBuilder;

public class RemoteCommonTestSuite extends TestSuite {

  public static Test suite() throws Exception {
    return new TestSuiteBuilder()
        .usingNoDriver()
        .create();
  }
}
