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

package org.openqa.selenium.server.browserlaunchers;

import static org.junit.Assert.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.thoughtworks.selenium.CommandProcessor;
import com.thoughtworks.selenium.SeleniumException;

import org.junit.Test;

public class ProcessorCommandsTest {

  @Test(expected = SeleniumException.class)
  public void shouldThrowASeleniumExceptionIfTheMethodDoesNotExistOnSelenium() {
    ProcessorCommands commands = new ProcessorCommands();

    commands.execute(null, "iLikeEatingCheese", new String[0]);
  }

  @Test
  public void shouldExecuteValidVoidMethod() {
    ProcessorCommands commands = new ProcessorCommands();

    final CommandProcessor processor = mock(CommandProcessor.class);
    final String[] args = new String[] { "foo", "bar" };

    commands.execute(processor, "showContextualBanner", args);
    verify(processor).doCommand("showContextualBanner", args);
  }

  @Test
  public void shouldExecuteValidStringMethod() {
    ProcessorCommands commands = new ProcessorCommands();

    final CommandProcessor processor = mock(CommandProcessor.class);

    when(processor.getString("getBodyText", new String[0])).thenReturn("cheese");

    String result = commands.execute(processor, "getBodyText", new String[0]);

    assertEquals("cheese", result);
  }

  @Test
  public void shouldExecuteValidStringArrayMethod() {
    ProcessorCommands commands = new ProcessorCommands();

    final CommandProcessor processor = mock(CommandProcessor.class);
    final String[] args = {"cheese"};

    when(processor.getStringArray("getSelectedLabels", args))
        .thenReturn(new String[]{"cheddar", "brie", "gouda"});

    String result = commands.execute(processor, "getSelectedLabels", args);

    assertEquals("cheddar,brie,gouda", result);
  }

  @Test
  public void shouldExecuteValidBooleanMethod() {
    ProcessorCommands commands = new ProcessorCommands();

    final CommandProcessor processor = mock(CommandProcessor.class);
    final String[] args = {"cheese"};

    when(processor.getBoolean("isTextPresent", args)).thenReturn(true);

    String result = commands.execute(processor, "isTextPresent", args);

    assertEquals("true", result);
  }

  @Test
  public void shouldExecuteValidNumberMethod() {
    ProcessorCommands commands = new ProcessorCommands();

    final CommandProcessor processor = mock(CommandProcessor.class);
    final String[] args = {"cheese"};

    when(processor.getNumber("getCssCount", args)).thenReturn(42);

    String result = commands.execute(processor, "getCssCount", args);

    assertEquals("42", result);
  }
}
