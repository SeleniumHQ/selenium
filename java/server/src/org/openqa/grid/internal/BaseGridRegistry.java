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

package org.openqa.grid.internal;

import org.openqa.grid.internal.utils.configuration.GridHubConfiguration;
import org.openqa.grid.web.Hub;
import org.openqa.selenium.remote.internal.HttpClientFactory;

public abstract class BaseGridRegistry implements GridRegistry {
  protected final HttpClientFactory httpClientFactory;
  @Deprecated
  protected GridHubConfiguration configuration;

  // The following needs to be volatile because we expose a public setters
  protected volatile Hub hub;

  public BaseGridRegistry(Hub hub) {
    this.httpClientFactory = new HttpClientFactory();
    this.hub = hub;

    this.configuration = (hub != null) ?
       hub.getConfiguration() : new GridHubConfiguration();
  }

  /**
   * @see GridRegistry#getConfiguration()
   */
  @Deprecated
  public GridHubConfiguration getConfiguration() {
    return (hub != null) ? hub.getConfiguration() :
           (configuration != null) ? configuration : new GridHubConfiguration();
  }

  /**
   * @see GridRegistry#getHub()
   */
  public Hub getHub() {
    return hub;
  }

  /**
   * @see GridRegistry#setHub(Hub)
   */
  public void setHub(Hub hub) {
    this.hub = hub;
    if (hub != null) {
      this.configuration = hub.getConfiguration();
    }
  }

  /**
   * @see GridRegistry#getHttpClientFactory()
   */
  public HttpClientFactory getHttpClientFactory() {
    return httpClientFactory;
  }

}
