package org.openqa.selenium.remote;

import org.openqa.selenium.UnsupportedCommandException;
import org.openqa.selenium.remote.Command;

/**
 * Converts {@link Command} objects to and from another representation.
 *
 * @param <T> The type of an encoded command.
 */
public interface CommandCodec<T> {

  /**
   * Encodes a command.
   *
   * @param command the command to encode.
   * @return the encoded command.
   * @throws UnsupportedCommandException If the command is not supported by this codec.
   */
  T encode(Command command);

  /**
   * Decodes a command.
   *
   * @param encodedCommand the command to decode.
   * @return the decoded command.
   * @throws UnsupportedCommandException If the command is not supported by this codec.
   */
  Command decode(T encodedCommand);
}
