package com.thoughtworks.webdriver.firefox;

import java.io.BufferedInputStream;
import java.io.BufferedOutputStream;
import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.io.Reader;
import java.io.Writer;
import java.net.ConnectException;
import java.text.MessageFormat;
import java.util.HashMap;
import java.util.Map;

public class FirefoxLauncher {
    public static void main(String[] args) {
        FirefoxLauncher launcher = new FirefoxLauncher();

        if (args.length == 0)
            launcher.createBaseWebDriverProfile();
        else
            launcher.createBaseWebDriverProfile(args[0]);
    }

    public void createBaseWebDriverProfile() {
        createBaseWebDriverProfile("WebDriver");
    }

    public void createBaseWebDriverProfile(String profileName) {
        // If there's a browser already running
        connectAndKill();

        File firefox = locateFirefoxBinary(null);

        System.out.println(MessageFormat.format("Creating {0}", profileName));
        Process process;
        try {
            process = new ProcessBuilder(firefox.getAbsolutePath(), "-CreateProfile", profileName).redirectErrorStream(true).start();

            process.waitFor();

            System.out.println(getNextLineOfOutputFrom(process));
        } catch (IOException e) {
            throw new RuntimeException(e);
        } catch (InterruptedException e) {
        	throw new RuntimeException(e);
        }

        File extensionsDir = locateWebDriverProfile(profileName);

        System.out.println("Attempting to install the WebDriver extension");
        installExtensionInto(extensionsDir);

        System.out.println("Updating user preferences with common, useful settings");
        updateUserPrefsFor(extensionsDir);

        System.out.println("Deleting existing extensions cache (if it already exists)");
        deleteExtensionsCacheIfItExists(extensionsDir);

        System.out.println("Firefox should now start and quit");

        startFirefox(firefox, profileName);
        watchForParentLockFile(extensionsDir);
        connectAndKill();
    }

    private void watchForParentLockFile(File extensionsDir) {
        // Take a look at: http://kb.mozillazine.org/Profile_in_use

        String parentLockName;
        switch (OperatingSystem.getCurrentPlatform()) {
            case WINDOWS:
              parentLockName = "parent.lock";
              break;

            default:
              parentLockName = ".parentlock";
              break;
        }

        File parentLock = new File(extensionsDir, parentLockName);
        long until = System.currentTimeMillis() + 2000;
        while (System.currentTimeMillis() < until) {
            // Lifted from Selenium RC's FirefoxLauncher
            if (!parentLock.exists() && makeSureFileLockRemainsGone(parentLock))
                return;
            sleep(250);
        }
    }

    private void sleep(long timeInMillis) {
        try {
            Thread.sleep(timeInMillis);
        } catch (InterruptedException e) {
            throw new RuntimeException(e);
        }
    }

  // Lifted from Selenium RC's FirefoxLauncher
    private boolean makeSureFileLockRemainsGone(File lock) {
        long until = System.currentTimeMillis() + 500;
        while (System.currentTimeMillis() < until) {
            sleep(500);
            if (lock.exists())
                return false;
        }

        if (!lock.exists()) {
            return true;
        }

        return false;
    }

