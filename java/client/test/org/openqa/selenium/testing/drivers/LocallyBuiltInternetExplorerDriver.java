// Copyright 2012 Google Inc. All Rights Reserved.

package org.openqa.selenium.testing.drivers;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.ie.InternetExplorerDriver;
import org.openqa.selenium.ie.InternetExplorerDriverService;
import org.openqa.selenium.testing.InProject;

/**
 * @author eranm@google.com (Eran Messeri)
 */
public class LocallyBuiltInternetExplorerDriver extends InternetExplorerDriver {
  public LocallyBuiltInternetExplorerDriver(Capabilities capabilities) {
    super(getService(), capabilities);
  }

  private static InternetExplorerDriverService getService() {
    InternetExplorerDriverService.Builder builder =
        new InternetExplorerDriverService.Builder().usingDriverExecutable(
            InProject.locate("build\\cpp\\Win32\\Release\\IEDriverServer.exe"));
    return builder.build();
  }
}
