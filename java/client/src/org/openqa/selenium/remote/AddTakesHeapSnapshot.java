/*
Copyright 2013 Selenium committers

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

import org.openqa.selenium.HeapSnapshot;
import org.openqa.selenium.TakesHeapSnapshot;

import java.lang.reflect.Method;

class AddTakesHeapSnapshot implements AugmenterProvider {

  public Class<?> getDescribedInterface() {
    return TakesHeapSnapshot.class;
  }

  public InterfaceImplementation getImplementation(Object ignored) {
    return new InterfaceImplementation() {
      public Object invoke(ExecuteMethod executeMethod, Object self, Method method, Object... args) {
        Object data = executeMethod.execute(DriverCommand.HEAP_SNAPSHOT, null);
        return HeapSnapshot.ParseHeapSnapshot(data);
      }
    };
  }
}

