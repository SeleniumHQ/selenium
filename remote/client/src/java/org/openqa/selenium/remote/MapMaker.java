// Copyright 2008 Google Inc.  All Rights Reserved.

package org.openqa.selenium.remote;

import java.util.HashMap;
import java.util.Map;

public class MapMaker {

  public static Map<Object, Object> map(Object... keysToValues) {
    Map<Object, Object> toReturn = new HashMap<Object, Object>();
    for (int i = 0; i < keysToValues.length; i += 2) {
      toReturn.put(keysToValues[i], keysToValues[i + 1]);
    }

    return toReturn;
  }
}
