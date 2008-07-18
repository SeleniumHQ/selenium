package org.openqa.selenium.server;

public class BrowserConfigurationOptions {

    private String profile = "";
    
    public BrowserConfigurationOptions(String browserConfiguration) {
        //"name:value;name:value"
        String[] optionsPairList = browserConfiguration.split(";");
        for (int i = 0; i < optionsPairList.length; i++) {
            String[] option = optionsPairList[i].split(":", 2);
            if (2 == option.length) {
              String optionsName = option[0].trim();
              String optionValue = option[1].trim();
              if ("profile".equalsIgnoreCase(optionsName)) {
                  this.profile = optionValue;
              }
            }
        }
    }
    
    public BrowserConfigurationOptions() {}

    /**
     * Sets the profile name for this configuration object.
     * @param profile_name  The name of the profile to use
     */
    public void setProfile(String profile_name) {
        this.profile = profile_name;
    }
    
    public String serialize() {
        //"profile:XXXXXXXXXX"
        return String.format("profile:%s", profile);
    }

    public String getProfile() {
        return profile;
    }

}
