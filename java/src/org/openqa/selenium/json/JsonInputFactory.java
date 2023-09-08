package org.openqa.selenium.json;

import java.io.StringReader;

public class JsonInputFactory {
  public static JsonInput createJsonInput(String json) {
    return new JsonInput(new StringReader(json), new JsonTypeCoercer(), PropertySetting.BY_NAME);
  }
}
