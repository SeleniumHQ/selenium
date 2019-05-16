package org.openqa.selenium.devtools.network.model;

import org.openqa.selenium.devtools.Runtime;
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
  private final Runtime.Timestamp monotonicTime;


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

  public ResponseReceived(RequestId requestId,
                          LoaderId loaderId,
                          Runtime.Timestamp monotonicTime,
                          ResourceType type,
                          Response response, String frameId) {
    this.requestId = requestId;
    this.loaderId = loaderId;
    this.monotonicTime = monotonicTime;
    this.type = type;
    this.response = response;
    this.frameId = frameId;

  }

  public static ResponseReceived fromJson(JsonInput input){
    RequestId requestId = new RequestId(input.nextString());
    LoaderId loaderId = null;
    Runtime.Timestamp monotonicTime = null;
    ResourceType type = null;
    Response response = null;
    String frameId = null;
    while (input.hasNext()){
      switch (input.nextName()){
        case "loaderId" :
          loaderId = new LoaderId(input.nextString());
          break;
        case "monotonicTime":
          monotonicTime = Runtime.Timestamp.fromJson(input.nextNumber());
          break;
        case "response":
          response = Response.parseResponse(input);
          break;
        case "type":
          type = ResourceType.valueOf(input.nextString());
          break;
        case "frameId" :
          frameId = input.nextString();
          break;
        default:
          input.skipValue();
          break;
      }
    }
    return new ResponseReceived(requestId,loaderId,monotonicTime,type,response,frameId);
  }

  public RequestId getRequestId() {
    return requestId;
  }

  public LoaderId getLoaderId() {
    return loaderId;
  }

  public Runtime.Timestamp getMonotonicTime() {
    return monotonicTime;
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

}
