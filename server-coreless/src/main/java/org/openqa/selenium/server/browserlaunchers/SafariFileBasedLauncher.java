package org.openqa.selenium.server.browserlaunchers;

import org.apache.tools.ant.util.FileUtils;
import org.openqa.selenium.server.RemoteControlConfiguration;
import org.openqa.selenium.server.SeleniumServer;

import java.io.File;
import java.io.IOException;

public class SafariFileBasedLauncher extends SafariCustomProfileLauncher {

    public SafariFileBasedLauncher(RemoteControlConfiguration configuration, String sessionId) {
        super(configuration, sessionId);
    }

    public SafariFileBasedLauncher(RemoteControlConfiguration configuration,
                                   String sessionId, String browserLaunchLocation) {
        super(configuration, sessionId, browserLaunchLocation);
    }

    public SafariFileBasedLauncher(RemoteControlConfiguration configuration,
                                   String sessionId, BrowserInstallation browserInstallation) {
        super(configuration, sessionId, browserInstallation);
    }
    
    @Override
    protected void launch(String url) {
        final String fileUrl;
        String query;

        query = LauncherUtils.getQueryString(url);
        query += "&driverUrl=http://localhost:" + getPort() + "/selenium-server/driver/";
        try {
            if (SeleniumServer.isEnsureCleanSession()) {
                ensureCleanSession();
            }
            fileUrl = createExtractedFiles().toURL() + "?" + query;

            launchSafari(fileUrl);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    private File createExtractedFiles() {
        final File userExtensionsJavascriptFile;
        final File userExtensions;
        final File coreDir;

        coreDir = new File(customProfileDir, "core");
        try {
            coreDir.mkdirs();
            ResourceExtractor.extractResourcePath(SafariFileBasedLauncher.class, "/core", coreDir);
            // custom user-extensions
            userExtensions = getConfiguration().getUserExtensions();
            if (userExtensions != null) {
                userExtensionsJavascriptFile = new File(coreDir, "scripts/user-extensions.js");
                FileUtils.getFileUtils().copyFile(userExtensions, userExtensionsJavascriptFile, null, true);
            }
            return new File(coreDir, "RemoteRunner.html");
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }
    
}
