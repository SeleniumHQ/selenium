package org.openqa.selenium.remote.server;

import com.google.common.collect.ImmutableList;

import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.SessionNotCreatedException;
import org.openqa.selenium.remote.NewSessionPayload;

import java.io.IOException;
import java.util.LinkedList;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.function.Function;

public class NewSessionPipeline {

  private final List<SessionFactory> factories;
  private final SessionFactory fallback;
  private final List<Function<ImmutableCapabilities, ImmutableCapabilities>> mutators;

  private NewSessionPipeline(
      List<SessionFactory> factories,
      SessionFactory fallback,
      List<Function<ImmutableCapabilities, ImmutableCapabilities>> mutators) {
    this.factories = factories;
    this.fallback = fallback;
    this.mutators = mutators;
  }

  public static Builder builder() {
    return new Builder();
  }

  public ActiveSession createNewSession(NewSessionPayload payload) throws IOException {
    return payload.stream()
        .map(caps -> {
          for (Function<ImmutableCapabilities, ImmutableCapabilities> mutator : mutators) {
            caps = mutator.apply(caps);
          }
          return caps;
        })
        .map(caps -> factories.stream()
            .map(factory -> factory.apply(payload.getDownstreamDialects(), caps))
            .filter(Optional::isPresent)
            .map(Optional::get)
            .findFirst())
        .filter(Optional::isPresent)
        .map(Optional::get)
        .findFirst()
        .orElseGet(() ->
          fallback.apply(payload.getDownstreamDialects(), new ImmutableCapabilities())
              .orElseThrow(
                  () -> new SessionNotCreatedException("Unable to create session from " + payload))
        );
  }

  public static class Builder {
    private List<SessionFactory> factories = new LinkedList<>();
    private SessionFactory fallback = (dialects, caps) -> Optional.empty();
    private List<Function<ImmutableCapabilities, ImmutableCapabilities>> mutators = new LinkedList<>();

    private Builder() {
      // Private class
    }

    public Builder add(SessionFactory factory) {
      factories.add(Objects.requireNonNull(factory, "Factory must not be null"));
      return this;
    }

    public Builder fallback(SessionFactory factory) {
      fallback = Objects.requireNonNull(factory, "Fallback must not be null");
      return this;
    }

    public Builder addCapabilitiesMutator(
        Function<ImmutableCapabilities, ImmutableCapabilities> mutator) {
      mutators.add(Objects.requireNonNull(mutator, "Mutator must not be null"));
      return this;
    }

    public NewSessionPipeline create() {
      return new NewSessionPipeline(ImmutableList.copyOf(factories), fallback, mutators);
    }
  }
}
