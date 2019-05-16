package org.openqa.selenium.devtools.network.model;

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

  public WebSocketClosed(RequestId requestId,
                         MonotonicTime timeStamp) {
    this.requestId = requestId;
    this.timestamp = timeStamp;
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
