// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

package org.openqa.selenium.grid.node;

import static java.nio.charset.StandardCharsets.UTF_8;

import com.google.common.collect.ImmutableMap;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.grid.data.Session;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.remote.Dialect;
import org.openqa.selenium.remote.ErrorCodes;
import org.openqa.selenium.remote.SessionId;

import java.util.Map;
import java.util.function.BiFunction;
import java.util.function.Function;

public class CapabilityResponseEncoder {

  private static final Json JSON = new Json();
  private static final ResponseEncoder<Session, Map<String, Object>, byte[]> JWP_ENCODER =
      new Encoder(Dialect.OSS);
  private static final ResponseEncoder<Session, Map<String, Object>, byte[]> W3C_ENCODER =
      new Encoder(Dialect.W3C);

  private CapabilityResponseEncoder() {
    // Utility class
  }

  public static ResponseEncoder<Session, Map<String, Object>, byte[]> getEncoder(Dialect dialect) {
    switch (dialect) {
      case OSS:
        return JWP_ENCODER;

      case W3C:
        return W3C_ENCODER;

      default:
        throw new IllegalArgumentException("Unrecognised dialect: " + dialect);
    }
  }

  public interface ResponseEncoder<T, U, R> extends Function<T, R>, BiFunction<T, U, R> {
    @Override
    default <V> ResponseEncoder<T, U, V> andThen(Function<? super R, ? extends V> after) {
      return new ResponseEncoder<T, U, V>() {
        @Override
        public V apply(final T t, final U u) {
          return after.apply(ResponseEncoder.this.apply(t, u));
        }

        @Override
        public V apply(final T t) {
          return after.apply(ResponseEncoder.this.apply(t));
        }
      };
    }
  }

  private static class Encoder implements ResponseEncoder<Session, Map<String, Object>, byte[]> {

    private final Dialect dialect;

    private Encoder(Dialect dialect) {
      this.dialect = Require.nonNull("Dialect", dialect);
    }

    @Override
    public byte[] apply(Session session, Map<String, Object> metadata) {
      Require.nonNull("Session", session);
      Require.nonNull("Metadata", metadata);

      return encodeAsResponse(dialect, session.getId(), session.getCapabilities(), metadata);
    }

    @Override
    public byte[] apply(Session session) {
      return apply(session, ImmutableMap.of());
    }

    /**
     * Create a UTF-8 encoded response for a given dialect for use with the New Session command.
     */
    private static byte[] encodeAsResponse(
        Dialect dialect,
        SessionId id,
        Capabilities capabilities,
        Map<String, Object> metadata) {

      Map<String, Object> toEncode;

      switch (dialect) {
        case OSS:
          toEncode = encodeJsonWireProtocol(id, capabilities, metadata);
          break;

        case W3C:
          toEncode = encodeW3C(id, capabilities, metadata);
          break;

        default:
          throw new IllegalArgumentException("Unknown dialect: " + dialect);
      }

      return JSON.toJson(toEncode).getBytes(UTF_8);
    }

    private static Map<String, Object> encodeW3C(
        SessionId id,
        Capabilities capabilities,
        Map<String, Object> metadata) {
      return ImmutableMap.<String, Object>builder()
          .putAll(metadata)
          .put("value", ImmutableMap.of(
              "sessionId", id,
              "capabilities", capabilities))
          .build();
    }

    private static Map<String, Object> encodeJsonWireProtocol(
        SessionId id,
        Capabilities capabilities,
        Map<String, Object> metadata) {
      return ImmutableMap.<String, Object>builder()
          .putAll(metadata)
          .put("status", ErrorCodes.SUCCESS)
          .put("sessionId", id)
          .put("value", capabilities)
          .build();

    }

  }
}
