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

import java.io.StringReader;
import java.util.Map;
import java.util.function.Function;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.bidi.BiDi;
import org.openqa.selenium.bidi.Command;
import org.openqa.selenium.bidi.HasBiDi;
import org.openqa.selenium.bidi.storage.DeleteCookiesParameters;
import org.openqa.selenium.bidi.storage.GetCookiesParameters;
import org.openqa.selenium.bidi.storage.GetCookiesResult;
import org.openqa.selenium.bidi.storage.PartitionKey;
import org.openqa.selenium.bidi.storage.SetCookieParameters;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.json.JsonInput;

public class Storage {
  private static final Json JSON = new Json();

  private final BiDi bidi;

  private final Function<JsonInput, GetCookiesResult> getCookiesResultMapper =
      jsonInput -> jsonInput.read(GetCookiesResult.class);

  private final Function<JsonInput, PartitionKey> partitionKeyResultMapper =
      jsonInput -> {
        Map<String, Object> response = jsonInput.read(Map.class);
        try (StringReader reader = new StringReader(JSON.toJson(response.get("partitionKey")));
            JsonInput input = JSON.newInput(reader)) {
          return input.read(PartitionKey.class);
        }
      };

  public Storage(WebDriver driver) {
    Require.nonNull("WebDriver", driver);

    if (!(driver instanceof HasBiDi)) {
      throw new IllegalArgumentException("WebDriver instance must support BiDi protocol");
    }

    this.bidi = ((HasBiDi) driver).getBiDi();
  }

  public GetCookiesResult getCookies(GetCookiesParameters params) {
    return this.bidi.send(
        new Command<>("storage.getCookies", params.toMap(), getCookiesResultMapper));
  }

  public PartitionKey setCookie(SetCookieParameters params) {
    return this.bidi.send(
        new Command<>("storage.setCookie", params.toMap(), partitionKeyResultMapper));
  }

  public PartitionKey deleteCookies(DeleteCookiesParameters params) {
    return this.bidi.send(
        new Command<>("storage.deleteCookies", params.toMap(), partitionKeyResultMapper));
  }
}
