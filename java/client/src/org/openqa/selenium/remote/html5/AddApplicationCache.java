/*
Copyright 2007-2010 Selenium committers

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

package org.openqa.selenium.remote.html5;

import com.google.common.base.Throwables;

import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.html5.ApplicationCache;
import org.openqa.selenium.remote.AugmenterProvider;
import org.openqa.selenium.remote.ExecuteMethod;
import org.openqa.selenium.remote.InterfaceImplementation;

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;

public class AddApplicationCache implements AugmenterProvider {

  @Override
  public Class<?> getDescribedInterface() {
    return ApplicationCache.class;
  }

  @Override
  public InterfaceImplementation getImplementation(Object value) {
    return new InterfaceImplementation() {

      @Override
      public Object invoke(ExecuteMethod executeMethod, Object self, Method method, Object... args) {
        RemoteApplicationCache cache = new RemoteApplicationCache(executeMethod);
        try {
          return method.invoke(cache, args);
        } catch (IllegalAccessException e) {
          throw new WebDriverException(e);
        } catch (InvocationTargetException e) {
          throw Throwables.propagate(e.getCause());
        }
      }
    };
  }


}
