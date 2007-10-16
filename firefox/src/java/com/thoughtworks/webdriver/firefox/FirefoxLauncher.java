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
import java.text.MessageFormat;
import java.util.HashMap;
import java.util.Map;
import java.net.ConnectException;

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

            // Wait for a second for the process to actually finish
            wait(1);

            System.out.println(getNextLineOfOutputFrom(process));
        } catch (IOException e) {
            throw new RuntimeException(e);
        }

        File extensionsDir = locateWebDriverProfile(profileName);

        System.out.println("Attempting to install the WebDriver extension");
        installExtensionInto(extensionsDir);

        System.out.println("Updating user preferences with common, useful settings");
        updateUserPrefsFor(extensionsDir);

        System.out.println("Deleting existing extensions cache (if it already exists)");
        deleteExtensionsCacheIfItExists(extensionsDir);

        System.out.println(MessageFormat.format("Firefox should now start and then quit.\n\n" +
                "Once this has happened, please run firefox using:\n\n{0} -P {1}\n\n" +
                "and go to the \"Tools->Add-ons\" menu and confirm that an add-on called \"Firefox WebDriver\" has been " +
                "successfully installed.\n\nIf this is not present, please quit all open instances of Firefox.\n",
                firefox.getAbsolutePath(), profileName));

        File extensionsCache = new File(extensionsDir, "extensions.cache");
        startFirefox(firefox, profileName);

        long until = System.currentTimeMillis() + (30 * 1000);
        while (System.currentTimeMillis() < until && !extensionsCache.exists()) {
            wait(2);
        }

        System.out.println("Quitting");

        connectAndKill();
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
            String id = connection.sendMessageAndWaitForResponse("findActiveDriver", 1, null).getResponseText();
            connection.sendMessageAndWaitForResponse("quit", Long.parseLong(id), "");
        } catch (NullPointerException e) {
            // Expected. Swallow it.
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    private void startFirefox(File firefox, String profileName) {
        try {
            Runtime runtime = Runtime.getRuntime();
            Process process = runtime.exec(new String[]{firefox.getAbsolutePath(), "-P", profileName}, new String[]{"MOZ_NO_REMOTE=1"});
            process.waitFor();
        } catch (IOException e) {
            throw new RuntimeException(e);
        } catch (InterruptedException e) {
            throw new RuntimeException(e);
        }
    }

    private void updateUserPrefsFor(File extensionsDir) {
        File userPrefs = new File(extensionsDir, "prefs.js");

        Map<String, String> prefs = new HashMap<String, String>();
        if (userPrefs.exists()) {
            prefs = readExistingPrefs(userPrefs);
        }

        prefs.put("app.update.enabled", "false");
        prefs.put("browser.download.manager.showWhenStarting", "false");
        prefs.put("browser.link.open_external", "2");
        prefs.put("browser.link.open_newwindow", "2");
        prefs.put("browser.search.update", "false");
        prefs.put("browser.shell.checkDefaultBrowser", "false");
        prefs.put("browser.startup.page", "0");
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

        userPrefs.delete();

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

    // Assumes that the prefs file is untouched by people.
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

            Runtime runtime = Runtime.getRuntime();
            runtime.exec(new String[] { binary.getAbsolutePath(), "-Profile", profileDir.getAbsolutePath()}, new String[] {"MOZ_NO_REMOTE=1"});
        } catch (IOException e) {
            throw new RuntimeException("Cannot load firefox: " + profileName);
        }
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
        String osName = System.getProperty("os.name").toLowerCase();
        File appData = locateUserDataDirectory(osName);

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

    private File locateUserDataDirectory(String osName) {
        File appData;
        if (osName.contains("windows")) {
            appData = new File(MessageFormat.format("{0}\\Mozilla\\Firefox", System.getenv("APPDATA")));
        } else if (osName.contains("mac")) {
            appData = new File(MessageFormat.format("{0}/Library/Application Support/Firefox", System.getenv("HOME")));
        } else {
            appData = new File(MessageFormat.format("{0}/.mozilla/firefox", System.getenv("HOME")));
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

        String osName = System.getProperty("os.name").toLowerCase();
        if (osName.startsWith("windows")) {
            String programFiles = System.getenv("PROGRAMFILES");
            if (programFiles == null)
                programFiles = "\\Program Files";
            binary = new File(
                    programFiles + "\\Mozilla Firefox\\firefox.exe");
        } else if (osName.startsWith("mac")) {
            binary = new File(
                    "/Applications/Firefox.app/Contents/MacOS/firefox");
        } else {
            binary = shellOutAndFindPathOfFirefox("firefox");
        }

        if (binary.exists())
            return binary;

        throw new RuntimeException("Unable to locate firefox binary. Please check that it is installed in the default location, " +
                "or the path given points to the firefox binary. I would have used: " + binary.getPath());
    }

  private File locateFirefoxBinaryFromSystemProperty() {
    String binaryName = System.getProperty("firefox.bin");
    if (binaryName == null)
      return null;

    File binary = new File(binaryName);
    if (binary.exists())
      return binary;

    String osName = System.getProperty("os.name").toLowerCase();
    if (osName.contains("windows"))
      return null;  // Who knows how to handle this

    if (osName.contains("mac")) {
      if (!binaryName.endsWith(".app"))
        binaryName += ".app";
      binaryName += "/Contents/MacOS/firefox";
      return new File(binaryName);
    }

    // Assume that we're on a UNIX variant
    return shellOutAndFindPathOfFirefox(binaryName);

  }

  private File shellOutAndFindPathOfFirefox(String binaryName) {
        // Assume that we're on a unix of some kind. We're going to cheat
        try {
            Process which = Runtime.getRuntime().exec(new String[] {"which", binaryName});
            String result = getNextLineOfOutputFrom(which);
            return new File(result);
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
