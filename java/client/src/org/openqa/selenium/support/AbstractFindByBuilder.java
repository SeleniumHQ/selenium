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

import java.lang.reflect.Field;
import java.util.HashSet;
import java.util.Set;

public abstract class AbstractFindByBuilder {

  public abstract By buildIt(Object annotation, Field field);

  protected By buildByFromFindBy(FindBy findBy) {
    assertValidFindBy(findBy);

    By ans = buildByFromShortFindBy(findBy);
    if (ans == null) {
      ans = buildByFromLongFindBy(findBy);
    }

    return ans;
  }

  protected By buildByFromShortFindBy(FindBy findBy) {
    if (!"".equals(findBy.className())) {
      return By.className(findBy.className());
    }

    if (!"".equals(findBy.css())) {
      return By.cssSelector(findBy.css());
    }

    if (!"".equals(findBy.id())) {
      return By.id(findBy.id());
    }

    if (!"".equals(findBy.linkText())) {
      return By.linkText(findBy.linkText());
    }

    if (!"".equals(findBy.name())) {
      return By.name(findBy.name());
    }

    if (!"".equals(findBy.partialLinkText())) {
      return By.partialLinkText(findBy.partialLinkText());
    }

    if (!"".equals(findBy.tagName())) {
      return By.tagName(findBy.tagName());
    }

    if (!"".equals(findBy.xpath())) {
      return By.xpath(findBy.xpath());
    }

    // Fall through
    return null;
  }

  protected By buildByFromLongFindBy(FindBy findBy) {
    return findBy.how().buildBy(findBy.using());
  }

  protected void assertValidFindBys(FindBys findBys) {
    for (FindBy findBy : findBys.value()) {
      assertValidFindBy(findBy);
    }
  }

  protected void assertValidFindBy(FindBy findBy) {
    if (findBy.how() != null) {
      if (findBy.using() == null) {
        throw new IllegalArgumentException(
            "If you set the 'how' property, you must also set 'using'");
      }
    }

    Set<String> finders = new HashSet<>();
    if (!"".equals(findBy.using())) finders.add("how: " + findBy.using());
    if (!"".equals(findBy.className())) finders.add("class name:" + findBy.className());
    if (!"".equals(findBy.css())) finders.add("css:" + findBy.css());
    if (!"".equals(findBy.id())) finders.add("id: " + findBy.id());
    if (!"".equals(findBy.linkText())) finders.add("link text: " + findBy.linkText());
    if (!"".equals(findBy.name())) finders.add("name: " + findBy.name());
    if (!"".equals(findBy.partialLinkText()))
      finders.add("partial link text: " + findBy.partialLinkText());
    if (!"".equals(findBy.tagName())) finders.add("tag name: " + findBy.tagName());
    if (!"".equals(findBy.xpath())) finders.add("xpath: " + findBy.xpath());

    // A zero count is okay: it means to look by name or id.
    if (finders.size() > 1) {
      throw new IllegalArgumentException(
          String.format("You must specify at most one location strategy. Number found: %d (%s)",
                        finders.size(), finders.toString()));
    }
  }

  protected void assertValidFindAll(FindAll findBys) {
    for (FindBy findBy : findBys.value()) {
      assertValidFindBy(findBy);
    }
  }

}
