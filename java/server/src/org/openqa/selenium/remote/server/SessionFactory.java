package org.openqa.selenium.remote.server;


import org.openqa.selenium.remote.Dialect;

import java.nio.file.Path;
import java.util.Set;

public interface SessionFactory {
  ActiveSession apply(Path capabilitiesBlob, Set<Dialect> downstreamDialects);
}
