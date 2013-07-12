/*
Copyright 2013 Selenium committers
Copyright 2013 Software Freedom Conservancy.

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

package org.openqa.selenium.support.ui;

import com.google.common.base.Function;

import org.openqa.selenium.StaleElementReferenceException;

/**
 * Canned Conditions that can be used for both {@link ContextExpectedCondition}s and
 * {@link ExpectedCondition}s.
 */
class GenericConditions {

  private GenericConditions() {
    //Utility class
  }

  /**
   * An expectation with the logical opposite condition of the given condition.
   */
  public static <T> Function<T, Boolean> not(final Function<T, ?> condition) {
    return new Function<T, Boolean>() {
      @Override
      public Boolean apply(T object) {
        Object result = condition.apply(object);
        return result == null || result == Boolean.FALSE;
      }

      @Override
      public String toString() {
        return "condition to not be valid: " + condition;
      }
    };
  }

  /**
   * Wrapper for a condition, which allows for elements to update by redrawing.
   *
   * This works around the problem of conditions which have two parts: find an
   * element and then check for some condition on it. For these conditions it is
   * possible that an element is located and then subsequently it is redrawn on
   * the client. When this happens a {@link org.openqa.selenium.StaleElementReferenceException} is
   * thrown when the second part of the condition is checked.
   */
  public static <T, TT> Function<T, TT> refreshed(
      final Function<T, TT> condition) {
    return new Function<T, TT>() {
      @Override
      public TT apply(T driver) {
        try {
          return condition.apply(driver);
        } catch (StaleElementReferenceException e) {
          return null;
        }
      }

      @Override
      public String toString() {
        return String.format("condition (%s) to be refreshed", condition);
      }
    };
  }

}
