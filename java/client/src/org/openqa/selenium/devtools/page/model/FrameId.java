package org.openqa.selenium.devtools.page.model;

import java.util.Objects;

public class FrameId {

  private final String id;

  private FrameId(String id) {
    this.id = Objects.requireNonNull(id);
  }

  public String getId() {
    return id;
  }

  private static FrameId fromJson(String id) {
    return new FrameId(id);
  }
}
