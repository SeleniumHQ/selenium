package org.openqa.selenium.devtools.page.model;

import org.openqa.selenium.Beta;
import org.openqa.selenium.devtools.DevToolsException;

import java.util.Arrays;

@Beta
public enum TransferMode {
  ReturnAsBase64,
  ReturnAsStream;

  public static TransitionType getTransferMode(String val) {
    return Arrays.asList(TransitionType.values()).stream()
        .filter(t -> t.name().equalsIgnoreCase(val))
        .findFirst()
        .orElseThrow(() -> new DevToolsException("Given value " + val + ", is not valid"));
  }
}
