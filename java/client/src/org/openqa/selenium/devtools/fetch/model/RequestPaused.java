package org.openqa.selenium.devtools.fetch.model;

import com.google.common.reflect.TypeToken;
import org.openqa.selenium.devtools.network.model.ErrorReason;
import org.openqa.selenium.devtools.network.model.Request;
import org.openqa.selenium.devtools.network.model.ResourceType;
import org.openqa.selenium.devtools.page.model.FrameId;
import org.openqa.selenium.json.JsonInput;

import java.util.List;
import java.util.Objects;
import java.util.Optional;

public class RequestPaused {

  private final RequestId requestId;
  private final Request request;
  private final FrameId frameId;
  private final ResourceType resourceType;
  private final Optional<ErrorReason> errorReason;
  private final Optional<Integer> responseStatusCode;
  private final Optional<List<HeaderEntry>> responseHeaders;
  private final Optional<RequestId> networkId;

  private RequestPaused(
    RequestId requestId,
    Request request,
    FrameId frameId,
    ResourceType resourceType,
    Optional<ErrorReason> errorReason,
    Optional<Integer> responseStatusCode,
    Optional<List<HeaderEntry>> responseHeaders,
    Optional<RequestId> networkId) {
    this.requestId = Objects.requireNonNull(requestId);
    this.request = Objects.requireNonNull(request);
    this.frameId = Objects.requireNonNull(frameId);
    this.resourceType = Objects.requireNonNull(resourceType);
    this.errorReason = Objects.requireNonNull(errorReason);
    this.responseStatusCode = Objects.requireNonNull(responseStatusCode);
    this.responseHeaders = Objects.requireNonNull(responseHeaders);
    this.networkId = Objects.requireNonNull(networkId);
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

  public Optional<ErrorReason> getResponseErrorReason() {
    return errorReason;
  }

  public Optional<Integer> getResponseStatusCode() {
    return responseStatusCode;
  }

  public Optional<List<HeaderEntry>> getResponseHeaders() {
    return responseHeaders;
  }

  public Optional<RequestId> getNetworkId() {
    return networkId;
  }

  private static RequestPaused fromJson(JsonInput input) {
    RequestId requestId = null;
    Request request = null;
    FrameId frameId = null;
    ResourceType resourceType = null;
    Optional<ErrorReason> errorReason = Optional.empty();
    Optional<Integer> responseStatusCode = Optional.empty();
    Optional<List<HeaderEntry>> responseHeaders = Optional.empty();
    Optional<RequestId> networkId = Optional.empty();

    input.beginObject();
    while (input.hasNext()) {
      switch (input.nextName()) {
        case "frameId":
          frameId = input.read(FrameId.class);
          break;

        case "networkId":
          networkId = Optional.of(input.read(RequestId.class));
          break;

        case "request":
          request = input.read(Request.class);
          break;

        case "requestId":
          requestId = input.read(RequestId.class);
          break;

        case "resourceType":
          resourceType = input.read(ResourceType.class);
          break;

        case "responseErrorReason":
          errorReason = Optional.of(input.read(ErrorReason.class));
          break;

        case "responseStatusCode":
          responseStatusCode = Optional.of(input.read(Integer.class));
          break;

        case "responseHeaders":
          responseHeaders = Optional.of(input.read(new TypeToken<List<HeaderEntry>>(){}.getType()));
          break;

        default:
          input.skipValue();
          break;
      }
    }
    input.endObject();

    return new RequestPaused(
      requestId,
      request,
      frameId,
      resourceType,
      errorReason,
      responseStatusCode,
      responseHeaders,
      networkId);
  }
}
