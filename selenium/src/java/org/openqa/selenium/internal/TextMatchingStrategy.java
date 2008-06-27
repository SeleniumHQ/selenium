package org.openqa.selenium.internal;

public interface TextMatchingStrategy {
    boolean isAMatch(String compareThis, String with);
}
