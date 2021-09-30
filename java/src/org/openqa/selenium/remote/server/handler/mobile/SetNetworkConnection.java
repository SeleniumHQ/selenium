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

package org.openqa.selenium.remote.server.handler.mobile;

import org.openqa.selenium.mobile.NetworkConnection.ConnectionType;
import org.openqa.selenium.remote.server.Session;
import org.openqa.selenium.remote.server.handler.WebDriverHandler;
import org.openqa.selenium.remote.server.handler.html5.Utils;

import java.util.Map;

public class SetNetworkConnection extends WebDriverHandler<Number> {
  private volatile ConnectionType type;

  public SetNetworkConnection(Session session) {
    super(session);
  }

  @SuppressWarnings("unchecked")
  @Override
  public void setJsonParameters(Map<String, Object> allParameters) throws Exception {
    super.setJsonParameters(allParameters);
    Map<String, Object> parameters = (Map<String, Object>)allParameters.get("parameters");
    Number bitmask = (Number) parameters.get("type");
    type = new ConnectionType(bitmask.intValue());
  }

  @Override
  public Number call() {
    return Integer.parseInt(Utils.getNetworkConnection(getUnwrappedDriver()).setNetworkConnection(type).toString());
  }

  @Override
  public String toString() {
    return String.format("[set network connection : %s]", type.toString());
  }
}
