package org.openqa.selenium.remote.server.handler.html5;

import org.openqa.selenium.UnsupportedCommandException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.remote.Augmenter;

/**
 * Utilities for working with the HTML5 APIs.
 */
class Utils {

  private static final Augmenter augmenter = new Augmenter();

  /**
   * Converts the given {@code driver} to another type. Will throw an
   * {@link UnsupportedCommandException} if the requested interface is not supported.
   */
  static <T> T convert(WebDriver driver, Class<T> clazz) throws UnsupportedCommandException {
    driver = augmenter.augment(driver);
    if (clazz.isInstance(driver)) {
      return clazz.cast(driver);
    }
    throw new UnsupportedCommandException("Driver does not support " + clazz.getSimpleName());
  }
}
