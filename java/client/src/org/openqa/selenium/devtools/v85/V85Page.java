package org.openqa.selenium.devtools.v85;

import com.google.common.collect.ImmutableMap;
import org.openqa.selenium.devtools.Command;
import org.openqa.selenium.devtools.ConverterFunctions;
import org.openqa.selenium.devtools.idealized.page.Page;
import org.openqa.selenium.devtools.v85.page.model.ScriptIdentifier;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.json.JsonInput;

import java.util.function.Function;

public class V85Page implements Page {

  @Override
  public Command<Void> enable() {
    return org.openqa.selenium.devtools.v85.page.Page.enable();
  }

  @Override
  public Command<org.openqa.selenium.devtools.idealized.page.model.ScriptIdentifier> addScriptToEvaluateOnNewDocument(String source) {
    Require.nonNull("Source", source);
    ImmutableMap.Builder<String, Object> params = ImmutableMap.builder();
    params.put("source", source);

    Function<JsonInput, ScriptIdentifier> mapper = ConverterFunctions.map("identifier", ScriptIdentifier.class);

    return new Command<>(
      "Page.addScriptToEvaluateOnNewDocument",
      ImmutableMap.of("source", source),
      input -> {
        ScriptIdentifier actualId = mapper.apply(input);
        return new org.openqa.selenium.devtools.idealized.page.model.ScriptIdentifier(actualId);
      });
  }
}
