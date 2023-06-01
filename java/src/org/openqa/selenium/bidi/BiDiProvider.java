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

package org.openqa.selenium.bidi;

import com.google.auto.service.AutoService;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.Optional;
import java.util.function.Predicate;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.remote.AugmenterProvider;
import org.openqa.selenium.remote.ExecuteMethod;
import org.openqa.selenium.remote.http.ClientConfig;
import org.openqa.selenium.remote.http.HttpClient;

@AutoService(AugmenterProvider.class)
public class BiDiProvider implements AugmenterProvider<HasBiDi> {

  @Override
  public Predicate<Capabilities> isApplicable() {
    return caps -> getBiDiUrl(caps).isPresent();
  }

  @Override
  public Class<HasBiDi> getDescribedInterface() {
    return HasBiDi.class;
  }

  @Override
  public HasBiDi getImplementation(Capabilities caps, ExecuteMethod executeMethod) {

    URI wsUri = getBiDiUrl(caps).orElseThrow(() -> new BiDiException("BiDi not supported"));

    HttpClient.Factory clientFactory = HttpClient.Factory.createDefault();
    ClientConfig wsConfig = ClientConfig.defaultConfig().baseUri(wsUri);
    HttpClient wsClient = clientFactory.createClient(wsConfig);
    Connection connection = new Connection(wsClient, wsUri.toString());

    return () -> Optional.of(new BiDi(connection));
  }

  private Optional<URI> getBiDiUrl(Capabilities caps) {
    Object bidiCapability;
    if (caps.asMap().containsKey("se:bidi")) {
      // Session is created remotely
      bidiCapability = caps.getCapability("se:bidi");
    } else {
      bidiCapability = caps.getCapability("webSocketUrl");
    }
    Optional<String> webSocketUrl = Optional.ofNullable((String) bidiCapability);

    return webSocketUrl.map(
        uri -> {
          try {
            return new URI(uri);
          } catch (URISyntaxException e) {
            return null;
          }
        });
  }
}
