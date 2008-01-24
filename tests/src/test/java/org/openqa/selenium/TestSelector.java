package org.openqa.selenium;

import org.testng.ITestNGMethod;

import java.util.Arrays;
import java.util.List;

public class TestSelector {
    public static boolean select(ITestNGMethod testNGMethod) {
        String browser = System.getProperty("browser", "FIREFOX2");
        boolean multiWindow = Boolean.parseBoolean(System.getProperty("multiWindow", "false"));
        boolean proxyInjection = Boolean.parseBoolean(System.getProperty("proxyInjection", "true"));
        List<String> methodGroups = Arrays.asList(testNGMethod.getGroups());
        String os = TestReporter.getOs();

        if (methodGroups.contains("skip-" + browser)) {
            return false;
        }

        if (methodGroups.contains("skip-" + os)) {
            return false;
        }

        if (multiWindow && methodGroups.contains("skip-multiWindow")) {
            return false;
        }

        if (proxyInjection && methodGroups.contains("skip-proxyInjection")) {
            return false;
        }

        if (!proxyInjection && !multiWindow && methodGroups.contains("skip-normal")) {
            return false;
        }

        return true;
    }
}
