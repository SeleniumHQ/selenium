package org.openqa.selenium.devtools.network.types;

import org.openqa.selenium.json.JsonInput;

/**
 * Information about a signed exchange response
 */
public class SignedExchangeError {

  private String message;

  private Integer signatureIndex;

  private SignedExchangeErrorField errorField;

  /** Error message. */
  public String getMessage() {
    return message;
  }

  /** Error message. */
  public void setMessage(String message) {
    this.message = message;
  }

  /** The index of the signature which caused the error. */
  public Integer getSignatureIndex() {
    return signatureIndex;
  }

  /** The index of the signature which caused the error. */
  public void setSignatureIndex(Integer signatureIndex) {
    this.signatureIndex = signatureIndex;
  }

  /** The field which caused the error. */
  public SignedExchangeErrorField getErrorField() {
    return errorField;
  }

  /** The field which caused the error. */
  public void setErrorField(SignedExchangeErrorField errorField) {
    this.errorField = errorField;
  }

  public static SignedExchangeError parseResponse(JsonInput input) {
    //TODO: @GED implement parser
    return null;
  }
}
