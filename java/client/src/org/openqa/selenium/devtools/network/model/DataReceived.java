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
 * Object for storing Network.dataReceived response
 */
public class DataReceived {

  /**
   * Request identifier
   */
  private final RequestId requestId;

  /**
   * MonotonicTime
   */
  private final MonotonicTime timestamp;

  /**
   * Data chunk length
   */
  private final Number dataLength;

  /**
   * Actual bytes received (might be less than dataLength for compressed encodings)
   */
  private final Number encodedDataLength;

  private DataReceived(RequestId requestId, MonotonicTime timestamp, Number dataLength,
                       Number encodedDataLength) {
    this.requestId = requestId;
    this.timestamp = timestamp;
    this.dataLength = dataLength;
    this.encodedDataLength = encodedDataLength;
  }

  private static DataReceived fromJson(JsonInput input) {
    RequestId requestId = new RequestId(input.nextString());
    MonotonicTime timestamp = null;
    Number dataLength = null;
    Number encodedDataLength = null;

    while (input.hasNext()) {

      switch (input.nextName()) {
        case "timestamp":
          timestamp = MonotonicTime.parse(input.nextNumber());
          break;

        case "dataLength":
          dataLength = input.nextNumber();
          break;

        case "encodedDataLength":
          encodedDataLength = input.nextNumber();
          break;

        default:
          input.skipValue();
          break;
      }
    }

    return new DataReceived(requestId, timestamp, dataLength, encodedDataLength);
  }

  public RequestId getRequestId() {
    return requestId;
  }

  public MonotonicTime getTimestamp() {
    return timestamp;
  }

  public Number getDataLength() {
    return dataLength;
  }

  public Number getEncodedDataLength() {
    return encodedDataLength;
  }

  @Override
  public String toString() {
    return "DataReceived{" +
           "requestId='" + requestId.toString() + '\'' +
           ", timestamp=" + timestamp.getTimeStamp().toString() +
           ", dataLength=" + dataLength +
           ", encodedDataLength=" + encodedDataLength +
           '}';
  }

}
