package org.openqa.selenium.devtools.network.model;

import org.openqa.selenium.json.JsonInput;

/**
 * Information about a signed exchange response
 */
public class SignedExchangeError {

  private String message;

  private Integer signatureIndex;

  private SignedExchangeErrorField errorField;

  public SignedExchangeError() {
  }

  private SignedExchangeError(String message, Integer signatureIndex,
                              SignedExchangeErrorField errorField) {
    this.message = message;
    this.signatureIndex = signatureIndex;
    this.errorField = errorField;
  }

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

  public static SignedExchangeError parseSignedExchangeError(JsonInput input) {

     String message = null;
     Number signatureIndex = null;
     SignedExchangeErrorField errorField = null;

    switch (input.nextName()) {
      case "message":
        message = input.nextString();
        break;
      case "signatureIndex":
        signatureIndex = input.nextNumber();
        break;
      case "errorField":
        errorField = SignedExchangeErrorField.valueOf(input.nextString());
        break;
      default:
        input.skipValue();
        break;
    }
    return new SignedExchangeError(message, Integer.valueOf(String.valueOf(signatureIndex)), errorField);
  }
}
