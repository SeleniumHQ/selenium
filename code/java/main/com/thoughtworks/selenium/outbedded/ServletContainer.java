/*
 * Copyright 2004 ThoughtWorks, Inc.
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

package com.thoughtworks.selenium.outbedded;

import com.thoughtworks.selenium.CommandProcessor;

import java.io.File;

/**
 * An abstract class representing a servlet container to which selenium and app under test can be deployed
 * @author Ben Griffiths
 */
public abstract class ServletContainer {

    protected String protocol = "http://";
    protected String domain = "localhost";
    protected int port = 8080;
    protected String seleniumContext = "selenium-driver";
    protected String driverPath = "driver";
    private static final String ROOT_CONTEXT = "";

    /** Deploys the specified webapp at the specified context path
     * 
     * @param webAppRoot the root webapp that will be served
     * @param contextpath the name of the virtual (context) directory
     */
    public abstract void installWebApp(File webAppRoot, String contextpath);

    /** Starts the servlet server and returns a CommandProcessor configured to
     * send commands to the CommandBridge driver
     * @return a CommandProcessor configured to
     * send commands to the CommandBridge
     */
    public abstract CommandProcessor start();

    /** Stops the servlet server */
    public abstract void stop();

    /** Constructs an URL pointing to the CommandBridge driver */
    protected String buildDriverURL() {
        return protocol + domain + ":" + port + "/" + seleniumContext + "/" + driverPath;
    }

    public void deployAppAndSelenium(Deployer deployer) {
        deployer.deploySelenium(this,seleniumContext,driverPath);
        deployer.deployAppUnderTest(this,ROOT_CONTEXT);
    }
}