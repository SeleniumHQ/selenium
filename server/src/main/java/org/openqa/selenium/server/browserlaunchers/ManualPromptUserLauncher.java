/*
 * Copyright 2006 ThoughtWorks, Inc.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */
package org.openqa.selenium.server.browserlaunchers;


/**
 * Manually prompt the user to start a browser from the command line
 *  
 * 
 *  @author dfabulich
 *
 */
public class ManualPromptUserLauncher implements BrowserLauncher {

    String sessionId;
    
    public ManualPromptUserLauncher(String sessionId) {
        this.sessionId = sessionId;
    }
    
    /** Prints out a polite request on the console */
    public void launch(String url) {
        System.out.println("Hello!  This test run is now waiting for you to manually bring up a browser for testing:\nFrom this browser, request:\n" + url);

    }
    
    public void launchHTMLSuite(String suiteUrl, String browserURL) {
        launch(LauncherUtils.getDefaultHTMLSuiteUrl(browserURL, suiteUrl));
    }
    
    public void launchRemoteSession(String browserURL) {
        launch(LauncherUtils.getDefaultRemoteSessionUrl(browserURL, sessionId));
    }

    public void close() {

    }

}
