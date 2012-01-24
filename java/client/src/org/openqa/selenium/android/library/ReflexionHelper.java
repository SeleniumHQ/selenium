/*
Copyright 2011 Software Freedom Conservatory.

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

package org.openqa.selenium.android.library;

import org.openqa.selenium.WebDriverException;

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;

/**
 * Helper methods used for reflexion.
 */
/* package */ class ReflexionHelper {

  private static Method getMethod(Object obj, String name, Class[] argsClazz) {
    try {
      return obj.getClass().getMethod(name, argsClazz);
    } catch (NoSuchMethodException e) {
      try {
        return obj.getClass().getDeclaredMethod(name, argsClazz);
      } catch (NoSuchMethodException ex) {
      throw new WebDriverException(
          "The object you are using does not have "
          + "a " + name + " method", ex);
      }
    }
  }

  /* package */ static Object invoke(Object obj, String name,
        Class[] argsClazz, Object[] args) {
    Method method = getMethod(obj, name, argsClazz);
    try {
      return method.invoke(obj, args);
    } catch (IllegalAccessException e) {
      throw new WebDriverException(e);
    } catch (InvocationTargetException e) {
      throw new WebDriverException(e);
    }
  }
}
