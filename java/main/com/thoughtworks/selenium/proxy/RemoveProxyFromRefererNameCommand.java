package com.thoughtworks.selenium.proxy;

/*
  Copyright 2004 ThoughtWorks, Inc.

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/

/**
 * @version $Id: RemoveProxyFromRefererNameCommand.java,v 1.3 2004/11/13 05:43:00 ahelleso Exp $
 */
public class RemoveProxyFromRefererNameCommand implements RequestModificationCommand {
    private final static String textToRemove = SeleniumHTTPRequest.SELENIUM_REDIRECT_SERVER + SeleniumHTTPRequest.SELENIUM_REDIRECT_DIR;

    public void execute(HTTPRequest httpRequest) {
        String referer = httpRequest.getHeaderField("Referer");
        if (referer != null) {
            String newReferer = referer.replaceFirst(textToRemove, "");
            httpRequest.setHeaderField("Referer", newReferer);
        }
    }
}
