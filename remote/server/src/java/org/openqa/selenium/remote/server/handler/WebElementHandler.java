package org.openqa.selenium.remote.server.handler;

import org.openqa.selenium.WebElement;
import org.openqa.selenium.remote.server.DriverSessions;

public abstract class WebElementHandler extends WebDriverHandler {
  private String elementId;
  
  public WebElementHandler(DriverSessions sessions) {
    super(sessions);
  }
  
  public void setId(String elementId) {
    this.elementId = elementId;
  }
  
  protected WebElement getElement() {
    return getKnownElements().get(elementId);  
  }
  
  protected String getElementAsString() {
    try {
      return elementId + " " + String.valueOf(getElement());
    } catch (RuntimeException e) {
      // Be paranoid!
    }
    
    return elementId + " unknown";
  }
}
