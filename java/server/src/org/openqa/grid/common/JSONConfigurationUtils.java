package org.openqa.grid.common;

import java.io.BufferedReader;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;

import org.json.JSONException;
import org.json.JSONObject;
import org.openqa.grid.common.exception.GridConfigurationException;

public class JSONConfigurationUtils {

  /**
   * load a json file from the resource or file system.
   *
   * @param resource
   * @return
   * @throws IOException
   * @throws JSONException
   */
  public static JSONObject loadJSON(String resource) {
    InputStream in = Thread.currentThread().getContextClassLoader().getResourceAsStream(resource);

    if (in == null) {
      try {
        in = new FileInputStream(resource);
      } catch (FileNotFoundException e) {
        // ignore
      }
    }
    if (in == null) {
      throw new RuntimeException(resource + " is not a valid resource.");
    }
    StringBuilder b = new StringBuilder();
    InputStreamReader inputreader = new InputStreamReader(in);
    BufferedReader buffreader = new BufferedReader(inputreader);
    String line;
    try {
      while ((line = buffreader.readLine()) != null) {
        b.append(line);
      }
    } catch (IOException e) {
      throw new GridConfigurationException("Cannot read file " + resource + " , " + e.getMessage(), e);
    }

    String json = b.toString();
    JSONObject o;
    try {
      o = new JSONObject(json);
    } catch (JSONException e) {
      throw new GridConfigurationException("Wrong format for the JSON input : " + e.getMessage(), e);
    }
    return o;
  }


}
