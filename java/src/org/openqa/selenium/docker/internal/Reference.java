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
import java.util.Objects;
import org.openqa.selenium.Beta;
import org.openqa.selenium.docker.DockerException;
import org.openqa.selenium.internal.Require;

@Beta
public class Reference {
  private static final String DEFAULT_DOMAIN = "docker.io";
  private static final String LEGACY_DEFAULT_DOMAIN = "index.docker.io";
  private static final String DEFAULT_REPO = "library";
  private static final String DEFAULT_TAG = "latest";

  private final String domain;
  private final String name;
  private final String tag;
  private final String digest;
  private final String platform;

  @VisibleForTesting
  Reference(String domain, String name, String tag, String digest) {
    this.domain = Require.nonNull("Domain", domain);
    this.name = Require.nonNull("Name", name);
    this.tag = tag;
    this.digest = digest;
    this.platform = getDefaultPlatform();
  }

  @VisibleForTesting
  Reference(String domain, String name, String tag, String digest, String platform) {
    this.domain = Require.nonNull("Domain", domain);
    this.name = Require.nonNull("Name", name);
    this.tag = tag;
    this.digest = digest;
    this.platform = Require.nonNull("Platform", platform);
  }

  // Logic taken from https://github.com/distribution/distribution/blob/main/reference/normalize.go
  public static Reference parse(String input) {
    Require.nonNull("Reference to parse", input);

    ImmutableMap<String, String> splitDockerDomain = splitDockerDomain(input);
    String domain = splitDockerDomain.get("domain");
    String remainder = splitDockerDomain.get("remainder");

    String name;
    String digest =
        splitDockerDomain.get("digest").isEmpty() ? null : splitDockerDomain.get("digest");
    String platform = splitDockerDomain.get("platform");
    String tag = DEFAULT_TAG;

    int tagSep = remainder.indexOf(":");
    if (digest != null) {
      tag = null;
      name = remainder;
    } else if (tagSep > -1) {
      tag = remainder.substring(tagSep + 1);
      name = remainder.substring(0, tagSep);
    } else {
      name = remainder;
    }

    if (!name.toLowerCase().equals(name)) {
      throw new DockerException(
          String.format("Invalid reference format: repository name (%s) must be lowercase", name));
    }

    return new Reference(domain, name, tag, digest, platform);
  }

  private static ImmutableMap<String, String> splitDockerDomain(String name) {
    String domain;
    String remainder;
    String platform = getDefaultPlatform();
    String digest = "";

    // Check if the name contains a platform part
    int platformSep = name.lastIndexOf("@");
    if (platformSep > -1) {
      String[] parts = name.substring(platformSep + 1).split("/");
      if (parts.length == 2) {
        platform = name.substring(platformSep + 1);
      } else if (parts[0].contains(":")) {
        digest = name.substring(platformSep + 1);
      }
      name = name.substring(0, platformSep);
    }

    int domSep = name.indexOf("/");
    String possibleDomain = domSep == -1 ? "" : name.substring(0, domSep);
    if (domSep == -1
        || (!possibleDomain.contains(".")
            && !possibleDomain.contains(":")
            && !"localhost".equalsIgnoreCase(possibleDomain)
            && possibleDomain.toLowerCase().equals(possibleDomain))) {
      remainder = name;
      domain = DEFAULT_DOMAIN;
    } else {
      domain = possibleDomain;
      remainder = name.substring(domSep + 1);
    }
    if (LEGACY_DEFAULT_DOMAIN.equals(domain)) {
      domain = DEFAULT_DOMAIN;
    }
    if (DEFAULT_DOMAIN.equals(domain) && !remainder.contains("/")) {
      remainder = String.format("%s/%s", DEFAULT_REPO, remainder);
    }
    return ImmutableMap.of(
        "domain", domain, "remainder", remainder, "platform", platform, "digest", digest);
  }

  public String getDomain() {
    return domain;
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

  public String getPlatform() {
    return platform;
  }

  public String getFamiliarName() {
    StringBuilder familiar = new StringBuilder();

    if (!DEFAULT_DOMAIN.equals(domain)) {
      familiar.append(domain).append("/");
    }

    if (name.contains(DEFAULT_REPO) && DEFAULT_DOMAIN.equals(domain)) {
      familiar.append(name.replace(DEFAULT_REPO + "/", ""));
    } else {
      familiar.append(name);
    }

    if (digest != null) {
      familiar.append("@").append(digest);
    } else if (tag != null) {
      familiar.append(":").append(tag);
    } else {
      throw new DockerException("Unable to form familiar name: " + this);
    }

    return familiar.toString();
  }

  private static String getDefaultPlatform() {
    String arch = System.getProperty("os.arch").toLowerCase();
    if (arch.contains("amd64") || arch.contains("x86_64")) {
      arch = "amd64";
    } else if (arch.contains("arm64") || arch.contains("aarch64")) {
      arch = "arm64";
    }
    return "linux/" + arch;
  }

  @Override
  public String toString() {
    return "Reference{"
        + "domain='"
        + domain
        + '\''
        + ", name='"
        + name
        + '\''
        + ", tag='"
        + tag
        + '\''
        + ", digest='"
        + digest
        + '\''
        + ", platform='"
        + platform
        + '}';
  }

  @Override
  public boolean equals(Object o) {
    if (!(o instanceof Reference)) {
      return false;
    }

    Reference that = (Reference) o;
    return this.domain.equals(that.domain)
        && this.name.equals(that.name)
        && Objects.equals(tag, that.tag)
        && Objects.equals(digest, that.digest)
        && Objects.equals(platform, that.platform);
  }

  @Override
  public int hashCode() {
    return Objects.hash(domain, name, tag, digest, platform);
  }
}
