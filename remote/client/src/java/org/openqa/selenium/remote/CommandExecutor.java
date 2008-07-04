package org.openqa.selenium.remote;

public interface CommandExecutor {

  Response execute(Command command) throws Exception;
}
