/*
Copyright 2012 Selenium committers
Copyright 2012 Software Freedom Conservancy

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

package org.openqa.selenium.server.browserlaunchers;

import com.google.common.base.Joiner;
import com.google.common.collect.Maps;

import com.thoughtworks.selenium.CommandProcessor;
import com.thoughtworks.selenium.Selenium;
import com.thoughtworks.selenium.SeleniumException;

import java.lang.reflect.Method;
import java.util.Map;

class ProcessorCommands {

  Map<String, Class<?>> commandsToResultTypes = Maps.newHashMap();
  Map<Class<?>, ProcessorFragment> commandHandlers = Maps.newHashMap();

  public ProcessorCommands() {
    for (Method method : Selenium.class.getMethods()) {
      commandsToResultTypes.put(method.getName(), method.getReturnType());
    }

    commandHandlers.put(boolean.class, new ProcessorFragment() {
      public String execute(CommandProcessor processor, String commandName, String[] args) {
        boolean value = processor.getBoolean(commandName, args);
        return String.valueOf(value);
      }
    });

    commandHandlers.put(Number.class, new ProcessorFragment() {
      public String execute(CommandProcessor processor, String commandName, String[] args) {
        Number value = processor.getNumber(commandName, args);
        return String.valueOf(value);
      }
    });

    commandHandlers.put(String.class, new ProcessorFragment() {
      public String execute(CommandProcessor processor, String commandName, String[] args) {
        return processor.getString(commandName, args);
      }
    });

    commandHandlers.put(String[].class, new ProcessorFragment() {
      public String execute(CommandProcessor processor, String commandName, String[] args) {
        String[] value = processor.getStringArray(commandName, args);
        return Joiner.on(",").join(value);
      }
    });

    commandHandlers.put(void.class, new ProcessorFragment() {
      public String execute(CommandProcessor processor, String commandName, String[] args) {
        processor.doCommand(commandName, args);
        return null;
      }
    });

  }

  public String execute(CommandProcessor processor, String command, String[] args) {
    Class<?> returnType = commandsToResultTypes.get(command);

    if (returnType == null) {
      throw new SeleniumException(
          "Method is not present on Selenium interface: " + command);
    }

    ProcessorFragment fragment = commandHandlers.get(returnType);

    return fragment.execute(processor, command, args);
  }
}
