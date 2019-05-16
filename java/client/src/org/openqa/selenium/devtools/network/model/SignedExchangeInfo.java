package org.openqa.selenium.devtools.network.model;

import java.util.List;

/**
 * Information about a signed exchange response
 */
public class SignedExchangeInfo {

  private Response outerResponse;

  private SignedExchangeHeader header;

  private SecurityDetails securityDetails;

  private List<SignedExchangeError> errors;

  public SignedExchangeInfo() {
  }

  public SignedExchangeInfo(Response outerResponse,
                            SignedExchangeHeader header,
                            SecurityDetails securityDetails,
                            List<SignedExchangeError> errors) {
    this.outerResponse = outerResponse;
    this.header = header;
    this.securityDetails = securityDetails;
    this.errors = errors;
  }

  /** The outer response of signed HTTP exchange which was received from network. */
  public Response getOuterResponse() {
    return outerResponse;
  }

  /** The outer response of signed HTTP exchange which was received from network. */
  public void setOuterResponse(Response outerResponse) {
    this.outerResponse = outerResponse;
  }

  /** Information about the signed exchange header. */
  public SignedExchangeHeader getHeader() {
    return header;
  }

  /** Information about the signed exchange header. */
  public void setHeader(SignedExchangeHeader header) {
    this.header = header;
  }

  /** Security details for the signed exchange header. */
  public SecurityDetails getSecurityDetails() {
    return securityDetails;
  }

  /** Security details for the signed exchange header. */
  public void setSecurityDetails(SecurityDetails securityDetails) {
    this.securityDetails = securityDetails;
  }

  /** Errors occurred while handling the signed exchagne. */
  public List<SignedExchangeError> getErrors() {
    return errors;
  }

  /** Errors occurred while handling the signed exchagne. */
  public void setErrors(List<SignedExchangeError> errors) {
    this.errors = errors;
  }

}
