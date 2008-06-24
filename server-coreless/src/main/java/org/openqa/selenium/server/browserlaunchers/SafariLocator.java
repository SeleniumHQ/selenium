package org.openqa.selenium.server.browserlaunchers;

import java.io.File;

/**
 * Discovers a valid Internet Explorer installation on local system.
 */
public class SafariLocator {

    private static final String DEFAULT_LOCATION = "/Applications/Safari.app/Contents/MacOS/Safari";
    
    public static String findBrowserLaunchLocation() {
        String defaultPath = System.getProperty("SafariDefaultPath");
        if (defaultPath == null) {
            if (WindowsUtils.thisIsWindows()) {
                defaultPath = WindowsUtils.getProgramFilesPath() + "\\Safari\\Safari.exe";
            } else {
                defaultPath = DEFAULT_LOCATION;
            }
        }
        File defaultLocation = new File(defaultPath);
        if (defaultLocation.exists()) {
            return defaultLocation.getAbsolutePath();
        }
        if (WindowsUtils.thisIsWindows()) {
            File safariEXE = AsyncExecute.whichExec("Safari.exe");
            if (safariEXE != null) return safariEXE.getAbsolutePath();
            throw new RuntimeException("Safari couldn't be found in the path!\n" +
                    "Please add the directory containing Safari.exe to your PATH environment\n" +
                    "variable, or explicitly specify a path to Safari like this:\n" +
                    "*safari c:\\blah\\safari.exe");
        }
        // On unix, prefer SafariBin if it's on the path
        File SafariBin = AsyncExecute.whichExec("Safari");
        if (SafariBin != null) {
            return SafariBin.getAbsolutePath();
        }
        throw new RuntimeException("Safari couldn't be found in the path!\n" +
                "Please add the directory containing 'Safari' to your PATH environment\n" +
                "variable, or explicitly specify a path to Safari like this:\n" +
                "*Safari /blah/blah/Safari");
    }

}
