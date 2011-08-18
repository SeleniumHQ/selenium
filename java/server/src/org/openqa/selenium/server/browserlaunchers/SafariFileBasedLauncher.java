package org.openqa.selenium.server.browserlaunchers;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.browserlaunchers.LauncherUtils;
import org.openqa.selenium.io.FileHandler;
import org.openqa.selenium.remote.CapabilityType;
import org.openqa.selenium.server.RemoteControlConfiguration;

import java.io.File;
import java.io.IOException;

public class SafariFileBasedLauncher extends SafariCustomProfileLauncher {

    public SafariFileBasedLauncher(Capabilities browserOptions,
                                   RemoteControlConfiguration configuration,
                                   String sessionId,
                                   String browserLaunchLocation) {
        super(browserOptions, configuration, sessionId, browserLaunchLocation);
    }
    
    @Override
    protected void launch(String url) {
        final String fileUrl;
        String query;

        query = LauncherUtils.getQueryString(url);
        query += "&driverUrl=http://localhost:" + getPort() + "/selenium-server/driver/";
        try {
            if (browserConfigurationOptions.is(
                    CapabilityType.ForSeleniumServer.ENSURING_CLEAN_SESSION)) {
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
            userExtensions = BrowserOptions.getFile(browserConfigurationOptions, "userExtensions");
            if (userExtensions != null) {
                userExtensionsJavascriptFile = new File(coreDir, "scripts/user-extensions.js");
                FileHandler.copy(userExtensions, userExtensionsJavascriptFile);
            }
            return new File(coreDir, "RemoteRunner.html");
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }
    
}
