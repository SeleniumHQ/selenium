package org.openqa.selenium.internal;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;

public class AltLookupStrategy implements LookupStrategy {
    public WebElement find(WebDriver driver, String use) {
        return driver.findElement(By.xpath("//*[@alt='" + use + "']"));
    }
}
