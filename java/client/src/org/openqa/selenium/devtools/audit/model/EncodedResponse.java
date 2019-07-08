package org.openqa.selenium.devtools.audit.model;

import org.openqa.selenium.json.JsonInput;

public class EncodedResponse {

  /**
   * The encoded body as a base64 string. Omitted if sizeOnly is true.
   */
  private final String body;
  /**
   * Size before re-encoding.
   */
  private final int originalSize;
  /**
   * Size after re-encoding.
   */
  private final int encodedSize;

  public EncodedResponse(String body, int originalSize, int encodedSize) {
    this.body = body;
    this.originalSize = originalSize;
    this.encodedSize = encodedSize;
  }

  private static EncodedResponse fromJson(JsonInput input) {
    String body = null;
    Integer originalSize = null, encodedSize = null;
    while (input.hasNext()) {
      switch (input.nextName()) {
        case "body":
          body = input.nextString();
          break;
        case "originalSize":
          originalSize = input.read(Integer.class);
          break;
        case "encodedSize":
          encodedSize = input.read(Integer.class);
          break;
        default:
          input.skipValue();
          break;
      }
    }
    return new EncodedResponse(body, originalSize, encodedSize);
  }
}
