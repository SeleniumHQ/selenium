package org.openqa.selenium.remote;

import java.util.Optional;
import java.util.function.Function;

interface HandshakeResponse {
  Function<InitialHandshakeResponse, Optional<ProtocolHandshake.Result>> getResponseFunction();
}
