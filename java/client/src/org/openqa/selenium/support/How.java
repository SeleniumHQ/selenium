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

package org.openqa.selenium.support;

import org.openqa.selenium.By;

public enum How {
  CLASS_NAME {
    @Override
    public By buildBy(String value) {
      return By.className(value);
    }
  },
  CSS {
    @Override
    public By buildBy(String value) {
      return By.cssSelector(value);
    }
  },
  ID {
    @Override
    public By buildBy(String value) {
      return By.id(value);
    }
  },
  ID_OR_NAME {
    @Override
    public By buildBy(String value) {
      return new ByIdOrName(value);
    }
  },
  LINK_TEXT {
    @Override
    public By buildBy(String value) {
      return By.linkText(value);
    }
  },
  NAME {
    @Override
    public By buildBy(String value) {
      return By.name(value);
    }
  },
  PARTIAL_LINK_TEXT {
    @Override
    public By buildBy(String value) {
      return By.partialLinkText(value);
    }
  },
  TAG_NAME {
    @Override
    public By buildBy(String value) {
      return By.tagName(value);
    }
  },
  XPATH {
    @Override
    public By buildBy(String value) {
      return By.xpath(value);
    }
  },
  UNSET {
    @Override
    public By buildBy(String value) {
      return ID.buildBy(value);
    }
  };

  public abstract By buildBy(String value);
}
