package org.openqa.selenium.devtools.network.model;

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
  private final Number timestamp;

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

  public LoadingFailed(RequestId requestId, Number timestamp,
                       ResourceType resourceType, String errorText, Boolean canceled,
                       BlockedReason blockedReason) {
    this.requestId = requestId;
    this.timestamp = timestamp;
    this.type = resourceType;
    this.errorText = errorText;
    this.canceled = canceled;
    this.blockedReason = blockedReason;
  }

  private static LoadingFailed fromJson(JsonInput input) {
    RequestId requestId = new RequestId(input.nextString());
    Number timestamp = null;
    ResourceType type = null;
    String errorText = null;
    Boolean canceled = null;
    BlockedReason blockedReason = null;

    while (input.hasNext()) {

      switch (input.nextName()) {
        case "timestamp":
          timestamp = input.nextNumber();
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

  public Number getTimestamp() {
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
           ", timestamp=" + timestamp +
           ", resourceType=" + type +
           ", errorText='" + errorText + '\'' +
           ", canceled=" + canceled +
           ", blockedReason=" + blockedReason +
           '}';
  }

}
