package org.openqa.selenium.server.browserlaunchers;

import junit.framework.TestCase;

import org.openqa.selenium.server.RemoteControlConfiguration;

import java.io.File;

public class FirefoxCustomProfileLauncherUnitTest extends TestCase {

  public void testProfileRemovedWhenProcessNull() {
    FirefoxCustomProfileLauncherStubbedForShutdown launcher =
        new FirefoxCustomProfileLauncherStubbedForShutdown();
    launcher.setCustomProfileDir(new File("testdir"));
    launcher.close();
    assertFalse(launcher.wasKillFirefoxProcessCalled());
    assertTrue(launcher.wasRemoveCustomProfileCalled());
  }

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

  public void testProfileRemovedWhenProcessNotNull() {
    FirefoxCustomProfileLauncherStubbedForShutdown launcher =
        new FirefoxCustomProfileLauncherStubbedForShutdown();
    launcher.setCustomProfileDir(new File("testdir"));
    launcher.setCommandLine(new TestProcess());
    launcher.close();
    assertTrue(launcher.wasKillFirefoxProcessCalled());
    assertTrue(launcher.wasRemoveCustomProfileCalled());
  }

  public void testNothingRemovedIfAlreadyNull() {
    FirefoxCustomProfileLauncherStubbedForShutdown launcher =
        new FirefoxCustomProfileLauncherStubbedForShutdown();
    launcher.close();
    assertFalse(launcher.wasKillFirefoxProcessCalled());
    assertFalse(launcher.wasRemoveCustomProfileCalled());
  }

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
