package com.thoughtworks.webdriver.selenium;

public interface TextMatchingStrategy {
    boolean isAMatch(String compareThis, String with);
}
