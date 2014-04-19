package org.openqa.selenium.remote.codec;

import org.openqa.selenium.UnsupportedCommandException;
import org.openqa.selenium.remote.Command;

/**
 * Converts {@link Command} objects to and from another representation.
 *
 * @param <T> The type of an encoded command.
 */
public interface CommandCodec<T> extends Codec<Command, T> {

  /**
   * @inheritDoc
   * @throws UnsupportedCommandException If the command is not supported by this codec.
   */
  @Override
  T encode(Command command);

  /**
   * @inheritDoc
   * @throws UnsupportedCommandException If the command is not supported by this codec.
   */
  @Override
  Command decode(T encodedCommand);
}
