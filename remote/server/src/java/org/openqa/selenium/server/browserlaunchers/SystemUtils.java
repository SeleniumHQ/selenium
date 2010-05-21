package org.openqa.selenium.server.browserlaunchers;

import org.openqa.selenium.browserlaunchers.WindowsUtils;
import org.apache.tools.ant.taskdefs.condition.Os;

/**
 * Helper methods related to runtime operating system 
 */
public class SystemUtils {


    public static String libraryPathEnvironmentVariable() {
        if (WindowsUtils.thisIsWindows()) {
            return WindowsUtils.getExactPathEnvKey();
        }
        if (Os.isFamily("mac")) {
            return "DYLD_LIBRARY_PATH";
        }
        // TODO other linux?
        return "LD_LIBRARY_PATH";
    }

    
}
