/*
Copyright 2011 Selenium committers
Copyright 2011 Software Freedom Conservancy

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

package org.openqa.grid.common;

import org.json.JSONException;
import org.json.JSONObject;
import org.openqa.grid.common.exception.GridConfigurationException;

import java.io.BufferedReader;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;

public class JSONConfigurationUtils {

  /**
   * load a JSON file from the resource or file system.
   * 
   * @param resource
   * @return A JSONObject representing the passed resource argument.
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
    } finally {
      try {
        buffreader.close();
        inputreader.close();
        in.close();
      } catch (IOException e) {
        e.printStackTrace();
      }
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
