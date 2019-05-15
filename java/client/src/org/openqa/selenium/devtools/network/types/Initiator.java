package org.openqa.selenium.devtools.network.types;

/**
 * Information about the request initiator
 */
public class Initiator {

  private InitiatorType type;

  private StackTrace stack;

  private String url;

  private Double lineNumber;

  public Initiator() {
  }

  public Initiator(InitiatorType type, StackTrace stack, String url, Double lineNumber) {
    this.type = type;
    this.stack = stack;
    this.url = url;
    this.lineNumber = lineNumber;
  }

  /** Type of this initiator. */
  public InitiatorType getType() {
    return type;
  }

  /** Type of this initiator. */
  public void setType(InitiatorType type) {
    this.type = type;
  }

  /** Initiator JavaScript stack trace, set for Script only. */
  public StackTrace getStack() {
    return stack;
  }

  /** Initiator JavaScript stack trace, set for Script only. */
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
}

