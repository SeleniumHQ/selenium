package org.openqa.selenium.devtools.network.events;

import org.openqa.selenium.devtools.network.types.AuthChallenge;
import org.openqa.selenium.devtools.network.types.ErrorReason;
import org.openqa.selenium.devtools.network.types.Request;
import org.openqa.selenium.devtools.network.types.ResourceType;
import org.openqa.selenium.json.JsonInput;

public class RequestIntercepted {

  /**
   * Each request the page makes will have a unique id, however if any redirects are encountered while processing that fetch, they will be reported with the same id as the original fetch. Likewise if HTTP authentication is needed then the same fetch id will be used
   */
  private final String interceptionId;
  /**
   * Request data
   */
  private final Request request;
  /**
   * The id of the frame that initiated the request.
   */
  private final String frameId;
  /**
   * How the requested resource will be used.
   */
  private final ResourceType resourceType;

  /**
   * Whether this is a navigation request, which can abort the navigation completely.
   */
  private final boolean isNavigationRequest;

  /**
   * Set if the request is a navigation that will result in a download. Only present after response is received from the server (i.e. HeadersReceived stage).
   * Optional
   */
  private final Boolean isDownload;
  /**
   * Redirect location, only sent if a redirect was intercepted.
   * Optional
   */
  private final String redirectUrl;
  /**
   * Details of the Authorization Challenge encountered. If this is set then continueInterceptedRequest must contain an authChallengeResponse.
   * Optional
   */
  private final AuthChallenge authChallenge;
  /**
   * Response error if intercepted at response stage or if redirect occurred while intercepting request.
   * Optional
   */
  private final ErrorReason responseErrorReason;

  /**
   *Response code if intercepted at response stage or if redirect occurred while intercepting request or auth retry occurred.
   * Optional
   */
  private final Number responseStatusCode;

  /**
   * Response headers if intercepted at the response stage or if redirect occurred while intercepting request or auth retry occurred.
   * Optional
   */
  private final Object responseHeaders;
  /**
   * If the intercepted request had a corresponding requestWillBeSent event fired for it, then this requestId will be the same as the requestId present in the requestWillBeSent event.
   * Optional
   */
  private final String requestId;


  public RequestIntercepted(String interceptionId,
                            Request request,
                            String frameId,
                            ResourceType resourceType,
                            boolean isNavigationRequest,
                            Boolean isDownload,
                            String redirectUrl,
                            AuthChallenge authChallenge,
                            ErrorReason responseErrorReason,
                            Number responseStatusCode,
                            Object responseHeaders,
                            String requestId) {
    this.interceptionId = interceptionId;
    this.request = request;
    this.frameId = frameId;
    this.resourceType = resourceType;
    this.isNavigationRequest = isNavigationRequest;
    this.isDownload = isDownload;
    this.redirectUrl = redirectUrl;
    this.authChallenge = authChallenge;
    this.responseErrorReason = responseErrorReason;
    this.responseStatusCode = responseStatusCode;
    this.responseHeaders = responseHeaders;
    this.requestId = requestId;
  }
  public static RequestIntercepted fromJson(JsonInput input){
    String interceptionId = input.nextString();
    Request request =null;
    String frameId = null;
    ResourceType resourceType = null;
    Boolean isNavigationRequest = null;
    Boolean isDownload = null;
    String redirectUrl = null;
    AuthChallenge authChallenge = null;
    ErrorReason responseErrorReason = null;
    Number responseStatusCode = null;
    Object responseHeaders= null;
    String requestId = null;
    while (input.hasNext()){
      switch (input.nextName()) {
        case "request" :
          request = Request.parseRequest(input);
          break;
        case "frameId" :
          frameId = input.nextString();
          break;
        case "resourceType":
          resourceType = ResourceType.valueOf(input.nextString());
          break;
        case "isNavigationRequest":
          isNavigationRequest = input.nextBoolean();
          break;
        case "isDownload" :
          isDownload = input.nextBoolean();
          break;
        case "redirectUrl":
          redirectUrl = input.nextString();
          break;
        case "authChallenge" :
          authChallenge = AuthChallenge.parseRequest(input);
          break;
        case "responseErrorReason" :
          responseErrorReason = ErrorReason.valueOf(input.nextString());
          break;
        case "responseStatusCode" :
          responseStatusCode = input.nextNumber();
          break;
        case "responseHeaders" :
          //responseHeaders = input.nextNull()
          break;
        case "requestId" :
          requestId = input.nextString();
          break;
        default:
          input.skipValue();
          break;
      }
    }
    return new RequestIntercepted(interceptionId,
                                  request,
                                  frameId,
                                  resourceType,
                                  isNavigationRequest,
                                  isDownload,
                                  redirectUrl,
                                  authChallenge,
                                  responseErrorReason,
                                  responseStatusCode,
                                  responseHeaders,
                                  requestId);
  }
}
