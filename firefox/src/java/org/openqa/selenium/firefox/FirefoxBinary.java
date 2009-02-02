/*
Copyright 2007-2009 WebDriver committers
Copyright 2007-2009 Google Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

package org.openqa.selenium.firefox;

import org.openqa.selenium.Platform;
import org.openqa.selenium.firefox.internal.Executable;

import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class FirefoxBinary {
    private final Map<String, String> extraEnv = new HashMap<String, String>();
    private final Executable executable;
    private Process process;

    public FirefoxBinary() {
        this(null);
    }

    public FirefoxBinary(File pathToFirefoxBinary) {
      executable = new Executable(pathToFirefoxBinary);
    }

    public void startProfile(FirefoxProfile profile, String... commandLineFlags) throws IOException {
        setEnvironmentProperty("XRE_PROFILE_PATH", profile.getProfileDir().getAbsolutePath());
        setEnvironmentProperty("MOZ_NO_REMOTE", "1");

        List<String> commands = new ArrayList<String>();
        commands.add(executable.getPath());
        commands.addAll(Arrays.asList(commandLineFlags));
        ProcessBuilder builder = new ProcessBuilder(commands);
        builder.environment().putAll(extraEnv);
        executable.setLibraryPath(builder, extraEnv);
        process = builder.start();
    }

    public void setEnvironmentProperty(String propertyName, String value) {
        if (propertyName == null || value == null)
            throw new RuntimeException(
                    String.format("You must set both the property name and value: %s, %s", propertyName, value));
        extraEnv.put(propertyName, value);
    }

    public void createProfile(String profileName) throws IOException {
        ProcessBuilder builder = new ProcessBuilder(executable.getPath(), "-CreateProfile", profileName)
            .redirectErrorStream(true);
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
            while (reader.readLine() != null) {
              sleep(100);
            }
        } finally {
            reader.close();
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

		if (Platform.getCurrent().is(Platform.WINDOWS)) {
		    while (profile.isRunning()) {
			    sleep(500);
		    }

		    do {
				sleep(500);
			} while (profile.isRunning());
		}
	}
}
