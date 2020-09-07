package org.openqa.selenium;

import org.openqa.selenium.internal.Require;

import java.net.URI;
import java.util.function.Predicate;
import java.util.function.Supplier;

/**
 * Indicates that a driver supports authentication in some way.
 */
public interface HasAuthentication {

  void register(Predicate<URI> whenThisMatches, Supplier<Credentials> useTheseCredentials);

  default void register(Supplier<Credentials> alwaysUseTheseCredentials) {
    Require.nonNull("Credentials", alwaysUseTheseCredentials);

    register(uri -> true, alwaysUseTheseCredentials);
  }

}
