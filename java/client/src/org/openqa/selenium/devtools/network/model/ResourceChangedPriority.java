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

import org.openqa.selenium.json.JsonInput;

/**
 * Object for storing Network.resourceChangedPriority response
 */
public class ResourceChangedPriority {

  /**
   * Request identifier
   */
  private final RequestId requestId;

  /**
   * Total number of bytes received for this request
   */
  private final ResourcePriority newPriority;

  /**
   * MonotonicTime
   */
  private final MonotonicTime timestamp;

  private ResourceChangedPriority(RequestId requestId,
                                  ResourcePriority newPriority, MonotonicTime timestamp) {
    this.requestId = requestId;
    this.newPriority = newPriority;
    this.timestamp = timestamp;
  }

  private static ResourceChangedPriority fromJson(JsonInput input) {
    RequestId requestId = new RequestId(input.nextString());
    ResourcePriority newPriority = null;
    MonotonicTime timestamp = null;

    while (input.hasNext()) {

      switch (input.nextName()) {
        case "newPriority":
          newPriority = ResourcePriority.valueOf(input.nextString());
          break;

        case "timestamp":
          timestamp = MonotonicTime.parse(input.nextNumber());
          break;

        default:
          input.skipValue();
          break;
      }
    }

    return new ResourceChangedPriority(requestId, newPriority, timestamp);
  }

  public RequestId getRequestId() {
    return requestId;
  }

  public ResourcePriority getNewPriority() {
    return newPriority;
  }

  public MonotonicTime getTimestamp() {
    return timestamp;
  }

  @Override
  public String toString() {
    return "ResourceChangedPriority{" +
           "requestId=" + requestId +
           ", newPriority=" + newPriority +
           ", timestamp=" + timestamp.getTimeStamp().toString() +
           '}';
  }

}
