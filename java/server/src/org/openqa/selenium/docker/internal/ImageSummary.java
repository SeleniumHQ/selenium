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

import com.google.common.collect.ImmutableSet;
import org.openqa.selenium.Beta;
import org.openqa.selenium.docker.ImageId;
import org.openqa.selenium.json.JsonInput;
import org.openqa.selenium.json.TypeToken;

import java.lang.reflect.Type;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Objects;
import java.util.Set;

@Beta
public class ImageSummary {

  public static final Type LIST_OF_STRING = new TypeToken<List<String>>() {}.getType();
  private final ImageId id;
  private final Set<String> repoTags;

  public ImageSummary(ImageId id, Collection<String> repoTags) {
    this.id = Objects.requireNonNull(id);
    this.repoTags = ImmutableSet.copyOf(Objects.requireNonNull(repoTags));
  }

  public ImageId getId() {
    return id;
  }

  public Set<String> getRepoTags() {
    return repoTags;
  }

  static ImageSummary fromJson(JsonInput input) {
    input.beginObject();

    ImageId id = null;
    List<String> repoTags = new ArrayList<>();

    while (input.hasNext()) {
      switch (input.nextName()) {
        case "Id":
          id = new ImageId(input.nextString());
          break;

        case "RepoTags":
          // This is a required field, but can be null. *sigh*
          List<String> tags = input.read(LIST_OF_STRING);
          if (tags != null) {
            repoTags = tags;
          }
          break;

        default:
          input.skipValue();
          break;
      }
    }

    input.endObject();

    return new ImageSummary(id, repoTags);
  }
}
