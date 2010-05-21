package org.openqa.selenium.server.browserlaunchers;

import org.openqa.selenium.browserlaunchers.Proxies;
import org.openqa.selenium.server.BrowserConfigurationOptions;
import org.openqa.selenium.server.RemoteControlConfiguration;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.PrintStream;

public class KonquerorLauncher extends AbstractBrowserLauncher {
    private static final String KONQUEROR_PROFILE_SRC_LOCATION = "/konqueror";

    private static final String KONQUEROR_PROFILE_DEST_LOCATION = System.getProperty("user.home") + "/.kde/share/config";

    private static final String DEFAULT_KONQUEROR_LOCATION = "/usr/bin/konqueror";

    private Process process;

    private String browserLaunchLocation;

    public KonquerorLauncher(BrowserConfigurationOptions browserOptions, RemoteControlConfiguration configuration, String sessionId, String browserLaunchLocation) {
        super(sessionId, configuration, browserOptions);
        this.browserLaunchLocation = browserLaunchLocation;
    }

    @Override
    protected void launch(String url) {
        try {
            makeCustomProfile();
        } catch (IOException e) {
            e.printStackTrace();
        }
        exec(browserLaunchLocation + " " + url);
    }

    private void makeCustomProfile() throws IOException {
        File profileDest = new File(KONQUEROR_PROFILE_DEST_LOCATION);
        ResourceExtractor.extractResourcePath(getClass(), KONQUEROR_PROFILE_SRC_LOCATION, profileDest);


      File pacFile = Proxies.makeProxyPAC(new File(KONQUEROR_PROFILE_DEST_LOCATION), getPort(),
          browserConfigurationOptions.asCapabilities());

        File kioslaverc = new File(KONQUEROR_PROFILE_DEST_LOCATION, "kioslaverc");
        PrintStream out = new PrintStream(new FileOutputStream(kioslaverc));
        out.println("PersistentProxyConnection=false");
        out.println("[Proxy Settings]");
        out.println("AuthMode=0");
        out.println("Proxy Config Script=file://" + pacFile.getAbsolutePath());
        out.println("ProxyType=2");
        out.println("ReversedException=false");
        out.close();

    }

    public void close() {
        if (process == null) return;
        AsyncExecute.killProcess(process);
    }

    public Process getProcess() {
        return process;
    }

    protected void exec(String command) {
        try {
            process = Runtime.getRuntime().exec(command);
        } catch (IOException e) {
            throw new RuntimeException("Error starting browser by executing command " + command + ": " + e + "\n See http://openqa.org/selenium-rc/help/launching-konqueror.html");
        }
    }

}
