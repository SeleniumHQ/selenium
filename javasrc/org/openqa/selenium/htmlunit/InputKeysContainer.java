package org.openqa.selenium.htmlunit;

import static org.openqa.selenium.Keys.ENTER;
import static org.openqa.selenium.Keys.RETURN;

/**
 * Converts a group of character sequences to a string to be sent by sendKeys.
 *
 */
public class InputKeysContainer {
  private final StringBuilder builder = new StringBuilder();
  private final boolean submitKeyFound;
  private boolean capitalize = false;

  public InputKeysContainer(CharSequence... sequences) {
    this(false, sequences);
  }

  public InputKeysContainer(boolean trimPastEnterKey, CharSequence... sequences) {
    for (CharSequence seq : sequences) {
      builder.append(seq);
    }

    int indexOfSubmitKey = indexOfSubmitKey();
    submitKeyFound = (indexOfSubmitKey != -1);

    // If inputting keys to an input element, and the string contains one of
    // ENTER or RETURN, break the string at that point and submit the form    
    if (trimPastEnterKey && (indexOfSubmitKey != -1)) {
      builder.delete(indexOfSubmitKey, builder.length());
    }
  }

  private int indexOfSubmitKey() {
    CharSequence[] terminators = { "\n", ENTER, RETURN };
    for (CharSequence terminator : terminators) {
      String needle = String.valueOf(terminator);
      int index = builder.indexOf(needle);
      if (index != -1) {
        return index;
      }
    }

    return -1;
  }


  @Override
  public String toString() {
    String toReturn = builder.toString();
    if (capitalize) {
      return toReturn.toUpperCase();
    }
    return toReturn;
  }

  public boolean wasSubmitKeyFound() {
    return submitKeyFound;
  }

  public void setCapitalization(boolean capitalize) {
    this.capitalize = capitalize;
  }
}
