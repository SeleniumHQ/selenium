package com.googlecode.webdriver.selenium.internal;

public interface TextMatchingStrategy {
    boolean isAMatch(String compareThis, String with);
}
