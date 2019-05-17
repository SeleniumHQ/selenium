package org.openqa.selenium.devtools.network.model;

import static java.util.Objects.requireNonNull;

import org.openqa.selenium.json.JsonInput;

/**
 * Object for storing Network response
 */
public class ResponseBody {

  /**
   * Response body
   */
  private final String body;

  /**
   * True, if content was sent as base64
   */
  private final Boolean base64Encoded;

  private ResponseBody(String body, Boolean base64Encoded) {
    this.body = requireNonNull(body, "'body' is required for ResponseBody");
    this.base64Encoded = requireNonNull(base64Encoded, "'base64Encoded' is required for ResponseBody");
  }

  private static ResponseBody fromJson(JsonInput input) {
    String body = input.nextString();
    Boolean base64Encoded = null;

    while (input.hasNext()) {

      switch (input.nextName()) {
        case "base64Encoded":
          base64Encoded = input.nextBoolean();
          break;

        default:
          input.skipValue();
          break;
      }
    }

    return new ResponseBody(body, base64Encoded);
  }

  public String getBody() {
    return body;
  }

  public Boolean getBase64Encoded() {
    return base64Encoded;
  }

  @Override
  public String toString() {
    return "ResponseBody{" +
           "body='" + body + '\'' +
           ", base64Encoded=" + base64Encoded +
           '}';
  }

}
