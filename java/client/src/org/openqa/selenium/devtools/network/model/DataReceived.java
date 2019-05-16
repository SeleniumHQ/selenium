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
  private final Number timestamp;

  /**
   * Data chunk length
   */
  private final Number dataLength;

  /**
   * Actual bytes received (might be less than dataLength for compressed encodings)
   */
  private final Number encodedDataLength;

  public DataReceived(RequestId requestId, Number timestamp, Number dataLength, Number encodedDataLength) {
    this.requestId = requestId;
    this.timestamp = timestamp;
    this.dataLength = dataLength;
    this.encodedDataLength = encodedDataLength;
  }

  private static DataReceived fromJson(JsonInput input) {
    RequestId requestId = new RequestId(input.nextString());
    Number timestamp = null;
    Number dataLength = null;
    Number encodedDataLength = null;

    while (input.hasNext()) {

      switch (input.nextName()) {
        case "timestamp":
          timestamp = input.nextNumber();
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

  public Number getTimestamp() {
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
           ", timestamp=" + timestamp +
           ", dataLength=" + dataLength +
           ", encodedDataLength=" + encodedDataLength +
           '}';
  }

}
