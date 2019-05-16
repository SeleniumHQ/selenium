package org.openqa.selenium.json;

import java.util.HashMap;
import java.util.Map;

public class JsonInputConverter {
  public static Double extractDouble(JsonInput input){
    Number number = input.nextNumber();
    return (null != number) ? number.doubleValue() : null;
  }

  public static Integer extractInt(JsonInput input){
    Number number = input.nextNumber();
    return (null != number) ? number.intValue() : null;
  }

  public static Map<String,Object> extractMap(JsonInput input){
    input.beginObject();
    Map map = new HashMap<>();
    while (input.hasNext()) {
      map.put(input.nextName(), input.nextString());
    }
    input.endObject();
    return map;
  }


}
