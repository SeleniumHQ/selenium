from warnings import warn

removed_from_version = "4.12"


def deprecated_function(message):
    """decorator to log deprecation warning messgaes for deprecated methods."""

    def _deprecated_function(func):
        def wrapper(*args, **kwargs):
            warn(f"{message}: will be removed from {removed_from_version}", DeprecationWarning, stacklevel=2)
            return func(*args, **kwargs)

        return wrapper

    return _deprecated_function


def deprecated_attributes(*attrs, message):
    def _deprecated_attributes(func):
        def wrapper(*args, **kwargs):
            result = func(*args, **kwargs)
            for attr in attrs:
                _attr = getattr(args[0], attr, None)
                if _attr:
                    warn(f"'{message}': will be removed from {removed_from_version}", DeprecationWarning, stacklevel=2)
                    return result

        return wrapper

    return _deprecated_attributes
