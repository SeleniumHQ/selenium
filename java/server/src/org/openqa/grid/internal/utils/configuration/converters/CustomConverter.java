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

package org.openqa.grid.internal.utils.configuration.converters;

import com.beust.jcommander.IStringConverter;

import java.util.HashMap;
import java.util.Map;

public class CustomConverter implements IStringConverter<Map<String,String>> {
  @Override
  public Map<String,String> convert(String value) {
    Map<String,String> custom = new HashMap<>();
    for (String pair : value.split(",")) {
      String[] pieces = pair.split("=");
      custom.put(pieces[0], pieces[1]);
    }
    return custom;
  }
}
