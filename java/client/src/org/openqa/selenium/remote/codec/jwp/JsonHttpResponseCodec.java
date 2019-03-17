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

package org.openqa.selenium.remote.codec.jwp;

import org.openqa.selenium.remote.ErrorHandler;
import org.openqa.selenium.remote.Response;
import org.openqa.selenium.remote.codec.AbstractHttpResponseCodec;
import org.openqa.selenium.remote.internal.JsonToWebElementConverter;

import java.util.function.Function;

/**
 * A response codec that adheres to the Selenium project's JSON/HTTP wire protocol.
 *
 * @see <a href="https://github.com/SeleniumHQ/selenium/wiki/JsonWireProtocol"> JSON wire
 * protocol</a>
 */
public class JsonHttpResponseCodec extends AbstractHttpResponseCodec {

  private final ErrorHandler errorHandler = new ErrorHandler(true);
  private final Function<Object, Object> elementConverter = new JsonToWebElementConverter(null);

  @Override
  protected Response reconstructValue(Response response) {
    try {
      errorHandler.throwIfResponseFailed(response, 0);
    } catch (Exception e) {
      response.setValue(e);
    }

    response.setValue(elementConverter.apply(response.getValue()));

    return response;
  }

  @Override
  protected Object getValueToEncode(Response response) {
    return response;
  }
}
