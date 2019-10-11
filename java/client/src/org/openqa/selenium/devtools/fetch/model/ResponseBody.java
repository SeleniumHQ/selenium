package org.openqa.selenium.devtools.fetch.model;

import org.openqa.selenium.json.JsonInput;

import java.util.Objects;

public class ResponseBody {

  /**
   * Response body.
   */
  private final String body;
  /**
   * True, if content was sent as base64.
   */
  private final boolean base64Encoded;

  public ResponseBody(String body, boolean base64Encoded) {
    this.body = Objects.requireNonNull(body, "body is required");
    this.base64Encoded = base64Encoded;
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
}
