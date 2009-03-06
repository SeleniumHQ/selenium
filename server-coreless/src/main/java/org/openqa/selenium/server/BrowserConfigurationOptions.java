package org.openqa.selenium.server;

import java.io.File;
import java.util.HashMap;
import java.util.Map;

public class BrowserConfigurationOptions {

    private Map<String,String> options = new HashMap<String,String>();
    private boolean hasOptions = false;
    
    public BrowserConfigurationOptions(String browserConfiguration) {
        //"name:value;name:value"
        String[] optionsPairList = browserConfiguration.split(";");
        for (int i = 0; i < optionsPairList.length; i++) {
            String[] option = optionsPairList[i].split(":", 2);
            if (2 == option.length) {
              String optionsName = option[0].trim();
              String optionValue = option[1].trim();
              options.put(optionsName, optionValue);
              hasOptions = true;
            }
        }
    }
    
    public BrowserConfigurationOptions() {}
    
    public String serialize() {
        //"profile:XXXXXXXXXX"
        StringBuilder sb = new StringBuilder();
        boolean first = true;
        for (String key : options.keySet()) {
            if (first) {
                first = false;
            } else {
                sb.append(';');
            }
            sb.append(key).append(':').append(options.get(key));
        }
        return sb.toString();
    }

    public String getProfile() {
        return options.get("profile");
    }
    
    public boolean hasOptions() {
      return hasOptions;
    }
    
    public boolean isMultiWindow() {
        return getBoolean("multiWindow");
    }
    
    public void  setMultiWindow(Boolean multiWindow) {
        options.put("multiWindow", multiWindow.toString());
        hasOptions = true;
    }
    
    public String getExecutablePath() {
        return options.get("executablePath");
    }
    
    public void setExecutablePath(String executablePath) {
        options.put("executablePath", executablePath);
        hasOptions = true;
    }
    
    public int getTimeoutInSeconds() {
        String value = options.get("timeoutInSeconds");
        if (value == null) return RemoteControlConfiguration.DEFAULT_TIMEOUT_IN_SECONDS;
        return Integer.parseInt(value);
    }
    
    public boolean getBoolean(String key) {
        String value = options.get(key);
        if (value == null) return false;
        return Boolean.parseBoolean(value);
    }
    
    public String get(String key) {
        return options.get(key);
    }
    
    public int getInt(String key) {
        String value = options.get(key);
        if (value == null) return 0;
        return Integer.parseInt(value);
    }
    
    public File getFile(String key) {
        String value = options.get(key);
        if (value == null) return null;
        return new File(value);
    }
    
    public void set(String key, Object value) {
        if (value == null) {
            options.put(key, null);
        } else {
            options.put(key, value.toString());
        }
    }
    
    /**
     * Returns the serialization of this object, as defined by the serialize()
     * method.
     */
    public String toString() {
        return serialize();
    }
}
