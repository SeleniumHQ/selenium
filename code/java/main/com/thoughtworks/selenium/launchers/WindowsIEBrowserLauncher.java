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

package com.thoughtworks.selenium.launchers;

import com.jacob.activeX.ActiveXComponent;
import com.jacob.com.Dispatch;
import com.jacob.com.Variant;
import com.thoughtworks.selenium.BrowserLauncher;

/**
 * Uses the <a href="http://danadler.com/jacob/">JACOB</a> Java-COM bridge to invoke
 * the Microsoft COM InternetExplorer automation object using JNI.
 * @author Paul Hammant
 * @version $Revision$
 */
public class WindowsIEBrowserLauncher implements BrowserLauncher {

    ActiveXComponent explorer;

    public void launch(String url) {
        explorer = new ActiveXComponent("clsid:0002DF01-0000-0000-C000-000000000046");
        Object ieObject = explorer.getObject();
        Dispatch.put(ieObject, "Visible", new Variant(true));
        Dispatch.put(ieObject, "AddressBar", new Variant(true));
        Dispatch.put(ieObject, "StatusText", new Variant("Selenium Testing..."));
        Dispatch.call(ieObject, "Navigate", new Variant(url));
    }

    /** Stops IE by sending a quit COM command; but if the browser is busy it may not notice! */ 
    public void close() {
        explorer.invoke("Quit", new Variant[]{});
    }

}
