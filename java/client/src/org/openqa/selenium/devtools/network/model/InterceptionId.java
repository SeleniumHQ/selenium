package org.openqa.selenium.devtools.network.model;

import java.util.Objects;

/**
 * Unique intercepted request identifier
 */
public class InterceptionId {

  private final String interceptionId;

  public InterceptionId(String interceptionId) {
    this.interceptionId = Objects.requireNonNull(interceptionId, "InterceptionId must be set.");
  }

  @Override
  public boolean equals(Object o) {
    if (!(o instanceof InterceptionId)) {
      return false;
    }

    InterceptionId that = (InterceptionId) o;
    return Objects.equals(interceptionId, that.interceptionId);
  }

  @Override
  public int hashCode() {
    return Objects.hash(interceptionId);
  }

  @Override
  public String toString() {
    return interceptionId;
  }

}
