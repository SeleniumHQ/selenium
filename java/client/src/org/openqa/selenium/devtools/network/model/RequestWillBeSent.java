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

package org.openqa.selenium.devtools.network.model;

import static java.util.Objects.requireNonNull;

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
  private final MonotonicTime timestamp;

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

  private RequestWillBeSent(RequestId requestId,
                            LoaderId loaderId, String documentURL,
                            Request request, MonotonicTime timestamp, Number wallTime,
                            Initiator initiator,
                            Response redirectResponse,
                            ResourceType type, String frameId, Boolean hasUserGesture) {
    this.requestId = requireNonNull(requestId, "'requestId' is required for RequestWillBeSent");
    this.loaderId = requireNonNull(loaderId, "'loaderId' is required for RequestWillBeSent");
    this.documentURL =
        requireNonNull(documentURL, "'documentURL' is required for RequestWillBeSent");
    this.request = requireNonNull(request, "'request' is required for RequestWillBeSent");
    this.timestamp = requireNonNull(timestamp, "'timestamp' is required for RequestWillBeSent");
    this.wallTime = requireNonNull(wallTime, "'wallTime' is required for RequestWillBeSent");
    this.initiator = requireNonNull(initiator, "'initiator' is required for RequestWillBeSent");
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
    MonotonicTime timestamp = null;
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
          request = input.read(Request.class);
          break;

        case "timestamp":
          timestamp = MonotonicTime.parse(input.nextNumber());
          break;

        case "wallTime":
          wallTime = input.nextNumber();
          break;

        case "initiator":
          initiator = input.read(Initiator.class);
          break;

        case "redirectResponse":
          redirectResponse = input.read(Response.class);
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

  public MonotonicTime getTimestamp() {
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
           ", timestamp=" + timestamp.getTimeStamp().toString() +
           ", wallTime=" + wallTime +
           ", initiator=" + initiator +
           ", redirectResponse=" + redirectResponse +
           ", type=" + type +
           ", frameId='" + frameId + '\'' +
           ", hasUserGesture=" + hasUserGesture +
           '}';
  }

}
