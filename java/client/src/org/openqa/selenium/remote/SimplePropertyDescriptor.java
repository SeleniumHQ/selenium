// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

package org.openqa.selenium.remote;

import java.lang.reflect.Method;
import java.util.HashMap;

public class SimplePropertyDescriptor {
  private String name;
  private Method readMethod;
  private Method writeMethod;

  public SimplePropertyDescriptor() {
  }

  public SimplePropertyDescriptor(String name, Method readMethod, Method writeMethod) {
    this.name = name;
    this.readMethod = readMethod;
    this.writeMethod = writeMethod;
  }

  public String getName() {
    return name;
  }

  public Method getReadMethod() {
    return readMethod;
  }

  public Method getWriteMethod() {
    return writeMethod;
  }

  public static SimplePropertyDescriptor[] getPropertyDescriptors(Class<? extends Object> clazz) {
    HashMap<String, SimplePropertyDescriptor> properties = new HashMap<>();
    for (Method m : clazz.getMethods()) {
      String methodName = m.getName();
      if (methodName.length() > 2 && methodName.startsWith("is")) {
        String propertyName = uncapitalize(methodName.substring(2));
        if (properties.containsKey(propertyName))
          properties.get(propertyName).readMethod = m;
        else
          properties.put(propertyName, new SimplePropertyDescriptor(propertyName, m, null));
      }
      if (methodName.length() <= 3) {
        continue;
      }
      String propertyName = uncapitalize(methodName.substring(3));
      if (methodName.startsWith("get") || methodName.startsWith("has")) {
        if (properties.containsKey(propertyName))
          properties.get(propertyName).readMethod = m;
        else
          properties.put(propertyName, new SimplePropertyDescriptor(propertyName, m, null));
      }
      if (methodName.startsWith("set")) {
        if (properties.containsKey(propertyName))
          properties.get(propertyName).writeMethod = m;
        else
          properties.put(propertyName, new SimplePropertyDescriptor(propertyName, null, m));
      }
    }
    SimplePropertyDescriptor[] pdsArray = new SimplePropertyDescriptor[properties.size()];
    return properties.values().toArray(pdsArray);
  }

  private static String uncapitalize(String s) {
    return s.substring(0, 1).toLowerCase() + s.substring(1);
  }
}
