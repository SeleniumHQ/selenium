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

package org.openqa.selenium.devtools.idealized.network.model;

import org.openqa.selenium.devtools.idealized.security.model.MixedContentType;

import java.util.Optional;

public interface Request {

  String getUrl();

  Optional<String> getUrlFragment();

  String getMethod();

  Headers getHeaders();

  Optional<String> getPostData();

  Optional<Boolean> getHasPostData();

  Optional<MixedContentType> getMixedContentType();

  ResourcePriority getInitialPriority();

  Request.ReferrerPolicy getReferrerPolicy();

  Optional<Boolean> getIsLinkPreload();

  enum ReferrerPolicy {
    UNSAFE_URL,
    NO_REFERRER_WHEN_DOWNGRADE,
    NO_REFERRER,
    ORIGIN,
    ORIGIN_WHEN_CROSS_ORIGIN,
    SAME_ORIGIN,
    STRICT_ORIGIN,
    STRICT_ORIGIN_WHEN_CROSS_ORIGIN;
  }
}
