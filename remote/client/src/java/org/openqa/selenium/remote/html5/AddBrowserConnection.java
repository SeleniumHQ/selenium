/*
Copyright 2007-2010 WebDriver committers
Copyright 2007-2010 Google Inc.

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

import java.lang.reflect.Method;

import org.openqa.selenium.html5.BrowserConnection;
import org.openqa.selenium.remote.AugmenterProvider;
import org.openqa.selenium.remote.DriverCommand;
import org.openqa.selenium.remote.ExecuteMethod;
import org.openqa.selenium.remote.InterfaceImplementation;

import com.google.common.collect.ImmutableMap;

public class AddBrowserConnection implements AugmenterProvider {

  public Class<?> getDescribedInterface() {
    return BrowserConnection.class;
  }
  
  public InterfaceImplementation getImplementation(Object value) {
    return new InterfaceImplementation() {
      
      public Object invoke(ExecuteMethod executeMethod, Method method,
          Object... args) {
        if ("setOnline".equals(method.getName())) {
          return executeMethod.execute(DriverCommand.SET_BROWSER_ONLINE,
              ImmutableMap.of("state", args[0]));
        } else if ("isOnline".equals(method.getName())) {
          return executeMethod.execute(DriverCommand.IS_BROWSER_ONLINE, null);
        }
        return null;
      }
    };
  }
}
