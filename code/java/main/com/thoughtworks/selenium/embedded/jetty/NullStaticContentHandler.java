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

package com.thoughtworks.selenium.embedded.jetty;

import org.mortbay.jetty.servlet.ServletHttpContext;

/**
 * A do-nothing stub that exposes no static content (eg HTML, images, JavaScript) in the Jetty server.
 * @author Paul Hammant
 * @version $Revision$
 */
public class NullStaticContentHandler implements StaticContentHandler {
    /** Does nothing! */
    public void addStaticContent(ServletHttpContext context) {
    }
}
