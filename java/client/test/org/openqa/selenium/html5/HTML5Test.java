package org.openqa.selenium.html5;

import org.openqa.selenium.AbstractDriverTestCase;
import org.openqa.selenium.WaitingConditions;

import java.util.List;
import java.util.Map;
import java.util.Set;

import static java.util.concurrent.TimeUnit.MILLISECONDS;
import static org.openqa.selenium.TestWaiter.waitFor;

public class HTML5Test extends AbstractDriverTestCase {
  private static final String INSERT_STATEMENT =
      "INSERT INTO docs(docname) VALUES (?)";
  private static final String SELECT_STATEMENT = "SELECT * FROM docs";
  private static final String DELETE_STATEMENT = "DELETE FROM docs";

  // Browser Connection
  public void testShouldSetBrowserOffline() {
    if (!(driver instanceof BrowserConnection)) {
      return;
    }
    driver.get(pages.html5Page);
    assertTrue("Browser is offline.", ((BrowserConnection) driver).isOnline());
    ((BrowserConnection) driver).setOnline(false);
    assertFalse("Failed to set browser offline.",
        ((BrowserConnection) driver).isOnline());
    ((BrowserConnection) driver).setOnline(true);
    assertTrue("Failed to set browser online.",
        ((BrowserConnection) driver).isOnline());
  }

  // Location
  public void testShouldSetAndGetLocation() {
    if (!(driver instanceof LocationContext)) {
      return;
    }
    driver.get(pages.html5Page);

    ((LocationContext) driver).setLocation(
        new Location(40.714353, -74.005973, 0.056747));

    driver.manage().timeouts().implicitlyWait(2000, MILLISECONDS);

    Location location = ((LocationContext) driver).location();
    assertEquals(40.714353, location.getLatitude(), 4);
    assertEquals(-74.005973, location.getLongitude(), 4);
    assertEquals(1.056747, location.getAltitude(), 4);
  }

  // Local Web Storage
  public void testLocalStorageSetAndGetItem() {
    if (!(driver instanceof WebStorage)) {
      return;
    }
    driver.get(pages.html5Page);

    LocalStorage local = ((WebStorage) driver).getLocalStorage();
    local.clear();
    assertEquals("Local Storage isn't empty.", 0, local.size());

    local.setItem("FOO", "BAR");
    assertEquals("BAR", local.getItem("FOO"));

    local.setItem("FOO1", "BAR1");
    assertEquals("BAR1", local.getItem("FOO1"));
    assertEquals(2, local.size());

    local.clear();
    assertEquals(0, local.size());
  }

  public void testLocalStorageKeySet() {
    if (!(driver instanceof WebStorage)) {
      return;
    }
    driver.get(pages.html5Page);

    LocalStorage local = ((WebStorage) driver).getLocalStorage();
    local.clear();
    local.setItem("FOO1", "BAR1");
    local.setItem("FOO2", "BAR2");
    local.setItem("FOO3", "BAR3");

    Set<String> keySet = local.keySet();
    assertTrue(keySet.size() == 3);
    assertTrue(keySet.contains("FOO1"));
    assertTrue(keySet.contains("FOO2"));
    assertTrue(keySet.contains("FOO3"));

    local.clear();
    assertTrue(local.keySet().isEmpty());
  }

  public void testClearLocalStorage() {
    if (!(driver instanceof WebStorage)) {
      return;
    }
    LocalStorage local = ((WebStorage) driver).getLocalStorage();
    local.setItem("FOO1", "BAR1");
    local.setItem("FOO2", "BAR2");
    local.setItem("FOO3", "BAR3");
    assertEquals(3, local.size());

    local.clear();
    assertEquals(0, local.size());
  }

  public void testLocalStorageRemoveItem() {
    if (!(driver instanceof WebStorage)) {
      return;
    }
    driver.get(pages.html5Page);

    LocalStorage local = ((WebStorage) driver).getLocalStorage();
    local.clear();
    local.setItem("FOO", "BAR");
    assertEquals(1, local.size());
    String removedItemValue = local.removeItem("FOO");
    assertEquals("BAR", removedItemValue);
    assertEquals(0, local.size());
    local.clear();
  }

