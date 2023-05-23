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

package org.openqa.selenium.remote;

import java.util.ServiceLoader;
import org.openqa.selenium.remote.codec.w3c.W3CHttpCommandCodec;
import org.openqa.selenium.remote.codec.w3c.W3CHttpResponseCodec;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;

public enum Dialect {
  W3C {
    @Override
    public CommandCodec<HttpRequest> getCommandCodec() {
      return bindAdditionalCommands(new W3CHttpCommandCodec());
    }

    @Override
    public ResponseCodec<HttpResponse> getResponseCodec() {
      return new W3CHttpResponseCodec();
    }

    @Override
    public String getEncodedElementKey() {
      return "element-6066-11e4-a52e-4f735466cecf";
    }

    @Override
    public String getShadowRootElementKey() {
      return "shadow-6066-11e4-a52e-4f735466cecf";
    }
  };

  public abstract CommandCodec<HttpRequest> getCommandCodec();

  public abstract ResponseCodec<HttpResponse> getResponseCodec();

  public abstract String getEncodedElementKey();

  public abstract String getShadowRootElementKey();

  private static CommandCodec<HttpRequest> bindAdditionalCommands(
      CommandCodec<HttpRequest> toCodec) {
    ServiceLoader.load(AdditionalHttpCommands.class)
        .forEach(
            cmds -> {
              cmds.getAdditionalCommands()
                  .forEach(
                      (name, info) -> {
                        if (!toCodec.isSupported(name)) {
                          toCodec.defineCommand(name, info.getMethod(), info.getUrl());
                        }
                      });
            });

    return toCodec;
  }
}
