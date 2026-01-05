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

import org.openqa.selenium.By;

/**
 * @deprecated Use {@link org.openqa.selenium.support.pagefactory.How} instead.
 */
@Deprecated(forRemoval = false)
public enum How {
  CLASS_NAME(org.openqa.selenium.support.pagefactory.How.CLASS_NAME),
  CSS(org.openqa.selenium.support.pagefactory.How.CSS),
  ID(org.openqa.selenium.support.pagefactory.How.ID),
  ID_OR_NAME(org.openqa.selenium.support.pagefactory.How.ID_OR_NAME) {
    @Override
    public By buildBy(String value) {
      return new ByIdOrName(value);
    }
  },
  LINK_TEXT(org.openqa.selenium.support.pagefactory.How.LINK_TEXT),
  NAME(org.openqa.selenium.support.pagefactory.How.NAME),
  PARTIAL_LINK_TEXT(org.openqa.selenium.support.pagefactory.How.PARTIAL_LINK_TEXT),
  TAG_NAME(org.openqa.selenium.support.pagefactory.How.TAG_NAME),
  XPATH(org.openqa.selenium.support.pagefactory.How.XPATH),
  UNSET(org.openqa.selenium.support.pagefactory.How.UNSET);

  private final org.openqa.selenium.support.pagefactory.How delegate;

  How(org.openqa.selenium.support.pagefactory.How delegate) {
    this.delegate = delegate;
  }

  public By buildBy(String value) {
    return delegate.buildBy(value);
  }
}
