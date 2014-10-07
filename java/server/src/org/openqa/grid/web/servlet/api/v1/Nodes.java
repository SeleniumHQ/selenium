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


import org.openqa.grid.internal.ProxySet;
import org.openqa.grid.internal.RemoteProxy;
import org.openqa.grid.web.servlet.api.v1.utils.ProxyIdUtil;

import java.io.UnsupportedEncodingException;
import java.util.HashMap;
import java.util.Iterator;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;


public class Nodes extends RestApiEndpoint {


  @Override
  public Object getResponse(String query) {
    Map<String, List<Map>> computerNames = new HashMap<String, List<Map>>();

    ProxySet proxies = this.getRegistry().getAllProxies();
    Iterator<RemoteProxy> iterator = proxies.iterator();
    while (iterator.hasNext()) {
      RemoteProxy currentProxy = iterator.next();
      String host = currentProxy.getRemoteHost().getHost();
      String port = String.valueOf(currentProxy.getRemoteHost().getPort());

      if (!computerNames.containsKey(host)) {
        computerNames.put(host, new LinkedList<Map>());
      }
      Map<String, String> proxyInfo = new HashMap<String, String>();
      proxyInfo.put("port", port);
      try {
        proxyInfo.put("proxy", ProxyIdUtil.encodeId(currentProxy.getId()));
      } catch (UnsupportedEncodingException e) {
        e.printStackTrace();  //To change body of catch statement use File | Settings | File Templates.
      }
      computerNames.get(host).add(proxyInfo);

    }

    return computerNames;
  }


}
