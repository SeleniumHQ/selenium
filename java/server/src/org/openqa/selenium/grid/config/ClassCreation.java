package org.openqa.selenium.grid.config;

import java.lang.reflect.Method;
import java.lang.reflect.Modifier;

class ClassCreation {

  private ClassCreation() {
    // Utility class
  }

  static <X> X callCreateMethod(String clazz, Class<X> typeOfClass, Config configToUse)
    throws ReflectiveOperationException {
    try {
      // Use the context class loader since this is what the `--ext`
      // flag modifies.
      Class<?> ClassClazz = Class.forName(clazz, true, Thread.currentThread().getContextClassLoader());
      Method create = ClassClazz.getMethod("create", org.openqa.selenium.grid.config.Config.class);

      if (!Modifier.isStatic(create.getModifiers())) {
        throw new IllegalArgumentException(String.format(
          "Class %s's `create(Config)` method must be static", clazz));
      }

      if (!typeOfClass.isAssignableFrom(create.getReturnType())) {
        throw new IllegalArgumentException(String.format(
          "Class %s's `create(Config)` method must be static", clazz));
      }

      return typeOfClass.cast(create.invoke(null, configToUse));
    } catch (NoSuchMethodException e) {
      throw new IllegalArgumentException(String.format(
        "Class %s must have a static `create(Config)` method", clazz));
    }
  }
}
