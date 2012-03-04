package org.openqa.selenium.firefox.internal;

import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNotNull;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.openqa.selenium.testing.NeedsLocalEnvironment;
import org.openqa.selenium.testing.SeleniumTestRunner;

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
