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

package org.openqa.selenium;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatExceptionOfType;
import static org.assertj.core.api.Assertions.fail;
import static org.openqa.selenium.internal.Require.nonNull;

import org.junit.Test;
import org.junit.experimental.categories.Category;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.testing.UnitTests;

import java.io.File;
import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Duration;

@Category(UnitTests.class)
public class RequireTest {

  @Test
  public void shouldCheckBooleanPrecondition() {
    assertThatExceptionOfType(IllegalArgumentException.class)
        .isThrownBy(() -> Require.precondition(2 * 2 == 5, "this is %s!", "math"))
        .withMessage("this is math!");
    assertThatCode(() -> Require.precondition(2 * 2 == 4, "this is %s!", "math"))
        .doesNotThrowAnyException();
  }

  @Test
  public void shouldReturnObjectArgumentIfItIsNotNull() {
    String arg = "test";
    assertThat(Require.nonNull("x", arg)).isSameAs(arg);
    assertThat(nonNull("x", arg, "it cannot be null")).isSameAs(arg);
  }

  @Test
  public void canCheckArgumentForNull() {
    assertThatExceptionOfType(IllegalArgumentException.class)
        .isThrownBy(() -> Require.nonNull("x", null))
        .withMessage("x must be set");
    assertThatExceptionOfType(IllegalArgumentException.class)
        .isThrownBy(() -> nonNull("x", null, "cannot be %s", "null"))
        .withMessage("x cannot be null");
  }

  @Test
  public void shouldReturnObjectArgumentFromCheckerObjectIfItIsNotNull() {
    String arg = "test";
    assertThat(Require.argument("x", arg).nonNull()).isSameAs(arg);
    assertThat(Require.argument("x", arg).nonNull("it cannot be null")).isSameAs(arg);
  }

  @Test
  public void canCheckArgumentForNullUsingCheckerObject() {
    assertThatExceptionOfType(IllegalArgumentException.class)
        .isThrownBy(() -> Require.argument("x", (Object) null).nonNull())
        .withMessage("x must be set");
    assertThatExceptionOfType(IllegalArgumentException.class)
        .isThrownBy(() -> Require.argument("x", (Object) null).nonNull("%s cannot be null", "it"))
        .withMessage("it cannot be null");
  }

  @Test
  public void canCheckArgumentEquality() {
    Object arg1 = null;
    assertThatExceptionOfType(IllegalArgumentException.class)
        .isThrownBy(() -> Require.argument("This", arg1).equalTo("that"))
        .withMessage("This must be set");
    Object arg2 = "that";
    assertThatExceptionOfType(IllegalArgumentException.class)
        .isThrownBy(() -> Require.argument("This", arg2).equalTo("this"))
        .withMessage("This must be equal to `this`");
    assertThat(Require.argument("That", arg2).equalTo("that")).isSameAs(arg2);
  }

  @Test
  public void canCheckArgumentClass() {
    Object arg1 = null;
    assertThatExceptionOfType(IllegalArgumentException.class)
        .isThrownBy(() -> Require.argument("This", arg1).instanceOf(Number.class))
        .withMessage("This must be set");
    Object arg2 = "that";
    assertThatExceptionOfType(IllegalArgumentException.class)
        .isThrownBy(() -> Require.argument("This", arg2).instanceOf(Number.class))
        .withMessage("This must be an instance of class java.lang.Number");
    assertThat(Require.argument("That", arg2).instanceOf(String.class)).isSameAs(arg2);
  }

  @Test
  public void canCheckDurationArgument() {
    assertThatExceptionOfType(IllegalArgumentException.class)
        .isThrownBy(() -> Require.nonNegative((Duration) null))
        .withMessage("Duration must be set");
    assertThatExceptionOfType(IllegalArgumentException.class)
        .isThrownBy(() -> Require.nonNegative("Timeout", (Duration) null))
        .withMessage("Timeout must be set");
    assertThatExceptionOfType(IllegalArgumentException.class)
        .isThrownBy(() -> Require.nonNegative(Duration.ofSeconds(-5)))
        .withMessage("Duration must be set to 0 or more");
    assertThatExceptionOfType(IllegalArgumentException.class)
        .isThrownBy(() -> Require.nonNegative("Timeout", Duration.ofSeconds(-5)))
        .withMessage("Timeout must be set to 0 or more");
    assertThat(Require.nonNegative(Duration.ofSeconds(0))).isEqualTo(Duration.ofSeconds(0));
    assertThat(Require.nonNegative("Timeout", Duration.ofSeconds(0))).isEqualTo(Duration.ofSeconds(0));
    assertThat(Require.nonNegative(Duration.ofSeconds(5))).isEqualTo(Duration.ofSeconds(5));
    assertThat(Require.nonNegative("Timeout", Duration.ofSeconds(5))).isEqualTo(Duration.ofSeconds(5));
  }

