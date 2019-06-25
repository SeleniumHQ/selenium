package org.openqa.selenium.devtools.page.model;

import org.openqa.selenium.Beta;
import org.openqa.selenium.json.JsonInput;

/**
 * Default font sizes.EXPERIMENTAL
 */
@Beta
public class FontSizes {

  /**
   * Default standard font size.
   */
  private final Integer standard;
  /**
   * Default fixed font size.
   */
  private final Integer fixed;

  public FontSizes(Integer standard, Integer fixed) {
    this.standard = standard;
    this.fixed = fixed;
  }

  private static FontSizes fromJson(JsonInput input) {
    Integer standard = null, fixed = null;
    input.beginObject();
    while (input.hasNext()) {
      switch (input.nextName()) {
        case "standard":
          standard = input.read(Integer.class);
          break;
        case "fixed":
          fixed = input.read(Integer.class);
          break;
        default:
          input.skipValue();
          break;
      }
    }
    input.endObject();
    return new FontSizes(standard, fixed);
  }
}
