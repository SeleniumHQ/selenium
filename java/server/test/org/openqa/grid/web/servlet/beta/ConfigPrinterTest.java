package org.openqa.grid.web.servlet.beta;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNull;

import org.junit.Test;

public class ConfigPrinterTest {

  @Test
  public void thatNullConfigValueReturnsNull() {
    assertNull(ConfigPrinter.printConfigValue(null, null));
  }

  @Test
  public void thatTimeoutIsReturnedInSeconds() {
    String timeout = ConfigPrinter.printConfigValue("timeout", "30000");
    assertEquals("30s", timeout);
  }

  @Test
  public void thatBrowserTimeoutIsReturnedInSeconds() {
    String timeout = ConfigPrinter.printConfigValue("browserTimeout", "30000");
    assertEquals("30s", timeout);
  }

  @Test
  public void thatConfigValueIsNotChanged() {
    String maxSession = ConfigPrinter.printConfigValue("maxSession", "1");
    assertEquals("1", maxSession);
  }
}
