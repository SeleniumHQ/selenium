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
package org.openqa.selenium.devtools.audit;

import static org.openqa.selenium.devtools.ConverterFunctions.map;
import static org.openqa.selenium.devtools.audit.model.Encoding.getEncoding;

import com.google.common.collect.ImmutableMap;

import org.openqa.selenium.devtools.Command;
import org.openqa.selenium.devtools.audit.model.EncodedResponse;
import org.openqa.selenium.devtools.network.model.RequestId;

import java.util.Objects;
import java.util.Optional;

/**
 * Audits domain allows investigation of page violations and possible improvements.
 */
public class Audit {

  public static Command<EncodedResponse> getEncodedResponse(RequestId requestId, String encoding,
                                                            Optional<Double> quality,
                                                            Optional<Boolean> sizeOnly) {
    final ImmutableMap.Builder<String, Object> params = ImmutableMap.builder();
    Objects.requireNonNull(requestId, "requestId is mandatory");
    Objects.requireNonNull(encoding, "encoding is encoding");
    params.put("requestId", requestId);
    params.put("encoding", getEncoding(encoding).name());
    params.put("quality", quality.orElse(1.0));
    params.put("sizeOnly", sizeOnly.orElse(false));
    return new Command<>(
        "Audit.getEncodedResponse", params.build(), map("body", EncodedResponse.class));
  }


}
