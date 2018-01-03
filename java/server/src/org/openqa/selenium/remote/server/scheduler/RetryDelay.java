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

package org.openqa.selenium.remote.server.scheduler;

import com.google.common.collect.ImmutableList;
import com.google.common.collect.Iterators;

import java.time.Duration;
import java.util.Iterator;

public interface RetryDelay extends Iterable<RetryDelay> {

  Duration getDelay();

  @Override
  default Iterator<RetryDelay> iterator() {
    return ImmutableList.of(this).iterator();
  }

  default RetryDelay orElse(RetryDelay nextDelay) {
    return new RetryDelay() {
      @Override
      public Duration getDelay() {
        return nextDelay.getDelay();
      }

      @Override
      public Iterator<RetryDelay> iterator() {
        return Iterators.concat(ImmutableList.of(this).iterator(), nextDelay.iterator());
      }
    };
  }
}
