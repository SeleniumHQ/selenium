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

package org.openqa.selenium.support;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Used to mark a field on a Page Object to indicate an alternative mechanism
 * for locating the element. Used in conjunction with
 * {@link org.openqa.selenium.support.PageFactory#proxyElement(org.openqa.selenium.WebDriver, Object, java.lang.reflect.Field)}
 * this allows users to quickly and easily create PageObjects
 */
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.FIELD)
public @interface FindBy {
  How how() default How.ID;
  String using() default "";
  String id() default "";
  String name() default "";
  String className() default "";
  String tagName() default "";
  String linkText() default "";
  String partialLinkText() default "";
  String xpath() default "";
}
