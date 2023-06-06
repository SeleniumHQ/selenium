package org.openqa.selenium.testing;

import org.openqa.selenium.testing.drivers.Browser;

import java.lang.annotation.ElementType;
import java.lang.annotation.Repeatable;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.METHOD)
@Repeatable(NotWorkingInRemoteBazelBuildsList.class)
public @interface NotWorkingInRemoteBazelBuilds {

  Browser value() default Browser.ALL;

}
