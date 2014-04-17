package org.openqa.selenium.remote.html5;

import com.google.common.collect.ImmutableMap;
import com.google.common.collect.Iterables;
import com.google.common.collect.Lists;

import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.html5.DatabaseStorage;
import org.openqa.selenium.html5.ResultSet;
import org.openqa.selenium.html5.ResultSetRows;
import org.openqa.selenium.remote.DriverCommand;
import org.openqa.selenium.remote.ExecuteMethod;
import org.openqa.selenium.remote.internal.WebElementToJsonConverter;

import java.util.List;
import java.util.Map;

/**
 * Provides remote access to the {@link DatabaseStorage} API.
 */
public class RemoteDatabaseStorage implements DatabaseStorage {

  private final ExecuteMethod executeMethod;

  public RemoteDatabaseStorage(ExecuteMethod executeMethod) {
    this.executeMethod = executeMethod;
  }

  @Override
  public ResultSet executeSQL(String databaseName, String query, Object... args)
      throws WebDriverException {
    query = query.replaceAll("\"", "\\\"");
    Iterable<Object> convertedArgs = Iterables.transform(
        Lists.newArrayList(args), new WebElementToJsonConverter());

    Map<String, ?> params = ImmutableMap.of(
        "dbName", databaseName,
        "query", query,
        "args", Lists.newArrayList(convertedArgs));

    @SuppressWarnings("unchecked")
    Map<Object, Object> resultAsMap =
        (Map<Object, Object>) executeMethod.execute(DriverCommand.EXECUTE_SQL, params);
    @SuppressWarnings("unchecked")
    List<Map<String, Object>> rows = (List<Map<String, Object>>) resultAsMap.get("rows");
    return new ResultSet(
        ((Number) resultAsMap.get("insertId")).intValue(),
        ((Number) resultAsMap.get("rowsAffected")).intValue(),
        new ResultSetRows(rows));
  }
}
