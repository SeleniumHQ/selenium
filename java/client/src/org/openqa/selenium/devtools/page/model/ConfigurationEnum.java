package org.openqa.selenium.devtools.page.model;

import org.openqa.selenium.devtools.DevToolsException;

import java.util.Arrays;

public enum ConfigurationEnum {
  Mobile,
  Desktop;

  public static ConfigurationEnum getConfiguration(String val) {
    return Arrays.stream(ConfigurationEnum.values())
        .filter(c -> c.name().equalsIgnoreCase(val))
        .findFirst()
        .orElseThrow(() -> new DevToolsException(val + ", is not configuration value"));
  }
}
