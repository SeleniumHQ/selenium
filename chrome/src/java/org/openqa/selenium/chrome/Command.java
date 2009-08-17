package org.openqa.selenium.chrome;

public class Command {
  private final String elementId;
  private final String commandName;
  private final Object[] parameters;

  public Command(String commandName, Object... parameters) {
      this(null, commandName, parameters);
  }

  public Command(String elementId, String commandName, Object... parameters) {
      this.elementId = elementId;
      this.commandName = commandName;
      this.parameters = parameters;
  }

  public String getElementId() {
      return elementId;
  }

  public String getCommandName() {
      return commandName;
  }

  public Object[] getParameters() {
      return parameters;
  }
}
