package org.openqa.selenium.devtools.network.events;

import org.openqa.selenium.devtools.network.types.RequestId;
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
  private final Number timestamp;

  /**
   * Total number of bytes received for this request
   */
  private final Number encodedDataLength;

  /**
   * Set when 1) response was blocked by Cross-Origin Read Blocking and also 2) this needs to be reported to the DevTools console
   */
  private final Boolean shouldReportCorbBlocking;

  public LoadingFinished(RequestId requestId, Number timestamp, Number encodedDataLength,
                         Boolean shouldReportCorbBlocking) {
    this.requestId = requestId;
    this.timestamp = timestamp;
    this.encodedDataLength = encodedDataLength;
    this.shouldReportCorbBlocking = shouldReportCorbBlocking;
  }

  private static LoadingFinished fromJson(JsonInput input) {
    RequestId requestId = new RequestId(input.nextString());
    Number timestamp = null;
    Number encodedDataLength = null;
    Boolean shouldReportCorbBlocking = null;

    while (input.hasNext()) {

      switch (input.nextName()) {
        case "timestamp":
          timestamp = input.nextNumber();
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

  public Number getTimestamp() {
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
           ", timestamp=" + timestamp +
           ", encodedDataLength=" + encodedDataLength +
           ", shouldReportCorbBlocking=" + shouldReportCorbBlocking +
           '}';
  }

}
