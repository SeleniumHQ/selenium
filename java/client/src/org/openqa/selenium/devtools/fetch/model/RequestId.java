package org.openqa.selenium.devtools.fetch.model;

import java.util.Objects;

public class RequestId {

  private final String id;

  private RequestId(String id) {
    this.id = Objects.requireNonNull(id);
  }

  private static RequestId fromJson(String id) {
    return new RequestId(id);
  }

  private String toJson() {
    return id;
  }
}
