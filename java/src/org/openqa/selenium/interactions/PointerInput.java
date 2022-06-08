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

import org.openqa.selenium.WebElement;
import org.openqa.selenium.WrapsElement;
import org.openqa.selenium.internal.Require;

import java.time.Duration;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.openqa.selenium.internal.Require.nonNegative;

/**
 * Models a <a href="https://www.w3.org/TR/webdriver/#dfn-pointer-input-source">pointer input
 * source</a>.
 */
public class PointerInput implements InputSource, Encodable {

  private final Kind kind;
  private final String name;

  public PointerInput(Kind kind, String name) {
    this.kind = Require.nonNull("Kind of pointer device", kind);
    this.name = Optional.ofNullable(name).orElse(UUID.randomUUID().toString());
  }

  @Override
  public String getName() {
    return this.name;
  }

  @Override
  public SourceType getInputType() {
    return SourceType.POINTER;
  }

  @Override
  public Map<String, Object> encode() {
    Map<String, Object> toReturn = new HashMap<>();

    toReturn.put("type", getInputType().getType());
    toReturn.put("id", name);

    Map<String, Object> parameters = new HashMap<>();
    parameters.put("pointerType", kind.getWireName());
    toReturn.put("parameters", parameters);

    return toReturn;
  }

  public Interaction createPointerMove(Duration duration, Origin origin, int x, int y) {
    return new Move(this, duration, origin, x, y);
  }

  public Interaction createPointerMove(Duration duration, Origin origin, int x, int y, PointerEventProperties eventProperties) {
    return new Move(this, duration, origin, x, y, eventProperties);
  }

  public Interaction createPointerDown(int button) {
    return new PointerPress(this, PointerPress.Direction.DOWN, button);
  }

  /**
   * @deprecated always use the method with the button
   */
  @Deprecated
  public Interaction createPointerDown(PointerEventProperties eventProperties) {
    return createPointerDown(0, eventProperties);
  }

  public Interaction createPointerDown(int button, PointerEventProperties eventProperties) {
    return new PointerPress(this, PointerPress.Direction.DOWN, button, eventProperties);
  }

  public Interaction createPointerUp(int button) {
    return new PointerPress(this, PointerPress.Direction.UP, button);
  }

  /**
   * @deprecated always use the method with the button
   */
  @Deprecated
  public Interaction createPointerUp(PointerEventProperties eventProperties) {
    return createPointerUp(0, eventProperties);
  }

  public Interaction createPointerUp(int button, PointerEventProperties eventProperties) {
    return new PointerPress(this, PointerPress.Direction.UP, button, eventProperties);
  }

  private static class PointerPress extends Interaction implements Encodable {

    private final Direction direction;
    private final int button;
    private final PointerEventProperties eventProperties;

    public PointerPress(InputSource source, Direction direction, int button) {
      super(source);

      if (button < 0) {
        throw new IllegalStateException(
            String.format("Button must be greater than or equal to 0: %d", button));
      }

      this.direction = Require.nonNull("Direction of move", direction);
      this.button = button;
      this.eventProperties = new PointerEventProperties();
    }

    /**
     * @deprecated always use the constructor with the button
     */
    @Deprecated
    public PointerPress(InputSource source, Direction direction, PointerEventProperties eventProperties) {
      this(source, direction, 0, eventProperties);
    }

    public PointerPress(InputSource source, Direction direction, int button, PointerEventProperties eventProperties) {
      super(source);
      this.button = button;
      this.eventProperties = Require.nonNull("pointer event properties", eventProperties);
      this.direction = Require.nonNull("Direction of press", direction);
    }

    @Override
    public Map<String, Object> encode() {
      Map<String, Object> toReturn = eventProperties.encode();

      toReturn.put("type", direction.getType());
      toReturn.put("button", button);

      return toReturn;
    }

    enum Direction {
      DOWN("pointerDown"),
      UP("pointerUp");

      private final String type;

      Direction(String type) {
        this.type = type;
      }

      public String getType() {
        return type;
      }
    }
  }

  private static class Move extends Interaction implements Encodable {

    private final Origin origin;
    private final int x;
    private final int y;
    private final Duration duration;
    private final PointerEventProperties eventProperties;

    protected Move(
        InputSource source,
        Duration duration,
        Origin origin,
        int x,
        int y,
      PointerEventProperties eventProperties) {
      super(source);

      this.origin = Require.nonNull("Origin of move", origin);
      this.x = x;
      this.y = y;
      this.duration = nonNegative(duration);
      this.eventProperties = Require.nonNull("pointer event properties", eventProperties);
    }

    protected Move(PointerInput source, Duration duration, Origin origin, int x, int y) {
      this(source, duration, origin, x, y, new PointerEventProperties());
    }

    @Override
    protected boolean isValidFor(SourceType sourceType) {
      return SourceType.POINTER == sourceType;
    }

    @Override
    public Map<String, Object> encode() {
      Map<String, Object> toReturn = eventProperties.encode();

      toReturn.put("type", "pointerMove");
      toReturn.put("duration", duration.toMillis());
      toReturn.put("origin", origin.asArg());

      toReturn.put("x", x);
      toReturn.put("y", y);

      return toReturn;
    }
  }

  public enum Kind {
    MOUSE("mouse"),
    PEN("pen"),
    TOUCH("touch"),;

