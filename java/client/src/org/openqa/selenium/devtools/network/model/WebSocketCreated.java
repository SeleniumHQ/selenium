package org.openqa.selenium.devtools.network.model;

import static java.util.Objects.requireNonNull;

import org.openqa.selenium.json.JsonInput;

public class WebSocketCreated {

  /**
   * request identifier
   */
  private final RequestId requestId;

  /**
   * WebSocket request Url
   */
  private final String url;

  /**
   * Request initiator.
   * Optional
   */
  private final Initiator initiator;


  public RequestId getRequestId() {
    return requestId;
  }

  public String getUrl() {
    return url;
  }

  public Initiator getInitiator() {
    return initiator;
  }

  private WebSocketCreated(RequestId requestId, String url,
                           Initiator initiator) {
    this.requestId = requireNonNull(requestId, "'requestId' is required for WebSocketCreated");
    this.url = requireNonNull(url, "'url' is required for WebSocketCreated");
    this.initiator = initiator;
  }

  public static WebSocketCreated fromJson(JsonInput input) {
    RequestId requestId = new RequestId(input.nextString());
    String url = null;
    Initiator initiator = null;

    while (input.hasNext()) {
      switch (input.nextName()) {
        case "url":
          url = input.nextString();
          break;
        case "initiator":
          initiator = Initiator.parseInitiator(input);
          break;
        default:
          input.skipValue();
          break;
      }
    }
    return new WebSocketCreated(requestId, url, initiator);
  }
}
