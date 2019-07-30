package org.openqa.selenium.devtools.fetch.model;

import com.google.common.collect.ImmutableMap;
import org.openqa.selenium.devtools.network.model.ResourceType;
import org.openqa.selenium.json.JsonInput;

import java.util.Map;
import java.util.Objects;
import java.util.Optional;

public class RequestPattern {

  private final Optional<String> urlPattern;
  private final Optional<ResourceType> resourceType;
  private final Optional<RequestStage> requestStage;

  public RequestPattern(
    Optional<String> urlPattern,
    Optional<ResourceType> resourceType,
    Optional<RequestStage> requestStage) {

    this.urlPattern = Objects.requireNonNull(urlPattern);
    this.resourceType = Objects.requireNonNull(resourceType);
    this.requestStage = Objects.requireNonNull(requestStage);
  }

  public Optional<String> getUrlPattern() {
    return urlPattern;
  }

  public Optional<ResourceType> getResourceType() {
    return resourceType;
  }

  public Optional<RequestStage> getRequestStage() {
    return requestStage;
  }

  private Map<String, Object> toJson() {
    ImmutableMap.Builder<String, Object> blob = ImmutableMap.builder();
    urlPattern.ifPresent(pattern -> blob.put("urlPattern", pattern));
    resourceType.ifPresent(type -> blob.put("resourceType", type));
    requestStage.ifPresent(stage -> blob.put("requestStage", stage));
    return blob.build();
  }

  private static RequestPattern fromJson(JsonInput input) {
    Optional<String> urlPattern = Optional.empty();
    Optional<ResourceType> resourceType = Optional.empty();
    Optional<RequestStage> requestStage = Optional.empty();

    input.beginObject();
    while (input.hasNext()) {
      switch (input.nextName()) {
        case "urlPattern":
          urlPattern = Optional.of(input.nextString());
          break;

        case "resourceType":
          resourceType = Optional.of(input.read(ResourceType.class));
          break;

        case "requestStage":
          requestStage = Optional.of(input.read(RequestStage.class));
          break;

        default:
          input.skipValue();
          break;
      }
    }
    input.endObject();

    return new RequestPattern(urlPattern, resourceType, requestStage);
  }
}
