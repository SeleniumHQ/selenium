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

package org.openqa.selenium.docker;

import java.util.Objects;
import java.util.function.Predicate;

public class ImageNamePredicate implements Predicate<Image> {

  private final String name;
  private final String tag;

  public ImageNamePredicate(String name, String tag) {
    this.name = Objects.requireNonNull(name);
    this.tag = Objects.requireNonNull(tag);
  }

  public ImageNamePredicate(String name) {
    Objects.requireNonNull(name);
    int index = name.indexOf(":");
    if (index == -1) {
      this.tag = "latest";
      this.name = name;
    } else {
      this.name = name.substring(0, index);
      this.tag = name.substring(index + 1);
    }

  }

  @Override
  public boolean test(Image image) {
    return image.getTags().contains(name + ":" + tag);
  }

  @Override
  public String toString() {
    return "by tag: " + name + ":" + tag;
  }
}
