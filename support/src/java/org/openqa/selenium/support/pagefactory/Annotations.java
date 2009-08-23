/*
Copyright 2007-2009 WebDriver committers
Copyright 2007-2009 Google Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

package org.openqa.selenium.support.pagefactory;

import org.openqa.selenium.By;
import org.openqa.selenium.support.ByIdOrName;
import org.openqa.selenium.support.CacheLookup;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.How;

import java.lang.reflect.Field;
import java.util.HashSet;
import java.util.Set;

public class Annotations {

  private Field field;

  public Annotations(Field field) {
    this.field = field;
  }

  public boolean isLookupCached() {
    return (field.getAnnotation(CacheLookup.class) != null);
  }

  public By buildBy() {
    assertOnlyOneMechansimIsSelected();

    By shortForm = getShortFormBy();
    if (shortForm != null) {
      return shortForm;
    }

    How how = How.ID_OR_NAME;
    String using = field.getName();

    FindBy findBy = field.getAnnotation(FindBy.class);
    if (findBy != null) {
      how = findBy.how();
      using = findBy.using();
    }

    switch (how) {
      case CLASS_NAME:
        return By.className(using);

      case ID:
        return By.id(using);

      case ID_OR_NAME:
        return new ByIdOrName(using);

      case LINK_TEXT:
        return By.linkText(using);

      case NAME:
        return By.name(using);

      case PARTIAL_LINK_TEXT:
        return By.partialLinkText(using);

      case TAG_NAME:
        return By.tagName(using);

      case XPATH:
        return By.xpath(using);

      default:
        throw new IllegalArgumentException("Cannot determine how to locate element");
    }
  }

  private By getShortFormBy() {
    FindBy findBy = field.getAnnotation(FindBy.class);
    if (findBy == null)
      return null;

    if (!"".equals(findBy.className()))
      return By.className(findBy.className());

    if (!"".equals(findBy.id()))
      return By.id(findBy.id());

    if (!"".equals(findBy.linkText()))
      return By.linkText(findBy.linkText());

    if (!"".equals(findBy.name()))
      return By.name(findBy.name());

    if (!"".equals(findBy.partialLinkText()))
      return By.partialLinkText(findBy.partialLinkText());

    if (!"".equals(findBy.tagName()))
      return By.tagName(findBy.tagName());

    if (!"".equals(findBy.xpath()))
      return By.xpath(findBy.xpath());

    // Fall through    
    return null;
  }

  private void assertOnlyOneMechansimIsSelected() {
    FindBy findBy = field.getAnnotation(FindBy.class);
    if (findBy == null)
      return;

    if (findBy.how() != null) {
      if (findBy.using() == null) {
        throw new IllegalArgumentException("If you set the 'how' property, you must also set 'using'");
      }
    }

    Set<String> finders = new HashSet<String>();
    if (!"".equals(findBy.using())) finders.add("how: " + findBy.using());
    if (!"".equals(findBy.className())) finders.add("class name:" + findBy.className());
    if (!"".equals(findBy.id())) finders.add("id: " + findBy.id());
    if (!"".equals(findBy.linkText())) finders.add("link text: " + findBy.linkText());
    if (!"".equals(findBy.name())) finders.add("name: " + findBy.name());
    if (!"".equals(findBy.partialLinkText())) finders.add("partial link text: " + findBy.partialLinkText());
    if (!"".equals(findBy.tagName())) finders.add("tag name: " + findBy.tagName());
    if (!"".equals(findBy.xpath())) finders.add("xpath: " + findBy.xpath());

    // A zero count is okay: it means to look by name or id.
    if (finders.size() > 1) {
      throw new IllegalArgumentException(
      				String.format("You must specify at most one location strategy. Number found: %d (%s)",
      								finders.size(), finders.toString()));
    }
  }
}
