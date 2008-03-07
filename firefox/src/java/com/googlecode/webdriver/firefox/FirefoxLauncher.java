package com.googlecode.webdriver.firefox;

import com.googlecode.webdriver.firefox.internal.Cleanly;
import com.googlecode.webdriver.firefox.internal.FirefoxProfile;
import com.googlecode.webdriver.firefox.internal.ProfilesIni;
import com.googlecode.webdriver.firefox.internal.RunningInstanceConnection;
import com.googlecode.webdriver.internal.OperatingSystem;

import java.io.BufferedInputStream;
import java.io.BufferedOutputStream;
import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.FileWriter;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.ConnectException;
import java.text.MessageFormat;

public class FirefoxLauncher {
    public static void main(String[] args) {
        FirefoxLauncher launcher = new FirefoxLauncher();

        if (args.length == 0)
            launcher.createBaseWebDriverProfile();
        else if (args.length == 1)
            launcher.createBaseWebDriverProfile(args[0]);
        else
        	launcher.createBaseWebDriverProfile(args[0], Integer.parseInt(args[1]));
    }

    public void createBaseWebDriverProfile() {
        createBaseWebDriverProfile(FirefoxDriver.DEFAULT_PROFILE);
    }

    public void createBaseWebDriverProfile(String profileName) {
        createBaseWebDriverProfile(profileName, FirefoxDriver.DEFAULT_PORT);
    }

    public void createBaseWebDriverProfile(String profileName, int port) {
        // If there's a browser already running
        connectAndKill(port);

        File firefox = locateFirefoxBinary(null);

        System.out.println(MessageFormat.format("Creating {0}", profileName));
        Process process;
        try {
            ProcessBuilder builder = new ProcessBuilder(firefox.getAbsolutePath(), "-CreateProfile", profileName).redirectErrorStream(true);
            builder.environment().put("MOZ_NO_REMOTE", "1");
            process = builder.start();

            process.waitFor();

            System.out.println(getNextLineOfOutputFrom(process));
        } catch (IOException e) {
            throw new RuntimeException(e);
        } catch (InterruptedException e) {
            throw new RuntimeException(e);
        }

        ProfilesIni allProfiles = new ProfilesIni();
        FirefoxProfile profile = allProfiles.getProfile(profileName);
        File extensionsDir = profile.getExtensionsDir();

        System.out.println("Attempting to install the WebDriver extension");
        installExtensionInto(extensionsDir);

        System.out.println("Updating user preferences with common, useful settings");
        profile.setPort(port);
        profile.updateUserPrefs();

        System.out.println("Deleting existing extensions cache (if it already exists)");
        profile.deleteExtensionsCacheIfItExists();

        System.out.println("Firefox should now start and quit");

        // These next two lines are a race condition. On a fast system, firefox
        // might be able to sort itself and restart before we attempt the first
        // connect
        startFirefox(firefox, profileName);
        
        repeatedlyConnectUntilFirefoxAppearsStable(port);
    }

    private void repeatedlyConnectUntilFirefoxAppearsStable(int port) {
      ExtensionConnection connection = null;
      // maximum wait time is a minute
      long maxWaitTime = System.currentTimeMillis() + 60000;
      
        while (System.currentTimeMillis() < maxWaitTime) {
            try {
                connection = new RunningInstanceConnection("localhost", port, 1000);
                sleep(4000);
                connection.quit();
                return;
            } catch (ConnectException e) {
                // Fine. Nothing listening. Perhaps in a restart?
            } catch (IOException e) {
                // Expected. It'll do that
            }
        }
    }

