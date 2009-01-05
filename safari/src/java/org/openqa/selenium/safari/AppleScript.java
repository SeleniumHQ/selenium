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

package org.openqa.selenium.safari;

import java.io.BufferedReader;
import java.io.InputStreamReader;

public class AppleScript {
    public static final String APP = "Safari";

     public String executeJavascript(String script) {
        StringBuilder builder = new StringBuilder("tell application \"" + APP + "\"\rdo JavaScript \"");
        builder.append("\rfunction f() {\r");
        builder.append(script.replace("\"", "\\\""));
        builder.append("\r}; f();");
        builder.append("\r\" in document 1\rend tell\r");

        return executeApplescript(builder.toString());
    }

    public String executeApplescript(String applescript) {
//        System.out.println("applescript = " + applescript);
        try {
            Process process = new ProcessBuilder("osascript", "-e", applescript).redirectErrorStream(true).start();
            process.waitFor();
            BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
            StringBuilder response = new StringBuilder();
            String line = reader.readLine();
            while (line != null) {
                response.append(line);
                line = reader.readLine();
            }

            return response.toString();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
