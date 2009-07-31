package org.openqa.selenium.firefox.internal;

import junit.framework.TestCase;

import org.junit.Test;

import java.io.File;

public class ExecutableTest extends TestCase {

  @Test
  public void testEnvironmentDiscovery() {
    Executable env = new Executable(null);
    File exe = env.getFile();
    assertNotNull(exe);
    assertFalse(exe.isDirectory());
  }
}
