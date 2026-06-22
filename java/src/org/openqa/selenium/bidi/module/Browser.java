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

package org.openqa.selenium.bidi.module;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.openqa.selenium.Beta;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.bidi.BiDi;
import org.openqa.selenium.bidi.Command;
import org.openqa.selenium.bidi.HasBiDi;
import org.openqa.selenium.bidi.browser.ClientWindowInfo;
import org.openqa.selenium.bidi.browser.SetDownloadBehaviorParameters;
import org.openqa.selenium.json.JsonInput;

@Beta
public class Browser {
  private final BiDi bidi;

  private static final Function<JsonInput, String> userContextInfoMapper =
      json -> json.readMapElement("userContext");

  private static final Function<JsonInput, List<String>> userContextsInfoMapper =
      json -> {
        List<Map<String, String>> userContexts = json.readMapElement("userContexts");

        return userContexts.stream()
            .map(map -> map.get("userContext"))
            .collect(Collectors.toList());
      };

  private static final Function<JsonInput, List<ClientWindowInfo>> clientWindowsInfoMapper =
      json -> {
        List<Map<String, Object>> clientWindows = json.readMapElement("clientWindows");
        return clientWindows.stream()
            .map(map -> ClientWindowInfo.fromJson(map))
            .collect(Collectors.toList());
      };

  public Browser(WebDriver driver) {
    this.bidi = ((HasBiDi) driver).getBiDi();
  }

  public String createUserContext() {
    return bidi.send(new Command<>("browser.createUserContext", Map.of(), userContextInfoMapper));
  }

  public List<String> getUserContexts() {
    return bidi.send(new Command<>("browser.getUserContexts", Map.of(), userContextsInfoMapper));
  }

  public void removeUserContext(String userContext) {
    bidi.send(new Command<>("browser.removeUserContext", Map.of("userContext", userContext)));
  }

  public List<ClientWindowInfo> getClientWindows() {
    return bidi.send(new Command<>("browser.getClientWindows", Map.of(), clientWindowsInfoMapper));
  }

  public void setDownloadBehavior(SetDownloadBehaviorParameters parameters) {
    bidi.send(new Command<>("browser.setDownloadBehavior", parameters.toMap()));
  }
}
