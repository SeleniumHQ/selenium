package org.openqa.selenium.server.browserlaunchers;

import java.io.File;

/**
 * Discovers a valid Internet Explorer installation on local system.
 */
public class InternetExplorerLocator {

    protected static String findBrowserLaunchLocation() {
        String defaultPath = System.getProperty("internetExplorerDefaultPath");
        if (defaultPath == null) {
            defaultPath = WindowsUtils.getProgramFilesPath() + "\\Internet Explorer\\iexplore.exe";
        }
        File defaultLocation = new File(defaultPath);
        if (defaultLocation.exists()) {
            return defaultLocation.getAbsolutePath();
        }
        File iexploreEXE = AsyncExecute.whichExec("iexplore.exe");
        if (iexploreEXE != null) return iexploreEXE.getAbsolutePath();
        throw new RuntimeException("Internet Explorer couldn't be found in the path!\n" +
                "Please add the directory containing iexplore.exe to your PATH environment\n" +
                "variable, or explicitly specify a path to IE like this:\n" +
                "*iexplore c:\\blah\\iexplore.exe");
    }

    
}
