/*
Copyright 2007-2009 WebDriver committers
Copyright 2007-2009 Google Inc.

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

package org.openqa.selenium.remote.server.rest;

import org.openqa.selenium.remote.server.DriverSessions;
import org.openqa.selenium.remote.server.LogTo;

import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.Map;
import java.util.Set;

public class UrlMapper {

  private Map<ResultType, Renderer> globals = new LinkedHashMap<ResultType, Renderer>();
  private Set<ResultConfig> configs = new LinkedHashSet<ResultConfig>();
  private final DriverSessions sessions;
  private LogTo logger;

  public UrlMapper(DriverSessions sessions, LogTo logger) {
    this.sessions = sessions;
    this.logger = logger;
  }

  public ResultConfig bind(String url, Class<? extends Handler> handlerClazz) {
    ResultConfig config = new ResultConfig(url, handlerClazz, sessions, logger);
    configs.add(config);
    for (Map.Entry<ResultType, Renderer> entry : globals.entrySet()) {
      config.on(entry.getKey(), entry.getValue());
    }
    return config;
  }

  public ResultConfig getConfig(String url) throws Exception {
    for (ResultConfig config : configs) {
      if (config.isFor(url)) {
        return config;
      }
    }

    return null;
  }

  public void addGlobalHandler(ResultType type, Renderer renderer) {
    globals.put(type, renderer);

    for (ResultConfig config : configs) {
      config.on(type, renderer);
    }
  }
}
