package org.openqa.selenium.javascript;

import static com.google.common.base.Preconditions.checkState;

import com.google.common.base.Throwables;
import org.json.JSONException;
import org.json.JSONObject;

public class ResultSet {

  private final JSONObject data;

  public ResultSet(JSONObject data) {
    this.data = data;
  }

  public boolean isSuccess() {
    return get("isSuccess", Boolean.class);
  }

  public String getReport() {
    return get("report", String.class);
  }

  private <T> T get(String field, Class<T> type) {
    checkState(data.has(field), "Invalid ResultSet; no '%s' field", field);
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
