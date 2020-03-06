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

import org.openqa.selenium.Dimension;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.remote.server.Session;

import java.util.Map;

public class SetWindowSize extends WebDriverHandler<Void> {

  private Dimension size;

  public SetWindowSize(Session session) {
    super(session);
  }

  @Override
  public void setJsonParameters(Map<String, Object> allParameters) throws Exception {
    super.setJsonParameters(allParameters);
    int width, height;
    try {
      width = ((Number) allParameters.get("width")).intValue();
    } catch (ClassCastException ex) {
      throw new WebDriverException("Illegal (non-numeric) window width value passed: " + allParameters.get("width"), ex);
    }
    try {
      height = ((Number) allParameters.get("height")).intValue();
    } catch (ClassCastException ex) {
      throw new WebDriverException("Illegal (non-numeric) window height value passed: " + allParameters.get("height"), ex);
    }

    size = new Dimension(width, height);
  }

  @Override
  public Void call() {
    getDriver().manage().window().setSize(size);
    return null;
  }

  @Override
  public String toString() {
    return "[set window size]";
  }
}
