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

package org.openqa.selenium.grid.commands;

import static java.util.stream.Collectors.joining;

import com.beust.jcommander.JCommander;
import com.beust.jcommander.ParameterException;
import com.beust.jcommander.Parameters;
import com.beust.jcommander.internal.DefaultConsole;
import com.google.auto.service.AutoService;
import java.io.PrintStream;
import java.util.AbstractMap;
import java.util.Collections;
import java.util.Comparator;
import java.util.Map;
import java.util.ServiceLoader;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;
import org.openqa.selenium.cli.CliCommand;
import org.openqa.selenium.grid.config.DescribedOption;
import org.openqa.selenium.grid.config.Role;
import org.openqa.selenium.grid.server.HelpFlags;

@AutoService(CliCommand.class)
public class CompletionCommand implements CliCommand {
  @Override
  public String getName() {
    return "completion";
  }

  @Override
  public String getDescription() {
    return "Generate shell autocompletions";
  }

  @Override
  public Set<Role> getConfigurableRoles() {
    return Collections.singleton(Role.of("completion"));
  }

  @Override
  public Set<Object> getFlagObjects() {
    return Collections.singleton(new HelpFlags());
  }

  @Override
  public Executable configure(PrintStream out, PrintStream err, String... args) {
    HelpFlags help = new HelpFlags();

    Zsh zsh = new Zsh();

    JCommander commander =
        JCommander.newBuilder().programName("selenium").addObject(help).addCommand(zsh).build();
    commander.setConsole(new DefaultConsole(out));

    return () -> {
      try {
        commander.parse(args);
      } catch (ParameterException e) {
        err.println(e.getMessage());
        commander.usage();
        return;
      }

      if (help.displayHelp(commander, out)) {
        return;
      }

      if (args.length == 0) {
        commander.parse();
      }

      if (commander.getParsedCommand() == null) {
        err.println("No shell given. Possible shells are: zsh");
        System.exit(1);
      }

      switch (commander.getParsedCommand()) {
        case "zsh":
          outputZshCompletions(out);
          break;

        default:
          err.println("Unrecognised shell: " + commander.getParsedCommand());
          System.exit(1);
          break;
      }
    };
  }

  private void outputZshCompletions(PrintStream out) {
    Map<CliCommand, Set<DescribedOption>> allCommands = listKnownCommands();

    // My kingdom for multiline strings
    out.println("#compdef _selenium selenium");
    out.println("typeset -A opt_args");
    out.println("_selenium() {");
    out.println("  local context state state_descr line");
    out.println("  _arguments -C \\");
    out.println("    '(- :)--ext[Amend the classpath for Grid]: :->arg' \\");
    out.println("    '(-): :->command' \\");
    out.println("    '(-)*:: :->arg' && return");
    out.println("  case $state in");
    out.println("    (command)");
    out.println("      local cmds");
    out.println("      cmds=(");

    allCommands.keySet().stream()
        .sorted(Comparator.comparing(CliCommand::getName))
        .forEach(
            cmd -> {
              out.println(
                  String.format(
                      "        '%s:%s'",
                      cmd.getName(), cmd.getDescription().replace("'", "'\\''")));
            });

    out.println("      )");
    out.println("      _describe 'commands' cmds");
    out.println("      ;;");
    out.println("    (arg)");
    out.println("      case ${words[1]} in");

    allCommands.keySet().stream()
        .sorted(Comparator.comparing(CliCommand::getName))
        .forEach(
            cmd -> {
              String shellName = cmd.getName().replace('-', '_');
              out.println(String.format("        (%s)", cmd.getName()));
              out.println(String.format("          _selenium_%s", shellName));
              out.println("          ;;");
            });

    out.println("      esac");
    out.println("      ;;");
    out.println("  esac");
    out.println("}\n\n");

    allCommands.forEach(
        (cmd, options) -> {
          out.println(String.format("_selenium_%s() {", cmd.getName().replace('-', '_')));
          out.println("  args=(");

          options.stream()
              .filter(opt -> !opt.flags().isEmpty())
              .sorted(Comparator.comparing(opt -> opt.flags().iterator().next()))
              .forEach(
                  opt -> {
                    String quotedDesc = opt.description().replace("'", "'\\''");
                    int index = quotedDesc.indexOf("\n");
                    if (index != -1) {
                      quotedDesc = quotedDesc.substring(0, index);
                    }

                    if (opt.flags().size() == 1) {
                      out.println(
                          String.format(
                              "    '%s[%s]%s'",
                              opt.flags().iterator().next(), quotedDesc, getZshType(opt)));
                    } else {
                      out.print("    '");
                      out.print(opt.flags.stream().collect(joining(" ", "(", ")")));
                      out.print("'");
                      out.print(opt.flags.stream().collect(joining(",", "{", "}")));
                      out.print("'");
                      out.print(String.format("[%s]", quotedDesc));
                      out.print(getZshType(opt));
                      out.print("'\n");
                    }
                  });

          out.println("  )");
          out.println("  _arguments $args && return");
          out.println("}\n\n");
        });
  }

  private String getZshType(DescribedOption option) {
    switch (option.type) {
      case "boolean":
        return ":(true false)";

      case "int":
      case "integer":
        return ":int";

      case "list of strings":
      case "string":
        return ": ";

      case "uri":
      case "url":
        return ":urls: ";

      case "path":
        return ":filename:_files";

      default:
        throw new IllegalStateException("Unknown type: " + option.type);
    }
  }

  private Map<CliCommand, Set<DescribedOption>> listKnownCommands() {
    return StreamSupport.stream(ServiceLoader.load(CliCommand.class).spliterator(), true)
        .map(
            command ->
                new AbstractMap.SimpleEntry<>(
                    command,
                    DescribedOption.findAllMatchingOptions(command.getConfigurableRoles())))
        .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue));
  }

  @Parameters(commandNames = "zsh", commandDescription = "Create autocompletions for zsh")
  private static class Zsh {}
}
