package org.openqa.selenium.remote;

import org.openqa.selenium.TestSuiteBuilder;

import junit.framework.TestCase;
import junit.framework.Test;

public class RemoteClientTestSuite extends TestCase {

    public static Test suite() throws Exception {
      return new TestSuiteBuilder()
          .addSourceDir("remote/client")
          .usingNoDriver()
          .create();
    }
}
