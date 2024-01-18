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

import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/** A bad implementation of URL Templates, but enough for our needs. */
public class UrlTemplate {

  private static final Pattern GROUP_NAME = Pattern.compile("(\\{\\p{Alnum}+\\})");
  private final Function<String, UrlTemplate.Match> compiled;

  public UrlTemplate(String template) {
    if (template == null || template.isEmpty()) {
      throw new IllegalArgumentException("Template must not be 0 length");
    }

    // ^ start of string
    StringBuilder regex = new StringBuilder("^");
    Matcher groupNameMatcher = GROUP_NAME.matcher(template);

    List<String> groups = new ArrayList<>();
    int lastStart = 0;
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
      lastStart = start;
      lastGroup = end;
    }

    if (template.length() > lastGroup) {
      // everything behind the last group
      regex.append(Pattern.quote(template.substring(lastGroup)));
    }

    // $ end of string
    regex.append('$');

    List<String> allGroups = List.copyOf(groups);
    // do we hit a fast path?
    switch (allGroups.size()) {
      case 0: // no groups, just .equals
        this.compiled =
            (matchAgainst) -> {
              if (!template.equals(matchAgainst)) {
                return null;
              }

              return new Match(matchAgainst, Collections.emptyMap());
            };
        break;
      case 1: // one group, the common case
        String groupName = template.substring(lastStart + 1, lastGroup - 1);
        String prefix = template.substring(0, lastStart);
        String suffix = template.substring(lastGroup);

        this.compiled =
            (matchAgainst) -> {
              if (matchAgainst.length() <= prefix.length() + suffix.length()) {
                // the url is too short to match
                return null;
              } else if (!matchAgainst.startsWith(prefix)) {
                // the url does not have the prefix
                return null;
              } else if (!matchAgainst.endsWith(suffix)) {
                // the url does not have the suffix
                return null;
              } else {
                String groupValue =
                    matchAgainst.substring(
                        prefix.length(), matchAgainst.length() - suffix.length());
                // ensure we act like the regex way
                if (groupValue.indexOf('/') != -1) {
                  return null;
                }
                return new Match(matchAgainst, Collections.singletonMap(groupName, groupValue));
              }
            };
        break;
      default: // more than one group, not common
        Pattern pattern = Pattern.compile(regex.toString());

        this.compiled =
            (matchAgainst) -> {
              Matcher matcher = pattern.matcher(matchAgainst);
              if (!matcher.matches()) {
                return null;
              }

              Map<String, String> params = new LinkedHashMap<>();
              for (int i = 0; i < allGroups.size(); i++) {
                params.put(allGroups.get(i), matcher.group(i + 1));
              }

              return new Match(matchAgainst, Map.copyOf(params));
            };
    }
  }

  /**
   * @return A {@link Match} with all parameters filled if successful, null otherwise.
   */
  public UrlTemplate.Match match(String matchAgainst) {
    if (matchAgainst == null) {
      return null;
    }

    return compiled.apply(matchAgainst);
  }

  /**
   * @return A {@link Match} with all parameters filled if successful, null otherwise. Remove
   *     subPath from matchAgainst before matching.
   */
  public UrlTemplate.Match match(String matchAgainst, String prefix) {
    if (matchAgainst == null || prefix == null) {
      return null;
    }
    if (!prefix.isEmpty() && !prefix.equals("/")) {
      matchAgainst = matchAgainst.replaceFirst(prefix, "");
    }
    return match(matchAgainst);
  }

  @SuppressWarnings("InnerClassMayBeStatic")
  public class Match {
    private final String url;
    private final Map<String, String> parameters;

    private Match(String url, Map<String, String> parameters) {
      this.url = url;
      this.parameters = Map.copyOf(parameters);
    }

    public String getUrl() {
      return url;
    }

    public Map<String, String> getParameters() {
      return parameters;
    }
  }
}
