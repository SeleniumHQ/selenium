package org.openqa.selenium.bidi.browser;

import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class SetDownloadBehaviorParameters {
  private final Map<String, Object> map = new HashMap<>();

  public SetDownloadBehaviorParameters(Boolean allowed, String destinationFolder) {
    this(allowed, destinationFolder != null ? Paths.get(destinationFolder) : null);
  }

  public SetDownloadBehaviorParameters(Boolean allowed, Path destinationFolder) {
    if (allowed == null) {
      map.put("downloadBehavior", null);
    } else if (allowed) {
      if (destinationFolder == null) {
        throw new IllegalArgumentException("destinationFolder is required when allowed is true");
      }
      Map<String, String> behavior = new HashMap<>();
      behavior.put("type", "allowed");
      behavior.put("destinationFolder", destinationFolder.toAbsolutePath().toString());
      map.put("downloadBehavior", behavior);
    } else {
      if (destinationFolder != null) {
        throw new IllegalArgumentException(
            "destinationFolder should not be provided when allowed is false");
      }
      Map<String, String> behavior = new HashMap<>();
      behavior.put("type", "denied");
      map.put("downloadBehavior", behavior);
    }
  }

  public SetDownloadBehaviorParameters userContexts(List<String> userContexts) {
    map.put("userContexts", userContexts);
    return this;
  }

  public Map<String, Object> toMap() {
    return map;
  }
}
