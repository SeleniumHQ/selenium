package org.openqa.selenium.remote;

import org.openqa.selenium.WebElement;
import org.openqa.selenium.By;
import org.openqa.selenium.SearchContext;
import org.openqa.selenium.internal.FindsByLinkText;
import org.openqa.selenium.internal.FindsById;
import org.openqa.selenium.internal.FindsByName;
import org.openqa.selenium.internal.FindsByClassName;
import org.openqa.selenium.internal.FindsByXPath;
import static org.openqa.selenium.remote.MapMaker.map;

import java.util.List;

public class RemoteWebElement implements WebElement, SearchContext,
    FindsByLinkText, FindsById, FindsByName, FindsByClassName, FindsByXPath {

  protected String id;
  protected RemoteWebDriver parent;

  public void setParent(RemoteWebDriver parent) {
    this.parent = parent;
  }

  public String getId() {
    return id;
  }

  public void setId(String id) {
    this.id = id;
  }

  public void click() {
    execute("clickElement", map("id", id));
  }

  public void submit() {
    execute("submitElement", map("id", id));
  }

  public String getValue() {
    return (String) execute("getElementValue", map("id", id)).getValue();
  }

  public void sendKeys(CharSequence... keysToSend) {
    execute("sendKeys", map("id", id, "value", keysToSend));
  }

  public void clear() {
    execute("clearElement", map("id", id));
  }

  public String getElementName() {
    return (String) execute("getElementName", map("id", id)).getValue();
  }

  public String getAttribute(String name) {
    Object value = execute("getElementAttribute", map("id", id, "name", name)).getValue();
    if (value == null) {
      return null;
    }
    return String.valueOf(value);
  }

  public boolean toggle() {
    return (Boolean) execute("toggleElement", map("id", id)).getValue();
  }

  public boolean isSelected() {
    return (Boolean) execute("isElementSelected", map("id", id)).getValue();
  }

  public void setSelected() {
    execute("setElementSelected", map("id", id));
  }

  public boolean isEnabled() {
    return (Boolean) execute("isElementEnabled", map("id", id)).getValue();
  }

  public String getText() {
    Response response = execute("getElementText", map("id", id));
    return (String) response.getValue();
  }

  public List<WebElement> getChildrenOfType(String tagName) {
    Response response = execute("getChildrenOfType", map("id", id, "name", tagName));
    return getElementsFrom(response);
  }

  public List<WebElement> findElements(By by) {
    return by.findElements(this);
  }

  public WebElement findElement(By by) {
    return by.findElement(this);
  }

 public WebElement findElementById(String using) {
    Response response = execute("findElementUsingElement", map("id", id, "using", "id", "value", using));
    return getElementFrom(response);
  }

  public List<WebElement> findElementsById(String using) {
    Response response = execute("findElementsUsingElement", map("id", id, "using", "id", "value", using));
    return getElementsFrom(response);
  }

  public WebElement findElementByLinkText(String using) {
    Response response = execute("findElementUsingElement", map("id", id, "using", "link text", "value", using));
    return getElementFrom(response);
  }

  public List<WebElement> findElementsByLinkText(String using) {
    Response response = execute("findElementsUsingElement", map("id", id, "using", "link text", "value", using));
    return getElementsFrom(response);
  }

  public WebElement findElementByName(String using) {
    Response response = execute("findElementUsingElement", map("id", id, "using", "name", "value", using));
    return getElementFrom(response);
  }

  public List<WebElement> findElementsByName(String using) {
    Response response = execute("findElementsUsingElement", map("id", id, "using", "name", "value", using));
    return getElementsFrom(response);
  }

  public WebElement findElementByClassName(String using) {
    Response response = execute("findElementUsingElement", map("id", id, "using", "class name", "value", using));
    return getElementFrom(response);
  }

  public List<WebElement> findElementsByClassName(String using) {
    Response response = execute("findElementsUsingElement", map("id", id, "using", "class name", "value", using));
    return getElementsFrom(response);
  }

  public WebElement findElementByXPath(String using) {
    Response response = execute("findElementUsingElement", map("id", id, "using", "xpath", "value", using));
    return getElementFrom(response);
  }

  public List<WebElement> findElementsByXPath(String using) {
    Response response = execute("findElementsUsingElement", map("id", id, "using", "xpath", "value", using));
    return getElementsFrom(response);
  }

  public WebElement findElementByPartialLinkText(String using) {
    throw new UnsupportedOperationException();
  }

  public List<WebElement> findElementsByPartialLinkText(String using) {
    throw new UnsupportedOperationException();
  }

  protected Response execute(String commandName, Object... parameters) {
    return parent.execute(commandName, parameters);
  }

  protected WebElement getElementFrom(Response response) {
    return parent.getElementFrom(response);
  }

  protected List<WebElement> getElementsFrom(Response response) {
    return parent.getElementsFrom(response);
  }
}