    private void sleep(long timeInMillis) {
        try {
            Thread.sleep(timeInMillis);
        } catch (InterruptedException e) {
            throw new RuntimeException(e);
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

    private void startFirefox(File firefox, String profileName) {
        try {
            ProcessBuilder builder = new ProcessBuilder(firefox.getAbsolutePath(), "-P", profileName).redirectErrorStream(true);
            builder.environment().put("MOZ_NO_REMOTE", "1");
            builder.start();
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    protected void installExtensionInto(File extensionsDir) {
        String home = System.getProperty("webdriver.firefox.development");
        if (home != null) {
            installDevelopmentExtension(extensionsDir, home);
        } else {
            throw new UnsupportedOperationException("This hasn't been written yet");
        }
    }

    private void installDevelopmentExtension(File extensionsDir, String home) {
        if (!home.endsWith("extension"))
            throw new RuntimeException("The given source directory does not look like a source " +
                    "directory for the extension: " + home);

        extensionsDir.mkdirs();
        
        File writeTo = new File(extensionsDir, "fxdriver@googlecode.com");
        if (writeTo.exists()) {
            writeTo.delete();
        }

        FileWriter writer = null;
        try {
            writer = new FileWriter(writeTo);
            writer.write(home);
        } catch (IOException e) {
            throw new RuntimeException(e);
        } finally {
            Cleanly.close(writer);
        }
    }

    public Process startProfile(File profileDir, int port) {
        return startProfile(profileDir, null, port);
    }

    public Process startProfile(File originalProfileDir, File firefoxBinary, int port) {
        File binary = locateFirefoxBinary(firefoxBinary);

        try {
            // Find the "normal" WebDriver profile, and make a copy of it
            if (!originalProfileDir.exists())
                throw new RuntimeException(MessageFormat.format("Found the profile directory does not exist: {0}",
                        originalProfileDir.getAbsolutePath()));
            File profileDir = createCopyOfProfile(originalProfileDir, port);

            ProcessBuilder builder = new ProcessBuilder(binary.getAbsolutePath()).redirectErrorStream(true);
            modifyLibraryPath(builder, binary);
            builder.environment().put("MOZ_NO_REMOTE", "1");
            builder.environment().put("XRE_PROFILE_PATH", profileDir.getAbsolutePath());
            return builder.start();
        } catch (IOException e) {
            throw new RuntimeException("Cannot load firefox: " + originalProfileDir);
        }
    }

    protected void modifyLibraryPath(ProcessBuilder builder, File binary) {
        String propertyName;

        OperatingSystem os = OperatingSystem.getCurrentPlatform();
        switch (os) {
            case MAC:
                propertyName = "DYLD_LIBRARY_PATH";
                break;

            case WINDOWS:
                propertyName = "PATH";
                break;

            default:
                propertyName = "LD_LIBRARY_PATH";
                break;
        }

        String libraryPath = System.getenv(propertyName);
        if (libraryPath == null) {
            libraryPath = "";
        }

        String firefoxLibraryPath = System.getProperty("webdriver.firefox.library.path", binary.getParentFile().getAbsolutePath());

        libraryPath = firefoxLibraryPath + File.pathSeparator + libraryPath;

        builder.environment().put(propertyName, libraryPath);
    }

    protected File createCopyOfProfile(File from, int port) {
        File tmpDir = new File(System.getProperty("java.io.tmpdir"));
        File to = new File(tmpDir, "webdriver-" + System.currentTimeMillis());
        to.mkdirs();

        copy(from, to);
        FirefoxProfile profile = new FirefoxProfile(to);
        profile.setPort(port);
        profile.updateUserPrefs();

        return to;
    }

  protected void copy(File from, File to) {
        String[] contents = from.list();
        for (String child : contents) {
            File toCopy = new File(from, child);
            File target = new File(to, child);

            if (toCopy.isDirectory()) {
                target.mkdir();
                copy(toCopy, target);
            } else if (!".parentlock".equals(child)) {
                copyFile(toCopy, target);
            }
        }
    }

    private void copyFile(File from, File to) {
        BufferedOutputStream out = null;
        BufferedInputStream in = null;
        try {
            out = new BufferedOutputStream(new FileOutputStream(to));
            in = new BufferedInputStream(new FileInputStream(from));

            int read = in.read();
            while (read != -1) {
                out.write(read);
                read = in.read();
            }
        } catch (IOException e) {
            throw new RuntimeException(e);
        } finally {
            Cleanly.close(out);
            Cleanly.close(in);
        }
    }

    protected File locateFirefoxBinary(File suggestedLocation) {
        if (suggestedLocation != null) {
            if (suggestedLocation.exists() && suggestedLocation.isFile())
                return suggestedLocation;
            else
                throw new RuntimeException("Given firefox binary location does not exist or is not a real file: " + suggestedLocation);
        }

        File binary = locateFirefoxBinaryFromSystemProperty();
        if (binary != null)
            return binary;

        OperatingSystem os = OperatingSystem.getCurrentPlatform();
        switch (os) {
            case WINDOWS:
                String programFiles = System.getenv("PROGRAMFILES");
                if (programFiles == null)
                    programFiles = "\\Program Files";
                binary = new File(
                        programFiles + "\\Mozilla Firefox\\firefox.exe");
                break;

            case MAC:
                binary = new File("/Applications/Firefox.app/Contents/MacOS/firefox");
                break;

            default:
                String[] binaryNames = new String[]{"firefox3", "firefox2", "firefox"};
                for (String name : binaryNames) {
                    binary = shellOutAndFindPathOfFirefox(name);
                    if (binary != null)
                        break;
                }
                break;
        }

        if (binary == null) {
            throw new RuntimeException("Cannot find firefox binary in PATH. Make sure firefox " +
                    "is installed");
        }

        if (binary.exists())
            return binary;

        throw new RuntimeException("Unable to locate firefox binary. Please check that it is installed in the default location, " +
                "or the path given points to the firefox binary. I would have used: " + binary.getPath());
    }

    protected File locateFirefoxBinaryFromSystemProperty() {
        String binaryName = System.getProperty("webdriver.firefox.bin");
        if (binaryName == null)
            return null;

        File binary = new File(binaryName);
        if (binary.exists())
            return binary;

        switch (OperatingSystem.getCurrentPlatform()) {
            case WINDOWS:
                return null;

            case MAC:
                if (!binaryName.endsWith(".app"))
                    binaryName += ".app";
                binaryName += "/Contents/MacOS/firefox";
                return new File(binaryName);

            default:
                return shellOutAndFindPathOfFirefox(binaryName);
        }
    }

    private File shellOutAndFindPathOfFirefox(String binaryName) {
        // Assume that we're on a unix of some kind. We're going to cheat
        try {
            Process which = Runtime.getRuntime().exec(new String[]{"which", binaryName});
            String result = getNextLineOfOutputFrom(which);
            return result == null ? null : new File(result);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }


    // Assumes that the process has exited
    private String getNextLineOfOutputFrom(Process process) {
        BufferedReader reader = null;
        try {
            reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
            return reader.readLine();
        } catch (IOException e) {
            throw new RuntimeException(e);
        } finally {
            Cleanly.close(reader);
        }
    }
}
