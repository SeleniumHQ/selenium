package com.thoughtworks.selenium.internal;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class RegExTextMatchingStrategy implements TextMatchingStrategy {
    public boolean isAMatch(String compareThis, String with) {
        Pattern pattern = Pattern.compile(compareThis, Pattern.MULTILINE);
        Matcher matcher = pattern.matcher(with);
        return matcher.find();

    }
}
