// Copyright 2007 Google Inc. All Rights Reserved.

package com.thoughtworks.webdriver.support;

import com.thoughtworks.webdriver.How;

import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;
import java.lang.annotation.ElementType;

/**
 * Used to mark a field on a Page Object to indicate an alternative mechanism
 * for locating the element. Used in conjunction with
 * {@link com.thoughtworks.webdriver.support.PageFactory#proxyElement(com.thoughtworks.webdriver.WebDriver, Object, java.lang.reflect.Field)}
 * this allows users to quickly and easily create PageObjects
 */
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.FIELD)
public @interface FindBy {
    How how() default How.ID;
    String using();
}
