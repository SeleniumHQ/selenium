package org.openqa.selenium.firefox;

import org.openqa.selenium.firefox.internal.ProfilesIni;
import org.openqa.selenium.firefox.internal.RunningInstanceConnection;

import java.io.IOException;
import java.net.ConnectException;

public class FirefoxLauncher {
    private final FirefoxBinary binary;

    public FirefoxLauncher(FirefoxBinary binary) {
        this.binary = binary;
    }

    public static void main(String[] args) throws IOException {
        FirefoxLauncher launcher = new FirefoxLauncher(new FirefoxBinary());

        if (args.length == 0)
            launcher.createBaseWebDriverProfile("WebDriver");
        else if (args.length == 1)
            launcher.createBaseWebDriverProfile(args[0]);
        else
            launcher.createBaseWebDriverProfile(args[0], Integer.parseInt(args[1]));
    }

    public void createBaseWebDriverProfile() throws IOException {
        createBaseWebDriverProfile(null);
    }

    public void createBaseWebDriverProfile(String profileName) throws IOException {
        createBaseWebDriverProfile(profileName, FirefoxDriver.DEFAULT_PORT);
    }

    public void createBaseWebDriverProfile(String profileName, int port) throws IOException {
        // If there's a browser already running
        connectAndKill(port);

        System.out.println(String.format("Creating %s", profileName));
        try {
            binary.createProfile(profileName);
            System.out.println("Profile created");
            binary.waitFor();
        } catch (IOException e) {
            throw new RuntimeException(e);
        } catch (InterruptedException e) {
            throw new RuntimeException(e);
        }

        ProfilesIni allProfiles = new ProfilesIni();
        FirefoxProfile profile = allProfiles.getProfile(profileName);

        if (profile == null)
          throw new IllegalStateException(String.format("Unable to locate profile \"%s\"", profileName));

        System.out.println("Attempting to install the WebDriver extension");
        profile.addWebDriverExtensionIfNeeded(true);

        System.out.println("Updating user preferences with common, useful settings");
        profile.setPort(port);
        profile.updateUserPrefs();

        System.out.println("Deleting existing extensions cache (if it already exists)");
        profile.deleteExtensionsCacheIfItExists();

        System.out.println("Firefox should now start and quit");
        binary.startProfile(profile);
        
        repeatedlyConnectUntilFirefoxAppearsStable(port);
    }

    private void repeatedlyConnectUntilFirefoxAppearsStable(int port) {
      ExtensionConnection connection;
      // maximum wait time is a minute
      long maxWaitTime = System.currentTimeMillis() + 60000;
      
        while (System.currentTimeMillis() < maxWaitTime) {
            try {
                connection = new RunningInstanceConnection("localhost", port, 1000);
                Thread.sleep(2000);
                connection.quit();
                return;
            } catch (ConnectException e) {
                // Fine. Nothing listening. Perhaps in a restart?
            } catch (IOException e) {
                // Expected. It'll do that
            } catch (InterruptedException e) {
                throw new RuntimeException(e);
            }
        }
    }

    protected void connectAndKill(int port) {
        try {
            ExtensionConnection connection = new RunningInstanceConnection("localhost", port, 5000);
            connection.quit();
        } catch (ConnectException e) {
            // This is fine. It just means that Firefox isn't running with the webdriver extension installed already
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    public FirefoxBinary startProfile(FirefoxProfile profile, int port) throws IOException {
      FirefoxBinary binaryToUse = binary;
      if (binary == null) {
        binaryToUse = new FirefoxBinary();
      }

      FirefoxProfile profileToUse = profile.createCopy(port);
      binaryToUse.clean(profileToUse);
      binaryToUse.startProfile(profileToUse);
      return binaryToUse;
    }
}
