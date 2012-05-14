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

import static org.easymock.EasyMock.expectLastCall;
import static org.easymock.classextension.EasyMock.createStrictMock;
import static org.easymock.classextension.EasyMock.replay;
import static org.easymock.classextension.EasyMock.verify;

import org.junit.Test;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.browserlaunchers.locators.BrowserInstallation;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.server.RemoteControlConfiguration;
import org.openqa.selenium.server.SslCertificateGenerator;


public class SafariCustomProfileLauncherUnitTest {

  private AbstractBrowserLauncher launcher;
  private Capabilities browserOptions = BrowserOptions.newBrowserOptions();
  private RemoteControlConfiguration remoteConfiguration = new RemoteControlConfiguration();
  private SslCertificateGenerator generator;

  @Test(expected = InvalidBrowserExecutableException.class)
  public void constructor_invalidBrowserInstallationCausesException() throws Exception {
    launcher =
        new SafariCustomProfileLauncher(browserOptions, remoteConfiguration, "session", "invalid");
  }

  @Test
  public void launchRemoteSession_generatesSslCertsIfBrowserSideLogEnabled() throws Exception {
    String location = null;

    generator = createStrictMock(SslCertificateGenerator.class);
    generator.generateSSLCertsForLoggingHosts();
    expectLastCall().once();

    remoteConfiguration.setSeleniumServer(generator);
    ((DesiredCapabilities) browserOptions).setCapability("browserSideLog", true);

    launcher =
        new SafariCustomProfileLauncher(browserOptions, remoteConfiguration, "session", location) {
          @Override
          protected void launch(String url) {
          }

          @Override
          protected BrowserInstallation locateSafari(String location) {
            return new BrowserInstallation("", "");
          }
        };

    replay(generator);
    launcher.launchRemoteSession("http://url");
    verify(generator);
  }

}
