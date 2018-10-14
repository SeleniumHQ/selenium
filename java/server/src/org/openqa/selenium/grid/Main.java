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

package org.openqa.selenium.grid;

import static java.util.Comparator.comparing;

import org.openqa.selenium.cli.CliCommand;
import org.openqa.selenium.cli.WrappedPrintWriter;

import java.io.PrintWriter;
import java.util.Comparator;
import java.util.ServiceLoader;
import java.util.Set;
import java.util.TreeSet;

public class Main {

  public static void main(String[] args) {
    Set<CliCommand> commands = new TreeSet<>(comparing(CliCommand::getName));
    ServiceLoader.load(CliCommand.class).forEach(commands::add);

    String commandName;
    String[] remainingArgs;

    switch (args.length) {
      case 0:
        commandName = "help";
        remainingArgs = new String[0];
        break;

      case 1:
        commandName = args[0];
        remainingArgs = new String[0];
        break;

      default:
        commandName = args[0];
        remainingArgs = new String[args.length - 1];
        System.arraycopy(args, 1, remainingArgs, 0, args.length - 1);
        break;
    }

    CliCommand command = commands.parallelStream()
        .filter(cmd -> commandName.equals(cmd.getName()))
        .findFirst()
        .orElse(new Help(commands));

    Runnable primed = command.configure(remainingArgs);
    primed.run();
  }

  private static class Help implements CliCommand {

    private final Set<CliCommand> commands;

    public Help(Set<CliCommand> commands) {
      this.commands = commands;
    }

    @Override
    public String getName() {
      return "Selenium Server commands";
    }

    @Override
    public String getDescription() {
      return "A list of all the commands available. To use one, run `java -jar selenium.jar " +
             "commandName`.";
    }

    @Override
    public Runnable configure(String... args) {
      return () -> {
        int longest = commands.stream()
            .map(CliCommand::getName)
            .max(Comparator.comparingInt(String::length))
            .map(String::length)
            .orElse(0) + 2;  // two space padding either side

        PrintWriter out = new WrappedPrintWriter(System.out, 72, 0);
        out.append(getName()).append("\n\n");
        out.append(getDescription()).append("\n").append("\n");

        int indent = Math.min(longest, 25);
        String format = "  %-" + longest + "s";

        PrintWriter indented = new WrappedPrintWriter(System.out, 72, indent);
        commands.forEach(cmd -> {
          indented.format(format, cmd.getName())
              .append(cmd.getDescription())
              .append("\n");
        });

        out.write("\nFor each command, run with `--help` for command-specific help\n");
        System.out.println("\n");
      };
    }
  }
}
