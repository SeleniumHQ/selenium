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

import com.beust.jcommander.JCommander;
import com.beust.jcommander.ParameterException;
import com.google.auto.service.AutoService;
import com.google.common.io.Resources;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.StringReader;
import java.nio.charset.StandardCharsets;
import org.openqa.selenium.cli.CliCommand;
import org.openqa.selenium.cli.WrappedPrintWriter;
import org.openqa.selenium.grid.server.HelpFlags;

import java.io.PrintWriter;
import java.util.Collections;


@AutoService(CliCommand.class)
public class InfoCommand implements CliCommand {

  public String getName() {
    return "info";
  }

  public String getDescription() {
    return "Prints information for commands and topics.";
  }

  public Executable configure(String... args) {
    HelpFlags help = new HelpFlags();
    InfoFlags topic = new InfoFlags();

    JCommander commander = JCommander.newBuilder()
      .programName("selenium")
      .addObject(help)
      .addObject(topic)
      .build();

    return () -> {
      try {
        commander.parse(args);
      } catch (ParameterException e) {
        System.err.println(e.getMessage());
        commander.usage();
        return;
      }

      if (help.displayHelp(commander, System.out)) {
        return;
      }

      String toDisplay;
      String title;
      switch (topic.topic) {
        case "security":
          title = "About Security";
          toDisplay = "security.txt";
          break;

        case "tracing":
          title = "About Tracing";
          toDisplay = "tracing.txt";
          break;

        case "help":
        case "info":
        default:
          title = "Info";
          toDisplay = "info.txt";
          break;
      }

      String path = getClass().getPackage().getName().replaceAll("\\.", "/") + "/" + toDisplay;
      String content = readContent(path);

      PrintWriter out = new WrappedPrintWriter(System.out, 72, 0);

      out.printf("\n%s\n%s\n\n", title, String.join("", Collections.nCopies(title.length(), "=")));
      out.print(content);
      out.println("\n\n");
    };
  }

  private String readContent(String path) throws IOException {
    String unformattedText = Resources.toString(Resources.getResource(path), StandardCharsets.UTF_8);
    StringBuilder formattedText = new StringBuilder();
    try (BufferedReader reader = new BufferedReader(new StringReader(unformattedText))) {
      boolean inCode = false;

      for (String line = reader.readLine(); line != null; line = reader.readLine()) {
        if (line.isEmpty()) {
          if (inCode) {
            formattedText.append("\n");
          } else {
            formattedText.append("\n\n");
          }
        } else if ("```".equals(line)) {
          inCode = !inCode;
        } else {
          formattedText.append(line);
          if (inCode || line.startsWith("* ")) {
            formattedText.append("\n");
          } else {
            formattedText.append(" ");
          }
        }
      }
    }

    return formattedText.toString();
  }
}
