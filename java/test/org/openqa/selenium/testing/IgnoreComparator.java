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

package org.openqa.selenium.testing;

import java.io.IOException;
import java.util.HashSet;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Stream;
import org.eclipse.egit.github.core.Issue;
import org.eclipse.egit.github.core.service.IssueService;
import org.openqa.selenium.testing.drivers.Browser;

class IgnoreComparator {
  private final Set<Browser> ignored = new HashSet<>();

  // TODO(simon): reduce visibility
  public void addDriver(Browser driverToIgnore) {
    ignored.add(driverToIgnore);
  }

  public boolean shouldIgnore(IgnoreList ignoreList) {
    return ignoreList != null
        && ignoreList.value().length > 0
        && shouldIgnore(Stream.of(ignoreList.value()));
  }

  public boolean shouldIgnore(Ignore ignore) {
    return ignore != null && shouldIgnore(Stream.of(ignore));
  }

  public boolean shouldIgnore(Stream<Ignore> ignoreList) {
    return ignoreList.anyMatch(
        driver ->
            (ignored.contains(driver.value()) || driver.value() == Browser.ALL)
                && ((!driver.travis() || TestUtilities.isOnTravis())
                    || (!driver.gitHubActions() || TestUtilities.isOnGitHubActions()))
                && isOpen(driver.issue()));
  }

  private boolean isOpen(String issue) {
    if ("".equals(issue)) {
      return true; // unknown issue, suppose it's open
    }
    Matcher m = Pattern.compile("#?(\\d+)").matcher(issue);
    if (m.matches()) {
      return isOpenGitHubIssue("SeleniumHQ", "selenium", m.group(1));
    }
    m = Pattern.compile("https?://github.com/(\\w+)/(\\w+)/issues/(\\d+)").matcher(issue);
    if (m.matches()) {
      return isOpenGitHubIssue(m.group(1), m.group(2), m.group(3));
    }
    return true; // unknown issue, suppose it's open
  }

  private boolean isOpenGitHubIssue(String owner, String repo, String issueId) {
    String gitHubToken = System.getenv("GITHUB_TOKEN");
    if (gitHubToken == null) {
      return true;
    }
    IssueService service = new IssueService();
    service.getClient().setOAuth2Token(gitHubToken);
    try {
      Issue issue = service.getIssue(owner, repo, issueId);
      return "open".equals(issue.getState());
    } catch (IOException e) {
      e.printStackTrace();
    }
    return true;
  }
}
