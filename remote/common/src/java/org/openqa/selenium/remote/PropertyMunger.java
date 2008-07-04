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
