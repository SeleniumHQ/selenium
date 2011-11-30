package org.openqa.selenium.firefox.internal;

import junit.framework.TestCase;
import org.junit.Test;
import org.openqa.selenium.NeedsLocalEnvironment;

import java.io.File;

public class ExecutableTest extends TestCase {

  @Test
  @NeedsLocalEnvironment(reason = "Requires local browser launching environment")
  public void testEnvironmentDiscovery() {
    Executable env = new Executable(null);
    File exe = env.getFile();
    assertNotNull(exe);
    assertFalse(exe.isDirectory());
  }
}
