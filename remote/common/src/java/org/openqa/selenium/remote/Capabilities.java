package org.openqa.selenium.remote;

import org.openqa.selenium.Platform;

public interface Capabilities {

  String getBrowserName();

  Platform getPlatform();

  String getVersion();

  boolean isJavascriptEnabled();
}
