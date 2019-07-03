package org.openqa.selenium.devtools.fetch.model;

import org.openqa.selenium.devtools.network.model.Request;
import org.openqa.selenium.devtools.network.model.ResourceType;
import org.openqa.selenium.devtools.page.model.FrameId;
import org.openqa.selenium.json.JsonInput;

import java.util.Objects;

public class AuthRequired {

  /**
   * Each request the page makes will have a unique id.
   */
  private final RequestId requestId;
  /**
   * The details of the request.
   */
  private final Request request;
  /**
   * The id of the frame that initiated the request.
   */
  private final FrameId frameId;
  /**
   * How the requested resource will be used.
   */
  private final ResourceType resourceType;
  /**
   * Details of the Authorization Challenge encountered. If this is set, client should respond with
   * continueRequest that contains AuthChallengeResponse.
   */
  private final AuthChallenge authChallenge;

  public AuthRequired(
      RequestId requestId,
      Request request,
      FrameId frameId,
      ResourceType resourceType,
      AuthChallenge authChallenge) {
    this.requestId = Objects.requireNonNull(requestId, "requestId is required");
    this.request = Objects.requireNonNull(request, "request is required");
    this.frameId = Objects.requireNonNull(frameId, "frameId is required");
    this.resourceType = Objects.requireNonNull(resourceType, "resourceType is required");
    this.authChallenge = Objects.requireNonNull(authChallenge, "authChallenge is required");
  }

  private static AuthRequired fromJson(JsonInput input) {
    RequestId requestId = null;
    Request request = null;
    FrameId frameId = null;
    ResourceType resourceType = null;
    AuthChallenge authChallenge = null;
    while (input.hasNext()) {
      switch (input.nextName()) {
        case "requestId":
          requestId = input.read(RequestId.class);
          break;
        case "request":
          request = input.read(Request.class);
          break;
        case "frameId":
          frameId = input.read(FrameId.class);
          break;
        case "resourceType":
          resourceType = input.read(ResourceType.class);
          break;
        case "authChallenge":
          authChallenge = input.read(AuthChallenge.class);
          break;
        default:
          input.skipValue();
          break;
      }
    }
    return new AuthRequired(requestId, request, frameId, resourceType, authChallenge);
  }

  public RequestId getRequestId() {
    return requestId;
  }

  public Request getRequest() {
    return request;
  }

  public FrameId getFrameId() {
    return frameId;
  }

  public ResourceType getResourceType() {
    return resourceType;
  }

  public AuthChallenge getAuthChallenge() {
    return authChallenge;
  }
}
