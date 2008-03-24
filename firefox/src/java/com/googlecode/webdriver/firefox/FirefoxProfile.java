package com.googlecode.webdriver.firefox;

import com.googlecode.webdriver.firefox.internal.Cleanly;

import java.io.BufferedInputStream;
import java.io.BufferedOutputStream;
import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.io.Writer;
import java.text.MessageFormat;
import java.util.HashMap;
import java.util.Map;

public class FirefoxProfile {
    private static final String EXTENSION_NAME = "fxdriver@googlecode.com";
    private final File profileDir;
    private final File extensionsDir;
    private File userPrefs;
    private Map<String, String> additionalPrefs = new HashMap<String, String>();
    private int port;

    public FirefoxProfile(File profileDir) {
        this.profileDir = profileDir;
        this.extensionsDir = new File(profileDir, "extensions");
        this.userPrefs = new File(profileDir, "user.js");

        if (!profileDir.exists()) {
            throw new RuntimeException(MessageFormat.format("Profile directory does not exist: {0}",
                    profileDir.getAbsolutePath()));
        }
    }

    public FirefoxProfile() {
        File tmpDir = new File(System.getProperty("java.io.tmpdir"));
        if (!tmpDir.exists())
            throw new RuntimeException("Unable to find default temp directory: " + tmpDir);

        profileDir = new File(tmpDir, "webdriver-custom-" + System.currentTimeMillis());
        if (!profileDir.mkdirs())
            throw new RuntimeException("Cannot create custom profile directory");

        extensionsDir = new File(profileDir, "extensions");
        if (!extensionsDir.mkdirs())
            throw new RuntimeException(String.format("Cannot create custom profile extensions directory: %s", extensionsDir));
    }

    public void addWebDriverExtensionIfNeeded() {
        File extensionLocation = new File(extensionsDir, EXTENSION_NAME);
        if (extensionLocation.exists())
            return;

        String home = System.getProperty("webdriver.firefox.development");
        if (home != null) {
            installDevelopmentExtension(home);
        } else {
            installPrepackagedExtension(null);
        }

        deleteExtensionsCacheIfItExists();
    }

    public void installPrepackagedExtension(File extensionToInstall) {
        throw new UnsupportedOperationException("We do not currently support installing extensions (including the WebDriver extension)");
    }

    public void installDevelopmentExtension(String home) {
        if (!home.endsWith("extension"))
            throw new RuntimeException("The given source directory does not look like a source " +
                    "directory for the extension: " + home);

        extensionsDir.mkdirs();

        File writeTo = new File(extensionsDir, EXTENSION_NAME);
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


    public File getProfileDir() {
        return profileDir;
    }

    //Assumes that we only really care about the preferences, not the comments
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
            Cleanly.close(reader);
        }

        return prefs;
    }

    public File getExtensionsDir() {
        return extensionsDir;
    }

    public void addAdditionalPreference(String key, String value) {
        this.additionalPrefs.put(key, value);
    }

    public void addAdditionalPreferences(Map<String, String> additionalPrefs) {
        this.additionalPrefs.putAll(additionalPrefs);
    }

    public void updateUserPrefs() {
        if (port == 0) {
            throw new RuntimeException("You must set the port to listen on before updating user.js");
        }

        Map<String, String> prefs = new HashMap<String, String>();

        if (userPrefs.exists()) {
            prefs = readExistingPrefs(userPrefs);
            if (!userPrefs.delete())
                throw new RuntimeException("Cannot delete existing user preferences");
        }

        prefs.putAll(additionalPrefs);

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
        prefs.put("startup.homepage_welcome_url", "\"about:blank\"");

        // Which port should we listen on?
        prefs.put("webdriver_firefox_port", Integer.toString(port));

        // Settings to facilitate debugging the driver
        prefs.put("javascript.options.showInConsole", "true"); // Logs errors in chrome files to the Error Console.
        prefs.put("browser.dom.window.dump.enabled", "true");  // Enables the use of the dump() statement

        writeNewPrefs(prefs);
    }

    public void deleteExtensionsCacheIfItExists() {
        File cacheFile = new File(extensionsDir, "extensions.cache");
        if (cacheFile.exists())
            cacheFile.delete();
    }

    protected void writeNewPrefs(Map<String, String> prefs) {
        Writer writer = null;
        try {
            writer = new FileWriter(userPrefs);
            for (Map.Entry<String, String> entry : prefs.entrySet()) {
                writer.append("user_pref(\"").append(entry.getKey()).append("\", ").append(entry.getValue()).append(");\n");
            }
        } catch (IOException e) {
            throw new RuntimeException(e);
        } finally {
            Cleanly.close(writer);
        }
    }

    public void setPort(int port) {
        this.port = port;
    }

    public boolean isRunning() {
        File macAndLinuxLockFile = new File(profileDir, ".parentlock");
        File windowsLockFile = new File(profileDir, "parent.lock");

        return macAndLinuxLockFile.exists() || windowsLockFile.exists();
    }

    public File init() {
        addWebDriverExtensionIfNeeded();
        return profileDir;
    }

    public FirefoxProfile createCopy(int port) {
        File tmpDir = new File(System.getProperty("java.io.tmpdir"));
        File to = new File(tmpDir, "webdriver-" + System.currentTimeMillis());
        to.mkdirs();

        copy(profileDir, to);
        FirefoxProfile profile = new FirefoxProfile(to);
        profile.setPort(port);
        profile.updateUserPrefs();

        return new FirefoxProfile(to);
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
}
