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

package org.openqa.selenium.remote.server.log;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.JUnit4;

import java.util.logging.Formatter;
import java.util.logging.Level;
import java.util.logging.LogRecord;

/**
 * {@link org.openqa.selenium.remote.server.log.ShortTermMemoryHandler} unit test class.
 */
@RunWith(JUnit4.class)
public class ShortTermMemoryHandlerUnitTest {

  @Test
  public void testRecordsReturnsAnEmptyArrayWhenNoRecordHasBeenAdded() {
    final ShortTermMemoryHandler handler;

    handler = new ShortTermMemoryHandler(1, Level.FINEST, null);
    assertNotNull(handler.records());
    assertEquals(0, handler.records().length);
  }

  @Test
  public void testRecordsReturnsTheAddedRecordWhenASingleOneIsPublished() {
    final ShortTermMemoryHandler handler;
    final LogRecord theLogRecord;

    handler = new ShortTermMemoryHandler(1, Level.FINEST, null);
    theLogRecord = new LogRecord(Level.INFO, "");
    handler.publish(theLogRecord);
    assertNotNull(handler.records());
    assertEquals(1, handler.records().length);
    assertEquals(theLogRecord, handler.records()[0]);
  }

  @Test
  public void testRecordsIsEmptyWhenAddedRecordIsLowerThanTheMinimumLevel() {
    final ShortTermMemoryHandler handler;
    final LogRecord theLogRecord;

    handler = new ShortTermMemoryHandler(1, Level.INFO, null);
    theLogRecord = new LogRecord(Level.FINE, "");
    handler.publish(theLogRecord);
    assertNotNull(handler.records());
    assertEquals(0, handler.records().length);
  }

  @Test
  public void testRecordsIsEmptyWhenAddedRecordIsEqualToTheMinimumLevel() {
    final ShortTermMemoryHandler handler;
    final LogRecord theLogRecord;

    handler = new ShortTermMemoryHandler(1, Level.INFO, null);
    theLogRecord = new LogRecord(Level.INFO, "");
    handler.publish(theLogRecord);
    assertNotNull(handler.records());
    assertEquals(1, handler.records().length);
    assertEquals(theLogRecord, handler.records()[0]);
  }

  @Test
  public void testRecordsReturnsTheTwoAddedRecordWhenATwoRecordsArePublishedAndCapacityIsNotExceeded() {
    final ShortTermMemoryHandler handler;
    final LogRecord firstLogRecord;
    final LogRecord secondLogRecord;

    handler = new ShortTermMemoryHandler(2, Level.FINEST, null);
    firstLogRecord = new LogRecord(Level.INFO, "");
    secondLogRecord = new LogRecord(Level.INFO, "");
    handler.publish(firstLogRecord);
    handler.publish(secondLogRecord);
    assertNotNull(handler.records());
    assertEquals(2, handler.records().length);
    assertEquals(firstLogRecord, handler.records()[0]);
    assertEquals(secondLogRecord, handler.records()[1]);
  }

  @Test
  public void testRecordsOnlyReturnsTheLastRecordWhenATwoRecordsArePublishedAndCapacityIsExceeded() {
    final ShortTermMemoryHandler handler;
    final LogRecord firstLogRecord;
    final LogRecord secondLogRecord;

    handler = new ShortTermMemoryHandler(1, Level.FINEST, null);
    firstLogRecord = new LogRecord(Level.INFO, "");
    secondLogRecord = new LogRecord(Level.INFO, "");
    handler.publish(firstLogRecord);
    handler.publish(secondLogRecord);
    assertNotNull(handler.records());
    assertEquals(1, handler.records().length);
    assertEquals(secondLogRecord, handler.records()[0]);
  }

  @Test
  public void testRecordsOnlyReturnsTheLastTwoRecordsWhenThreeRecordsArePublishedAndCapacityIsExceeded() {
    final ShortTermMemoryHandler handler;
    final LogRecord firstLogRecord;
    final LogRecord secondLogRecord;
    final LogRecord thirdLogRecord;

    handler = new ShortTermMemoryHandler(2, Level.FINEST, null);
    firstLogRecord = new LogRecord(Level.INFO, "");
    secondLogRecord = new LogRecord(Level.INFO, "");
    thirdLogRecord = new LogRecord(Level.INFO, "");
    handler.publish(firstLogRecord);
    handler.publish(secondLogRecord);
    handler.publish(thirdLogRecord);
    assertNotNull(handler.records());
    assertEquals(2, handler.records().length);
    assertEquals(secondLogRecord, handler.records()[0]);
    assertEquals(thirdLogRecord, handler.records()[1]);
  }

  @Test
  public void testRecordsOnlyReturnsTheLastRecordWhenThreeRecordsArePublishedAndCapacityIsOne() {
    final ShortTermMemoryHandler handler;
    final LogRecord firstLogRecord;
    final LogRecord secondLogRecord;
    final LogRecord thirdLogRecord;

    handler = new ShortTermMemoryHandler(1, Level.FINEST, null);
    firstLogRecord = new LogRecord(Level.INFO, "");
    secondLogRecord = new LogRecord(Level.INFO, "");
    thirdLogRecord = new LogRecord(Level.INFO, "");
    handler.publish(firstLogRecord);
    handler.publish(secondLogRecord);
    handler.publish(thirdLogRecord);
    assertNotNull(handler.records());
    assertEquals(1, handler.records().length);
    assertEquals(thirdLogRecord, handler.records()[0]);
  }

  @Test
  public void testAfterCloseAllRecordsAreCleared() {
    final ShortTermMemoryHandler handler;
    final LogRecord firstLogRecord;
    final LogRecord secondLogRecord;

    handler = new ShortTermMemoryHandler(2, Level.FINEST, null);
    firstLogRecord = new LogRecord(Level.INFO, "");
    secondLogRecord = new LogRecord(Level.INFO, "");
    handler.publish(firstLogRecord);
    handler.publish(secondLogRecord);
    handler.close();
    assertNotNull(handler.records());
    assertEquals(0, handler.records().length);
  }

  @Test
  public void testFormattedRecordsReturnsAnEmptyStringWhenThereIsNoRecord() {
    final ShortTermMemoryHandler handler;

    handler = new ShortTermMemoryHandler(1, Level.INFO, null);
    assertEquals("", handler.formattedRecords());

  }

  @Test
  public void testFormattedRecords() {
    final ShortTermMemoryHandler handler;
    final LogRecord firstLogRecord;
    final LogRecord secondLogRecord;
    final Formatter formatter;

    formatter = new Formatter() {
      @Override
      public String format(LogRecord record) {
        return "[FORMATTED] " + record.getMessage();
      }
    };
    handler = new ShortTermMemoryHandler(2, Level.INFO, formatter);
    firstLogRecord = new LogRecord(Level.INFO, "First log message");
    secondLogRecord = new LogRecord(Level.INFO, "Second log message");
    handler.publish(firstLogRecord);
    handler.publish(secondLogRecord);
    assertEquals("[FORMATTED] First log message\n" +
        "[FORMATTED] Second log message\n", handler.formattedRecords());

  }

}
