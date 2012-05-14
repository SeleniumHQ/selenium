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

package org.openqa.selenium.remote;

import java.lang.reflect.Method;

/**
 * An implementation of a particular interface, used by the
 * {@link org.openqa.selenium.remote.Augmenter}.
 */
public interface InterfaceImplementation {
  /**
   * Called when it has become apparent that this is the right interface to implement a particular
   * method.
   * 
   * @param executeMethod Call this to actually call the remote instance
   * @param self
   * @param method The method invoked by the user
   * @param args The arguments to the method @return The return value, which will be passed to the
   *        user directly.
   */
  Object invoke(ExecuteMethod executeMethod, Object self, Method method, Object... args);
}
