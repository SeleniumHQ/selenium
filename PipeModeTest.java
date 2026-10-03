// Java -> Selenium Manager (--pipe --record) -> ChromeDriver integration test
// Usage: java PipeModeTest.java [path-to-selenium-manager]

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Duration;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

public class PipeModeTest {
  static final String SM = "C:\\Users\\boni\\Documents\\dev\\selenium\\rust\\target\\release\\selenium-manager.exe";
  static final String RECORD = "trace-test.zip";

  public static void main(String[] args) throws Exception {
    Path sm = args.length > 0 ? Path.of(args[0]) : Path.of(SM);
    if (!Files.exists(sm)) { System.err.println("SM not found"); System.exit(1); }
    System.out.println("=== Pipe Mode Integration Test ===");

    Path rec = Path.of(RECORD).toAbsolutePath();
    Files.deleteIfExists(rec);

    // Use --output mixed: JSON to stdout, human-readable to stderr
    // SM prints the proxy_url as the last JSON line before waiting for connections
    ProcessBuilder pb = new ProcessBuilder(
      sm.toAbsolutePath().toString(),
      "--pipe", "--record", RECORD,
      "--browser", "chrome",
      "--output", "mixed"
    );
    pb.redirectErrorStream(true);
    Process proc = pb.start();

    // Read stdout via the classic Process.getInputStream() approach
    // Process.inputReader() reads from stdin — we need to read from stdout
    // The old API's getInputStream() reads the child's stdout
    String proxyUrl = null;
    long deadline = System.nanoTime() + Duration.ofSeconds(30).toNanos();
    var reader = new java.io.BufferedReader(new java.io.InputStreamReader(proc.getInputStream()));
    while (System.nanoTime() < deadline && proxyUrl == null && proc.isAlive()) {
      if (reader.ready()) {
        String line = reader.readLine();
        if (line != null) {
          int idx = line.indexOf("http://localhost:");
          if (idx > 0) {
            int end = line.indexOf('"', idx);
            if (end < 0) end = line.indexOf(',', idx);
            if (end < 0) end = line.indexOf('}', idx);
            if (end < 0) end = line.length();
            proxyUrl = line.substring(idx, end);
          }
        }
      } else {
        Thread.sleep(Duration.ofMillis(100).toMillis());
      }
    }
    if (proxyUrl == null) { proc.destroy(); throw new RuntimeException("proxy_url timeout"); }
    System.out.println("proxy_url: " + proxyUrl);

    // Create WebDriver session
    var http = HttpClient.newHttpClient();
    var req = HttpRequest.newBuilder(URI.create(proxyUrl + "/session"))
      .header("Content-Type","application/json")
      .POST(HttpRequest.BodyPublishers.ofString("{\"capabilities\":{\"alwaysMatch\":{\"browserName\":\"chrome\"}}}"))
      .timeout(Duration.ofSeconds(15)).build();
    var resp = http.send(req, HttpResponse.BodyHandlers.ofString());
    System.out.println("POST /session -> " + resp.statusCode());
    if (resp.statusCode() != 200) { proc.destroy(); throw new RuntimeException("Session: " + resp.body()); }

    String sid = resp.body().replaceFirst(".*\"sessionId\"\\s*:\\s*\"([^\"]+)\".*","$1");
    System.out.println("sid: " + sid);

    // Navigate and query
    req = HttpRequest.newBuilder(URI.create(proxyUrl + "/session/" + sid + "/url"))
      .header("Content-Type","application/json")
      .POST(HttpRequest.BodyPublishers.ofString("{\"url\":\"https://example.com\"}"))
      .timeout(Duration.ofSeconds(15)).build();
    resp = http.send(req, HttpResponse.BodyHandlers.ofString());
    System.out.println("POST /url -> " + resp.statusCode());

    req = HttpRequest.newBuilder(URI.create(proxyUrl + "/session/" + sid + "/title"))
      .GET().timeout(Duration.ofSeconds(15)).build();
    resp = http.send(req, HttpResponse.BodyHandlers.ofString());
    System.out.println("GET /title -> " + resp.statusCode());

    req = HttpRequest.newBuilder(URI.create(proxyUrl + "/session/" + sid))
      .DELETE().timeout(Duration.ofSeconds(15)).build();
    resp = http.send(req, HttpResponse.BodyHandlers.ofString());
    System.out.println("DELETE /session -> " + resp.statusCode());

    proc.destroy(); proc.waitFor(Duration.ofSeconds(5));

    boolean ok = Files.exists(rec);
    System.out.println("trace.zip: " + (ok ? "OK" : "NOT FOUND"));
    if (ok) {
      try (var zis = new ZipInputStream(Files.newInputStream(rec))) {
        ZipEntry e;
        while ((e = zis.getNextEntry()) != null) {
          System.out.println(" ZIP: " + e.getName());
          if (e.getName().equals("trace.json")) {
            String c = new String(zis.readAllBytes(), StandardCharsets.UTF_8);
            ok = c.contains("trace");
          }
        }
      }
    }
    System.out.println(ok ? "\n=== ALL PASSED ===" : "\n=== FAILED ===");
  }
}