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

import org.openqa.selenium.WebElement;
import org.openqa.selenium.WrapsElement;
import org.openqa.selenium.remote.server.KnownElements;
import org.openqa.selenium.remote.server.Session;

import java.util.Map;

public class ElementEquality extends WebElementHandler<Boolean> {
  private volatile String otherId;

  public ElementEquality(Session session) {
    super(session);
  }

  @Override
  public void setJsonParameters(Map<String, Object> allParameters) throws Exception {
    super.setJsonParameters(allParameters);
    otherId = (String) allParameters.get("other");
  }

  @Override
  public Boolean call() {

    WebElement one = getElement();
    WebElement two = getKnownElements().get(otherId);

    // Unwrap the elements, if necessary
    if (one instanceof WrapsElement) {
      one = ((WrapsElement) one).getWrappedElement();
    }
    if (two instanceof KnownElements.ProxiedElement) {
      two = ((KnownElements.ProxiedElement) two).getWrappedElement();
    }

    return one.equals(two);
  }

  @Override
  public String toString() {
    return String.format("[equals: %s, %s]", getElementAsString(), otherId);
  }
}
