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
import org.mortbay.http.handler.ResourceHandler;
import org.mortbay.http.HttpRequest;
import org.mortbay.http.HttpResponse;
import org.mortbay.http.HttpException;
import org.mortbay.http.HttpFields;

import java.io.File;
import java.io.IOException;

/**
 * @author Paul Hammant
 * @version $Revision: 1.4 $
 */
public class DirectoryStaticContentHandler implements StaticContentHandler {
    private File directory;

    public DirectoryStaticContentHandler(File directory) {
        this.directory = directory;
    }

    public void addStaticContent(ServletHttpContext context) {
        context.setResourceBase(directory.getAbsolutePath());
        context.addHandler(new ResourceHandler() {
            public void handle(String s, String s1, HttpRequest req, HttpResponse res) throws HttpException, IOException {
                res.setField("Expires", "-1"); // never cached.
                super.handle(s,s1,req,res);
            }
        });
    }
}
