package com.googlecode.webdriver.firefox;

public class Command {
    private final Context context;
    private final String elementId;
    private final String commandName;
    private final Object[] parameters;

    public Command(Context context, String commandName, Object... parameters) {
        this(context, null, commandName, parameters);
    }

    public Command(Context context, String elementId, String commandName, Object... parameters) {
        this.context = context;
        this.elementId = elementId;
        this.commandName = commandName;
        this.parameters = parameters;
    }


    public Context getContext() {
        return context;
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
