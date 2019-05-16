package org.openqa.selenium.devtools.network.events;

import org.openqa.selenium.devtools.network.types.Initiator;
import org.openqa.selenium.devtools.network.types.RequestId;
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

  public WebSocketCreated(RequestId requestId, String url,
                          Initiator initiator) {
    this.requestId = requestId;
    this.url = url;
    this.initiator = initiator;
  }

  public static WebSocketCreated fromJson(JsonInput input){
    RequestId requestId = new RequestId(input.nextString());
    String url = null;
    Initiator initiator = null;

    while (input.hasNext()){
      switch (input.nextName()) {
        case "url" :
          url = input.nextString();
          break;
        case "initiator" :
          initiator = Initiator.parseInitiator(input);
          break;
        default:
          input.skipValue();
          break;
      }
    }
    return new WebSocketCreated(requestId,url,initiator);
  }
}
