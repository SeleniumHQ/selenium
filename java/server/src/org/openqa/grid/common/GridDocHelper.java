package org.openqa.grid.common;

import org.apache.commons.lang.WordUtils;

import java.io.IOException;
import java.io.InputStream;
import java.util.Properties;

public class GridDocHelper {
  private static Properties gridProperties = load("defaults/GridParameters.properties");

  public static void printHelp(String msg) {
    printHelpInConsole(gridProperties, msg, true);
  }

  public static void printHelp(String msg, boolean error) {
    printHelpInConsole(gridProperties, msg, error);
  }


  public static String getGridParam(String param) {
    return getParam(gridProperties, param);
  }


  private static String getParam(Properties p, String param) {
    if (param == null) {
      return "";
    }
    String s = (String) gridProperties.get(param);
    if (s == null) {
      return "No help specified for " + param;
    } else {
      return s;
    }
  }

  private static void printHelpInConsole(Properties p, String msg, boolean error) {
    if (msg != null) {
      if (error) {
        System.out.println("Error building the config :" + msg);
      } else {
        System.out.println(msg);
      }

    }

    System.out.println("Usage :");
    for (Object key : p.keySet()) {
      System.out.println("-" + key + ":\n\t"
          + WordUtils.wrap(getParam(p, key.toString()), 80, "\n\t", false));
    }
  }

  private static Properties load(String resource) {
    InputStream in = Thread.currentThread().getContextClassLoader().getResourceAsStream(resource);
    Properties p = new Properties();
    if (in != null) {
      try {
        p.load(in);
        return p;
      } catch (IOException e) {
        throw new RuntimeException("bug." + resource + " cannot be loaded.");
      }
    } else {
      throw new RuntimeException("bug." + resource + " cannot be loaded.");
    }
  }


}
