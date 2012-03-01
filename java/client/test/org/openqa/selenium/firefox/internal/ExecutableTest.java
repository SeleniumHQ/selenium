package org.openqa.selenium.firefox.internal;

import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNotNull;

import org.junit.Test;
import org.openqa.selenium.testing.NeedsLocalEnvironment;
import org.openqa.selenium.testing.drivers.SauceDriver;

import java.io.File;

public class ExecutableTest {

  @Test
  @NeedsLocalEnvironment(reason = "Requires local browser launching environment")
  public void testEnvironmentDiscovery() {
    if (SauceDriver.shouldUseSauce()) {
      // It seems this isn't being passed through TestIgnorance - ignore it regardless
      return;
    }
    Executable env = new Executable(null);
    File exe = env.getFile();
    assertNotNull(exe);
    assertFalse(exe.isDirectory());
  }
}
