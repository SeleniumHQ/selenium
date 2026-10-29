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

package org.openqa.selenium.bidi.protocol.session;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.ArrayList;
import java.util.List;
import java.util.logging.Handler;
import java.util.logging.Level;
import java.util.logging.LogRecord;
import java.util.logging.Logger;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.json.Json;

@Tag("UnitTests")
class UserPromptHandlerTest {

  @Test
  void wireKeyDefaultDeserializesIntoTheEscapedDefault_Field() {
    // "default" is a Java reserved word, so the generator escapes the Java identifier to
    // "default_" while keeping the wire key "default" — this must still round-trip correctly.
    Json json = new Json();
    UserPromptHandler handler =
        json.toType("{\"default\":\"accept\",\"alert\":\"dismiss\"}", UserPromptHandler.class);

    assertThat(handler.getDefault_()).isPresent();
    assertThat(handler.getDefault_().get()).isEqualTo(UserPromptHandlerType.ACCEPT);
    assertThat(handler.getAlert()).isPresent();
    assertThat(handler.getAlert().get()).isEqualTo(UserPromptHandlerType.DISMISS);
  }

  @Test
  void unknownWireKeyIsWarnedAboutNotSilentlyDropped() {
    // UserPromptHandler has a reserved-word field ("default"), which forces the generator to
    // emit a custom fromJson (see BiDiGenerator's appendFromJson) that bypasses
    // ConstructorCoercer entirely — and with it, the @WarnOnUnknownFields check every other
    // receivable, non-extensible generated type gets for free. This proves the generated
    // fromJson calls UnknownFieldsWarning itself instead of silently dropping the extra key.
    List<LogRecord> records =
        captureLogRecords(
            () ->
                new Json()
                    .toType(
                        "{\"alert\":\"dismiss\",\"mystery\":\"field\"}", UserPromptHandler.class));

    assertThat(records).hasSize(1);
    assertThat(records.get(0).getMessage())
        .contains("dropped 1 undeclared field")
        .contains("mystery");
  }

  private static List<LogRecord> captureLogRecords(Runnable action) {
    // UnknownFieldsWarning logs under ConstructorCoercer's own (package-private, so named by
    // string here) category, not its own — see UnknownFieldsWarning's class javadoc.
    Logger logger = Logger.getLogger("org.openqa.selenium.json.ConstructorCoercer");
    List<LogRecord> records = new ArrayList<>();
    Handler handler =
        new Handler() {
          @Override
          public void publish(LogRecord record) {
            records.add(record);
          }

          @Override
          public void flush() {}

          @Override
          public void close() {}
        };
    handler.setLevel(Level.ALL);

    // UnknownFieldsWarning gates on LOG.isLoggable(Level.WARNING) — ambient JVM/global logging
    // config (an unrelated test, a different logging.properties) must not be able to suppress
    // that gate out from under this test, so the level is pinned for the duration and restored
    // afterward rather than left to whatever happened to be configured.
    Level previousLevel = logger.getLevel();
    boolean previousUseParentHandlers = logger.getUseParentHandlers();
    logger.setLevel(Level.ALL);
    logger.setUseParentHandlers(false);
    logger.addHandler(handler);
    try {
      action.run();
    } finally {
      logger.removeHandler(handler);
      logger.setUseParentHandlers(previousUseParentHandlers);
      logger.setLevel(previousLevel);
    }
    return records;
  }
}
