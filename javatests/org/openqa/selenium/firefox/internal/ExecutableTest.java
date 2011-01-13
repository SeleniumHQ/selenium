package org.openqa.selenium.firefox.internal;

import junit.framework.TestCase;

import java.io.File;

import org.junit.Test;

public class ExecutableTest extends TestCase {

  @Test
  public void testEnvironmentDiscovery() {
    Executable env = new Executable(null);
    File exe = env.getFile();
    assertNotNull(exe);
    assertFalse(exe.isDirectory());
  }
}
