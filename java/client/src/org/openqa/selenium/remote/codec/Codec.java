package org.openqa.selenium.remote.codec;

/**
 * Converts an object between two different representations.
 *
 * @param <S> The raw value type.
 * @param <T> The value's encoded type.
 */
public interface Codec<S, T> {

  /**
   * Encodes an object.
   *
   * @param raw The object's raw representation.
   * @return The encoded object.
   * @throws IllegalArgumentException If the object cannot be encoded.
   */
  T encode(S raw);

  /**
   * Decodes an object.
   *
   * @param encoded The encoded object to decode.
   * @return The decoded object.
   * @throws IllegalArgumentException If the object cannot be decoded.
   */
  S decode(T encoded);
}
