package org.openqa.selenium.os;

import org.openqa.selenium.WebDriverException;

@SuppressWarnings("serial")
public class WindowsRegistryException extends WebDriverException {
  WindowsRegistryException(Exception e) {
    super(generateMessage(), e);
  }

  private static String generateMessage() {
    return "Problem while managing the registry, OS Version '" +
           System.getProperty("os.version") + "', regVersion1 = " + WindowsUtils.regVersion1;
  }

  WindowsRegistryException(String message) {
    this(new RuntimeException(message));
  }
}
