/*
 * Copyright 2011 Selenium committers
 * Copyright 2011 Software Freedom Conservancy
 * 
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License. You may obtain a copy of the License at
 * 
 * http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software distributed under the License
 * is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing permissions and limitations under
 * the License.
 */

package org.openqa.grid.web.servlet.handler;

import java.io.UnsupportedEncodingException;
import java.net.URLDecoder;
import java.net.URLEncoder;
import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;

import org.openqa.grid.common.RegistrationRequest;
import org.openqa.grid.internal.ExternalSessionKey;
import org.openqa.grid.internal.Registry;
import org.openqa.grid.internal.TestSession;
import org.openqa.grid.internal.exception.NewSessionException;
import org.openqa.grid.web.utils.BrowserNameUtils;

public class LegacySeleniumRequest extends SeleniumBasedRequest {

  public LegacySeleniumRequest(HttpServletRequest httpServletRequest, Registry registry) {
    super(httpServletRequest, registry);

  }

  @Override
  public RequestType extractRequestType() {
    if (getBody().contains("cmd=getNewBrowserSession")) {
      return RequestType.START_SESSION;
    } else if (getBody().contains("cmd=testComplete")) {
      return RequestType.STOP_SESSION;
    } else {
      return RequestType.REGULAR;
    }

  }

  @Override
  public ExternalSessionKey extractSession() {
    if (getRequestType() == RequestType.START_SESSION) {
      throw new IllegalAccessError("Cannot call that method of a new session request.");
    }
    // for selenium 1, the url is ignored. The session has to be read from
    // the request body.
    String command = getBody();
    String[] pieces = command.split("&");
    ExternalSessionKey externalSessionKey;
    for (String piece : pieces) {
      externalSessionKey = ExternalSessionKey.fromSe1Request(piece);
      if (externalSessionKey != null) {
        return externalSessionKey;
      }
    }
    return null;
  }

  @Override
  public Map<String, Object> extractDesiredCapability() {
    if (getRequestType() != RequestType.START_SESSION) {
      throw new Error("the desired capability is only present in the new session requests.");
    }
    String[] pieces = getBody().split("&");
    for (String piece : pieces) {
      try {
        piece = URLDecoder.decode(piece, "UTF-8");
      } catch (UnsupportedEncodingException e) {}
      if (piece.startsWith("1=")) {
        String envt = piece.replace("1=", "");
        Map<String, Object> cap = new HashMap<String, Object>();
        // TODO freynaud : more splitting, like trying to guess the
        // plateform or version ?

        // We don't want to process Grid 1.0 environment names because
        // they use an explicit mapping
        // to a browser launcher string.
        if (getRegistry().getConfiguration().getGrid1Mapping().containsKey(envt)) {
          cap.put(RegistrationRequest.BROWSER, envt);
        }

        // Otherwise, process the environment string to extract the
        // target browser and platform.
        else {
          cap.putAll(BrowserNameUtils.parseGrid2Environment(envt));
        }

        return cap;
      }
    }

    throw new RuntimeException("Error");
  }

  @Override
  public String getNewSessionRequestedCapability(TestSession session) {
    try {
      String body = getBody();
      String[] pieces = body.split("&");
      StringBuilder builder = new StringBuilder();

      for (String piece : pieces) {
        if (piece.startsWith("1=")) {
          piece = URLDecoder.decode(piece, "UTF-8");
          String parts[] = piece.split("1=");

          // We don't want to process Grid 1.0 environment names
          // because they use an explicit mapping
          // to a browser launcher string.
          if (getRegistry().getConfiguration().getGrid1Mapping().containsKey(parts[1])) {
            piece =
                String.format(
                    "1=%s",
                    URLEncoder.encode(
                        BrowserNameUtils.lookupGrid1Environment(parts[1], getRegistry()), "UTF-8"));
          }

          // Otherwise, the requested environment includes the browser
          // name before the space.
          else {
            piece =
                (String) BrowserNameUtils.parseGrid2Environment(piece).get(
                    RegistrationRequest.BROWSER);
          }
        }
        builder.append(piece).append("&");
      }
      return builder.toString();
    } catch (UnsupportedEncodingException ignore) {

    }
    throw new NewSessionException("Error with the request ");

  }

}
