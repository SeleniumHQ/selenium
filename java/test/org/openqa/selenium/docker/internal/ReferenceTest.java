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
  private final String familiarName;

  public ReferenceTest(String input, Reference expected, String familiarName) {
    this.input = input;
    this.expected = expected;
    this.familiarName = familiarName;
  }

  @Parameterized.Parameters
  public static Collection<Object[]> data() {
    String sha256 = "sha256:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";
    return Arrays.asList(new Object[][]{
      // input -> expected result
      {"image", new Reference("docker.io", "library/image", "latest", null), "image:latest"},
      {"img:tg", new Reference("docker.io", "library/img", "tg", null), "img:tg"},
      {String.format("img@%s", sha256), new Reference("docker.io", "library/img", null, sha256),
       String.format("img@%s", sha256)},
      {"repo/img", new Reference("docker.io", "repo/img", "latest", null), "repo/img:latest"},
      {"repo/img:tag", new Reference("docker.io", "repo/img", "tag", null), "repo/img:tag"},
      {String.format("repo/img@%s", sha256), new Reference("docker.io", "repo/img", null, sha256),
       String.format("repo/img@%s", sha256)},
      {"images.sample.io/repo/img", new Reference("images.sample.io", "repo/img", "latest", null),
       "images.sample.io/repo/img:latest"},
      {"images.sample.io/repo/img:tag", new Reference("images.sample.io", "repo/img", "tag", null),
       "images.sample.io/repo/img:tag"},
      {"gcr.io/gouda/brie/cheddar/img:tag",
       new Reference("gcr.io", "gouda/brie/cheddar/img", "tag", null),
       "gcr.io/gouda/brie/cheddar/img:tag"},
      {String.format("gcr.io/gouda/brie/cheddar/img@%s", sha256),
       new Reference("gcr.io", "gouda/brie/cheddar/img", null, sha256),
       String.format("gcr.io/gouda/brie/cheddar/img@%s", sha256)},
      {"localhost:5000/gouda/brie/cheddar/img:tag",
       new Reference("localhost:5000", "gouda/brie/cheddar/img", "tag", null),
       "localhost:5000/gouda/brie/cheddar/img:tag"},
      {String.format("localhost:5000/gouda/brie/cheddar/img@%s", sha256),
       new Reference("localhost:5000", "gouda/brie/cheddar/img", null, sha256),
       String.format("localhost:5000/gouda/brie/cheddar/img@%s", sha256)},
      }
    );
  }

  @Test
  public void shouldEvaluateValidInputsAsReferences() {
    Reference seen = Reference.parse(input);
    assertThat(seen).describedAs("%s -> %s", input, expected).isEqualTo(expected);
  }

  @Test
  public void shouldEvaluateReferencesFamiliarName() {
    Reference seen = Reference.parse(input);
    assertThat(seen.getFamiliarName()).describedAs("%s -> %s", input, familiarName)
      .isEqualTo(familiarName);
  }

}
