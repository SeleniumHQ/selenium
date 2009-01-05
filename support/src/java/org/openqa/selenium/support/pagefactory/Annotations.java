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
import org.openqa.selenium.How;
import org.openqa.selenium.support.ByIdOrName;
import org.openqa.selenium.support.CacheLookup;
import org.openqa.selenium.support.FindBy;

import java.lang.reflect.Field;

public class Annotations {
  private Field field;

  public Annotations(Field field) {
    this.field = field;
  }

  public boolean isLookupCached() {
    return (field.getAnnotation(CacheLookup.class) != null);
  }

  public By buildBy() {
    How how = How.ID_OR_NAME;
    String using = field.getName();

    FindBy findBy = field.getAnnotation(FindBy.class);
    if (findBy != null) {
      how = findBy.how();
      using = findBy.using();
    }

    switch (how) {
    case ID:
      return By.id(using);

    case ID_OR_NAME:
      return new ByIdOrName(using);

    case LINK_TEXT:
      return By.linkText(using);

    case NAME:
      return By.name(using);

    case XPATH:
      return By.xpath(using);

    default:
      throw new IllegalArgumentException("Cannot determine how to locate element");
    }
  }

}
