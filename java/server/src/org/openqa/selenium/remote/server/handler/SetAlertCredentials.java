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

import org.openqa.selenium.remote.server.JsonParametersAware;
import org.openqa.selenium.remote.server.Session;
import org.openqa.selenium.security.Credentials;
import org.openqa.selenium.security.UserAndPassword;

import java.util.Map;

public class SetAlertCredentials extends WebDriverHandler<Void> implements JsonParametersAware {
  private String username;
  private String password;

  public SetAlertCredentials(Session session) {
    super(session);
  }

  public void setJsonParameters(Map<String, Object> allParameters) throws Exception {
    username = (String) allParameters.get("username");
    password = (String) allParameters.get("password");
  }

  @Override
  public Void call() throws Exception {
    Credentials credentials = new UserAndPassword(username, password);
    getDriver().switchTo().alert().setCredentials(credentials);
    return null;
  }

  @Override
  public String toString() {
    return "[set alert credentials]";
  }
}
