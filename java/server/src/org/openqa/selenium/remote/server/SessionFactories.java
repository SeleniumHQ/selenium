package org.openqa.selenium.remote.server;

import java.util.Optional;
import org.openqa.selenium.Capabilities;

/** A provider of SessionFactory instances. */
public interface SessionFactories {
  Optional<SessionFactory> getFactoryFor(Capabilities caps);
}
