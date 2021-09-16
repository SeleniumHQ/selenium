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

package org.openqa.selenium.firefox;

import com.google.auto.service.AutoService;
import com.google.common.collect.ImmutableMap;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.remote.AugmenterProvider;
import org.openqa.selenium.remote.ExecuteMethod;

import java.nio.file.Path;
import java.util.function.Predicate;

import static java.util.Collections.singletonMap;
import static org.openqa.selenium.remote.BrowserType.FIREFOX;

@AutoService(AugmenterProvider.class)
public class AddHasExtensions implements AugmenterProvider<HasExtensions> {
  @Override
  public Predicate<Capabilities> isApplicable() {
    return caps -> FIREFOX.equals(caps.getBrowserName());
  }

  @Override
  public Class<HasExtensions> getDescribedInterface() {
    return HasExtensions.class;
  }

  @Override
  public HasExtensions getImplementation(Capabilities capabilities, ExecuteMethod executeMethod) {
    return new HasExtensions() {
      @Override
      public String installExtension(Path path) {
        return (String) executeMethod.execute(FirefoxDriver.ExtraCommands.INSTALL_EXTENSION,
          ImmutableMap.of("path", path.toAbsolutePath().toString(),
            "temporary", false));

      }

      @Override
      public void uninstallExtension(String extensionId) {
        executeMethod.execute(FirefoxDriver.ExtraCommands.UNINSTALL_EXTENSION, singletonMap("id", extensionId));
      }
    };
  }
}
