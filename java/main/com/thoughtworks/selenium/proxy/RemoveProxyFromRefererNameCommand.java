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
 * @version $Id: RemoveProxyFromRefererNameCommand.java,v 1.1 2004/11/11 12:19:48 mikemelia Exp $
 */
public class RemoveProxyFromRefererNameCommand implements RequestModificationCommand {
    public static int start = HTTPRequest.SELENIUM_REDIRECT_PROTOCOL.length();
    public static String sameServerAsSelenium = (HTTPRequest.SELENIUM_REDIRECT_PROTOCOL +
                                                 HTTPRequest.SELENIUM_REDIRECT_SERVERNAME).toUpperCase();

    public void execute(HTTPRequest httpRequest) {
        String referer = httpRequest.getHeaderField("Referer");
        if (referer != null) {
            String newReferer = referer.replaceFirst(HTTPRequest.SELENIUM_REDIRECT_URI, "");
            httpRequest.setHeaderField("Referer", newReferer);
        }
    }
}