  // Session Web Storage
  public void testSessionStorageSetAndGetItem() {
    if (!(driver instanceof WebStorage)) {
      return;
    }
    driver.get(pages.html5Page);
    SessionStorage session = ((WebStorage) driver).getSessionStorage();
    assertEquals("Session Storage isn't empty.", 0, session.size());

    session.setItem("BAR", "FOO");
    assertEquals("FOO", session.getItem("BAR"));

    session.setItem("BAR1", "FOO1");
    assertEquals("FOO1", session.getItem("BAR1"));
    assertEquals(2, session.size());

    session.clear();
    assertEquals(0, session.size());
  }

  public void testSessionStorageKeySet() {
    if (!(driver instanceof WebStorage)) {
      return;
    }
    driver.get(pages.html5Page);

    SessionStorage session = ((WebStorage) driver).getSessionStorage();
    session.clear();
    session.setItem("FOO1", "BAR1");
    session.setItem("FOO2", "BAR2");
    session.setItem("FOO3", "BAR3");

    Set<String> keySet = session.keySet();
    assertTrue(keySet.size() == 3);
    assertTrue(keySet.contains("FOO1"));
    assertTrue(keySet.contains("FOO2"));
    assertTrue(keySet.contains("FOO3"));

    session.clear();
    assertTrue(session.keySet().isEmpty());
  }

  public void testClearSessionStorage() {
    if (!(driver instanceof WebStorage)) {
      return;
    }
    SessionStorage session = ((WebStorage) driver).getSessionStorage();
    session.setItem("FOO1", "BAR1");
    session.setItem("FOO2", "BAR2");
    session.setItem("FOO3", "BAR3");
    assertEquals(3, session.size());

    session.clear();
    assertEquals(0, session.size());
  }

  public void testSessionStorageRemoveItem() {
    if (!(driver instanceof WebStorage)) {
      return;
    }
    driver.get(pages.html5Page);

    SessionStorage session = ((WebStorage) driver).getSessionStorage();
    session.clear();
    session.setItem("BAR", "FOO");
    assertEquals(1, session.size());
    String removedItemValue = session.removeItem("BAR");
    assertEquals("FOO", removedItemValue);
    assertEquals(0, session.size());
    session.clear();
  }

  // Application Cache
  public void testAppCacheStatus() {
    if (!(driver instanceof ApplicationCache)) {
      return;
    }
    driver.get(pages.html5Page);
    driver.manage().timeouts().implicitlyWait(2000, MILLISECONDS);

    AppCacheStatus status = ((ApplicationCache) driver).getStatus();
    assertEquals(AppCacheStatus.UNCACHED, status);
    // Check if resources are retrieved from browser's cache.
    ((BrowserConnection) driver).setOnline(false);
    driver.get(pages.html5Page);
    AppCacheStatus status1 = ((ApplicationCache) driver).getStatus();
    status1 = ((ApplicationCache) driver).getStatus();
    assertEquals("Resources should be retrieved from browser's cache.",
        AppCacheStatus.IDLE, status1);
  }

  public void testBrowserLoadsFromCacheWhenOffline() {
    if (!(driver instanceof ApplicationCache)) {
      return;
    }
    driver.get(pages.html5Page);
    driver.get(pages.formPage);

    ((BrowserConnection) driver).setOnline(false);
    driver.get(pages.html5Page);
    assertEquals("HTML5", driver.getTitle());
  }

  public void testGetAppCache() {
    if (!(driver instanceof ApplicationCache)) {
      return;
    }
    driver.get(pages.html5Page);

    ((BrowserConnection) driver).setOnline(false);

    List<AppCacheEntry> caches = ((ApplicationCache) driver).getAppCache();
    for (AppCacheEntry cache : caches) {
      assertEquals("image/jpeg", cache.getMimeType());
      if (cache.getUrl().contains("red.jpg")) {
        assertEquals(
            "Resources that were listed in cache's manifest isn't MASTER.",
            AppCacheType.MASTER, cache.getType().value());
      } else if (cache.getUrl().contains("yellow.jpg")) {
        assertEquals(
            "Resources that were listed in cache's manifest isn't EXPLICIT",
            AppCacheType.EXPLICIT, cache.getType().value());
      }
    }
  }

