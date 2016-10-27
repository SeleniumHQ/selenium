// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

package org.openqa.grid.web.servlet.api.v1;

import java.util.LinkedList;
import java.util.List;

public class APIEndpointRegistry {

  private static List<EndPoint> get = new LinkedList<>();
  private static final String apiPrefix = "/api/v1";

  public static List<EndPoint> getEndpoints() {
    if (get.isEmpty()) {
      get.add(new EndPoint("/api",
                           "HTML page documenting the API endpoints (this page)",
                           ApiV1.class.getName()));

      get.add(new EndPoint(apiPrefix + "/nodes",
                           "List of computers connected to the HUB and the nodes on each computer",
                           Nodes.class.getName()));

      get.add(new EndPoint(apiPrefix + "/proxy",
                           "Returns configuration and capability information for the current proxy",
                           Proxy.class.getName(),
                           apiPrefix + "/proxy/&lt;ID&gt; - ID retrieved from the /node endpoint"));

      get.add(new EndPoint(apiPrefix + "/sessions",
                           "List of currently open sessions",
                           Sessions.class.getName()));

      get.add(new EndPoint(apiPrefix + "/session",
                           "Returns details for a given session",
                           SessionInfo.class.getName(),
                           apiPrefix
                           + "/sessions/&lt;ID&gt; - ID retrieved from the /sessions endpoint"));
    }
    return get;
  }

  public static class EndPoint {
    private String permalink;
    private String description;
    private String className;
    private String usage;


    public EndPoint(String permalink, String description, String className, String usage) {
      this.permalink = permalink;
      this.description = description;
      this.className = className;
      this.usage = usage;
    }

    public EndPoint(String permalink, String description, String className) {
      this.permalink = permalink;
      this.description = description;
      this.className = className;
    }

    public String getDescription() {
      return this.description;
    }

    public String getPermalink() {
      return this.permalink;
    }

    public String getServerRegistrationPermalink() {
      return getPermalink() + "/*";
    }

    public String getClassName() {
      return this.className;
    }

    public String getUsage() {
      if (this.usage == null) {
        return getPermalink();
      } else {
        return this.usage;
      }
    }
  }
}
