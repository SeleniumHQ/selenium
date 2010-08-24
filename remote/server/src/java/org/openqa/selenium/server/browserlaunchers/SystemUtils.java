package org.openqa.selenium.server.browserlaunchers;

import org.openqa.selenium.Platform;
import org.openqa.selenium.browserlaunchers.WindowsUtils;

import static org.openqa.selenium.Platform.MAC;

/**
 * Helper methods related to runtime operating system 
 */
public class SystemUtils {


    public static String libraryPathEnvironmentVariable() {
        if (WindowsUtils.thisIsWindows()) {
            return WindowsUtils.getExactPathEnvKey();
        }
        if (Platform.getCurrent().is(MAC)) {
            return "DYLD_LIBRARY_PATH";
        }
        // TODO other linux?
        return "LD_LIBRARY_PATH";
    }

    
}
