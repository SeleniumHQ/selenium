from dataclasses import dataclass


@dataclass(frozen=True)
class HttpVerb:
    """
    All HTTP Verbs used for W3C.
    """
    GET: str = "get"
    POST: str = "post"
    DELETE: str = "delete"
    PUT: str = "put"
