package com.thoughtworks.webdriver.safari;

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
