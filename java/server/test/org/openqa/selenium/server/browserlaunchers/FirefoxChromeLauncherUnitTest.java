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

import com.thoughtworks.selenium.SeleniumException;

import static org.easymock.EasyMock.expect;
import static org.easymock.classextension.EasyMock.createMock;
import static org.easymock.classextension.EasyMock.replay;
import static org.easymock.classextension.EasyMock.verify;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.fail;

import org.junit.Test;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.browserlaunchers.locators.BrowserInstallation;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.server.RemoteControlConfiguration;

import java.io.File;

public class FirefoxChromeLauncherUnitTest {

  final Capabilities browserOptions = BrowserOptions.newBrowserOptions();
  final RemoteControlConfiguration configuration = new RemoteControlConfiguration();

  // AH: This is the inverse of what it used to be - as the former test only assured an NPE I
  // changed it
  @Test
  public void testInvalidBrowserStringCausesChromeLauncherToThrowException() {

    try {
      new FirefoxChromeLauncher(BrowserOptions.newBrowserOptions(), configuration, null, "invalid");
      fail("No exception thrown");
    } catch (InvalidBrowserExecutableException ibee) {
      assertEquals("The specified path to the browser executable is invalid.", ibee.getMessage());
    }
  }

  @Test
  public void nullBrowserInstallationDoesCauseChromeLauncherToThrowException() {
    BrowserInstallation browserInstallation = null;

    try {
      new FirefoxChromeLauncher(BrowserOptions.newBrowserOptions(), configuration, null, browserInstallation);
      fail("No exception thrown");
    } catch (InvalidBrowserExecutableException ibee) {
      assertEquals("The specified path to the browser executable is invalid.", ibee.getMessage());
    }

  }

  @Test
  public void testShouldAbleToCreateChromeUrlWithNormalUrl() throws Exception {
    String httpUrl = "http://www.my.com/folder/endname.html?a=aaa&b=bbb";
    String chromeUrl = new FirefoxChromeLauncher.ChromeUrlConvert().convert(httpUrl);
    assertEquals("chrome://src/content/endname.html?a=aaa&b=bbb",
        chromeUrl);
  }

  @Test
  public void testProfileRemovedWhenProcessNull() {
    FirefoxChromeLauncherStubbedForShutdown launcher =
        new FirefoxChromeLauncherStubbedForShutdown();
    launcher.setCustomProfileDir(new File("testdir"));
    launcher.close();
    assertFalse(launcher.wasKillFirefoxProcessCalled());
    assertTrue(launcher.wasRemoveCustomProfileCalled());
  }

  @Test
  public void testProfileRemovedWhenProcessKillFails() {
    FirefoxChromeLauncherStubbedForShutdown launcher =
        new FirefoxChromeLauncherStubbedForShutdown();
    launcher.haveProcessKillThrowException(false);
    launcher.setCustomProfileDir(new File("testdir"));
    launcher.setCommandLine(new TestProcess());
    launcher.close();
    assertTrue(launcher.wasKillFirefoxProcessCalled());
    assertTrue(launcher.wasRemoveCustomProfileCalled());
  }

  @Test
  public void testProfileRemovedWhenProcessNotNull() {
    FirefoxChromeLauncherStubbedForShutdown launcher =
        new FirefoxChromeLauncherStubbedForShutdown();
    launcher.setCustomProfileDir(new File("testdir"));
    launcher.setCommandLine(new TestProcess());
    launcher.close();
    assertTrue(launcher.wasKillFirefoxProcessCalled());
    assertTrue(launcher.wasRemoveCustomProfileCalled());
  }

  @Test
  public void testNothingRemovedIfAlreadyNull() {
    FirefoxChromeLauncherStubbedForShutdown launcher =
        new FirefoxChromeLauncherStubbedForShutdown();
    launcher.close();
    assertFalse(launcher.wasKillFirefoxProcessCalled());
    assertFalse(launcher.wasRemoveCustomProfileCalled());
  }

  @Test
  public void testSecondCloseIsNoOp() {
    FirefoxChromeLauncherStubbedForShutdown launcher =
        new FirefoxChromeLauncherStubbedForShutdown();
    launcher.setCustomProfileDir(new File("testdir"));
    launcher.close();
    assertTrue(launcher.wasRemoveCustomProfileCalled());
    launcher.reset();
    launcher.close();
    assertFalse(launcher.wasRemoveCustomProfileCalled());
  }

  @Test
  public void copyCert8db_copyiesOnlyIfFileExists() throws Exception {
    Capabilities browserOptions = BrowserOptions.newBrowserOptions();
    RemoteControlConfiguration configuration = new RemoteControlConfiguration();
    File firefoxProfileTemplate = new File("x");
    final File certFile = createMock(File.class);
    final BrowserInstallation browserInstallation = createMock(BrowserInstallation.class);

    FirefoxChromeLauncher launcher =
        new FirefoxChromeLauncher(browserOptions, configuration, "session", browserInstallation) {
          @Override
          protected void copySingleFileWithOverwrite(File sourceFile,
              File destFile) {
          }

          @Override
          protected File getFileFromParent(File parent, String child) {
            return certFile;
          }
        };

    // Expecting the call for exists()
    expect(certFile.exists()).andReturn(true);
    replay(certFile);
    launcher.copyCert8db(firefoxProfileTemplate);
    verify(certFile);

  }

  @Test
  public void initProfileTemplate_usesBrowserOptionIfNoProfilesLocationSpecified() throws Exception {

    final BrowserInstallation browserInstallation = createMock(BrowserInstallation.class);

    ((DesiredCapabilities) browserOptions).setCapability("firefoxProfileTemplate",
        "profileTemplate");

    FirefoxChromeLauncher launcher =
        new FirefoxChromeLauncher(browserOptions, configuration, "session", browserInstallation) {
          @Override
          protected void copyDirectory(File sourceDir, File destDir) {
          }
        };

    File result = launcher.initProfileTemplate();

    assertEquals("profileTemplate", result.getName());
  }

  @Test
  public void initProfileTemplate_usesProfilesLocationAlongWithRelativeProfileIfTheirAbsoluteTemplateExists()
      throws Exception {

    final BrowserInstallation browserInstallation = createMock(BrowserInstallation.class);
    final File profileTemplate = createMock(File.class);

    expect(profileTemplate.exists()).andReturn(true);
    replay(profileTemplate);

    configuration.setProfilesLocation(profileTemplate);
    ((DesiredCapabilities) browserOptions).setCapability("profile", "profile");

    FirefoxChromeLauncher launcher =
        new FirefoxChromeLauncher(browserOptions, configuration, "session",
            browserInstallation) {
          @Override
          protected void copyDirectory(File sourceDir, File destDir) {
          }

          @Override
          protected File getFileFromParent(File parent, String child) {
            return profileTemplate;
          }
        };

    File result = launcher.initProfileTemplate();
    verify(profileTemplate);
    assertEquals(profileTemplate, result);

  }

  public static class FirefoxChromeLauncherStubbedForShutdown extends FirefoxChromeLauncher {

    private boolean killFirefoxProcessCalled = false;
    private boolean removeCustomProfileDirCalled = false;
    private boolean throwProcessKillException = true;

    public FirefoxChromeLauncherStubbedForShutdown() {
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
    protected void killFirefoxProcess() {
      killFirefoxProcessCalled = true;
      if (!throwProcessKillException) {
        throw new SeleniumException("test exception");
      }
    }

    @Override
    protected void removeCustomProfileDir() throws RuntimeException {
      removeCustomProfileDirCalled = true;
    }
  }
}
