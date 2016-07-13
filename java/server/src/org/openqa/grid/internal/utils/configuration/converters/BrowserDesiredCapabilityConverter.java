package org.openqa.grid.internal.utils.configuration.converters;

import com.beust.jcommander.IStringConverter;

import org.openqa.selenium.remote.DesiredCapabilities;

public class BrowserDesiredCapabilityConverter implements IStringConverter<DesiredCapabilities> {
  @Override
  public DesiredCapabilities convert(String value) {
    DesiredCapabilities capabilities = new DesiredCapabilities();
    for (String cap : value.split(",")) {
      String[] pieces = cap.split("=");
      if (pieces[0].equals("maxInstances")) {
        capabilities.setCapability(pieces[0], Integer.parseInt(pieces[1], 10));
      } else {
        capabilities.setCapability(pieces[0], pieces[1]);
      }
    }
    return capabilities;
  }
}
