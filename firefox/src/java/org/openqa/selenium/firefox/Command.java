/*
Copyright 2007-2009 WebDriver committers
Copyright 2007-2009 Google Inc.

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

package org.openqa.selenium.firefox;

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
