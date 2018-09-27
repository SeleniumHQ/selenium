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

package org.openqa.selenium.support.pagefactory;

import org.openqa.selenium.SearchContext;

import java.lang.reflect.Field;

public class AjaxElementLocatorFactory implements ElementLocatorFactory {
  private final SearchContext searchContext;
  private final int timeOutInSeconds;

  public AjaxElementLocatorFactory(SearchContext searchContext, int timeOutInSeconds) {
    this.searchContext = searchContext;
    this.timeOutInSeconds = timeOutInSeconds;
  }

  public ElementLocator createLocator(Field field) {
    return new AjaxElementLocator(searchContext, field, timeOutInSeconds);
  }
}
