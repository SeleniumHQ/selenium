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

package org.openqa.selenium;

import java.util.function.Supplier;
import org.openqa.selenium.internal.Require;

/** A combination of username and password to use when authenticating a browser with a website. */
public class UsernameAndPassword implements Credentials {

  private final String username;
  private final String password;

  public UsernameAndPassword(String username, String password) {
    this.username = Require.nonNull("User name", username);
    this.password = Require.nonNull("Password", password);
  }

  public static Supplier<Credentials> of(String username, String password) {
    Require.nonNull("User name", username);
    Require.nonNull("Password", password);

    Credentials creds = new UsernameAndPassword(username, password);

    return () -> creds;
  }

  public String username() {
    return username;
  }

  public String password() {
    return password;
  }
}
