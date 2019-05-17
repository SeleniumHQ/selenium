package org.openqa.selenium.devtools.network.model;

import static java.util.Objects.requireNonNull;

import org.openqa.selenium.json.JsonInput;

public class ResponseReceived {

  /**
   * Request identifier.
   */
  private final RequestId requestId;

  /**
   * Loader identifier. Empty string if the request is fetched from worker.
   */
  private final LoaderId loaderId;

  /**
   * TimeStamp
   */
  private final MonotonicTime timestamp;


  /**
   * Resource Type
   */
  private final ResourceType type;

  /**
   * Response data.
   */
  private final Response response;

  /**
   * Frame identifier.
   * Optional
   */
  private final String frameId;

  private ResponseReceived(RequestId requestId,
                           LoaderId loaderId,
                           MonotonicTime timestamp,
                           ResourceType type,
                           Response response, String frameId) {
    this.requestId = requireNonNull(requestId, "'requestId' is required for ResponseReceived");
    this.loaderId = requireNonNull(loaderId, "'loaderId' is required for ResponseReceived");
    this.timestamp = requireNonNull(timestamp, "'timestamp' is required for ResponseReceived");
    this.type = requireNonNull(type, "'type' is required for ResponseReceived");
    this.response = requireNonNull(response, "'response' is required for ResponseReceived");
    this.frameId = frameId;

  }

  public static ResponseReceived fromJson(JsonInput input) {
    RequestId requestId = new RequestId(input.nextString());
    LoaderId loaderId = null;
    MonotonicTime timestamp = null;
    ResourceType type = null;
    Response response = null;
    String frameId = null;
    while (input.hasNext()) {
      switch (input.nextName()) {
        case "loaderId":
          loaderId = new LoaderId(input.nextString());
          break;
        case "monotonicTime":
          timestamp = MonotonicTime.parse(input.nextNumber());
          break;
        case "response":
          response = Response.parseResponse(input);
          break;
        case "type":
          type = ResourceType.valueOf(input.nextString());
          break;
        case "frameId":
          frameId = input.nextString();
          break;
        default:
          input.skipValue();
          break;
      }
    }
    return new ResponseReceived(requestId, loaderId, timestamp, type, response, frameId);
  }

  public RequestId getRequestId() {
    return requestId;
  }

  public LoaderId getLoaderId() {
    return loaderId;
  }

  public MonotonicTime getTimestamp() {
    return timestamp;
  }

  public ResourceType getType() {
    return type;
  }

  public Response getResponse() {
    return response;
  }

  public String getFrameId() {
    return frameId;
  }

  @Override
  public String toString() {
    return "ResponseReceived{" +
           "requestId=" + requestId +
           ", loaderId=" + loaderId +
           ", timestamp=" + timestamp.getTimeStamp().toString() +
           ", type=" + type +
           ", response=" + response +
           ", frameId='" + frameId + '\'' +
           '}';
  }
}
