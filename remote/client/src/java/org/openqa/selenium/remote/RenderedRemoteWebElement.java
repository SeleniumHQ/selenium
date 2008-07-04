// Copyright 2008 Google Inc.  All Rights Reserved.

package org.openqa.selenium.remote;

import org.openqa.selenium.RenderedWebElement;
import org.openqa.selenium.SearchContext;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.By;
import org.openqa.selenium.internal.FindsByXPath;
import org.openqa.selenium.internal.FindsByLinkText;
import org.openqa.selenium.internal.FindsById;
import org.openqa.selenium.internal.FindsByName;
import org.openqa.selenium.internal.FindsByClassName;
import static org.openqa.selenium.remote.MapMaker.map;

import java.awt.*;
import java.util.*;
import java.util.List;

public class RenderedRemoteWebElement extends RemoteWebElement implements RenderedWebElement {
  public boolean isDisplayed() {
    Response response = parent.execute("isElementDisplayed", map("id", id));
    return (Boolean) response.getValue();
  }

  @SuppressWarnings({"unchecked"})
  public Point getLocation() {
    Response response = parent.execute("getElementLocation", map("id", id));
    Map<String, Object> rawPoint = (Map<String, Object>) response.getValue();
    int x = (Integer) rawPoint.get("x");
    int y = (Integer) rawPoint.get("y");
    return new Point(x, y);
  }

  @SuppressWarnings({"unchecked"})
  public Dimension getSize() {
    Response response = parent.execute("getElementSize", map("id", id));
    Map<String, Object> rawSize = (Map<String, Object>) response.getValue();
    int width = (Integer) rawSize.get("width");
    int height = (Integer) rawSize.get("height");
    return new Dimension(width, height);
  }

  public void dragAndDropBy(int moveRightBy, int moveDownBy) {
    parent.execute("dragElement", map("id", id), moveRightBy, moveDownBy);
  }

  public void dragAndDropOn(RenderedWebElement element) {
    Point currentLocation = getLocation();
    Point destination = element.getLocation();
    dragAndDropBy(destination.x - currentLocation.x, destination.y - currentLocation.y);
  }

  public String getValueOfCssProperty(String propertyName) {
    Response response = parent.execute("getValueOfCssProperty", map("id", id, "propertyName", propertyName));
    return (String) response.getValue();
  }
}
