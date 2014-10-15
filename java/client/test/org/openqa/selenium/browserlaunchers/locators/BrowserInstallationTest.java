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

package org.openqa.selenium.browserlaunchers.locators;

import static org.junit.Assert.assertTrue;

import org.junit.Ignore;
import org.junit.Test;

public class BrowserInstallationTest {
  @Test @Ignore(value="comment this run to test.  this test is too dependent to be enabled on a CI")
  public void testBrowserInstallations() {
    // since some browsers might not exist on some machines, nor should that be required -
    // this is just used for internal validation purposes, rather than an actual unit test.

    // if you don't have all of the browsers installed, then these assertions will fail.
    // Toy around with commenting / uncommenting depending on your system

    /* USAGE */
    // You'll now be able to locally, and remotely detect whether or not a machine is ready to run on that machine.
    //   From a local project, you may call BrowserInstallation.is*Installed() to see if that particular browser is installed.

    assertTrue(BrowserInstallation.isGoogleChromeInstalled());
    assertTrue(BrowserInstallation.isFirefoxInstalled());
    assertTrue(BrowserInstallation.isSafariInstalled());
    assertTrue(BrowserInstallation.isInternetExplorerInstalled());

    System.out.println(BrowserInstallation.getFirefoxInstallationBinary());
    assertTrue(BrowserInstallation.getFirefoxInstallationBinary() != null);

    System.out.println(BrowserInstallation.getGoogleChromeInstallationBinary());
    assertTrue(BrowserInstallation.getGoogleChromeInstallationBinary() != null);

    System.out.println(BrowserInstallation.getSafariInstallationBinary());
    assertTrue(BrowserInstallation.getSafariInstallationBinary() != null);

    System.out.println(BrowserInstallation.getInternetExplorerInstallationBinary());
    assertTrue(BrowserInstallation.getInternetExplorerInstallationBinary() != null);
  }
}
