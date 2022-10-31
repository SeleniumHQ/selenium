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

package org.openqa.selenium.support.proxy;

import java.lang.reflect.Method;
import java.util.concurrent.Callable;

public interface MethodCallListener {

  /**
   * The callback to be invoked before any public method of the proxy is called.
   * The implementation is not expected to throw any exceptions. If a
   * runtime exception is thrown then it is going to be silently logged.
   *
   * @param obj The proxy instance
   * @param method Method to be called
   * @param args Array of method arguments
   */
  default void beforeCall(Object obj, Method method, Object[] args) {
    throw new NotImplementedException();
  }

  /**
   * Override this callback in order to change/customize the behavior
   * of a single or multiple methods. The original method result
   * will be replaced with the result returned by this callback.
   * Also, any exception thrown by it will replace original method(s)
   * exception.
   *
   * @param obj The proxy instance
   * @param method Method to be replaced
   * @param args Array of method arguments
   * @param original The reference to the original method in case it is necessary to
   *                 instrument its result.
   * @return It is expected that the type of the returned argument could be cast to
   * the returned type of the original method.
   */
  default Object call(Object obj, Method method, Object[] args, Callable<?> original) throws Throwable {
    throw new NotImplementedException();
  }

  /**
   * The callback to be invoked after any public method of the proxy is called.
   * The implementation is not expected to throw any exceptions. If a
   * runtime exception is thrown then it is going to be silently logged.
   *
   * @param obj The proxy instance
   * @param method Method to be called
   * @param args Array of method arguments
   */
  default void afterCall(Object obj, Method method, Object[] args, Object result) {
    throw new NotImplementedException();
  }

  /**
   * The callback to be invoked if a public method or its
   * {@link #call(Object, Method, Object[], Callable) Call} replacement throws an exception.
   *
   * @param obj The proxy instance
   * @param method Method to be called
   * @param args Array of method arguments
   * @param e Exception instance thrown by the original method invocation.
   * @return You could either (re)throw the exception in this callback or
   * overwrite the behavior and return a result from it. It is expected that the
   * type of the returned argument could be cast to the returned type of the original method.
   */
  default Object onError(Object obj, Method method, Object[] args, Throwable e) throws Throwable {
    throw new NotImplementedException();
  }
}
