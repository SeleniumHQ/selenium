from typing_extensions import Protocol


class Launchable(Protocol):
    """An implicit interface for starting and stopping a service.  This is
    primarily used for structural subtyping."""

    def start(self) -> None:
        """Start the service."""

    def stop(self) -> None:
        """Stop the service."""
