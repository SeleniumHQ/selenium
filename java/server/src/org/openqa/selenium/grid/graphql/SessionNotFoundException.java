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
