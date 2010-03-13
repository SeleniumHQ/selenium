/*
Copyright 2007-2009 WebDriver committers
Copyright 2007-2009 Google Inc.
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

package org.openqa.selenium.firefox;

import java.awt.Point;
import java.util.List;
import java.util.Map;

import com.google.common.collect.ImmutableMap;
import org.openqa.selenium.RenderedWebElement;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.internal.FindsByCssSelector;
import org.openqa.selenium.internal.Locatable;
import org.openqa.selenium.internal.WrapsElement;
import org.openqa.selenium.remote.DriverCommand;
import org.openqa.selenium.remote.RenderedRemoteWebElement;
import org.openqa.selenium.remote.Response;

public class FirefoxWebElement extends RenderedRemoteWebElement implements RenderedWebElement,
    Locatable, FindsByCssSelector {

    public FirefoxWebElement(FirefoxDriver parent) {
      setParent(parent);
    }

    public WebElement findElementByCssSelector(String using) {
      return findElement("css selector", using);
    }

    public List<WebElement> findElementsByCssSelector(String using) {
      return findElements("css selector", using);
    }

    public Point getLocationOnScreenOnceScrolledIntoView() {
            Response response = execute(DriverCommand.GET_ELEMENT_LOCATION_ONCE_SCROLLED_INTO_VIEW,
                ImmutableMap.of("id", getId()));

            @SuppressWarnings("unchecked")
            Map<String, Number> mapped = (Map<String, Number>) response.getValue();

            return new Point(mapped.get("x").intValue(), mapped.get("y").intValue());
    }

  @Override
  public boolean equals(Object obj) {
    if (!(obj instanceof WebElement)) {
      return false;
    }

    WebElement other = (WebElement) obj;
    if (other instanceof WrapsElement) {
      other = ((WrapsElement) obj).getWrappedElement();
    }

    if (!(other instanceof FirefoxWebElement)) {
      return false;
    }
    return getId().equals(((FirefoxWebElement)other).getId());
  }

  @Override
  public int hashCode() {
    return getId().hashCode();
  }
}
