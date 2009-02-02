package org.openqa.selenium.firefox.internal;

import junit.framework.TestCase;

import org.junit.Test;


public class ExecutableTest extends TestCase {

  @Test
  public void testEnvironmentDiscovery() {
    Executable env = new Executable(null);
    assertNotNull(env.getFile());
  }
}
