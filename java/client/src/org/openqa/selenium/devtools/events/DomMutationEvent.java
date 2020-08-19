package org.openqa.selenium.devtools.events;

import org.openqa.selenium.WebElement;

public class DomMutationEvent {

  private final WebElement element;
  private final String attributeName;
  private final String currentValue;
  private final String oldValue;

  public DomMutationEvent(WebElement element, String attributeName, String currentValue, String oldValue) {
    this.element = element;
    this.attributeName = attributeName;
    this.currentValue = currentValue;
    this.oldValue = oldValue;
  }

  public WebElement getElement() {
    return element;
  }

  public String getAttributeName() {
    return attributeName;
  }

  public String getCurrentValue() {
    return currentValue;
  }

  public String getOldValue() {
    return oldValue;
  }
}
