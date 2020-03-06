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

package org.openqa.selenium.remote.server.handler;

import org.openqa.selenium.remote.server.Session;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class SendKeys extends WebElementHandler<Void> {

  private final List<String> keys = new ArrayList<>();

  public SendKeys(Session session) {
    super(session);
  }

  @SuppressWarnings({"unchecked"})
  @Override
  public void setJsonParameters(Map<String, Object> allParameters) throws Exception {
    super.setJsonParameters(allParameters);
    List<String> rawKeys = (List<String>) allParameters.get("value");
    keys.addAll(rawKeys);
  }

  @Override
  public Void call() {
    String[] keysToSend = keys.toArray(new String[0]);
    getElement().sendKeys(keysToSend);

    return null;
  }

  @Override
  public String toString() {
    return String.format("[send keys: %s, %s]", getElementAsString(), keys);
  }
}
