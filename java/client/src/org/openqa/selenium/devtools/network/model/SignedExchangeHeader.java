package org.openqa.selenium.devtools.network.model;

import static java.util.Objects.requireNonNull;

import org.openqa.selenium.json.JsonInputConverter;
import org.openqa.selenium.json.JsonInput;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Information about a signed exchange header
 */
public class SignedExchangeHeader {

  private String requestUrl;

  private String requestMethod;

  private Integer responseCode;

  private Map<String, Object> responseHeaders;

  private List<SignedExchangeSignature> signatures;

  private SignedExchangeHeader(String requestUrl, String requestMethod, Integer responseCode,
                               Map<String, Object> responseHeaders,
                               List<SignedExchangeSignature> signatures) {
    this.requestUrl =
        requireNonNull(requestUrl, "'requestUrl' is required for SignedExchangeHeader");
    this.requestMethod =
        requireNonNull(requestMethod, "'requestMethod' is required for SignedExchangeHeader");
    this.responseCode =
        requireNonNull(responseCode, "'responseCode' is required for SignedExchangeHeader");
    this.responseHeaders =
        requireNonNull(responseHeaders, "'responseHeaders' is required for SignedExchangeHeader");
    this.signatures =
        requireNonNull(signatures, "'signatures' is required for SignedExchangeHeader");
  }

  /**
   * Signed exchange request URL.
   */
  public String getRequestUrl() {
    return requestUrl;
  }

  /**
   * Signed exchange request URL.
   */
  public void setRequestUrl(String requestUrl) {
    this.requestUrl = requestUrl;
  }

  /**
   * Signed exchange request method.
   */
  public String getRequestMethod() {
    return requestMethod;
  }

  /**
   * Signed exchange request method.
   */
  public void setRequestMethod(String requestMethod) {
    this.requestMethod = requestMethod;
  }

  /**
   * Signed exchange response code.
   */
  public Integer getResponseCode() {
    return responseCode;
  }

  /**
   * Signed exchange response code.
   */
  public void setResponseCode(Integer responseCode) {
    this.responseCode = responseCode;
  }

  /**
   * Signed exchange response headers.
   */
  public Map<String, Object> getResponseHeaders() {
    return responseHeaders;
  }

  /**
   * Signed exchange response headers.
   */
  public void setResponseHeaders(Map<String, Object> responseHeaders) {
    this.responseHeaders = responseHeaders;
  }

  /**
   * Signed exchange response signature.
   */
  public List<SignedExchangeSignature> getSignatures() {
    return signatures;
  }

  /**
   * Signed exchange response signature.
   */
  public void setSignatures(List<SignedExchangeSignature> signatures) {
    this.signatures = signatures;
  }

  public static SignedExchangeHeader parseSignedExchangeHeader(JsonInput input) {

    String requestUrl = null;

    String requestMethod = null;

    Number responseCode = null;

    Map<String, Object> responseHeaders = null;

    List<SignedExchangeSignature> signatures = null;

    input.beginObject();

    while (input.hasNext()) {

      switch (input.nextName()) {
        case "requestUrl":
          requestUrl = input.nextString();
          break;
        case "requestMethod":
          requestMethod = input.nextString();
          break;
        case "responseCode":
          responseCode = input.nextNumber();
          break;
        case "responseHeaders":
          responseHeaders = JsonInputConverter.extractMap(input);
          break;
        case "signatures":
          input.beginArray();
          signatures = new ArrayList<>();
          while (input.hasNext()) {
            signatures.add(SignedExchangeSignature.parseSignedExchangeSignature(input));
          }
          input.endArray();
          break;
        default:
          input.skipValue();
          break;
      }

    }

    return new SignedExchangeHeader(requestUrl, requestMethod,
                                    Integer.valueOf(String.valueOf(responseCode)), responseHeaders,
                                    signatures);
  }
}
