/*
Copyright 2012 Selenium committers
Copyright 2012 Software Freedom Conservancy

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/


package org.openqa.selenium.server.browserlaunchers;

import org.junit.Test;
import org.openqa.selenium.server.RemoteControlConfiguration;

import java.io.File;

import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

public class FirefoxCustomProfileLauncherUnitTest {

  @Test
  public void testProfileRemovedWhenProcessNull() {
    FirefoxCustomProfileLauncherStubbedForShutdown launcher =
        new FirefoxCustomProfileLauncherStubbedForShutdown();
    launcher.setCustomProfileDir(new File("testdir"));
    launcher.close();
    assertFalse(launcher.wasKillFirefoxProcessCalled());
    assertTrue(launcher.wasRemoveCustomProfileCalled());
  }

  @Test
  public void testProfileRemovedWhenProcessKillFails() {
    FirefoxCustomProfileLauncherStubbedForShutdown launcher =
        new FirefoxCustomProfileLauncherStubbedForShutdown();
    launcher.haveProcessKillThrowException(false);
    launcher.setCustomProfileDir(new File("testdir"));
    launcher.setCommandLine(new TestProcess());
    launcher.close();
    assertTrue(launcher.wasKillFirefoxProcessCalled());
    assertTrue(launcher.wasRemoveCustomProfileCalled());
  }

  @Test
  public void testProfileRemovedWhenProcessNotNull() {
    FirefoxCustomProfileLauncherStubbedForShutdown launcher =
        new FirefoxCustomProfileLauncherStubbedForShutdown();
    launcher.setCustomProfileDir(new File("testdir"));
    launcher.setCommandLine(new TestProcess());
    launcher.close();
    assertTrue(launcher.wasKillFirefoxProcessCalled());
    assertTrue(launcher.wasRemoveCustomProfileCalled());
  }

  @Test
  public void testNothingRemovedIfAlreadyNull() {
    FirefoxCustomProfileLauncherStubbedForShutdown launcher =
        new FirefoxCustomProfileLauncherStubbedForShutdown();
    launcher.close();
    assertFalse(launcher.wasKillFirefoxProcessCalled());
    assertFalse(launcher.wasRemoveCustomProfileCalled());
  }

  @Test
  public void testSecondCloseIsNoOp() {
    FirefoxCustomProfileLauncherStubbedForShutdown launcher =
        new FirefoxCustomProfileLauncherStubbedForShutdown();
    launcher.setCustomProfileDir(new File("testdir"));
    launcher.close();
    assertTrue(launcher.wasRemoveCustomProfileCalled());
    launcher.reset();
    launcher.close();
    assertFalse(launcher.wasRemoveCustomProfileCalled());
  }

  public static class FirefoxCustomProfileLauncherStubbedForShutdown
      extends FirefoxCustomProfileLauncher {

    private boolean killFirefoxProcessCalled = false;
    private boolean removeCustomProfileDirCalled = false;
    private boolean throwProcessKillException = true;

    public FirefoxCustomProfileLauncherStubbedForShutdown() {
      super(BrowserOptions.newBrowserOptions(), new RemoteControlConfiguration(), "testsession",
          (String) null);
    }

    public void haveProcessKillThrowException(boolean doThrow) {
      this.throwProcessKillException = doThrow;
    }

    public void reset() {
      killFirefoxProcessCalled = false;
      removeCustomProfileDirCalled = false;
      throwProcessKillException = true;
    }

    public boolean wasKillFirefoxProcessCalled() {
      return killFirefoxProcessCalled;
    }

    public boolean wasRemoveCustomProfileCalled() {
      return removeCustomProfileDirCalled;
    }

    @Override
    protected void killFirefoxProcess() throws FileLockRemainedException {
      killFirefoxProcessCalled = true;
      if (!throwProcessKillException) {
        throw new FileLockRemainedException("test exception");
      }
    }

    @Override
    protected void removeCustomProfileDir() throws RuntimeException {
      removeCustomProfileDirCalled = true;
    }
  }
}
