package org.openqa.selenium.devtools.network.types;

import java.util.Objects;

/**
 * Unique loader identifier
 */
public class LoaderId {

  private final String loaderId;

  public LoaderId(String loaderId) {
    this.loaderId = Objects.requireNonNull(loaderId, "LoaderId must be set.");
  }

  @Override
  public boolean equals(Object o) {
    if (!(o instanceof LoaderId)) {
      return false;
    }

    LoaderId that = (LoaderId) o;
    return Objects.equals(loaderId, that.loaderId);
  }

  @Override
  public int hashCode() {
    return Objects.hash(loaderId);
  }

  @Override
  public String toString() {
    return loaderId;
  }

  private static LoaderId fromJson(String loaderId) {
    return new LoaderId(loaderId);
  }

  private String toJson() {
    return loaderId;
  }

}
