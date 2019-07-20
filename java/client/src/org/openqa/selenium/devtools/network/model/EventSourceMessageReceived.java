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
 * Object for storing Network.eventSourceMessageReceived response
 */
public class EventSourceMessageReceived {

  /**
   * Request identifier
   */
  private final String requestId;

  /**
   * MonotonicTime
   */
  private final MonotonicTime timestamp;

  /**
   * Message type
   */
  private final String eventName;

  /**
   * Message identifier
   */
  private final String eventId;

  /**
   * Message content
   */
  private final String data;

  private EventSourceMessageReceived(String requestId, MonotonicTime timestamp, String eventName,
                                     String eventId, String data) {
    this.requestId = requestId;
    this.timestamp = timestamp;
    this.eventName = eventName;
    this.eventId = eventId;
    this.data = data;
  }

  private static EventSourceMessageReceived fromJson(JsonInput input) {
    String requestId = input.nextString();
    MonotonicTime timestamp = null;
    String eventName = null;
    String eventId = null;
    String data = null;

    while (input.hasNext()) {

      switch (input.nextName()) {
        case "timestamp":
          timestamp = MonotonicTime.parse(input.nextNumber());
          break;

        case "eventName":
          eventName = input.nextString();
          break;

        case "eventId":
          eventId = input.nextString();
          break;

        case "data":
          data = input.nextString();
          break;

        default:
          input.skipValue();
          break;
      }
    }

    return new EventSourceMessageReceived(requestId, timestamp, eventName, eventId, data);
  }

  public String getRequestId() {
    return requestId;
  }

  public MonotonicTime getTimestamp() {
    return timestamp;
  }

  public String getEventName() {
    return eventName;
  }

  public String getEventId() {
    return eventId;
  }

  public String getData() {
    return data;
  }

  @Override
  public String toString() {
    return "EventSourceMessageReceived{" +
           "requestId='" + requestId + '\'' +
           ", timestamp=" + timestamp.getTimeStamp().toString() +
           ", eventName='" + eventName + '\'' +
           ", eventId='" + eventId + '\'' +
           ", data='" + data + '\'' +
           '}';
  }

}
