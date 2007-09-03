package com.thoughtworks.selenium.internal;

public interface TextMatchingStrategy {
    boolean isAMatch(String compareThis, String with);
}
