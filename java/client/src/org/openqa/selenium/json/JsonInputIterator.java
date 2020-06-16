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

package org.openqa.selenium.json;

import static java.util.Spliterator.IMMUTABLE;
import static java.util.Spliterator.ORDERED;

import org.openqa.selenium.internal.Require;

import java.util.Iterator;
import java.util.Spliterator;
import java.util.Spliterators;
import java.util.stream.Stream;
import java.util.stream.StreamSupport;

class JsonInputIterator implements Iterator<JsonInput> {

  private final JsonInput jsonInput;

  JsonInputIterator(JsonInput jsonInput) {
    this.jsonInput = Require.nonNull("Json input", jsonInput);
  }

  @Override
  public boolean hasNext() {
    return jsonInput.hasNext();
  }

  @Override
  public JsonInput next() {
    return jsonInput;
  }

  public Stream<JsonInput> asStream() {
    Spliterator<JsonInput> spliterator = Spliterators.spliteratorUnknownSize(
        this,
        ORDERED & IMMUTABLE);

    return StreamSupport.stream(spliterator, false);
  }
}
