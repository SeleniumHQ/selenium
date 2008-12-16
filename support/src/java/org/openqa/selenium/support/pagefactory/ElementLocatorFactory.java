package org.openqa.selenium.support.pagefactory;

import org.openqa.selenium.support.pagefactory.ElementLocator;

import java.lang.reflect.Field;

/**
 * A factory for producing {@link ElementLocator}s. It is expected that
 * a new ElementLocator will be returned per call.
 */
public interface ElementLocatorFactory {
  /**
   * When a field on a class needs to be decorated with an 
   * {@link ElementLocator} this method will be called.
   * @param field
   * @return
   */
  ElementLocator createLocator(Field field);
}
