package org.openqa.selenium.browserlaunchers.locators;

import static org.junit.Assert.assertTrue;

import org.junit.Ignore;
import org.junit.Test;

public class BrowserInstallationTest {
  @Test @Ignore(value="comment this ignore to test.  this test is too dependent to be enabled on a CI") // remove the ignore to test.
  public void testBrowserInstallations() {
    // since some browsers might not exist on some machines, nor should that be required -
    // this is just used for internal validation purposes, rather than an actual unit test.

    // Firefox ======
    assertTrue(BrowserInstallation.isFirefoxInstalled());

    System.out.println(BrowserInstallation.getFirefoxInstallationBinary());
    assertTrue(BrowserInstallation.getFirefoxInstallationBinary() != null);

    // Safari ======
    assertTrue(BrowserInstallation.isSafariInstalled());

    System.out.println(BrowserInstallation.getSafariInstallationBinary());
    assertTrue(BrowserInstallation.getSafariInstallationBinary() != null);


    // Google Chrome ======
    assertTrue(BrowserInstallation.isGoogleChromeInstalled());


    System.out.println(BrowserInstallation.getGoogleChromeInstallationBinary());
    assertTrue(BrowserInstallation.getGoogleChromeInstallationBinary() != null);


    // IE ====== (uncomment this if you are using Windows)
//    assertTrue(BrowserInstallation.isInternetExplorerInstalled());
//
//    System.out.println(BrowserInstallation.getInternetExplorerInstallationBinary());
//    assertTrue(BrowserInstallation.getInternetExplorerInstallationBinary() != null);
  }
}
