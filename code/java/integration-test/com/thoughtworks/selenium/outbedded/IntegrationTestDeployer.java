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

import com.thoughtworks.selenium.outbedded.ServletContainer;
import com.thoughtworks.selenium.outbedded.Deployer;

import java.io.File;

/**
 * TODO: One line description of this class...
 * Created 11:40:36 11-Jan-2005
 */
public class IntegrationTestDeployer implements Deployer {

    public void deploySelenium(ServletContainer container, String seleniumContext, String driverPath) {
        container.installWebApp(new File(calculateCodeRoot(), "javascript"),seleniumContext);
        container.installWebApp(new File(calculateCodeRoot(), "java/bridgewebapp"),seleniumContext+"/"+driverPath);
    }

    public void deployAppUnderTest(ServletContainer container,String appContext) {
        container.installWebApp(new File(calculateCodeRoot(), "javascript/tests/html"),appContext);
    }

      private File calculateCodeRoot() {
        File codeRoot = null;
        String codeRootProperty = System.getProperty("code_root");
        if (codeRootProperty == null) {
            codeRootProperty = "c:\\selenium\\code";
	    }
        if (codeRootProperty == null) {
        } else if (codeRootProperty == null) {
            throw new RuntimeException("'code_root' not specified");
        } else {
            codeRoot = new File(codeRootProperty);
            if (!codeRoot.exists()) {
                throw new RuntimeException("'code_root' not a dir");
            }
        }
        return codeRoot;
    }
}
