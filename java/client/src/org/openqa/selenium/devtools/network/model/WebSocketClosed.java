package org.openqa.selenium.devtools.network.model;

import static java.util.Objects.requireNonNull;

import org.openqa.selenium.json.JsonInput;

public class WebSocketClosed {

  /**
   * Request identifier.
   */
  private final RequestId requestId;
  /**
   * timeStamp
   */
  private final MonotonicTime timestamp;

  private WebSocketClosed(RequestId requestId,
                          MonotonicTime timeStamp) {
    this.requestId = requireNonNull(requestId, "'requestId' is required for WebSocketClosed");
    this.timestamp = requireNonNull(timeStamp, "'timestamp' is required for WebSocketClosed");
  }

  public RequestId getRequestId() {
    return requestId;
  }

  public MonotonicTime getTimestamp() {
    return timestamp;
  }

  public static WebSocketClosed fromJson(JsonInput input){
    RequestId requestId = new RequestId(input.nextString());
    MonotonicTime timestamp = null;
    while (input.hasNext()){
      switch (input.nextName()){
        case "timestamp":
          timestamp = MonotonicTime.parse(input.nextNumber());
          break;
        default:
          input.skipValue();
          break;
      }
    }
    return new WebSocketClosed(requestId,timestamp);
  }
}
