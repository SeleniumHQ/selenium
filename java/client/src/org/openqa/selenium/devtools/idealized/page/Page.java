package org.openqa.selenium.devtools.idealized.page;

import org.openqa.selenium.devtools.Command;
import org.openqa.selenium.devtools.idealized.page.model.ScriptIdentifier;

public interface Page {

  Command<Void> enable();

  Command<ScriptIdentifier> addScriptToEvaluateOnNewDocument(String source);

}
