package org.openqa.selenium.devtools.network.events;

import org.openqa.selenium.devtools.network.types.CallFrame;
import org.openqa.selenium.devtools.network.types.Initiator;
import org.openqa.selenium.devtools.network.types.InitiatorType;
import org.openqa.selenium.devtools.network.types.LoaderId;
import org.openqa.selenium.devtools.network.types.MixedContentType;
import org.openqa.selenium.devtools.network.types.Request;
import org.openqa.selenium.devtools.network.types.RequestId;
import org.openqa.selenium.devtools.network.types.RequestReferrerPolicy;
import org.openqa.selenium.devtools.network.types.ResourcePriority;
import org.openqa.selenium.devtools.network.types.ResourceType;
import org.openqa.selenium.devtools.network.types.Response;
import org.openqa.selenium.devtools.network.types.StackTrace;
import org.openqa.selenium.devtools.network.types.StackTraceId;
import org.openqa.selenium.json.JsonInput;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

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

    //TODO: @GED add parser to Type as static methods
    while (input.hasNext()) {

      switch (input.nextName()) {

        case "loaderId":
          loaderId = new LoaderId(input.nextString());
          break;

        case "documentURL":
          documentURL = input.nextString();
          break;

        case "request":
          input.beginObject();
          String url = null;
          String method = null;
          String urlFragment = null;
          Map<String, Object> headers = null;
          String postData = null;
          Boolean hasPostData = null;
          MixedContentType mixedContentType = null;
          ResourcePriority initialPriority = null;
          RequestReferrerPolicy referrerPolicy = null;
          Boolean isLinkPreload = null;

          while (input.hasNext()) {
            switch (input.nextName()) {
              case "url":
                url = input.nextString();
                break;
              case "method":
                method = input.nextString();
                break;
              case "urlFragment":
                urlFragment = input.nextString();
                break;

              case "headers":
                input.beginObject();
                headers = new HashMap<>();
                while (input.hasNext()) {
                  headers.put(input.nextName(), input.nextString());
                }
                break;

              case "postData":
                postData = input.nextString();
                break;
              case "mixedContentType":
                mixedContentType = MixedContentType.valueOf(input.nextString());
                break;
              case "initialPriority":
                initialPriority = ResourcePriority.valueOf(input.nextString());
                break;
              case "referrerPolicy":
                referrerPolicy = RequestReferrerPolicy.valueOf(input.nextString());
                break;
              case "isLinkPreload":
                isLinkPreload = input.nextBoolean();
                break;
              default:
                input.skipValue();
                break;
            }
          }
          request =
              new Request(url, urlFragment, method, headers, postData, hasPostData,
                          mixedContentType, initialPriority, referrerPolicy, isLinkPreload);
          break;

        case "timestamp":
          timestamp = input.nextNumber();
          break;

        case "wallTime":
          wallTime = input.nextNumber();
          break;

        case "initiator":
          input.beginObject();
          InitiatorType initiatorType = null;
          StackTrace stack = null;
          String initiatorUrl = null;
          Number lineNumber = null;

          while (input.hasNext()) {
            switch (input.nextName()) {
              case "type":
                initiatorType = InitiatorType.valueOf(input.nextString());
                break;
              case "stack":
                input.beginObject();
                String description = null;
                List<CallFrame> callFrames = null;
                StackTrace parent = null;
                StackTraceId parentId = null;

                while (input.hasNext()) {
                  switch (input.nextName()) {
                    case "description":
                      description = input.nextString();
                      break;
                    case "callFrames":
                      input.beginArray();
                      while (input.hasNext()) {
                        String functionName = null;
                        String scriptId = null;
                        String callFrameUrl = null;
                        Number callFrameLineNumber = null;
                        Number columnNumber = null;
                        switch (input.nextName()) {
                          case "functionName":
                            functionName = input.nextString();
                            break;
                          case "scriptId":
                            scriptId = input.nextString();
                            break;
                          case "url":
                            callFrameUrl = input.nextString();
                            break;
                          case "lineNumber":
                            callFrameLineNumber = input.nextNumber();
                            break;
                          case "columnNumber":
                            columnNumber = input.nextNumber();
                            break;
                          default:
                            input.skipValue();
                            break;
                        }
                        callFrames.add(new CallFrame(functionName, scriptId, callFrameUrl, Integer.valueOf(String.valueOf(callFrameLineNumber)), Integer.valueOf(String.valueOf(columnNumber))));
                      }
                      input.endArray();
                      break;
                    default:
                      input.skipValue();
                      break;
                  }
                }
                stack = new StackTrace(description, callFrames, parent, parentId);
                break;
              case "url":
                initiatorUrl = input.nextString();
                break;
              case "lineNumber":
                lineNumber = input.nextNumber();
                break;
              default:
                input.skipValue();
                break;
            }
            initiator =
                new Initiator(initiatorType, stack, initiatorUrl,
                              Double.valueOf(String.valueOf(lineNumber)));
          }
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
