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

package org.openqa.selenium.grid.testing;

import org.assertj.core.api.AbstractAssert;
import org.openqa.selenium.internal.Either;

public class EitherAssert<A, B> extends AbstractAssert<EitherAssert<A, B>, Either<A, B>> {
  public EitherAssert(Either<A, B> actual) {
    super(actual, EitherAssert.class);
  }

  public EitherAssert<A, B> isLeft() {
    isNotNull();
    if (actual.isRight()) {
      failWithMessage("Expected Either to be left but it is right: %s", actual.right());
    }
    return this;
  }

  public EitherAssert<A, B> isRight() {
    isNotNull();
    if (actual.isLeft()) {
      failWithMessage("Expected Either to be right but it is left: %s", actual.left());
    }
    return this;
  }
}
