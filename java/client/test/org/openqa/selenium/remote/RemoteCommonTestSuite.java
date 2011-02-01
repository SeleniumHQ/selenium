package org.openqa.selenium.remote;

import junit.framework.Test;
import junit.framework.TestCase;

import org.openqa.selenium.TestSuiteBuilder;

public class RemoteCommonTestSuite extends TestCase {

  public static Test suite() throws Exception {
    return new TestSuiteBuilder()
        .usingNoDriver()
        .create();
  }
}
