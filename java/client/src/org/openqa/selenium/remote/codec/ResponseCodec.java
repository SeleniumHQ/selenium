package org.openqa.selenium.remote.codec;

import org.openqa.selenium.remote.Response;

/**
 * Converts {@link Response} objects to and from another representation.
 *
 * @param <T> The type of an encoded response.
 */
public interface ResponseCodec<T> extends Codec<Response, T> {
}
