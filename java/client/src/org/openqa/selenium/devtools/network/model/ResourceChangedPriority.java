package org.openqa.selenium.devtools.network.model;

import org.openqa.selenium.json.JsonInput;

/**
 * Object for storing Network.resourceChangedPriority response
 */
public class ResourceChangedPriority {

  /**
   * Request identifier
   */
  private final RequestId requestId;

  /**
   * Total number of bytes received for this request
   */
  private final ResourcePriority newPriority;

  /**
   * MonotonicTime
   */
  private final MonotonicTime timestamp;

  private ResourceChangedPriority(RequestId requestId,
                                  ResourcePriority newPriority, MonotonicTime timestamp) {
    this.requestId = requestId;
    this.newPriority = newPriority;
    this.timestamp = timestamp;
  }

  private static ResourceChangedPriority fromJson(JsonInput input) {
    RequestId requestId = new RequestId(input.nextString());
    ResourcePriority newPriority = null;
    MonotonicTime timestamp = null;

    while (input.hasNext()) {

      switch (input.nextName()) {
        case "newPriority":
          newPriority = ResourcePriority.valueOf(input.nextString());
          break;

        case "timestamp":
          timestamp = MonotonicTime.parse(input.nextNumber());
          break;

        default:
          input.skipValue();
          break;
      }
    }

    return new ResourceChangedPriority(requestId, newPriority, timestamp);
  }

  public RequestId getRequestId() {
    return requestId;
  }

  public ResourcePriority getNewPriority() {
    return newPriority;
  }

  public MonotonicTime getTimestamp() {
    return timestamp;
  }

  @Override
  public String toString() {
    return "ResourceChangedPriority{" +
           "requestId=" + requestId +
           ", newPriority=" + newPriority +
           ", timestamp=" + timestamp.getTimeStamp().toString() +
           '}';
  }

}
