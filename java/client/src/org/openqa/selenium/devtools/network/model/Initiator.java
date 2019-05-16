package org.openqa.selenium.devtools.network.model;

import static java.util.Objects.requireNonNull;

import org.openqa.selenium.json.JsonInputConverter;
import org.openqa.selenium.json.JsonInput;

/**
 * Information about the request initiator
 */
public class Initiator {

  private InitiatorType type;

  private StackTrace stack;

  private String url;

  private Double lineNumber;

  private Initiator(InitiatorType type, StackTrace stack, String url, Double lineNumber) {
    this.type = requireNonNull(type, "'type' is required for Initiator");
    this.stack = stack;
    this.url = url;
    this.lineNumber = lineNumber;
  }

  /**
   * Type of this initiator.
   */
  public InitiatorType getType() {
    return type;
  }

  /**
   * Type of this initiator.
   */
  public void setType(InitiatorType type) {
    this.type = type;
  }

  /**
   * Initiator JavaScript stack trace, set for Script only.
   */
  public StackTrace getStack() {
    return stack;
  }

  /**
   * Initiator JavaScript stack trace, set for Script only.
   */
  public void setStack(StackTrace stack) {
    this.stack = stack;
  }

  /**
   * Initiator URL, set for Parser type or for Script type (when script is importing module) or for
   * SignedExchange type.
   */
  public String getUrl() {
    return url;
  }

  /**
   * Initiator URL, set for Parser type or for Script type (when script is importing module) or for
   * SignedExchange type.
   */
  public void setUrl(String url) {
    this.url = url;
  }

  /**
   * Initiator line number, set for Parser type or for Script type (when script is importing module)
   * (0-based).
   */
  public Double getLineNumber() {
    return lineNumber;
  }

  /**
   * Initiator line number, set for Parser type or for Script type (when script is importing module)
   * (0-based).
   */
  public void setLineNumber(Double lineNumber) {
    this.lineNumber = lineNumber;
  }

  public static Initiator parseInitiator(JsonInput input) {

    InitiatorType initiatorType = null;
    StackTrace stack = null;
    String initiatorUrl = null;
    Double lineNumber = null;

    while (input.hasNext()) {
      switch (input.nextName()) {
        case "type":
          input.beginObject();
          initiatorType = InitiatorType.valueOf(input.nextString());
          input.endObject();
          break;
        case "stack":
          stack = StackTrace.parseStackTrace(input);
          break;
        case "url":
          initiatorUrl = input.nextString();
          break;
        case "lineNumber":
          lineNumber = JsonInputConverter.extractDouble(input);
          break;
        default:
          input.skipValue();
          break;
      }
    }
    return new Initiator(initiatorType, stack, initiatorUrl, lineNumber);
  }
}

