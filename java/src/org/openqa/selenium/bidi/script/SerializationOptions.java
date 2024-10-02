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

package org.openqa.selenium.bidi.script;

import java.util.Collections;
import java.util.Map;
import java.util.Optional;
import java.util.TreeMap;

public class SerializationOptions {
  public enum IncludeShadowTree {
    NONE,
    OPEN,
    ALL
  }

  private Optional<Long> maxDomDepth = Optional.empty();
  private Optional<Long> maxObjectDepth = Optional.empty();
  private Optional<IncludeShadowTree> includeShadowTree = Optional.empty();

  public void setMaxDomDepth(long value) {
    maxDomDepth = Optional.of(value);
  }

  public void setMaxObjectDepth(long value) {
    maxObjectDepth = Optional.of(value);
  }

  public void setIncludeShadowTree(IncludeShadowTree value) {
    includeShadowTree = Optional.of(value);
  }

  public Map<String, Object> toJson() {
    Map<String, Object> toReturn = new TreeMap<>();
    maxDomDepth.ifPresent(value -> toReturn.put("maxDomDepth", value));
    maxObjectDepth.ifPresent(value -> toReturn.put("maxObjectDepth", value));
    includeShadowTree.ifPresent(value -> toReturn.put("includeShadowTree", value.toString()));
    return Collections.unmodifiableMap(toReturn);
  }
}