    private void connectAndKill() {
        ExtensionConnection connection = new ExtensionConnection("localhost", 7055);
        try {
            long tryUntil = System.currentTimeMillis() + (5 * 1000);
            while (!connection.isConnected() && System.currentTimeMillis() < tryUntil) {
                try {
                    wait(2);
                    connection.connect();
                } catch (ConnectException e) {
                    // This is fine. It may just happen
                }
            }
            connection.sendMessageAndWaitForResponse("quit", 0, "");
        } catch (NullPointerException e) {
            // Expected. Swallow it.
            return;
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

    private void updateUserPrefsFor(File extensionsDir) {
        File userPrefs = new File(extensionsDir, "user.js");

        Map<String, String> prefs = new HashMap<String, String>();
        if (userPrefs.exists()) {
            prefs = readExistingPrefs(userPrefs);
            if (!userPrefs.delete())
                throw new RuntimeException("Cannot delete existing user preferences");
        }

        // Normal settings to facilitate testing
        prefs.put("app.update.enabled", "false");
        prefs.put("browser.download.manager.showWhenStarting", "false");
        prefs.put("browser.link.open_external", "2");
        prefs.put("browser.link.open_newwindow", "2");
        prefs.put("browser.search.update", "false");
        prefs.put("browser.shell.checkDefaultBrowser", "false");
        prefs.put("browser.startup.page", "0");
        prefs.put("browser.tabs.warnOnClose", "false");
        prefs.put("browser.tabs.warnOnOpen", "false");
        prefs.put("dom.disable_open_during_load", "false");
        prefs.put("extensions.update.enabled", "false");
        prefs.put("extensions.update.notifyUser", "false");
        prefs.put("security.warn_entering_secure", "false");
        prefs.put("security.warn_submit_insecure", "false");
        prefs.put("security.warn_entering_secure.show_once", "false");
        prefs.put("security.warn_entering_weak", "false");
        prefs.put("security.warn_entering_weak.show_once", "false");
        prefs.put("security.warn_leaving_secure", "false");
        prefs.put("security.warn_leaving_secure.show_once", "false");
        prefs.put("security.warn_submit_insecure", "false");
        prefs.put("security.warn_viewing_mixed", "false");
        prefs.put("security.warn_viewing_mixed.show_once", "false");
        prefs.put("signon.rememberSignons", "false");

        // Which port should we listen on?
        prefs.put("webdriver_firefox_port", "7055");

        // Settings to facilitate debugging the driver
        prefs.put("javascript.options.showInConsole", "true"); // Logs errors in chrome files to the Error Console.
        prefs.put("browser.dom.window.dump.enabled", "true");  // Enables the use of the dump() statement 

        writeNewPrefs(userPrefs, prefs);
    }

    private void writeNewPrefs(File userPrefs, Map<String, String> prefs) {
        Writer writer = null;
        try {
            writer = new FileWriter(userPrefs);
            for (Map.Entry<String, String> entry : prefs.entrySet()) {
                writer.append("user_pref(\"").append(entry.getKey()).append("\", ").append(entry.getValue()).append(");\n");
            }
        } catch (IOException e) {
            throw new RuntimeException(e);
        } finally {
            closeCleanly(writer);
        }
    }

    // Assumes that we only really care about the preferences, not the comments
    private Map<String, String> readExistingPrefs(File userPrefs) {
        Map<String, String> prefs = new HashMap<String, String>();

        BufferedReader reader = null;
        try {
            reader = new BufferedReader(new FileReader(userPrefs));
            String line = reader.readLine();
            while (line != null) {
                if (!line.startsWith("user_pref(\"")) {
                    line = reader.readLine();
                    continue;
                }
                line = line.substring("user_pref(\"".length());
                line = line.substring(0, line.length() - ");".length());
                String[] parts = line.split(",");
                parts[0] = parts[0].substring(0, parts[0].length() - 1);
                prefs.put(parts[0].trim(), parts[1].trim());

                line = reader.readLine();
            }
        } catch (IOException e) {
            throw new RuntimeException(e);
        } finally {
            closeCleanly(reader);
        }

        return prefs;
    }

    private void deleteExtensionsCacheIfItExists(File extensionsDir) {
        File cacheFile = new File(extensionsDir, "extensions.cache");
        if (cacheFile.exists())
            cacheFile.delete();
    }

    private void installExtensionInto(File profileDir) {
        File extensionsDir = new File(profileDir, "extensions");

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
        File writeTo = new File(extensionsDir, "fxdriver@thoughtworks.com");
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
            closeCleanly(writer);
        }
    }

    public void startProfile(String profileName) {
        startProfile(profileName, null);
    }

    public void startProfile(String profileName, File firefoxBinary) {
        File binary = locateFirefoxBinary(firefoxBinary);

        profileName = profileName == null ? System.getProperty("webdriver.firefox.profile") : profileName;

        if (profileName == null) {
            profileName = "WebDriver";
        }

        try {
            File profileDir = createCopyOfDefaultProfile(profileName);

            ProcessBuilder builder = new ProcessBuilder(binary.getAbsolutePath()).redirectErrorStream(true);
            modifyLibraryPath(builder, binary);
            builder.environment().put("MOZ_NO_REMOTE", "1");
            builder.environment().put("XRE_PROFILE_PATH", profileDir.getAbsolutePath());
            builder.start();
        } catch (IOException e) {
            throw new RuntimeException("Cannot load firefox: " + profileName);
        }
    }

  private void modifyLibraryPath(ProcessBuilder builder, File binary) {
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

  private File createCopyOfDefaultProfile(String profileName) {
        // Find the "normal" WebDriver profile, and make a copy of it
        File from = locateWebDriverProfile(profileName);
        if (!from.exists())
            throw new RuntimeException(MessageFormat.format("Found the {0} profile directory, but it does not exist: {1}",
                    profileName, from.getAbsolutePath()));

        File tmpDir = new File(System.getProperty("java.io.tmpdir"));
        File to = new File(tmpDir, "webdriver-" + System.currentTimeMillis());
        to.mkdirs();

        copy(from, to);

        return to;
    }

    private void copy(File from, File to) {
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
            closeCleanly(out);
            closeCleanly(in);
        }
    }

    private void closeCleanly(InputStream toClose) {
        if (toClose == null)
            return;

        try {
            toClose.close();
        } catch (IOException e) {
            // nothing that can done. Ignoring.
        }
    }

    private void closeCleanly(OutputStream toClose) {
        if (toClose == null)
            return;

        try {
            toClose.close();
        } catch (IOException e) {
            // nothing that can done. Ignoring.
        }
    }

    private void closeCleanly(Reader reader) {
        if (reader == null)
            return;

        try {
            reader.close();
        } catch (IOException e) {
            // nothing that can done. Ignoring.
        }
    }

    private void closeCleanly(Writer reader) {
        if (reader == null)
            return;

        try {
            reader.close();
        } catch (IOException e) {
            // nothing that can done. Ignoring.
        }
    }

    private File locateWebDriverProfile(String profileName) {
        String profileNameLine = "Name=" + profileName;
        File appData = locateUserDataDirectory(OperatingSystem.getCurrentPlatform());

        File profilesIni = new File(appData, "profiles.ini");
        if (!profilesIni.exists()) {
            throw new RuntimeException("Unable to locate the profiles.ini file, which contains information about where to locate the profiles");
        }

        BufferedReader reader = null;
        try {
            reader = new BufferedReader(new FileReader(profilesIni));
            boolean isRelative = true;
            String line = reader.readLine();
            boolean inProfile = false;
            while (line != null) {
                if (inProfile && line.startsWith("IsRelative="))
                    isRelative = line.endsWith("1");
                if (inProfile && line.startsWith("Name")) {
                    // We've left the webdriver profile and should have returned. Run away! Run away!
                    throw new RuntimeException("Found the " + profileName + " profile declaration, but cannot locate the path. Exiting");
                }
                if (inProfile && line.startsWith("Path=")) {
                    String path = line.substring("Path=".length());
                    if (isRelative)
                        return new File(appData, path);
                    return new File(path);
                }
                if (profileNameLine.equals(line.trim()))
                    inProfile = true;

                line = reader.readLine();
            }
        } catch (IOException e) {
            throw new RuntimeException(e);
        } finally {
            try {
                if (reader != null)
                    reader.close();
            } catch (IOException e) {
                // Nothing that can be done sensibly. Swallowing.
            }
        }

        throw new RuntimeException("Unable to locate the " + profileName + " profile. Exiting");
    }

    private File locateUserDataDirectory(OperatingSystem os) {
        File appData;
        switch (os) {
          case WINDOWS:
            appData = new File(MessageFormat.format("{0}\\Mozilla\\Firefox", System.getenv("APPDATA")));
            break;

          case MAC:
            appData = new File(MessageFormat.format("{0}/Library/Application Support/Firefox", System.getenv("HOME")));
            break;

          default:
            appData = new File(MessageFormat.format("{0}/.mozilla/firefox", System.getenv("HOME")));
            break;
        }

        if (!appData.exists()) {
            throw new RuntimeException("Unable to locate directory which should contain the information about Firefox profiles.\n" +
                    "Tried looking in: " + appData.getAbsolutePath());
        }

        if (!appData.isDirectory()) {
            throw new RuntimeException("The discovered user firefox data directory " +
                    "(which normally contains the profiles) isn't a directory: " + appData.getAbsolutePath());
        }

        return appData;
    }


    private File locateFirefoxBinary(File suggestedLocation) {
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
            String[] binaryNames = new String[] { "firefox3", "firefox2", "firefox" };
            for (String name : binaryNames) {
               binary = shellOutAndFindPathOfFirefox(name);
               if (binary != null)
                   break;
            }
            break;
        }

        if (binary == null)  {
          throw new RuntimeException("Cannot find firefox binary in PATH. Make sure firefox " +
                  "is installed");
        }

        if (binary.exists())
            return binary;

        throw new RuntimeException("Unable to locate firefox binary. Please check that it is installed in the default location, " +
                "or the path given points to the firefox binary. I would have used: " + binary.getPath());
    }

  private File locateFirefoxBinaryFromSystemProperty() {
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
            Process which = Runtime.getRuntime().exec(new String[] {"which", binaryName});
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
           closeCleanly(reader);
       }
    }

    private void wait(int seconds) {
        try {
            Thread.sleep(seconds * 1000);
        } catch (InterruptedException e) {
            // Nothing to do. Swallow it
        }
    }
}
