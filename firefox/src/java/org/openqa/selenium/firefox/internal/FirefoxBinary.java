package org.openqa.selenium.firefox.internal;

import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import org.openqa.selenium.firefox.FirefoxProfile;
import org.openqa.selenium.internal.OperatingSystem;

public class FirefoxBinary {
    private final File actualBinary;
    private Process process;

    public FirefoxBinary() {
        this(null);
    }

    public FirefoxBinary(File actualBinary) {
        this.actualBinary = locateFirefoxBinary(actualBinary);
    }

    public void startProfile(FirefoxProfile profile, String... commandLineFlags) throws IOException {
        List<String> commands = new ArrayList<String>();
        commands.add(actualBinary.getAbsolutePath());
        commands.addAll(Arrays.asList(commandLineFlags));
        ProcessBuilder builder = new ProcessBuilder(commands);
        modifyLibraryPath(builder);
        builder.environment().put("MOZ_NO_REMOTE", "1");
        builder.environment().put("XRE_PROFILE_PATH", profile.getProfileDir().getAbsolutePath());
        process = builder.start();
    }

    public void createProfile(String profileName) throws IOException {
        ProcessBuilder builder = new ProcessBuilder(actualBinary.getAbsolutePath(), "-CreateProfile", profileName).redirectErrorStream(true);
        builder.environment().put("MOZ_NO_REMOTE", "1");
        process = builder.start();
    }

    public void waitFor() throws InterruptedException, IOException {
        process.waitFor();

        // The Mac version (and perhaps others) spawns a new process when the profile needs fixing up
        // This child process shares the same stdout, stdin and stderr as the parent one. By reading
        // the line of input until EOF is reached, we know that we're good and that the child subprocess
        // has also quit.
        BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
        try {
            while (reader.readLine() != null)
                sleep(100);
        } finally {
            reader.close();
        }        
    }

    protected void modifyLibraryPath(ProcessBuilder builder) {
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

        String firefoxLibraryPath = System.getProperty("webdriver.firefox.library.path", actualBinary.getParentFile().getAbsolutePath());

        libraryPath = firefoxLibraryPath + File.pathSeparator + libraryPath;

        builder.environment().put(propertyName, libraryPath);
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

    private void sleep(long timeInMillis) {
        try {
            Thread.sleep(timeInMillis);
        } catch (InterruptedException e) {
            throw new RuntimeException(e);
        }
    }

	public void clean(FirefoxProfile profile) throws IOException {
		startProfile(profile, "-silent");
		try {
			waitFor();
		} catch (InterruptedException e) {
			throw new RuntimeException(e);
		}

		if (OperatingSystem.WINDOWS.equals(OperatingSystem.getCurrentPlatform())) {
		    while (profile.isRunning()) {
			    sleep(500);
		    }

		    do {
				sleep(500);
			} while (profile.isRunning());
		}
	}
}
