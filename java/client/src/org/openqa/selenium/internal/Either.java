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

package org.openqa.selenium.internal;

public class Either<A, B> {
  private A left = null;
  private B right = null;

  private Either(A a, B b) {
    left = a;
    right = b;
  }

  public static <A, B> Either<A, B> left(A a) {
    return new Either<A, B>(a, null);
  }

  public A left() {
    return left;
  }

  public boolean isLeft() {
    return left != null;
  }

  public boolean isRight() {
    return right != null;
  }

  public B right() {
    return right;
  }

  public static <A, B> Either<A, B> right(B b) {
    return new Either<A, B>(null, b);
  }
}
