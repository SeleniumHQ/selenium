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

package org.openqa.selenium.support;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;
import org.openqa.selenium.By;
import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.SearchContext;
import org.openqa.selenium.WebElement;

public class ByIdOrName extends By implements Serializable {

  private static final long serialVersionUID = 3986638402799576701L;

  private By idFinder;
  private By nameFinder;
  private String idOrName;

  public ByIdOrName(String idOrName) {
    this.idOrName = idOrName;
    idFinder = By.id(idOrName);
    nameFinder = By.name(idOrName);
  }

  @Override
  public WebElement findElement(SearchContext context) {
    try {
      // First, try to locate by id
      return idFinder.findElement(context);
    } catch (NoSuchElementException e) {
      // Then by name
      return nameFinder.findElement(context);
    }
  }

  @Override
  public List<WebElement> findElements(SearchContext context) {
    List<WebElement> elements = new ArrayList<>();

    // First: Find by id ...
    elements.addAll(idFinder.findElements(context));
    // Second: Find by name ...
    elements.addAll(nameFinder.findElements(context));

    return elements;
  }

  @Override
  public String toString() {
    return "by id or name \"" + idOrName + '"';
  }
}
