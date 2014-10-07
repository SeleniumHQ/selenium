/*
Copyright 2012 Selenium committers
Copyright 2012 Software Freedom Conservancy

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

package org.openqa.grid.web.servlet.api.v1;


import com.sun.org.apache.xml.internal.security.exceptions.Base64DecodingException;

import org.openqa.grid.internal.ProxySet;
import org.openqa.grid.internal.RemoteProxy;
import org.openqa.grid.internal.TestSlot;
import org.openqa.grid.web.servlet.api.v1.utils.ProxyIdUtil;

import java.util.HashMap;
import java.util.Iterator;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

public class Proxy extends RestApiEndpoint {

  public Map getResponse(String query) {

    Map proxyInfo = new HashMap();

    if (query == null || query.equals("/")) {
      //do nothing, bc user didn't deem it important enough to give any info :-P
    } else {
      try {
        final String proxyToFind = ProxyIdUtil.decodeId(query.replaceAll("^/", ""));

        ProxySet proxies = this.getRegistry().getAllProxies();
        Iterator<RemoteProxy> iterator = proxies.iterator();
        while (iterator.hasNext()) {
          RemoteProxy currentProxy = iterator.next();
          if (currentProxy.getId().equals(proxyToFind)) {
            proxyInfo.put("config", currentProxy.getConfig());

            List capabilities = new LinkedList();
            for (TestSlot testSlot : currentProxy.getTestSlots()) {
              capabilities.add(testSlot.getCapabilities());
            }

            proxyInfo.put("capabilities", capabilities);
            break;
          }

        }
      } catch (Base64DecodingException e) {
        e.printStackTrace();
      }

    }
    return proxyInfo;
  }
}
