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

/** A bad implementation of URL Templates, but enough for our needs. */
public class UrlTemplate {

  private static final Pattern GROUP_NAME = Pattern.compile("(\\{\\p{Alnum}+\\})");
  private final Pattern pattern;
  private final List<String> groups;

  public UrlTemplate(String template) {
    if (template == null || template.isEmpty()) {
      throw new IllegalArgumentException("Template must not be 0 length");
    }

    // ^ start of string
    StringBuilder regex = new StringBuilder("^");
    Matcher groupNameMatcher = GROUP_NAME.matcher(template);

    ImmutableList.Builder<String> groups = ImmutableList.builder();
    int lastGroup = 0;

    while (groupNameMatcher.find()) {
      int start = groupNameMatcher.start(1);
      int end = groupNameMatcher.end(1);

      // everything before the current group
      regex.append(Pattern.quote(template.substring(lastGroup, start)));
      // replace the group name with a capturing group
      regex.append("([^/]+)");
      // register the group name, to resolve into parameters
      groups.add(template.substring(start + 1, end - 1));
      lastGroup = end;
    }

    if (template.length() > lastGroup) {
      // everything behind the last group
      regex.append(Pattern.quote(template.substring(lastGroup)));
    }

    // $ end of string
    regex.append('$');

    this.pattern = Pattern.compile(regex.toString());
    this.groups = groups.build();
  }

  /**
   * @return A {@link Match} with all parameters filled if successful, null otherwise.
   */
  public UrlTemplate.Match match(String matchAgainst) {
    if (matchAgainst == null) {
      return null;
    }

    Matcher matcher = pattern.matcher(matchAgainst);
    if (!matcher.matches()) {
      return null;
    }

    ImmutableMap.Builder<String, String> params = ImmutableMap.builder();
    for (int i = 0; i < groups.size(); i++) {
      params.put(groups.get(i), matcher.group(i + 1));
    }

    return new Match(matchAgainst, params.build());
  }

  @SuppressWarnings("InnerClassMayBeStatic")
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
}
