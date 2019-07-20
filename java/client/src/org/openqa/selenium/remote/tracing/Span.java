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

package org.openqa.selenium.remote.tracing;

import java.io.Closeable;
import java.util.function.BiConsumer;

public interface Span extends Closeable {

  /**
   * Allows subclasses to indicate that this is the currently active span
   */
  Span activate();

  /**
   * Add a piece of metadata to the span, which allows high cardinality data to
   * be added to the span. This data will not be propagated to other spans.
   */
  Span addTag(String key, Object value);

  Span addTag(String key, boolean value);

  Span addTag(String key, Number value);

  void inject(BiConsumer<String, String> forEachField);

  @Override
  void close();
}
