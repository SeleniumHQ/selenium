package com.thoughtworks.selenium.internal;

import java.util.regex.Matcher;
import java.util.regex.Pattern;


public class GlobTextMatchingStrategy implements TextMatchingStrategy {
    public boolean isAMatch(String compareThis, String with) {
        String regex = compareThis.replace(".", "\\.").replace("*", ".*").replace("?", ".?");
        Pattern pattern = Pattern.compile(regex, Pattern.MULTILINE);
        Matcher matcher = pattern.matcher(with);

        return matcher.find();
    }
}
