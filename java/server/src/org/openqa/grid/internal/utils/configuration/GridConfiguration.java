package org.openqa.grid.internal.utils.configuration;

/*
Copyright 2011 Selenium committers
Copyright 2011 Software Freedom Conservancy

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

import java.util.HashMap;
import java.util.Map;
import java.util.Set;

public class GridConfiguration extends HashMap<Object, Map<String, String>> {

  private static final String DESCRIPTION = "description";
  
  
  public GridConfiguration(){
    addParam("role", "<hub|node> (default is no grid, just run an RC/webdriver server). When launching a node, the parameters will be forwarded to the server on the node, so you can use something like -role node -trustAllSSLCertificates.  In that case, the SeleniumServer will be launch with the trustallSSLCertificates option.");

    // hub config
    addParam("host", "(hub & node)  <IP | hostname> : usually not needed and determined automatically. For exotic network configuration, network with VPN, specifying the host might be necessary.");
    addParam("port", "(hub & node) <xxxx> : the port the remote/hub will listen on. Default to 4444.");

    addParam("throwOnCapabilityNotPresent", "(hub) <true | false> default to true. If true, the hub will reject test requests right away if no proxy is currently registered that can host that capability.Set it to false to have the request queued until a node supporting the capability is added to the grid.");
    addParam("newSessionWaitTimeout", "(hub) <XXXX>. Default to no timeout ( -1 ) the time in ms after which a new test waiting for a node to become available will time out.When that happens, the test will throw an exception before starting a browser.");

    addParam("capabilityMatcher", "(hub) a class implementing the CapabilityMatcher interface. Defaults to org.openqa.grid.internal.utils.DefaultCapabilityMatcher. Specify the logic the hub will follow to define if a request can be assigned to a node.Change this class if you want to have the matching process use regular expression instead of exact match for the version of the browser for instance. All the nodes of a grid instance will use the same matcher, defined by the registry.");
    addParam("prioritizer", "(hub) a class implementing the Prioritizer interface. Default to null ( no priority = FIFO ).Specify a custom prioritizer if you need the grid to process the tests from the CI, or the IE tests first for instance.");
    addParam("servlets", "(hub & node) <com.mycompany.MyServlet,com.mycompany.MyServlet2> to register a new servlet on the hub/node. The servlet will accessible under the path  /grid/admin/MyServlet /grid/admin/MyServlet2");

    addParam("grid1Yml", "(hub) a YML file following grid1 format.");
    addParam("hubConfig", "(hub) a JSON file following grid2 format that defines the hub properties.");
    addParam("nodeConfig", "(node) a JSON file following grid2 format that defines the node properties.");

    // config that will be inherited by the proxy and used for the node management.
    addParam("cleanupCycle", "(node) <XXXX> in ms. How often a proxy will check for timed out thread.");
    addParam("nodeTimeout", "(node) <XXXX>  the timeout in seconds before the hub automatically ends a test that hasn't had any activity in the last X seconds. The browser will be released for another test to use. This typically takes care of the client crashes.");
    addParam("browserTimeout", "(hub/node) The timeout in seconds a browser can hang");
    addParam("hub", "(node) <http://localhost:4444/grid/register> : the url that will be used to post the registration request. This option takes precedence over -hubHost and -hubPort options.");
    addParam("hubHost", "(node) <IP | hostname> : the host address of a hub the registration request should be sent to. Default to localhost. Option -hub takes precedence over this option.");
    addParam("hubPort", "(node) <xxxx> : the port listened by a hub the registration request should be sent to. Default to 4444. Option -hub takes precedence over this option.");
    addParam("proxy", "(node) the class that will be used to represent the node. By default org.openqa.grid.selenium.proxy.DefaultRemoteProxy.");
    addParam("maxSession", "(node) max number of tests that can run at the same time on the node, independently of the browser used.");
    addParam("registerCycle", "(node) how often in ms the node will try to register itself again.Allow to restart the hub without having to restart the nodes.");
    addParam("nodePolling", "(node) in ms. Interval between alive checks of node how often the hub checks if the node is still alive.");
    addParam("unregisterIfStillDownAfter", "(node) in ms. If the node remains down for more than unregisterIfStillDownAfter millisec, it will disappear from the hub.Default is 1min. ");
    addParam("downPollingLimit", "(node) node is marked as down after downPollingLimit alive checks.");
    addParam("nodeStatusCheckTimeout", "(node) in ms. Connection and socket timeout which is used for node alive check.");
  }
  

  public void addParam(String param, String description){
    Map<String, String> map = new HashMap<String, String>();
    map.put(DESCRIPTION, description);
    this.put(param, map);
  }


  public String getDescriptionForParam(String param) {
    if(this.containsKey(param)){
      Map info = this.get(param);
      return (String) info.get(DESCRIPTION);
    } else {
      return "No help specified for " + param;
    }
  }

  public Set<Object> getAllParams(){
    return this.keySet();
  }
}