    private final String wireName;


    Kind(String pointerSubType) {
      this.wireName = pointerSubType;
    }

    public String getWireName() {
      return wireName;
    }
  }

  public enum MouseButton {
    LEFT(0),
    MIDDLE(1),
    RIGHT(2),
    BACK(3),
    FORWARD(4),
    ;

    private final int button;

    MouseButton(int button) {
      this.button = button;
    }

    public int asArg() {
      return button;
    }
  }

  public static final class Origin {
    private final Object originObject;

    public Object asArg() {
      Object arg = originObject;
      while (arg instanceof WrapsElement) {
        arg = ((WrapsElement) arg).getWrappedElement();
      }
      return arg;
    }

    private Origin(Object originObject) {
      this.originObject = originObject;
    }

    public static Origin pointer() {
      return new Origin("pointer");
    }

    public static Origin viewport() {
      return new Origin("viewport");
    }

    public static Origin fromElement(WebElement element) {
      return new Origin(Require.nonNull("Element", element));
    }
  }

  public static PointerEventProperties eventProperties() {
    return new PointerEventProperties();
  }

  public static class PointerEventProperties implements Encodable {
    private Float width = null;
    private Float height = null;
    private Float pressure = null;
    private Float tangentialPressure = null;
    private Integer tiltX = null;
    private Integer tiltY = null;
    private Integer twist = null;
    private Float altitudeAngle = null;
    private Float azimuthAngle = null;

    public PointerEventProperties setWidth(float width) {
      Require.nonNull("width", width);
      if (width < 0) {
        throw new IllegalArgumentException("Width must be a positive Number");
      }
      this.width = width;
      return this;
    }

    public PointerEventProperties setHeight(float height) {
      Require.nonNull("height", height);
      if (height < 0) {
        throw new IllegalArgumentException("Height must be a positive Number");
      }
      this.height = height;
      return this;
    }

    public PointerEventProperties setPressure(float pressure) {
      Require.nonNull("pressure", pressure);
      if (pressure < 0 || pressure > 1) {
        throw new IllegalArgumentException("pressure must be a number between 0 and 1");
      }
      this.pressure = pressure;
      return this;
    }

    public PointerEventProperties setTangentialPressure(float tangentialPressure) {
      Require.nonNull("tangentialPressure", tangentialPressure);
      if (tangentialPressure < -1 || tangentialPressure > 1) {
        throw new IllegalArgumentException("tangentialPressure must be a Number between -1 and 1");
      }
      this.tangentialPressure = tangentialPressure;
      return this;
    }

    public PointerEventProperties setTiltX(int tiltX) {
      Require.nonNull("tiltX", tiltX);
      if (tiltX < -90 || tiltX > 90) {
        throw new IllegalArgumentException("tiltX must be an integer between -90 and 90");
      }
      this.tiltX = tiltX;
      return this;
    }

    public PointerEventProperties setTiltY(int tiltY) {
      Require.nonNull("tiltY", tiltY);
      if (tiltY < -90 || tiltY > 90) {
        throw new IllegalArgumentException("tiltY must be an integer between -90 and 90");
      }
      this.tiltY = tiltY;
      return this;
    }

    public PointerEventProperties setTwist(int twist) {
      Require.nonNull("twist", twist);
      if (twist < 0 || twist > 359) {
        throw new IllegalArgumentException("twist must be an integer between 0 and 359");
      }
      this.twist = twist;
      return this;
    }

    public PointerEventProperties setAltitudeAngle(float altitudeAngle) {
      Require.nonNull("altitudeAngle", altitudeAngle);
      if (altitudeAngle < 0 || altitudeAngle > Math.PI / 2) {
        throw new IllegalArgumentException("altitudeAngle must be a number between 0 and π/2");
      }
      this.altitudeAngle = altitudeAngle;
      return this;
    }

    public PointerEventProperties setAzimuthAngle(float azimuthAngle) {
      Require.nonNull("azimuthAngle", azimuthAngle);
      if (azimuthAngle < 0 || azimuthAngle > Math.PI * 2) {
        throw new IllegalArgumentException("azimuthAngle must be a number between 0 and 2π");
      }
      this.azimuthAngle = azimuthAngle;
      return this;
    }

    @Override
    public Map<String, Object> encode() {
      Map<String, Object> toReturn = new HashMap<>();
      Optional.ofNullable(width).ifPresent(v -> toReturn.put("width", v));
      Optional.ofNullable(height).ifPresent(v -> toReturn.put("height", v));
      Optional.ofNullable(pressure).ifPresent(v -> toReturn.put("pressure", v));
      Optional.ofNullable(tangentialPressure).ifPresent(v -> toReturn.put("tangentialPressure", v));
      Optional.ofNullable(tiltX).ifPresent(v -> toReturn.put("tiltX", v));
      Optional.ofNullable(tiltY).ifPresent(v -> toReturn.put("tiltY", v));
      Optional.ofNullable(twist).ifPresent(v -> toReturn.put("twist", v));
      Optional.ofNullable(altitudeAngle).ifPresent(v -> toReturn.put("altitudeAngle", v));
      Optional.ofNullable(azimuthAngle).ifPresent(v -> toReturn.put("azimuthAngle", v));

      return toReturn;
    }
  }
}
