package org.openqa.selenium.internal;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

public interface LookupStrategy {
    WebElement find(WebDriver driver, String use);
}