  @Test
  public void canCheckIntegerArgument() {
    assertThatExceptionOfType(IllegalArgumentException.class)
        .isThrownBy(() -> Require.nonNegative("Timeout", (Integer) null))
        .withMessage("Timeout must be set");
    assertThatExceptionOfType(IllegalArgumentException.class)
        .isThrownBy(() -> Require.nonNegative("Timeout", -5))
        .withMessage("Timeout cannot be less than 0");
    assertThat(Require.nonNegative("Timeout", 0)).isEqualTo(0);
    assertThat(Require.nonNegative("Timeout", 5)).isEqualTo(5);

    assertThatExceptionOfType(IllegalArgumentException.class)
        .isThrownBy(() -> Require.positive("Timeout", (Integer) null))
        .withMessage("Timeout must be set");
    assertThatExceptionOfType(IllegalArgumentException.class)
        .isThrownBy(() -> Require.positive("Timeout", -5))
        .withMessage("Timeout must be greater than 0");
    assertThatExceptionOfType(IllegalArgumentException.class)
        .isThrownBy(() -> Require.positive("Timeout", 0))
        .withMessage("Timeout must be greater than 0");
    assertThat(Require.positive("Timeout", 5)).isEqualTo(5);
  }

  @Test
  public void canCheckIntegersWithMessages() {
    assertThatExceptionOfType(IllegalArgumentException.class)
        .isThrownBy(() -> Require.positive("Timeout", 0, "Message should only be this"))
        .withMessage("Message should only be this");
  }

  @Test
  public void canCheckIntegerArgumentWithCheckerObject() {
    assertThatExceptionOfType(IllegalArgumentException.class)
        .isThrownBy(() -> Require.argument("Timeout", (Integer) null).greaterThan(5, "It should be longer"))
        .withMessage("Timeout must be set");
    assertThatExceptionOfType(IllegalArgumentException.class)
        .isThrownBy(() -> Require.argument("Timeout", 3).greaterThan(5, "It should be longer"))
        .withMessage("It should be longer");
    assertThat(Require.argument("Timeout", 10).greaterThan(5, "It should be longer")).isEqualTo(10);
  }

  @Test
  public void canCheckFileArgument() throws IOException {
    assertThatExceptionOfType(IllegalArgumentException.class)
        .isThrownBy(() -> Require.argument("Target", (File) null).isFile())
        .withMessage("Target must be set");
    File tempFile = File.createTempFile("example", "tmp");
    tempFile.deleteOnExit();
    assertThat(Require.argument("Target", tempFile).isFile()).isSameAs(tempFile);
    File dir = tempFile.getParentFile();
    assertThatExceptionOfType(IllegalArgumentException.class)
        .isThrownBy(() -> Require.argument("Target", dir).isFile())
        .withMessage("Target must be a regular file: %s", dir);
    if (!tempFile.delete()) {
      fail("Unable to delete temp file");
    }
    assertThatExceptionOfType(IllegalArgumentException.class)
        .isThrownBy(() -> Require.argument("Target", tempFile).isFile())
        .withMessage("Target must exist: %s", tempFile);
  }

  @Test
  public void canCheckDirectoryArgument() throws IOException {
    assertThatExceptionOfType(IllegalArgumentException.class)
        .isThrownBy(() -> Require.argument("Target", (File) null).isDirectory())
        .withMessage("Target must be set");
    File tempFile = File.createTempFile("example", "tmp");
    tempFile.deleteOnExit();
    assertThatExceptionOfType(IllegalArgumentException.class)
        .isThrownBy(() -> Require.argument("Target", tempFile).isDirectory())
        .withMessage("Target must be a directory: %s", tempFile);
    File dir = tempFile.getParentFile();
    assertThat(Require.argument("Target", dir).isDirectory()).isSameAs(dir);
    if (!tempFile.delete()) {
      fail("Unable to delete temp file");
    }
    assertThatExceptionOfType(IllegalArgumentException.class)
        .isThrownBy(() -> Require.argument("Target", tempFile).isDirectory())
        .withMessage("Target must exist: %s", tempFile);
  }

  @Test
  public void shouldCheckBooleanState() {
    assertThatExceptionOfType(IllegalStateException.class)
        .isThrownBy(() -> Require.stateCondition(2 * 2 == 5, "this is %s!", "math"))
        .withMessage("this is math!");
    assertThatCode(() -> Require.stateCondition(2 * 2 == 4, "this is %s!", "math"))
        .doesNotThrowAnyException();
  }

  @Test
  public void canCheckStateForNull() {
    assertThatExceptionOfType(IllegalStateException.class)
        .isThrownBy(() -> Require.state("x", (Object) null).nonNull())
        .withMessage("x must not be null");
    assertThatExceptionOfType(IllegalStateException.class)
        .isThrownBy(() -> Require.state("x", (Object) null).nonNull("must not be %s", "null"))
        .withMessage("x must not be null");
    String arg = "this";
    assertThat(Require.state("x", arg).nonNull()).isSameAs(arg);
    assertThat(Require.state("x", arg).nonNull("test")).isSameAs(arg);
  }

