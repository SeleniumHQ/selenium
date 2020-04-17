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

import com.beust.jcommander.JCommander;
import com.beust.jcommander.ParameterException;
import com.beust.jcommander.internal.DefaultConsole;

import org.openqa.selenium.cli.CliCommand;
import org.openqa.selenium.grid.config.AnnotatedConfig;
import org.openqa.selenium.grid.config.CompoundConfig;
import org.openqa.selenium.grid.config.ConcatenatingConfig;
import org.openqa.selenium.grid.config.Config;
import org.openqa.selenium.grid.config.ConfigFlags;
import org.openqa.selenium.grid.config.EnvConfig;
import org.openqa.selenium.grid.log.LoggingOptions;
import org.openqa.selenium.grid.server.HelpFlags;

import java.io.PrintStream;
import java.util.LinkedHashSet;
import java.util.Set;

public abstract class TemplateGridCommand implements CliCommand {

  @Override
  public final Executable configure(PrintStream out, PrintStream err, String... args) {
    Set<Object> allFlags = getFlagObjects();

    HelpFlags helpFlags = new HelpFlags();
    ConfigFlags configFlags = new ConfigFlags();

    JCommander.Builder builder = JCommander.newBuilder()
      .programName(getName())
      .addObject(configFlags)
      .addObject(helpFlags);
    allFlags.forEach(builder::addObject);
    JCommander commander = builder.build();
    commander.setConsole(new DefaultConsole(out));

    return () -> {
      try {
        commander.parse(args);
      } catch (ParameterException e) {
        err.println(e.getMessage());
        commander.usage();
        return;
      }

      if (helpFlags.displayHelp(commander, out)) {
        return;
      }

      Set<Config> allConfigs = new LinkedHashSet<>();
      allConfigs.add(new EnvConfig());
      allConfigs.add(new ConcatenatingConfig(getSystemPropertiesConfigPrefix(), '.', System.getProperties()));
      allFlags.forEach(flags -> allConfigs.add(new AnnotatedConfig(flags)));
      allConfigs.add(configFlags.readConfigFiles());
      allConfigs.add(getDefaultConfig());

      Config config = new CompoundConfig(allConfigs.toArray(new Config[0]));

      if (helpFlags.dumpConfig(config, out)) {
        return;
      }

      LoggingOptions loggingOptions = new LoggingOptions(config);
      loggingOptions.configureLogging();

      execute(config);
    };
  }

  protected abstract Set<Object> getFlagObjects();

  protected abstract String getSystemPropertiesConfigPrefix();

  protected abstract Config getDefaultConfig();

  protected abstract void execute(Config config);
}
