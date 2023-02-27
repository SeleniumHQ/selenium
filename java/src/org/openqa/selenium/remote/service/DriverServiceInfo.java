package org.openqa.selenium.remote.service;

import java.io.File;
public interface DriverServiceInfo {
  default String getDriverName() {
    return null;
  }

  default String getDriverProperty() {
    return null;
  }

  default File getDriverExecutable() {
    return null;
  }
}
