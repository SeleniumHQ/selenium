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


package org.openqa.selenium.server.commands;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

public class AddCustomRequestHeaderCommand extends Command {
  private static Map<String, String> headers = new ConcurrentHashMap<String, String>();

  private String key;
  private String value;

  public AddCustomRequestHeaderCommand(String key, String value) {
    this.key = key;
    this.value = value;
  }

  @Override
  public String execute() {
    headers.put(key, value);

    return "OK";
  }

  public static Map<String, String> getHeaders() {
    return headers;
  }
}
