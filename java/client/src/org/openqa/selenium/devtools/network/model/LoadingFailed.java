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
 * Object for storing Network.loadingFailed response
 */
public class LoadingFailed {

  /**
   * Request identifier
   */
  private final RequestId requestId;

  /**
   * MonotonicTime
   */
  private final MonotonicTime timestamp;

  /**
   * Resource type
   */
  private final ResourceType type;

  /**
   * User friendly error message
   */
  private final String errorText;

  /**
   * True if loading was canceled
   */
  private final Boolean canceled;

  /**
   * The reason why loading was blocked, if any
   */
  private final BlockedReason blockedReason;

  private LoadingFailed(RequestId requestId, MonotonicTime timestamp,
                        ResourceType resourceType, String errorText, Boolean canceled,
                        BlockedReason blockedReason) {
    this.requestId = requireNonNull(requestId, "'requestId' is required for LoadingFailed");
    this.timestamp = requireNonNull(timestamp, "'timestamp' is required for LoadingFailed");
    this.type = requireNonNull(resourceType, "'resourceType' is required for LoadingFailed");
    this.errorText = requireNonNull(errorText, "'errorText' is required for LoadingFailed");
    this.canceled = canceled;
    this.blockedReason = blockedReason;
  }

  private static LoadingFailed fromJson(JsonInput input) {
    RequestId requestId = new RequestId(input.nextString());
    MonotonicTime timestamp = null;
    ResourceType type = null;
    String errorText = null;
    Boolean canceled = null;
    BlockedReason blockedReason = null;

    while (input.hasNext()) {

      switch (input.nextName()) {
        case "timestamp":
          timestamp = MonotonicTime.parse(input.nextNumber());
          break;

        case "type":
          type = ResourceType.valueOf(input.nextString());
          break;

        case "errorText":
          errorText = input.nextString();
          break;

        case "canceled":
          canceled = input.nextBoolean();
          break;

        case "blockedReason":
          blockedReason = BlockedReason.fromString(input.nextString());
          break;

        default:
          input.skipValue();
          break;
      }
    }

    return new LoadingFailed(requestId, timestamp, type, errorText, canceled, blockedReason);
  }

  public RequestId getRequestId() {
    return requestId;
  }

  public MonotonicTime getTimestamp() {
    return timestamp;
  }

  public ResourceType getResourceType() {
    return type;
  }

  public String getErrorText() {
    return errorText;
  }

  public Boolean getCanceled() {
    return canceled;
  }

  public BlockedReason getBlockedReason() {
    return blockedReason;
  }

  @Override
  public String toString() {
    return "LoadingFailed{" +
           "requestId=" + requestId +
           ", timestamp=" + timestamp.getTimeStamp().toString() +
           ", resourceType=" + type +
           ", errorText='" + errorText + '\'' +
           ", canceled=" + canceled +
           ", blockedReason=" + blockedReason +
           '}';
  }

}
