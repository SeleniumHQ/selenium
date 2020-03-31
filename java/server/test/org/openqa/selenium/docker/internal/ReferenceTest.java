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

import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.Parameterized;

import java.util.Arrays;
import java.util.Collection;

import static org.assertj.core.api.Assertions.assertThat;

@RunWith(Parameterized.class)
public class ReferenceTest {

  private final String input;
  private final Reference expected;

  @Parameterized.Parameters
  public static Collection<Object[]> data() {
    return Arrays.asList(new Object[][]{
      // input -> expected result
      {"imageName", new Reference("docker.io", "library", "imageName", "latest", null)},
      {"img:tg", new Reference("docker.io", "library", "img", "tg", null)},
      {"img@sha256:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff", new Reference("docker.io", "library", "img", null, "sha256:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff")},
      {"repo/img", new Reference("docker.io", "repo", "img", "latest",null)},
      {"repo/img:tag", new Reference("docker.io", "repo", "img", "tag",null)},
      {"repo/img@sha256:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff", new Reference("docker.io", "repo", "img", null,"sha256:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff")},
      // domain/repository/name:tag -> {domain: domain, repository: repository, name: name, tag: tag, digest: null}
      // domain:port/repository/name@digest ->
    });
  }

  public ReferenceTest(String input, Reference expected) {
    this.input = input;
    this.expected = expected;
  }

  @Test
  public void shouldEvaluateValidInputsAsReferences() {
    Reference seen = Reference.parse(input);
    assertThat(seen).describedAs("%s -> %s", input, expected).isEqualTo(expected);
  }

}
