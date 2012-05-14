/*
Copyright 2012 Selenium committers
Copyright 2012 Software Freedom Conservancy

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


package org.openqa.selenium.javascript;

import static com.google.common.base.Preconditions.checkState;

import com.google.common.base.Throwables;

import org.json.JSONException;
import org.json.JSONObject;

public class TestEvent {

  private final JSONObject data;

  public TestEvent(JSONObject data) {
    this.data = data;
  }

  public String getId() {
    return get("id", String.class);
  }

  public String getType() {
    return get("type", String.class);
  }

  public JSONObject getData() {
    return get("data", JSONObject.class);
  }

  private <T> T get(String field, Class<T> type) {
    checkState(data.has(field), "Invalid TestEvent; no '%s' field", field);
    try {
      Object value = data.get(field);
      if (type.isInstance(value)) {
        return type.cast(value);
      }
      throw new IllegalStateException(
          String.format("Invalid %s; '%s' field is a %s, not a %s",
              getClass().getName(), field, type.getName(),
              value.getClass().getName()));
    } catch (JSONException e) {
      throw Throwables.propagate(e);
    }
  }
}
