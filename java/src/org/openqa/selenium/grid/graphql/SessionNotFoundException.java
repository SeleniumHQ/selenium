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

package org.openqa.selenium.grid.graphql;

import graphql.ErrorClassification;
import graphql.ErrorType;
import graphql.GraphQLError;
import graphql.language.SourceLocation;

import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

public class SessionNotFoundException extends RuntimeException implements GraphQLError {

  private final transient Optional<String> sessionId;

  public SessionNotFoundException(String message) {
    super(message);
    this.sessionId = Optional.empty();
  }

  public SessionNotFoundException(String message, String sessionId) {
    super(message);
    this.sessionId = Optional.of(sessionId);
  }

  @Override
  public Map<String, Object> getExtensions() {
    Map<String, Object> customAttributes = new LinkedHashMap<>();
    if (sessionId.isPresent()) {
      customAttributes.put("sessionId", sessionId.get());
    }
    return customAttributes;
  }

  @Override
  public List<SourceLocation> getLocations() {
    return Collections.emptyList();
  }

  @Override
  public ErrorClassification getErrorType() {
    return ErrorType.DataFetchingException;
  }
}
