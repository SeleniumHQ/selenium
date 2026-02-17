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

package org.openqa.selenium.grid.node;

import java.util.Collection;
import java.util.Map;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.grid.config.Config;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.tracing.Tracer;

/**
 * SPI for pluggable session factory providers that can be loaded via {@link
 * java.util.ServiceLoader}. Implementations are discovered at runtime when placed on the classpath
 * (e.g. via {@code --ext}).
 */
public interface NodeSessionFactoryProvider {

  /** Returns {@code true} when this provider's configuration section is present and active. */
  boolean isEnabled(Config config);

  /** Creates session factories for the capabilities this provider handles. */
  Map<Capabilities, Collection<SessionFactory>> loadFactories(
      Config config, Tracer tracer, HttpClient.Factory clientFactory);
}
