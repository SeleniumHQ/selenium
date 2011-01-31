/*
Copyright 2011 WebDriver committers
Copyright 2011 Google Inc.

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


package org.openqa.selenium.internal;

import com.google.common.base.Function;

public class TraceFactory {
  private static Function<Class<?>, Trace> generator = new NullTraceGenerator();

  public static Trace getTrace(Class<?> forClass) {
    return generator.apply(forClass);
  }

  public static synchronized void setGenerator(Function<Class<?>, Trace> generator) {
    TraceFactory.generator = generator;
  }
}
