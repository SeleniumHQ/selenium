package org.openqa.selenium.devtools.fetch.model;

import com.google.common.collect.ImmutableMap;
import org.openqa.selenium.json.JsonInput;

import java.util.Map;
import java.util.Objects;

public class HeaderEntry {

  private final String name;
  private final String value;

  public HeaderEntry(String name, String value) {
    this.name = Objects.requireNonNull(name);
    this.value = Objects.requireNonNull(value);
  }

  public String getName() {
    return name;
  }

  public String getValue() {
    return value;
  }

  private static HeaderEntry fromJson(JsonInput input) {
    String name = null;
    String value = null;

    input.beginObject();
    while (input.hasNext()) {
      switch (input.nextName()) {
        case "name":
          name = input.nextString();
          break;

        case "value":
          value = input.nextString();
          break;

        default:
          input.skipValue();
          break;
      }
    }
    input.endObject();

    return new HeaderEntry(name, value);
  }

  private Map<String, String> toJson() {
    return ImmutableMap.of("name", name, "value", value);
  }
}
