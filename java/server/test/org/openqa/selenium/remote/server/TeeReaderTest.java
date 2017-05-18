package org.openqa.selenium.remote.server;

import static org.junit.Assert.assertEquals;

import com.google.gson.stream.JsonReader;

import org.junit.Test;

import java.io.IOException;
import java.io.Reader;
import java.io.StringReader;
import java.io.StringWriter;


public class TeeReaderTest {

  @Test
  public void shouldDuplicateStreams() throws IOException {
    String expected = "{\"key\": \"value\"}";
    Reader source = new StringReader(expected);

    StringWriter writer = new StringWriter();

    Reader tee = new TeeReader(source, writer);

    JsonReader reader = new JsonReader(tee);

    reader.beginObject();
    assertEquals("key", reader.nextName());
    reader.skipValue();
    reader.endObject();

    assertEquals(expected, writer.toString());
  }
}