package org.openqa.selenium.bidi.emulation;

import java.util.List;
import java.util.Map;

public class SetScreenSettingsOverrideParameters extends AbstractOverrideParameters {
  int height, width;

  public SetScreenSettingsOverrideParameters(Map<String, Integer> screenArea) {
    if (screenArea == null) {
      map.put("screenArea", null);
    } else if (!screenArea.containsKey("height") || !screenArea.containsKey("width")) {
      throw new IllegalArgumentException("screenArea must contain both 'height' and 'width' keys");
    } else {
      this.height = screenArea.get("height");
      this.width = screenArea.get("width");
      map.put("screenArea", screenArea);
    }
  }

  public int getHeight() {
    return height;
  }

  public int getWidth() {
    return width;
  }

  @Override
  public SetScreenSettingsOverrideParameters contexts(List<String> contexts) {
    super.contexts(contexts);
    return this;
  }

  @Override
  public SetScreenSettingsOverrideParameters userContexts(List<String> userContexts) {
    super.userContexts(userContexts);
    return this;
  }
}