  @Test
  public void canCheckStateClass() {
    Object arg1 = null;
    assertThatExceptionOfType(IllegalStateException.class)
        .isThrownBy(() -> Require.state("This", arg1).instanceOf(Number.class))
        .withMessage("This must be set");
    Object arg2 = "that";
    assertThatExceptionOfType(IllegalStateException.class)
        .isThrownBy(() -> Require.state("This", arg2).instanceOf(Number.class))
        .withMessage("This must be an instance of class java.lang.Number");
    assertThat(Require.state("That", arg2).instanceOf(String.class)).isSameAs(arg2);
  }

  @Test
  public void canCheckFileState() throws IOException {
    assertThatExceptionOfType(IllegalStateException.class)
        .isThrownBy(() -> Require.state("Target", (File) null).isFile())
        .withMessage("Target must be set");
    File tempFile = File.createTempFile("example", "tmp");
    tempFile.deleteOnExit();
    assertThat(Require.state("Target", tempFile).isFile()).isSameAs(tempFile);
    File dir = tempFile.getParentFile();
    assertThatExceptionOfType(IllegalStateException.class)
        .isThrownBy(() -> Require.state("Target", dir).isFile())
        .withMessage("Target must be a regular file: %s", dir);
    if (!tempFile.delete()) {
      fail("Unable to delete temp file");
    }
    assertThatExceptionOfType(IllegalStateException.class)
        .isThrownBy(() -> Require.state("Target", tempFile).isFile())
        .withMessage("Target must exist: %s", tempFile);
  }

  @Test
  public void canCheckDirectoryState() throws IOException {
    assertThatExceptionOfType(IllegalStateException.class)
        .isThrownBy(() -> Require.state("Target", (File) null).isDirectory())
        .withMessage("Target must be set");
    File tempFile = File.createTempFile("example", "tmp");
    tempFile.deleteOnExit();
    assertThatExceptionOfType(IllegalStateException.class)
        .isThrownBy(() -> Require.state("Target", tempFile).isDirectory())
        .withMessage("Target must be a directory: %s", tempFile);
    File dir = tempFile.getParentFile();
    assertThat(Require.state("Target", dir).isDirectory()).isSameAs(dir);
    if (!tempFile.delete()) {
      fail("Unable to delete temp file");
    }
    assertThatExceptionOfType(IllegalStateException.class)
        .isThrownBy(() -> Require.state("Target", tempFile).isDirectory())
        .withMessage("Target must exist: %s", tempFile);
  }

  @Test
  public void canCheckFilePathState() throws IOException {
    assertThatExceptionOfType(IllegalStateException.class)
        .isThrownBy(() -> Require.state("Target", (Path) null).isFile())
        .withMessage("Target must be set");
    File tempFile = File.createTempFile("example", "tmp");
    tempFile.deleteOnExit();
    Path tempFilePath = Paths.get(tempFile.toURI());
    assertThat(Require.state("Target", tempFilePath).isFile()).isSameAs(tempFilePath);
    Path dirPath = tempFilePath.getParent();
    assertThatExceptionOfType(IllegalStateException.class)
        .isThrownBy(() -> Require.state("Target", dirPath).isFile())
        .withMessage("Target must be a regular file: %s", dirPath);
    if (!tempFile.delete()) {
      fail("Unable to delete temp file");
    }
    assertThatExceptionOfType(IllegalStateException.class)
        .isThrownBy(() -> Require.state("Target", tempFilePath).isFile())
        .withMessage("Target must exist: %s", tempFilePath);
  }

  @Test
  public void canCheckDirectoryPathState() throws IOException {
    assertThatExceptionOfType(IllegalStateException.class)
        .isThrownBy(() -> Require.state("Target", (Path) null).isDirectory())
        .withMessage("Target must be set");
    File tempFile = File.createTempFile("example", "tmp");
    Path tempFilePath = Paths.get(tempFile.toURI());
    tempFile.deleteOnExit();
    assertThatExceptionOfType(IllegalStateException.class)
        .isThrownBy(() -> Require.state("Target", tempFilePath).isDirectory())
        .withMessage("Target must be a directory: %s", tempFilePath);
    Path dirPath = tempFilePath.getParent();
    assertThat(Require.state("Target", dirPath).isDirectory()).isSameAs(dirPath);
    if (!tempFile.delete()) {
      fail("Unable to delete temp file");
    }
    assertThatExceptionOfType(IllegalStateException.class)
        .isThrownBy(() -> Require.state("Target", tempFilePath).isDirectory())
        .withMessage("Target must exist: %s", tempFilePath);
  }

}
