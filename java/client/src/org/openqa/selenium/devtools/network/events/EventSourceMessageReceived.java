package org.openqa.selenium.devtools.network.events;

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
  private final Number timestamp;

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

  public EventSourceMessageReceived(String requestId, Number timestamp, String eventName,
                                    String eventId, String data) {
    this.requestId = requestId;
    this.timestamp = timestamp;
    this.eventName = eventName;
    this.eventId = eventId;
    this.data = data;
  }

  private static EventSourceMessageReceived fromJson(JsonInput input) {
    String requestId = input.nextString();
    Number timestamp = null;
    String eventName = null;
    String eventId = null;
    String data = null;

    while (input.hasNext()) {

      switch (input.nextName()) {
        case "timestamp":
          timestamp = input.nextNumber();
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

  public Number getTimestamp() {
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
           ", timestamp=" + timestamp +
           ", eventName='" + eventName + '\'' +
           ", eventId='" + eventId + '\'' +
           ", data='" + data + '\'' +
           '}';
  }

}
