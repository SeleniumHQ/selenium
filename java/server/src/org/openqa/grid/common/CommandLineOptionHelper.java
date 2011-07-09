package org.openqa.grid.common;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import org.openqa.grid.common.exception.GridConfigurationException;

public class CommandLineOptionHelper {

  private String[] args;

  @SuppressWarnings("unused")
  private CommandLineOptionHelper() {

  }

  public CommandLineOptionHelper(String[] args) {
    this.args = args;
  }

  public boolean isParamPresent(String name) {
    for (String arg : args) {
      if (name.equalsIgnoreCase(arg)) {
        return true;
      }
    }
    return false;
  }

  public String getParamValue(String name) {
    int index = -1;
    for (int i = 0; i < args.length; i++) {
      if (name.equals(args[i])) {
        index = i;
        break;
      }
    }
    if (index == -1) {
      throw new GridConfigurationException("The parameter " + name + " isn't specified.");
    }
    if (args.length == index) {
      throw new GridConfigurationException("The parameter " + name + " doesn't have a value specified.");
    }
    return args[index + 1];
  }

  public List<String> getParamValues(String name) {
    if (isParamPresent(name)) {
      String value = getParamValue(name);
      return Arrays.asList(value.split(","));
    } else {
      return new ArrayList<String>();
    }

  }

  /**
   * get all occurences of -name
   *
   * @param name
   * @return
   */
  public List<String> getAll(String name) {
    List<String> res = new ArrayList<String>();
    for (int i = 0; i < args.length; i++) {
      if (name.equals(args[i])) {
        res.add(args[i + 1]);
      }
    }
    return res;
  }

  public List<String> getKeys() {
    List<String> keys = new ArrayList<String>();
    for (String arg : args) {
      if (arg.startsWith("-")) {
        keys.add(arg);
      }
    }
    return keys;
  }

}
