package org.openqa.selenium.firefox.internal;

import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNotNull;

import junit.framework.TestCase;
import org.junit.Test;
import org.openqa.selenium.NeedsLocalEnvironment;

import java.io.File;

public class ExecutableTest {

  @Test
  @NeedsLocalEnvironment(reason = "Requires local browser launching environment")
  public void testEnvironmentDiscovery() {
    Executable env = new Executable(null);
    File exe = env.getFile();
    assertNotNull(exe);
    assertFalse(exe.isDirectory());
  }
}
