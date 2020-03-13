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

package org.openqa.selenium.docker.internal;

import com.google.common.annotations.VisibleForTesting;
import com.google.common.collect.ImmutableMap;
import org.openqa.selenium.Beta;
import org.openqa.selenium.docker.DockerException;

import java.util.Map;
import java.util.Objects;
import java.util.function.Function;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Beta
public class Reference {

  private static final String DEFAULT_DOMAIN = "docker.io";
  private static final String DEFAULT_REPO = "library";
  private static final String DEFAULT_TAG = "latest";

  // Capturing groups used in patterns below
  private static final String DOMAIN = "([\\w\\d-_.]+?(:(\\d+))?";
  private static final String REPO = "([\\w\\d-_.]+?)";
  private static final String NAME = "([\\w\\d-_.]+?)";
  private static final String TAG = "([\\w\\d-_.]+?)";
  private static final String DIGEST = "(sha256:[A-Fa-f0-9]{64})";

  // name -> {domain: "docker.io", repository: "repository", name: name, tag: "latest", digest: null}
  // name:tag -> {domain: "docker.io", repository: "repository", name: name, tag: tag, digest: null}
  // name@digest -> {domain: "docker.io", repository: "repository", name: name, tag: null, digest: digest}
  // repository/name -> {domain: "docker.io", repository: repository, name: name, tag: "latest", digest: null}
  // repository/name:tag -> {domain: "docker.io", repository: repository, name: name, tag: tag, digest: null}
  // repository/name@digest -> {domain: "docker.io", repository: repository, name: name, tag: null, digest: digest}
  // domain/repository/name:tag -> {domain: "domain", repository: repository, name: name, tag: tag, digest: null}
  // domain:port/repository/name@digest -> {domain: "domain:port", repository: repository, name: name, tag: tag, digest: null}
  private static final Map<Pattern, Function<Matcher, Reference>> PATTERNS = ImmutableMap.<Pattern, Function<Matcher, Reference>>builder()
    .put(Pattern.compile(TAG), m -> new Reference(DEFAULT_DOMAIN, DEFAULT_REPO, m.group(1), DEFAULT_TAG, null))
    .put(Pattern.compile(String.format("%s:%s", NAME, TAG)), m -> new Reference(DEFAULT_DOMAIN, DEFAULT_REPO, m.group(1), m.group(2), null))
    .put(Pattern.compile(String.format("%s/%s", REPO, NAME)), m -> new Reference(DEFAULT_DOMAIN, m.group(1), m.group(2), DEFAULT_TAG, null))
    .put(Pattern.compile(String.format("%s@%s", NAME, DIGEST)), m -> new Reference(DEFAULT_DOMAIN, DEFAULT_REPO, m.group(1), null, m.group(2)))
    .put(Pattern.compile(String.format("%s/%s:%s", REPO, NAME, TAG)), m -> new Reference(DEFAULT_DOMAIN, m.group(1), m.group(2), m.group(3), null))
    .put(Pattern.compile(String.format("%s/%s@%s", REPO, NAME, DIGEST)), m -> new Reference(DEFAULT_DOMAIN, m.group(1), m.group(2), null, m.group(3)))
    .build();

  private final String domain;
  private final String repository;
  private final String name;
  private final String tag;
  private final String digest;

  @VisibleForTesting
  Reference(String domain, String repository, String name, String tag, String digest) {
    this.domain = Objects.requireNonNull(domain);
    this.repository = Objects.requireNonNull(repository);
    this.name = Objects.requireNonNull(name);
    this.tag = tag;
    this.digest = digest;
  }

  public String getDomain() {
    return domain;
  }

  public String getRepository() {
    return repository;
  }

  public String getName() {
    return name;
  }

  public String getTag() {
    return tag;
  }

  public String getDigest() {
    return digest;
  }

  public String getFamiliarName() {
    StringBuilder familiar = new StringBuilder();

    if (!DEFAULT_DOMAIN.equals(domain)) {
      familiar.append(domain).append("/");
    }

    if (!DEFAULT_REPO.equals(repository)) {
      familiar.append(repository).append("/");
    }

    familiar.append(name);

    if (digest != null) {
      familiar.append("@").append(digest);
    } else if (tag != null) {
      familiar.append(":").append(tag);
    } else {
      throw new DockerException("Unable to form familiar name: " + this);
    }

    return familiar.toString();
  }

  public static Reference parse(String input) {
    Objects.requireNonNull(input, "Reference to parse must be set.");

    for (Map.Entry<Pattern, Function<Matcher, Reference>> entry : PATTERNS.entrySet()) {
      Matcher matcher = entry.getKey().matcher(input);
      if (matcher.matches()) {
        return entry.getValue().apply(matcher);
      }
    }

    throw new DockerException("Unable to parse: " + input);
  }

  @Override
  public String toString() {
    return "Reference{" +
      "domain='" + domain + '\'' +
      ", repository='" + repository + '\'' +
      ", name='" + name + '\'' +
      ", tag='" + tag + '\'' +
      ", digest='" + digest + '\'' +
      '}';
  }

  @Override
  public boolean equals(Object o) {
    if (!(o instanceof Reference)) {
      return false;
    }

    Reference that = (Reference) o;
    return this.domain.equals(that.domain) &&
      this.repository.equals(that.repository) &&
      this.name.equals(that.name) &&
      Objects.equals(tag, that.tag) &&
      Objects.equals(digest, that.digest);
  }

  @Override
  public int hashCode() {
    return Objects.hash(domain, repository, name, tag, digest);
  }
}
