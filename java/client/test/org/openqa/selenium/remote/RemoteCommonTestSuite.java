package org.openqa.selenium.remote;

import org.openqa.selenium.TestSuiteBuilder;

import junit.framework.Test;
import junit.framework.TestCase;

public class RemoteCommonTestSuite extends TestCase {

  public static Test suite() throws Exception {
    return new TestSuiteBuilder()
        .usingNoDriver()
        .create();
  }
}
