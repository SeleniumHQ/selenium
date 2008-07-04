package org.openqa.selenium.remote.server;

import org.json.JSONArray;

import java.util.List;

public interface JsonParametersAware {

  void setJsonParameters(List<Object> allParameters) throws Exception;
}
