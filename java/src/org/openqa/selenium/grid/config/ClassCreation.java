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

package org.openqa.selenium.grid.config;

import java.lang.reflect.Constructor;
import java.lang.reflect.Method;
import java.lang.reflect.Modifier;

class ClassCreation {

  private ClassCreation() {
    // Utility class
  }

  static <X> X callCreateMethod(String clazz, Class<X> typeOfClass, Config configToUse)
      throws ReflectiveOperationException {

    // Use the context class loader since this is what the `--ext`
    // flag modifies.
    Class<?> classClazz =
        Class.forName(clazz, true, Thread.currentThread().getContextClassLoader());

    try {
      Method create = classClazz.getMethod("create", org.openqa.selenium.grid.config.Config.class);

      if (!Modifier.isStatic(create.getModifiers())) {
        throw new IllegalArgumentException(
            String.format("Class %s's `create(Config)` method must be static", clazz));
      }

      if (!typeOfClass.isAssignableFrom(create.getReturnType())) {
        throw new IllegalArgumentException(
            String.format("Class %s's `create(Config)` method must be static", clazz));
      }

      return typeOfClass.cast(create.invoke(null, configToUse));
    } catch (NoSuchMethodException e) {
      // Check to see if there's a public no-arg constructor
      Constructor<? extends X> constructor;
      try {
        constructor = classClazz.asSubclass(typeOfClass).getConstructor();
      } catch (NoSuchMethodException e2) {
        throw new IllegalArgumentException(
            String.format(
                "Class %s must have a static `create(Config)` method or a default constructor",
                clazz));
      }
      return constructor.newInstance();
    }
  }
}
