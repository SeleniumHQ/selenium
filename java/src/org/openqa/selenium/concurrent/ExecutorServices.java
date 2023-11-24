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

package org.openqa.selenium.concurrent;

import static java.util.concurrent.TimeUnit.SECONDS;
import static java.util.logging.Level.WARNING;

import java.util.concurrent.ExecutorService;
import java.util.logging.Logger;

public class ExecutorServices {

  private static final Logger LOG = Logger.getLogger(ExecutorServices.class.getName());

  public static void shutdownGracefully(String name, ExecutorService service) {
    service.shutdown();
    try {
      if (!service.awaitTermination(5, SECONDS)) {
        LOG.warning(String.format("Failed to shutdown %s", name));
        service.shutdownNow();
      }
    } catch (InterruptedException e) {
      Thread.currentThread().interrupt();
      LOG.log(WARNING, String.format("Failed to shutdown %s", name), e);
      service.shutdownNow();
    }
  }
}
