package org.openqa.selenium.remote;

import org.openqa.selenium.internal.OperatingSystem;

public interface Capabilities {

  String getBrowserName();

  OperatingSystem getOperatingSystem();

  String getVersion();

  boolean isJavascriptEnabled();
}
