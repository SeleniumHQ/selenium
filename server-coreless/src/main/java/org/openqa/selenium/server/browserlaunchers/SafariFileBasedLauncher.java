package org.openqa.selenium.server.browserlaunchers;

import java.io.File;
import java.io.IOException;

import org.apache.tools.ant.taskdefs.condition.Os;
import org.apache.tools.ant.util.FileUtils;
import org.openqa.selenium.server.RemoteControlConfiguration;
import org.openqa.selenium.server.SeleniumServer;

public class SafariFileBasedLauncher extends SafariCustomProfileLauncher {

    public SafariFileBasedLauncher(RemoteControlConfiguration configuration,
            String sessionId) {
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
        String query = LauncherUtils.getQueryString(url);
        query += "&driverUrl=http://localhost:" + getPort() + "/selenium-server/driver/";
        try {
            if (SeleniumServer.isEnsureCleanSession()) {
                ensureCleanSession();
            }
            String fileUrl = createExtractedFiles().toURL() + "?" + query;

            cmdarray = new String[]{browserInstallation.launcherFilePath()};
            if (Os.isFamily("mac")) {
                cmdarray = new String[]{browserInstallation.launcherFilePath(), fileUrl};
            } else {
                cmdarray = new String[]{browserInstallation.launcherFilePath(), "-url", fileUrl};
            }
            log.info("Launching Safari...");

            exe.setCommandline(cmdarray);
            process = exe.asyncSpawn();
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    private File createExtractedFiles() {
        File dir = customProfileDir;
        File coreDir = new File(dir, "core");
        try {
            coreDir.mkdirs();
            ResourceExtractor.extractResourcePath(SafariFileBasedLauncher.class, "/core", coreDir);
            FileUtils f = FileUtils.getFileUtils();
            // custom user-extensions
            File userExt = this.getConfiguration().getUserExtensions();
            if (userExt != null) {
                File selUserExt = new File(coreDir, "scripts/user-extensions.js");
                f.copyFile(userExt, selUserExt, null, true);
            }
            return new File(coreDir, "RemoteRunner.html");
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }
    
}
