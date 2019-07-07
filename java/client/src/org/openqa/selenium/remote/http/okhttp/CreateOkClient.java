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

package org.openqa.selenium.remote.http.okhttp;

import com.google.common.base.Strings;
import okhttp3.Credentials;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;
import org.openqa.selenium.remote.http.ClientConfig;

import java.util.Objects;
import java.util.function.Function;

import static java.util.concurrent.TimeUnit.MILLISECONDS;

class CreateOkClient implements Function<ClientConfig, OkHttpClient> {

  @Override
  public OkHttpClient apply(ClientConfig config) {
    Objects.requireNonNull(config, "Client config to use must be set.");

    okhttp3.OkHttpClient.Builder client = new okhttp3.OkHttpClient.Builder()
      .followRedirects(true)
      .followSslRedirects(true)
      .proxy(config.proxy())
      .readTimeout(config.readTimeout().toMillis(), MILLISECONDS)
      .connectTimeout(config.connectionTimeout().toMillis(), MILLISECONDS);

    String info = config.baseUri().getUserInfo();
    if (!Strings.isNullOrEmpty(info)) {
      String[] parts = info.split(":", 2);
      String user = parts[0];
      String pass = parts.length > 1 ? parts[1] : null;

      String credentials = Credentials.basic(user, pass);

      client.authenticator((route, response) -> {
        if (response.request().header("Authorization") != null) {
          return null; // Give up, we've already attempted to authenticate.
        }

        return response.request().newBuilder()
          .header("Authorization", credentials)
          .build();
      });
    }

    client.addNetworkInterceptor(chain -> {
      Request request = chain.request();
      Response response = chain.proceed(request);
      return response.code() == 408
        ? response.newBuilder().code(500).message("Server-Side Timeout").build()
        : response;
    });

    return client.build();
  }
}
