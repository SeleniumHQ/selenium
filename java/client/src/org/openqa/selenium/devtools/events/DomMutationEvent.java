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

package org.openqa.selenium.devtools.events;

import org.openqa.selenium.WebElement;

public class DomMutationEvent {

  private final WebElement element;
  private final String attributeName;
  private final String currentValue;
  private final String oldValue;

  public DomMutationEvent(WebElement element, String attributeName, String currentValue, String oldValue) {
    this.element = element;
    this.attributeName = attributeName;
    this.currentValue = currentValue;
    this.oldValue = oldValue;
  }

  public WebElement getElement() {
    return element;
  }

  public String getAttributeName() {
    return attributeName;
  }

  public String getCurrentValue() {
    return currentValue;
  }

  public String getOldValue() {
    return oldValue;
  }
}
