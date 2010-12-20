/*
Copyright 2007-2010 WebDriver committers
Copyright 2007-2010 Google Inc.
Portions copyright 2007 ThoughtWorks, Inc

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
 */

package org.openqa.selenium.ie;

import java.awt.Point;
import java.util.List;
import java.util.Map;

import org.openqa.selenium.Keys;
import org.openqa.selenium.RenderedWebElement;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.internal.FindsByCssSelector;
import org.openqa.selenium.internal.Locatable;
import org.openqa.selenium.remote.DriverCommand;
import org.openqa.selenium.remote.RenderedRemoteWebElement;
import org.openqa.selenium.remote.Response;

import com.google.common.collect.ImmutableMap;

public class InternetExplorerElement extends RenderedRemoteWebElement implements RenderedWebElement, Locatable, FindsByCssSelector {
  public InternetExplorerElement(InternetExplorerDriver parent) {
    setParent(parent);
  }
  
  public WebElement findElementByCssSelector(String cssSelector) {
    return findElement("css selector", cssSelector);
  }

  public List<WebElement> findElementsByCssSelector(String cssSelector) {
    return findElements("css selector", cssSelector);
  }
  
  protected WebElement findElement(String using, String value) {
    Response response = execute(DriverCommand.FIND_CHILD_ELEMENT,
        ImmutableMap.of("id", id, "using", using, "value", value));
    return (WebElement) response.getValue();
  }

  @SuppressWarnings("unchecked")
  protected List<WebElement> findElements(String using, String value) {
    Response response = execute(DriverCommand.FIND_CHILD_ELEMENTS,
        ImmutableMap.of("id", id, "using", using, "value", value));
    return (List<WebElement>) response.getValue();
  }
  
  public Point getLocationOnScreenOnceScrolledIntoView() {
    Response response = execute(DriverCommand.GET_ELEMENT_LOCATION_ONCE_SCROLLED_INTO_VIEW,
        ImmutableMap.of("id", getId()));

    @SuppressWarnings("unchecked")
    Map<String, Number> mapped = (Map<String, Number>) response.getValue();

    return new Point(mapped.get("x").intValue(), mapped.get("y").intValue());
  }
}
