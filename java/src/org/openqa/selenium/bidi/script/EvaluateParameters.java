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

import java.util.HashMap;
import java.util.Map;

public class EvaluateParameters {

  private final Map<String, Object> map = new HashMap<>();

  public EvaluateParameters(Target target, String expression, boolean awaitPromise) {
    map.put("target", target.toMap());
    map.put("expression", expression);
    map.put("awaitPromise", awaitPromise);
  }

  public EvaluateParameters resultOwnership(ResultOwnership ownership) {
    map.put("resultOwnership", ownership.toString());
    return this;
  }

  public EvaluateParameters serializationOptions(SerializationOptions serializationOptions) {
    map.put("serializationOptions", serializationOptions.toJson());
    return this;
  }

  public EvaluateParameters userActivation(boolean userActivation) {
    map.put("userActivation", userActivation);
    return this;
  }

  public Map<String, Object> toMap() {
    return map;
  }
}
