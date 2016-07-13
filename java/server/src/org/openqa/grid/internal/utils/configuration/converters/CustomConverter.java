package org.openqa.grid.internal.utils.configuration.converters;

import com.beust.jcommander.IStringConverter;

import java.util.HashMap;
import java.util.Map;

public class CustomConverter implements IStringConverter<Map<String,String>> {
  @Override
  public Map<String,String> convert(String value) {
    Map<String,String> custom = new HashMap<>();
    for (String pair : value.split(",")) {
      String[] pieces = pair.split("=");
      custom.put(pieces[0], pieces[1]);
    }
    return custom;
  }
}
