
/*
Copyright 2011 WebDriver committers
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

package org.openqa.grid.internal;

import org.json.JSONObject;
import org.openqa.grid.common.RegistrationRequest;
import org.openqa.grid.common.exception.GridException;
import org.openqa.grid.internal.utils.CapabilityMatcher;
import org.openqa.grid.internal.utils.HtmlRenderer;
import org.openqa.selenium.remote.internal.HttpClientFactory;

import java.net.URL;
import java.util.List;
import java.util.Map;

/**
 * Proxy to a remote server executing the tests. <p/> The proxy keeps a state of what is happening
 * on the remote server and knows if a new test can be run on the remote server. There are several
 * reasons why a test could not be run on the specified remote server, for instance: if the
 * RemoteProxy decides the remote server has reached the maximum number of concurrent sessions, or
 * if the client has requested DesiredCapabilities we don't support e.g. asking for Chrome when we
 * only support Firefox.
 */
public interface RemoteProxy extends Comparable<RemoteProxy> {
  List<TestSlot> getTestSlots();

  Registry getRegistry();

  CapabilityMatcher getCapabilityHelper();

  void setupTimeoutListener();

  String getId();

  void teardown();

  Map<String, Object> getConfig();

  RegistrationRequest getOriginalRegistrationRequest();

  int getMaxNumberOfConcurrentTestSessions();

  URL getRemoteHost();

  TestSession getNewSession(Map<String, Object> requestedCapability);

  int getTotalUsed();

  HtmlRenderer getHtmlRender();

  int getTimeOut();

  HttpClientFactory getHttpClientFactory();

  JSONObject getStatus() throws GridException;

  boolean hasCapability(Map<String,Object> requestedCapability);

  boolean isBusy();
}
