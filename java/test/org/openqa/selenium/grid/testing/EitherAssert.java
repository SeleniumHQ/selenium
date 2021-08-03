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
      failWithMessage(
        "Expected Either to be left but it is right: %s", actual.right());
    }
    return this;
  }

  public EitherAssert<A, B> isRight() {
    isNotNull();
    if (actual.isLeft()) {
      failWithMessage(
        "Expected Either to be right but it is left: %s", actual.left());
    }
    return this;
  }
}