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
 * Object for storing Network.loadingFinished response
 */
public class LoadingFinished {

  /**
   * Request identifier
   */
  private final RequestId requestId;

  /**
   * MonotonicTime
   */
  private final MonotonicTime timestamp;

  /**
   * Total number of bytes received for this request
   */
  private final Number encodedDataLength;

  /**
   * Set when 1) response was blocked by Cross-Origin Read Blocking and also 2) this needs to be reported to the DevTools console
   */
  private final Boolean shouldReportCorbBlocking;

  private LoadingFinished(RequestId requestId, MonotonicTime timestamp, Number encodedDataLength,
                          Boolean shouldReportCorbBlocking) {
    this.requestId = requireNonNull(requestId, "'requestId' is required for LoadingFinished");
    this.timestamp = requireNonNull(timestamp, "'timestamp' is required for LoadingFinished");
    this.encodedDataLength =
        requireNonNull(encodedDataLength, "'encodedDataLength' is required for LoadingFinished");
    this.shouldReportCorbBlocking = shouldReportCorbBlocking;
  }

  private static LoadingFinished fromJson(JsonInput input) {
    RequestId requestId = new RequestId(input.nextString());
    MonotonicTime timestamp = null;
    Number encodedDataLength = null;
    Boolean shouldReportCorbBlocking = null;

    while (input.hasNext()) {

      switch (input.nextName()) {
        case "timestamp":
          timestamp = MonotonicTime.parse(input.nextNumber());
          break;

        case "encodedDataLength":
          encodedDataLength = input.nextNumber();
          break;

        case "shouldReportCorbBlocking":
          shouldReportCorbBlocking = input.nextBoolean();
          break;

        default:
          input.skipValue();
          break;
      }
    }

    return new LoadingFinished(requestId, timestamp, encodedDataLength, shouldReportCorbBlocking);
  }

  public RequestId getRequestId() {
    return requestId;
  }

  public MonotonicTime getTimestamp() {
    return timestamp;
  }

  public Number getEncodedDataLength() {
    return encodedDataLength;
  }

  public Boolean getShouldReportCorbBlocking() {
    return shouldReportCorbBlocking;
  }

  @Override
  public String toString() {
    return "LoadingFinished{" +
           "requestId=" + requestId +
           ", timestamp=" + timestamp.getTimeStamp().toString() +
           ", encodedDataLength=" + encodedDataLength +
           ", shouldReportCorbBlocking=" + shouldReportCorbBlocking +
           '}';
  }

}
