// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

package org.openqa.selenium.interactions;

import static org.openqa.selenium.internal.Require.nonNegative;

import java.time.Duration;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import org.openqa.selenium.Point;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.WrapsElement;
import org.openqa.selenium.internal.Require;

/**
 * Models a <a href="https://www.w3.org/TR/webdriver/#dfn-wheel-input-source">wheel input
 * source</a>.
 */
public class WheelInput implements InputSource, Encodable {

  private final String name;

  public WheelInput(String name) {
    this.name = Optional.ofNullable(name).orElse(UUID.randomUUID().toString());
  }

  @Override
  public String getName() {
    return this.name;
  }

  @Override
  public SourceType getInputType() {
    return SourceType.WHEEL;
  }

  public Interaction createScroll(
      int x, int y, int deltaX, int deltaY, Duration duration, ScrollOrigin origin) {
    return new ScrollInteraction(this, x, y, deltaX, deltaY, duration, origin);
  }

  public Interaction createScroll(
      Point start, int deltaX, int deltaY, Duration duration, ScrollOrigin origin) {
    return createScroll(start.x, start.y, deltaX, deltaY, duration, origin);
  }

  @Override
  public Map<String, Object> encode() {
    Map<String, Object> toReturn = new HashMap<>();

    toReturn.put("type", getInputType().getType());
    toReturn.put("id", this.name);

    return toReturn;
  }

  static class ScrollInteraction extends Interaction implements Encodable {

    private final int x;
    private final int y;
    private final int deltaX;
    private final int deltaY;
    private final Duration duration;
    private final ScrollOrigin origin;

    protected ScrollInteraction(
        InputSource source,
        int x,
        int y,
        int deltaX,
        int deltaY,
        Duration duration,
        ScrollOrigin origin) {
      super(source);

      this.x = x;
      this.y = y;
      this.deltaX = deltaX;
      this.deltaY = deltaY;
      this.duration = nonNegative(duration);
      this.origin = Require.nonNull("Origin of scroll", origin);
    }

    @Override
    public Map<String, Object> encode() {
      Map<String, Object> toReturn = new HashMap<>();

      toReturn.put("type", "scroll");
      toReturn.put("x", x);
      toReturn.put("y", y);
      toReturn.put("deltaX", deltaX);
      toReturn.put("deltaY", deltaY);
      toReturn.put("duration", duration.toMillis());
      toReturn.put("origin", origin.asArg());

      return toReturn;
    }
  }

  public static final class ScrollOrigin {
    private final Object originObject;
    private int xOffset = 0;
    private int yOffset = 0;

    public Object asArg() {
      Object arg = originObject;
      while (arg instanceof WrapsElement) {
        arg = ((WrapsElement) arg).getWrappedElement();
      }
      return arg;
    }

    private ScrollOrigin(Object originObject, int xOffset, int yOffset) {
      this.originObject = originObject;
      this.xOffset = xOffset;
      this.yOffset = yOffset;
    }

    public static ScrollOrigin fromViewport() {
      return new ScrollOrigin("viewport", 0, 0);
    }

    public static ScrollOrigin fromViewport(int xOffset, int yOffset) {
      return new ScrollOrigin(
          "viewport", Require.nonNull("xOffset", xOffset), Require.nonNull("yOffset", yOffset));
    }

    public static ScrollOrigin fromElement(WebElement element) {
      return new ScrollOrigin(Require.nonNull("Element", element), 0, 0);
    }

    public static ScrollOrigin fromElement(WebElement element, int xOffset, int yOffset) {
      return new ScrollOrigin(
          Require.nonNull("Element", element),
          Require.nonNull("xOffset", xOffset),
          Require.nonNull("yOffset", yOffset));
    }

    public int getxOffset() {
      return xOffset;
    }

    public int getyOffset() {
      return yOffset;
    }
  }
}
