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
package com.thoughtworks.selenium.launch;

import com.jacob.activeX.ActiveXComponent;
import com.jacob.com.Dispatch;
import com.jacob.com.Variant;

public class WindowsIEBrowserLauncher  {

    ActiveXComponent explorer;

    public void launch(String url, boolean visible) {
        explorer = new ActiveXComponent("clsid:0002DF01-0000-0000-C000-000000000046");
        Object ieObject = explorer.getObject();
        Dispatch.put(ieObject, "Visible", new Variant(visible));
        Dispatch.put(ieObject, "AddressBar", new Variant(true));
        Dispatch.put(ieObject, "StatusText", new Variant("Selenium Testing..."));
        Dispatch.call(ieObject, "Navigate", new Variant(url));
    }

    public void close() {
        explorer.invoke("Quit", new Variant[]{});
    }

    public static void main(String[] argv) throws Exception {
        WindowsIEBrowserLauncher launcher = new WindowsIEBrowserLauncher();
        launcher.launch("http://www.google.com", false);
        Thread.sleep(5000);
        launcher.close();
    }
}