  // Database Storage
  private ResultSet executeQuery(String statement, String... param) {
    // Note: Current HTML5 API of Webdriver only requires the databaseName.
    // The version, displayName and initial quota size is assigned default value.
    // Default value of version is empty string, which is fine since in this case,
    // there is no expected version â€” any version is fine.
    // See: http://www.w3.org/TR/webdatabase/#dom-opendatabase
    // Default value of the initial quota is 5MB.
    String databaseName = "HTML5";
    return ((DatabaseStorage) driver).executeSQL(databaseName, statement,
        (Object[]) param);
  }

  public void testResultSetsReturnNegativeLastInsertedRowId() {
    if (!(driver instanceof DatabaseStorage)) {
      return;
    }
    driver.get(pages.html5Page);
    waitFor(WaitingConditions.elementToExist(driver, "db_completed"));

    ResultSet resultSet = executeQuery(SELECT_STATEMENT);
    assertTrue(resultSet.getLastInsertedRowId() == -1);
  }

  public void testResultSetsReturnPositiveLastInsertedRowId() {
    if (!(driver instanceof DatabaseStorage)) {
      return;
    }
    driver.get(pages.html5Page);
    waitFor(WaitingConditions.elementToExist(driver, "db_completed"));

    ResultSet resultSet = executeQuery(INSERT_STATEMENT, "DocFoo");
    assertTrue(resultSet.getLastInsertedRowId() != -1);

    ResultSet resultSet1 = executeQuery(SELECT_STATEMENT);
    assertTrue(resultSet1.getLastInsertedRowId() == -1);

    ResultSet resultSet2 = executeQuery(DELETE_STATEMENT);
    assertTrue(resultSet2.getLastInsertedRowId() == -1);
  }

  public void testResultSetsNumberOfRowsAffected() {
    if (!(driver instanceof DatabaseStorage)) {
      return;
    }
    driver.get(pages.html5Page);
    waitFor(WaitingConditions.elementToExist(driver, "db_completed"));

    ResultSet resultSet = executeQuery(INSERT_STATEMENT, "DocFooBar");
    assertTrue(resultSet.getNumberOfRowsAffected() == 1);

    ResultSet resultSet1 = executeQuery(SELECT_STATEMENT);
    assertTrue(resultSet1.getNumberOfRowsAffected() == 0);

    ResultSet resultSet2 = executeQuery(
        "UPDATE docs SET docname='DocBar' WHERE docname='DocFooBar'");
    assertTrue("It should only affect one row, but affects " + resultSet2.getNumberOfRowsAffected(),
        resultSet2.getNumberOfRowsAffected() == 1);

    executeQuery(DELETE_STATEMENT);
  }

  public void testResultSetRowsContainsInsertedRows() {
    if (!(driver instanceof DatabaseStorage)) {
      return;
    }
    driver.get(pages.html5Page);
    waitFor(WaitingConditions.elementToExist(driver, "db_completed"));

    executeQuery(INSERT_STATEMENT, "DocFoo");
    executeQuery(INSERT_STATEMENT, "DocFooBar");
    ResultSet resultSet = executeQuery(SELECT_STATEMENT);
    assertTrue(resultSet.rows().size() == 2);

    Map<String, Object> record = resultSet.rows().item(0);
    assertEquals("DocFoo", record.get("docname"));
    record = resultSet.rows().item(1);
    assertEquals("DocFooBar", record.get("docname"));

    executeQuery(DELETE_STATEMENT);
    resultSet = executeQuery(SELECT_STATEMENT);
    assertTrue(resultSet.rows().size() == 0);
  }
}
