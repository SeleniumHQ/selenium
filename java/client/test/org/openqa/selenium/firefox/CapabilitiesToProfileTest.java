package org.openqa.selenium.firefox;

import static org.junit.Assert.assertTrue;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.JUnit4;
import org.openqa.selenium.remote.CapabilityType;
import org.openqa.selenium.remote.DesiredCapabilities;

/**
 * Tests translation of capability to profile setting.
 */
@RunWith(JUnit4.class)
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
