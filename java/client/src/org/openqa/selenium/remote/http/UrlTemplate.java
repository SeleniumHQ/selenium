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

package org.openqa.selenium.remote.http;

import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableMap;

import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * An incredibly bad implementation of URL Templates, but enough for our needs.
 */
public class UrlTemplate {

  private final static Pattern GROUP_NAME = Pattern.compile("\\(\\?<([a-zA-Z][a-zA-Z0-9]*)>");
  private final List<Matches> template;

  public UrlTemplate(String template) {
    if (template == null || template.isEmpty()) {
      throw new IllegalArgumentException("Template must not be 0 length");
    }

    ImmutableList.Builder<Matches> fragments = ImmutableList.builder();
    for (String fragment : template.split("/")) {
      // Convert the fragment to a pattern by replacing "{...}" with a capturing group. We capture
      // from the opening '{' and do a non-greedy match of letters until the closing '}'.
      Matcher matcher = Pattern.compile("\\{(\\p{Alnum}+?)\\}").matcher(fragment);
      String toCompile = matcher.replaceAll("(?<$1>[^/]+)");

      // There's no API for getting the names of capturing groups from a pattern in java. So we're
      // going to use a regex to find them. ffs.
      Matcher groupNameMatcher = GROUP_NAME.matcher(toCompile);

      ImmutableList.Builder<String> names = ImmutableList.builder();
      while (groupNameMatcher.find()) {
        names.add(groupNameMatcher.group(1));
      }

      fragments.add(new Matches(Pattern.compile(Matcher.quoteReplacement(toCompile)), names.build()));
    }
    this.template = fragments.build();
  }

  /**
   * @return A {@link Match} with all parameters filled if successful, null otherwise.
   */
  public UrlTemplate.Match match(String matchAgainst) {
    if (matchAgainst == null) {
      return null;
    }

    String[] fragments = matchAgainst.split("/");
    if (fragments.length != template.size()) {
      return null;
    }

    ImmutableMap.Builder<String, String> params = ImmutableMap.builder();
    for (int i = 0; i < fragments.length; i++) {
      Matcher matcher = template.get(i).matcher(fragments[i]);
      if (!matcher.find()) {
        return null;
      }

      for (String name : template.get(i).groupNames) {
        params.put(name, matcher.group(name));
      }
    }

    return new Match(matchAgainst, params.build());
  }

  public class Match {
    private final String url;
    private final Map<String, String> parameters;

    private Match(String url, Map<String, String> parameters) {
      this.url = url;
      this.parameters = ImmutableMap.copyOf(parameters);
    }

    public String getUrl() {
      return url;
    }

    public Map<String, String> getParameters() {
      return parameters;
    }
  }

  private static class Matches {

    private final Pattern pattern;
    private final List<String> groupNames;

    private Matches(Pattern pattern, List<String> groupNames) {
      this.pattern = pattern;
      this.groupNames = groupNames;
    }

    public Matcher matcher(String fragment) {
      return pattern.matcher(fragment);
    }
  }
}
