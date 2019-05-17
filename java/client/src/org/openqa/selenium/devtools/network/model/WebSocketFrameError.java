package org.openqa.selenium.devtools.network.model;

import static java.util.Objects.requireNonNull;

import org.openqa.selenium.json.JsonInput;

public class WebSocketFrameError {

  /**
   * request identifier
   */
  private final RequestId requestId;

  /**
   * TimeStamp
   */
  private final MonotonicTime monotonicTime;

  /**
   * WebSocket Error Message
   */
  private final String errorMessage;


  private WebSocketFrameError(RequestId requestId,
                              MonotonicTime monotonicTime,
                              String errorMessage) {
    this.requestId = requireNonNull(requestId, "'requestId' is required for WebSocketFrameError");
    this.monotonicTime =
        requireNonNull(monotonicTime, "'monotonicTime' is required for WebSocketFrameError");
    this.errorMessage =
        requireNonNull(errorMessage, "'errorMessage' is required for WebSocketFrameError");
  }

  public static WebSocketFrameError fromJson(JsonInput input) {
    RequestId requestId = new RequestId(input.nextString());
    MonotonicTime monotonicTime = null;
    String errorMessage = null;
    while (input.hasNext()) {
      switch (input.nextName()) {
        case "monotonicTime":
          monotonicTime = MonotonicTime.parse(input.nextNumber());
          break;
        case "errorMessage":
          errorMessage = input.nextString();
          break;
        default:
          input.skipValue();
          break;
      }
    }
    return new WebSocketFrameError(requestId, monotonicTime, errorMessage);
  }
}
