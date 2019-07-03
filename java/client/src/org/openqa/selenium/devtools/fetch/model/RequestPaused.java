// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.
package org.openqa.selenium.devtools.fetch.model;

import org.openqa.selenium.devtools.network.model.ErrorReason;
import org.openqa.selenium.devtools.network.model.Request;
import org.openqa.selenium.devtools.network.model.ResourceType;
import org.openqa.selenium.devtools.page.model.FrameId;
import org.openqa.selenium.json.JsonInput;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

public class RequestPaused {

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
   * Response error if intercepted at response stage.
   */
  private final ErrorReason responseErrorReason;
  /**
   * Response code if intercepted at response stage.
   */
  private final Integer responseStatusCode;
  /**
   * Response headers if intercepted at the response stage.
   */
  private final List<HeaderEntry> responseHeaders;
  /**
   * If the intercepted request had a corresponding Network.requestWillBeSent event fired for it,
   * then this networkId will be the same as the requestId present in the requestWillBeSent event.
   */
  private final RequestId networkId;

  public RequestPaused(
      RequestId requestId,
      Request request,
      FrameId frameId,
      ResourceType resourceType,
      ErrorReason responseErrorReason,
      Integer responseStatusCode,
      List<HeaderEntry> responseHeaders,
      RequestId networkId) {
    this.requestId = Objects.requireNonNull(requestId, "requestId is required");
    this.request = Objects.requireNonNull(request, "request is required");
    this.frameId = Objects.requireNonNull(frameId, "frameId is required");
    this.resourceType = Objects.requireNonNull(resourceType, "resourceType is requiredd");
    this.responseErrorReason = responseErrorReason;
    this.responseStatusCode = responseStatusCode;
    this.responseHeaders = responseHeaders;
    this.networkId = networkId;
  }

  private static RequestPaused fromJson(JsonInput input) {
    RequestId requestId = input.read(RequestId.class);
    Request request = null;
    FrameId frameId = null;
    ResourceType resourceType = null;
    ErrorReason responseErrorReason = null;
    Integer responseStatusCode = null;
    List<HeaderEntry> responseHeaders = null;
    RequestId networkId = null;
    while (input.hasNext()) {
      switch (input.nextName()) {
        case "request":
          request = input.read(Request.class);
          break;
        case "frameId":
          frameId = input.read(FrameId.class);
          break;
        case "resourceType":
          resourceType = input.read(ResourceType.class);
          break;
        case "responseStatusCode":
          responseStatusCode = input.read(Integer.class);
          break;
        case "responseHeaders":
          responseHeaders = new ArrayList<>();
          input.beginArray();
          while (input.hasNext()) {
            responseHeaders.add(input.read(HeaderEntry.class));
          }
          input.endArray();
          break;
        default:
          input.skipValue();
          break;
      }
    }
    return new RequestPaused(
        requestId,
        request,
        frameId,
        resourceType,
        responseErrorReason,
        responseStatusCode,
        responseHeaders,
        networkId);
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

  public ErrorReason getResponseErrorReason() {
    return responseErrorReason;
  }

  public Integer getResponseStatusCode() {
    return responseStatusCode;
  }

  public List<HeaderEntry> getResponseHeaders() {
    return responseHeaders;
  }

  public RequestId getNetworkId() {
    return networkId;
  }
}
