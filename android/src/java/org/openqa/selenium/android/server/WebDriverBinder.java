package org.openqa.selenium.android.server;

import android.os.Binder;

public class WebDriverBinder extends Binder {
  private JettyService jettyService;
  
  public WebDriverBinder(JettyService service) {
    jettyService = service;
  }
  
  public JettyService getService() {
    return jettyService;
  }
}
