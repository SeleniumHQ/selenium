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
package org.openqa.selenium.bidi.generator;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Locale;
import java.util.Map;

/**
 * The sources one generator run emitted, keyed by srcjar path. Paths are derived here rather than
 * from the generator's own helpers, so a test also notices when a type lands in the wrong package.
 */
final class Generated {
  private static final String PROTOCOL_DIR = "org/openqa/selenium/bidi/protocol/";

  private final Map<String, String> sources;

  Generated(Map<String, String> sources) {
    this.sources = sources;
  }

  boolean has(String typeName) {
    return sources.containsKey(typePath(typeName));
  }

  String type(String typeName) {
    return read(typePath(typeName));
  }

  String module(String domain) {
    return read(
        PROTOCOL_DIR
            + "module/"
            + Character.toUpperCase(domain.charAt(0))
            + domain.substring(1)
            + ".java");
  }

  static String domainOf(String typeName) {
    int dot = typeName.indexOf('.');
    return dot >= 0 ? typeName.substring(0, dot) : typeName;
  }

  private static String typePath(String typeName) {
    int dot = typeName.indexOf('.');
    String simpleName = dot >= 0 ? typeName.substring(dot + 1) : typeName;
    return PROTOCOL_DIR + domainOf(typeName).toLowerCase(Locale.ROOT) + "/" + simpleName + ".java";
  }

  private String read(String path) {
    assertThat(sources).as("generated files: %s", sources.keySet()).containsKey(path);
    return sources.get(path);
  }
}
