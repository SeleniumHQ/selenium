package org.openqa.selenium.firefox;

import org.junit.Test;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.remote.CapabilityType;
import org.openqa.selenium.remote.DesiredCapabilities;

import static org.junit.Assert.assertTrue;

/**
 * Tests translation of capability to profile setting.
 */
public class CapabilitiesToProfileTest {
  @Test
  public void setsNativeEventsPrefOnProfile() {
    DesiredCapabilities caps = DesiredCapabilities.firefox();
    caps.setCapability(CapabilityType.HAS_NATIVE_EVENTS, true);

    FirefoxProfile profile = new FirefoxProfile();
    FirefoxDriver.populateProfile(profile, caps);
    assertTrue("Native events were enabled as capability, should be set on profile.",
        profile.areNativeEventsEnabled());
  }

}
