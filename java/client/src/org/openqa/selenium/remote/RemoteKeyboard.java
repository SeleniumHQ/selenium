package org.openqa.selenium.remote;

import com.google.common.collect.ImmutableMap;
import org.openqa.selenium.Keyboard;
import org.openqa.selenium.Keys;

/**
 * User: eranm
 */
public class RemoteKeyboard implements Keyboard {
  protected final ExecuteMethod executor;

  public RemoteKeyboard(ExecuteMethod executor) {
    this.executor = executor;
  }

  public void sendKeys(CharSequence... keysToSend) {
    executor.execute(DriverCommand.SEND_KEYS_TO_ACTIVE_ELEMENT,
        ImmutableMap.of("value", keysToSend));
  }

  public void pressKey(Keys keyToPress) {
    // The wire protocol requires an array of keys.
    CharSequence[] sequence = {keyToPress};
    executor.execute(DriverCommand.SEND_KEYS_TO_ACTIVE_ELEMENT,
        ImmutableMap.of("value", sequence));
  }

  public void releaseKey(Keys keyToRelease) {
    // The wire protocol requires an array of keys.
    CharSequence[] sequence = {keyToRelease};
    executor.execute(DriverCommand.SEND_KEYS_TO_ACTIVE_ELEMENT,
        ImmutableMap.of("value", sequence));

  }

}
