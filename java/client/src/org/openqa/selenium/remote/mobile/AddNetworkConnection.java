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

package org.openqa.selenium.remote.mobile;

import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.mobile.NetworkConnection;
import org.openqa.selenium.remote.AugmenterProvider;
import org.openqa.selenium.remote.ExecuteMethod;
import org.openqa.selenium.remote.InterfaceImplementation;

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;

public class AddNetworkConnection implements AugmenterProvider {

  @Override
  public Class<?> getDescribedInterface() {
    return NetworkConnection.class;
  }

  @Override
  public InterfaceImplementation getImplementation(Object value) {
    return new InterfaceImplementation() {

      @Override
      public Object invoke(ExecuteMethod executeMethod, Object self, Method method,
                           Object... args) {
        NetworkConnection connection = new RemoteNetworkConnection(executeMethod);
        try {
          return method.invoke(connection, args);
        } catch (IllegalAccessException e) {
          throw new WebDriverException(e);
        } catch (InvocationTargetException e) {
          throw new RuntimeException(e.getCause());
        }
      }
    };
  }
}
