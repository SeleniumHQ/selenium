package com.googlecode.webdriver.support;

import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;
import java.lang.annotation.ElementType;

/**
 * Marker annotation to be applied to WebElements to indicate that it never
 * changes (that is, that the same instance in the DOM will always be used)
 */
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.FIELD)
public @interface CacheLookup {
}
