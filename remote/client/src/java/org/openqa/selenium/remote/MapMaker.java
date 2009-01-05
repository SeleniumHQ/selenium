/*
Copyright 2007-2009 WebDriver committers
Copyright 2007-2009 Google Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

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
