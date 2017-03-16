package org.openqa.selenium.support;

import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;

@Retention(RetentionPolicy.RUNTIME)
public @interface PageFactoryFinder {
  Class<? extends AbstractFindByBuilder> value();
}
