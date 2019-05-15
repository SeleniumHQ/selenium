package org.openqa.selenium.devtools.network.types;

import java.util.Objects;

/**
 * Unique request identifier
 */
public class RequestId {

  private final String requestId;

  public RequestId(String requestId) {
    this.requestId = Objects.requireNonNull(requestId, "RequestId must be set.");
  }

  @Override
  public boolean equals(Object o) {
    if (!(o instanceof RequestId)) {
      return false;
    }

    RequestId that = (RequestId) o;
    return Objects.equals(requestId, that.requestId);
  }

  @Override
  public int hashCode() {
    return Objects.hash(requestId);
  }

  @Override
  public String toString() {
    return requestId;
  }

  private static RequestId fromJson(String requestId) {
    return new RequestId(requestId);
  }

  private String toJson() {
    return requestId;
  }

}
