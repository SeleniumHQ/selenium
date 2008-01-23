package org.openqa.selenium;

import org.testng.ITestNGMethod;

import java.util.Arrays;
import java.util.List;

public class TestSelector {
    public static boolean select(ITestNGMethod testNGMethod) {
        String browserLauncher = System.getProperty("browserLauncher", "*firefox");
        boolean multiWindow = Boolean.parseBoolean(System.getProperty("multiWindow", "false"));
        boolean proxyInjection = Boolean.parseBoolean(System.getProperty("proxyInjection", "true"));
        List<String> methodGroups = Arrays.asList(testNGMethod.getGroups());

        if (methodGroups.contains("skip-" + browserLauncher)) {
            return false;
        }

        if (multiWindow && methodGroups.contains("skip-multiWindow")) {
            return false;
        }

        if (proxyInjection && methodGroups.contains("skip-proxyInjection")) {
            return false;
        }

        return true;
    }
}
