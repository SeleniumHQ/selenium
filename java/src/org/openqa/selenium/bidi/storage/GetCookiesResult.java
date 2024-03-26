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

package org.openqa.selenium.bidi.storage;

import java.util.ArrayList;
import java.util.List;
import org.openqa.selenium.bidi.network.Cookie;
import org.openqa.selenium.json.JsonInput;
import org.openqa.selenium.json.TypeToken;

public class GetCookiesResult {
  private final List<Cookie> cookies;

  private final PartitionKey partitionKey;

  public GetCookiesResult(List<Cookie> cookies, PartitionKey partitionKey) {
    this.cookies = cookies;
    this.partitionKey = partitionKey;
  }

  public static GetCookiesResult fromJson(JsonInput input) {
    List<Cookie> cookies = new ArrayList<>();
    PartitionKey partitionKey = null;
    input.beginObject();
    while (input.hasNext()) {
      switch (input.nextName()) {
        case "cookies":
          cookies = input.read(new TypeToken<List<Cookie>>() {}.getType());
          break;

        case "partitionKey":
          partitionKey = input.read(PartitionKey.class);
          break;

        default:
          input.skipValue();
          break;
      }
    }

    input.endObject();

    return new GetCookiesResult(cookies, partitionKey);
  }

  public List<Cookie> getCookies() {
    return cookies;
  }

  public PartitionKey getPartitionKey() {
    return partitionKey;
  }
}
