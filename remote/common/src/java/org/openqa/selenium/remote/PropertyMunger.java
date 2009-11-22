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

package org.openqa.selenium.remote;

import java.beans.BeanInfo;
import java.beans.Introspector;
import java.beans.PropertyDescriptor;
import java.lang.reflect.Method;

public class PropertyMunger {

  public static Object get(String name, Object on) throws Exception {
    BeanInfo info = Introspector.getBeanInfo(on.getClass());

    PropertyDescriptor[] properties = info.getPropertyDescriptors();
    for (PropertyDescriptor property : properties) {
      if (property.getName().equals(name)) {
        Object result = property.getReadMethod().invoke(on);
        return String.valueOf(result);
      }
    }

    return null;
  }

  public static void set(String name, Object on, Object value) throws Exception {
    BeanInfo info = Introspector.getBeanInfo(on.getClass());
    PropertyDescriptor[] properties = info.getPropertyDescriptors();
    for (PropertyDescriptor property : properties) {
      if (property.getName().equals(name)) {
        Method writeMethod = property.getWriteMethod();
        if (writeMethod == null) {
          return;
        }

        Class<?>[] types = writeMethod.getParameterTypes();
        if (types.length != 1) {
          return;
        }

        if (String.class.equals(types[0])) {
          writeMethod.invoke(on, value);
        }
      }
    }
  }
}
