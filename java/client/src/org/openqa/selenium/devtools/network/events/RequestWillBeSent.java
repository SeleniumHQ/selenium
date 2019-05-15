package org.openqa.selenium.devtools.network.events;

import org.openqa.selenium.devtools.network.types.Initiator;
import org.openqa.selenium.devtools.network.types.LoaderId;
import org.openqa.selenium.devtools.network.types.Request;
import org.openqa.selenium.devtools.network.types.RequestId;
import org.openqa.selenium.devtools.network.types.ResourceType;
import org.openqa.selenium.devtools.network.types.Response;
import org.openqa.selenium.json.JsonInput;

/**
 * Object for storing Network.requestWillBeSent response
 */
public class RequestWillBeSent {

  /**
   * Request identifier
   */
  private final RequestId requestId;

  /**
   * Loader identifier. Empty string if the request is fetched from worker
   */
  private final LoaderId loaderId;

  /**
   * URL of the document this request is loaded for
   */
  private final String documentURL;

  /**
   * Request data
   */
  private final Request request;

  /**
   * MonotonicTime
   */
  private final Number timestamp;

  /**
   * MonotonicTime
   */
  private final Number wallTime;


  /**
   * Request initiator
   */
  private final Initiator initiator;

  /**
   * Redirect response data
   */
  private final Response redirectResponse;

  /**
   * Type of this resource
   */
  private final ResourceType type;


  /**
   * Frame identifier
   */
  private final String frameId;

  /**
   * Whether the request is initiated by a user gesture. Defaults to false
   */
  private final Boolean hasUserGesture;

  public RequestWillBeSent(RequestId requestId,
                           LoaderId loaderId, String documentURL,
                           Request request, Number timestamp, Number wallTime,
                           Initiator initiator,
                           Response redirectResponse,
                           ResourceType type, String frameId, Boolean hasUserGesture) {
    this.requestId = requestId;
    this.loaderId = loaderId;
    this.documentURL = documentURL;
    this.request = request;
    this.timestamp = timestamp;
    this.wallTime = wallTime;
    this.initiator = initiator;
    this.redirectResponse = redirectResponse;
    this.type = type;
    this.frameId = frameId;
    this.hasUserGesture = hasUserGesture;
  }

  private static RequestWillBeSent fromJson(JsonInput input) {

    RequestId requestId = new RequestId(input.nextString());
    LoaderId loaderId = null;
    String documentURL = null;
    Request request = null;
    Number timestamp = null;
    Number wallTime = null;
    Initiator initiator = null;
    Response redirectResponse = null;
    ResourceType type = null;
    String frameId = null;
    Boolean hasUserGesture = null;

    while (input.hasNext()) {

      switch (input.nextName()) {

        case "loaderId":
          loaderId = new LoaderId(input.nextString());
          break;

        case "documentURL":
          documentURL = input.nextString();
          break;

        case "request":
          request = Request.parseRequest(input);
          break;

        case "timestamp":
          timestamp = input.nextNumber();
          break;

        case "wallTime":
          wallTime = input.nextNumber();
          break;

        case "initiator":
          initiator = Initiator.parseInitiator(input);
          break;

        case "redirectResponse":
          redirectResponse = Response.parseResponse(input);
          break;

        case "type":
          type = ResourceType.valueOf(input.nextString());
          break;

        case "frameId":
          frameId = input.nextString();
          break;

        case "hasUserGesture":
          hasUserGesture = input.nextBoolean();
          break;

        default:
          input.skipValue();
          break;
      }
    }

    return new RequestWillBeSent(requestId, loaderId, documentURL, request, timestamp, wallTime,
                                 initiator, redirectResponse, type, frameId, hasUserGesture);
  }

  public RequestId getRequestId() {
    return requestId;
  }

  public LoaderId getLoaderId() {
    return loaderId;
  }

  public String getDocumentURL() {
    return documentURL;
  }

  public Request getRequest() {
    return request;
  }

  public Number getTimestamp() {
    return timestamp;
  }

  public Number getWallTime() {
    return wallTime;
  }

  public Initiator getInitiator() {
    return initiator;
  }

  public Response getRedirectResponse() {
    return redirectResponse;
  }

  public ResourceType getType() {
    return type;
  }

  public String getFrameId() {
    return frameId;
  }

  public Boolean getHasUserGesture() {
    return hasUserGesture;
  }

  @Override
  public String toString() {
    return "RequestWillBeSent{" +
           "requestId=" + requestId +
           ", loaderId=" + loaderId +
           ", documentURL='" + documentURL + '\'' +
           ", request=" + request +
           ", timestamp=" + timestamp +
           ", wallTime=" + wallTime +
           ", initiator=" + initiator +
           ", redirectResponse=" + redirectResponse +
           ", type=" + type +
           ", frameId='" + frameId + '\'' +
           ", hasUserGesture=" + hasUserGesture +
           '}';
  }

}
