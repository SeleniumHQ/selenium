package org.openqa.selenium.remote;

import org.openqa.selenium.remote.Response;

/**
 * Converts {@link Response} objects to and from another representation.
 *
 * @param <T> The type of an encoded response.
 */
public interface ResponseCodec<T> {

  /**
   * Encodes a response.
   *
   * @param response the response to encode.
   * @return the encoded response.
   * @throws IllegalArgumentException If the object cannot be encoded.
   */
  T encode(Response response);

  /**
   * Decodes a response.
   *
   * @param encodedResponse the response to decode.
   * @return the decoded response.
   * @throws IllegalArgumentException If the object cannot be decoded.
   */
  Response decode(T encodedResponse);
}
