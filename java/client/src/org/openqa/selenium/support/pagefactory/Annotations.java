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

import org.openqa.selenium.By;
import org.openqa.selenium.support.AbstractFindByBuilder;
import org.openqa.selenium.support.ByIdOrName;
import org.openqa.selenium.support.CacheLookup;
import org.openqa.selenium.support.FindAll;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.FindBys;
import org.openqa.selenium.support.PageFactoryFinder;

import java.lang.annotation.Annotation;
import java.lang.reflect.Field;

public class Annotations extends AbstractAnnotations {
  private Field field;

  /**
   * @param field expected to be an element in a Page Object
   */
  public Annotations(Field field) {
    this.field = field;
  }

  /**
   * {@inheritDoc}
   *
   * @return true if @CacheLookup annotation exists on a field
   */
  @Override
  public boolean isLookupCached() {
    return (field.getAnnotation(CacheLookup.class) != null);
  }

  /**
   * {@inheritDoc}
   *
   * Looks for one of {@link org.openqa.selenium.support.FindBy},
   * {@link org.openqa.selenium.support.FindBys} or
   * {@link org.openqa.selenium.support.FindAll} field annotations. In case
   * no annotations provided for field, uses field name as 'id' or 'name'.
   * @throws IllegalArgumentException when more than one annotation on a field provided
   */
  @Override
  public By buildBy() {
    assertValidAnnotations();

    By ans = null;

    for (Annotation annotation : field.getDeclaredAnnotations()) {
      AbstractFindByBuilder builder = null;
      if (annotation.annotationType().isAnnotationPresent(PageFactoryFinder.class)) {
        try {
          builder = annotation.annotationType()
              .getAnnotation(PageFactoryFinder.class).value()
              .getDeclaredConstructor().newInstance();
        } catch (ReflectiveOperationException e) {
          // Fall through.
        }
      }
      if (builder != null) {
        ans = builder.buildIt(annotation, field);
        break;
      }
    }

    if (ans == null) {
      ans = buildByFromDefault();
    }

    if (ans == null) {
      throw new IllegalArgumentException("Cannot determine how to locate element " + field);
    }

    return ans;
  }

  protected Field getField() {
    return field;
  }

  protected By buildByFromDefault() {
    return new ByIdOrName(field.getName());
  }

  protected void assertValidAnnotations() {
    FindBys findBys = field.getAnnotation(FindBys.class);
    FindAll findAll = field.getAnnotation(FindAll.class);
    FindBy findBy = field.getAnnotation(FindBy.class);
    if (findBys != null && findBy != null) {
      throw new IllegalArgumentException("If you use a '@FindBys' annotation, " +
           "you must not also use a '@FindBy' annotation");
    }
    if (findAll != null && findBy != null) {
      throw new IllegalArgumentException("If you use a '@FindAll' annotation, " +
           "you must not also use a '@FindBy' annotation");
    }
    if (findAll != null && findBys != null) {
      throw new IllegalArgumentException("If you use a '@FindAll' annotation, " +
           "you must not also use a '@FindBys' annotation");
    }
  }
}
