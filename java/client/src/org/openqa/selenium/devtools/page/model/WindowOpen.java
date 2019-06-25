package org.openqa.selenium.devtools.page.model;

import org.openqa.selenium.devtools.DevToolsException;
import org.openqa.selenium.json.JsonInput;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

public class WindowOpen {

  /**
   * The URL for the new window.
   */
  private final String url;
  /**
   * Window name.
   */
  private final String windowName;
  /**
   * An array of enabled window features.
   */
  private final List<String> windowFeatures;
  /**
   * Whether or not it was triggered by user gesture.
   */
  private final boolean userGesture;

  public WindowOpen(String url, String windowName, List<String> windowFeatures,
                    boolean userGesture) {
    this.url = Objects.requireNonNull(url, "url is required");
    this.windowName = Objects.requireNonNull(windowName, "windowName is required");
    this.windowFeatures = validateWindowFeatures(windowFeatures);
    this.userGesture = userGesture;
  }

  private static WindowOpen fromJson(JsonInput input) {
    String url = input.nextString(), windowName = null;
    List<String> windowFeatures = null;
    Boolean userGesture = null;
    while (input.hasNext()) {
      switch (input.nextName()) {
        case "windowName":
          windowName = input.nextString();
          break;
        case "windowFeatures":
          windowFeatures = new ArrayList<>();
          input.beginArray();
          while (input.hasNext()) {
            windowFeatures.add(input.nextString());
          }
          input.endArray();
          break;
        case "userGesture":
          userGesture = input.nextBoolean();
          break;
        default:
          input.skipValue();
          break;
      }
    }
    return new WindowOpen(url, windowName, windowFeatures, userGesture);
  }

  private List<String> validateWindowFeatures(List<String> windowFeatures) {
    Objects.requireNonNull(windowFeatures, "windowFeatures is required");
    if (windowFeatures.isEmpty()) {
      throw new DevToolsException("windowFeature is empty");
    }
    return windowFeatures;
  }
}
