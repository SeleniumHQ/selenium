# Licensed to the Software Freedom Conservancy (SFC) under one
# or more contributor license agreements.  See the NOTICE file
# distributed with this work for additional information
# regarding copyright ownership.  The SFC licenses this file
# to you under the Apache License, Version 2.0 (the
# "License"); you may not use this file except in compliance
# with the License.  You may obtain a copy of the License at
#
#   http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing,
# software distributed under the License is distributed on an
# "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
# KIND, either express or implied.  See the License for the
# specific language governing permissions and limitations
# under the License.

"""Serialization runtime for the generated WebDriver BiDi protocol layer.

Hand-written support for the generated ``selenium.webdriver.common._bidi.*`` modules
(not itself generated). Provides the immutable value-type base (:class:`Record`),
the discriminated-union dispatch base (:class:`Union`), and the :data:`UNSET`
sentinel that distinguishes an omitted optional from an explicit wire ``null``.

Each generated field carries its wire facts as dataclass field metadata (see
:func:`meta`), so a record's Python fields are its single source of truth — there
is no parallel field table.

This is internal, unsupported implementation. See
https://www.selenium.dev/documentation/warnings/bidi-implementation/
"""

from __future__ import annotations

import dataclasses
import logging
import re
from collections.abc import Callable, Iterator
from contextlib import contextmanager
from contextvars import ContextVar
from dataclasses import dataclass
from enum import Enum
from importlib import import_module
from typing import Any

from selenium.common.exceptions import WebDriverException

logger = logging.getLogger(__name__)


class BiDiSerializationError(WebDriverException):
    """A payload could not be (de)serialized against this Selenium's BiDi schema."""


_strict_inbound: ContextVar[bool] = ContextVar("bidi_strict_inbound", default=False)


@contextmanager
def strict_inbound() -> Iterator[None]:
    """Escalate the inbound tolerations to errors for the duration of the block.

    By default the layer tolerates a payload that lags or runs ahead of this Selenium's
    schema — a missing required field or an undeclared property — by warning and carrying
    on (the wire boundary is not ours to control). Wrap a command call in
    ``with strict_inbound():`` to make those deviations raise :class:`BiDiSerializationError`
    instead, for a caller that wants strict conformance. A corrupt value always errors.
    """
    token = _strict_inbound.set(True)
    try:
        yield
    finally:
        _strict_inbound.reset(token)


def _tolerate(message: str) -> None:
    """A tolerated inbound deviation: raise it in strict mode, otherwise warn and continue."""
    if _strict_inbound.get():
        raise BiDiSerializationError(message)
    logger.warning(message)


# Cap how many key names one tolerated-inbound warning spells out, so a payload with many
# unknown/absent keys yields a bounded log line / exception message instead of one built from
# every remote-supplied key; the remainder is summarized as a count.
_MAX_KEYS_SHOWN = 10


def _summarize(owner: str, kind: str, keys: list[str], suffix: str) -> str:
    """A bounded ``owner: kind 'a', 'b', … (+N more) (suffix)`` message for tolerated keys."""
    shown = ", ".join(repr(k) for k in keys[:_MAX_KEYS_SHOWN])
    if len(keys) > _MAX_KEYS_SHOWN:
        shown += f", … (+{len(keys) - _MAX_KEYS_SHOWN} more)"
    return f"{owner}: {kind} {shown} ({suffix})"


class UnsetType:
    """Type of the :data:`UNSET` sentinel (an omitted optional, not ``None``)."""

    _instance: UnsetType | None = None

    def __new__(cls) -> UnsetType:
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    def __repr__(self) -> str:
        return "UNSET"

    def __bool__(self) -> bool:
        return False


UNSET: UnsetType = UnsetType()
"""Marks an omitted optional. Dropped from the wire; distinct from ``None`` (explicit null)."""


@dataclass(frozen=True)
class _Wire:
    """Wire facts for one record field, attached as its dataclass field metadata."""

    wire: str
    required: bool = False
    nullable: bool = False
    ref: str | None = None
    is_list: bool = False
    enum: str | None = None
    primitive: str | None = None
    scalar: str | list[str] | None = None
    fixed: Any = UNSET


_META_KEY = "bidi"


def meta(
    name: str,
    *,
    required: bool = False,
    nullable: bool = False,
    ref: str | None = None,
    is_list: bool = False,
    enum: str | None = None,
    primitive: str | None = None,
    scalar: str | list[str] | None = None,
    fixed: Any = UNSET,
) -> dict:
    """Dataclass field metadata carrying one field's BiDi wire facts.

    Used as ``x: T = field(metadata=meta(...))`` in the generated modules — a plain
    ``dataclasses.field`` so it reads as an ordinary dataclass field. A baked
    discriminator additionally sets ``default=<const>, init=False`` on the field.

    ``scalar`` marks a map field (a ``[key, value]`` list whose value type is an
    object-only union): the union's string keys pass through when they match this
    primitive, rather than being rejected as non-objects.
    """
    descriptor = _Wire(
        wire=name,
        required=required,
        nullable=nullable,
        ref=ref,
        is_list=is_list,
        enum=enum,
        primitive=primitive,
        scalar=scalar,
        fixed=fixed,
    )
    return {_META_KEY: descriptor}


# schema type name -> generated class, populated as each domain module imports.
# Refs are resolved lazily (at (de)serialization time) through this registry so
# generated modules never import each other at runtime, avoiding import cycles.
_REGISTRY: dict[str, type] = {}


def register(schema_name: str) -> Callable[[type], type]:
    """Class decorator registering a generated class under its schema type name."""

    def decorate(cls: type) -> type:
        _REGISTRY[schema_name] = cls
        return cls

    return decorate


def _camel_to_snake(name: str) -> str:
    """``browsingContext`` -> ``browsing_context`` (mirrors the generator's domain->module map)."""
    name = re.sub(r"([A-Z]+)([A-Z][a-z])", r"\1_\2", name)
    name = re.sub(r"([a-z\d])([A-Z])", r"\1_\2", name)
    return name.lower()


def resolve(schema_name: str) -> type:
    cls = _REGISTRY.get(schema_name)
    if cls is not None:
        return cls
    # A cross-domain ref: generated modules import each other only under TYPE_CHECKING, so the
    # owning module may not have run its @register decorators yet. Import it now (a no-op if
    # already loaded) and retry, so e.g. resolving `script.NodeRemoteValue` works even when the
    # caller only imported `browsing_context`.
    module = _camel_to_snake(schema_name.split(".", 1)[0])
    try:
        import_module(f"{__package__}.{module}")
    except ImportError:
        pass
    try:
        return _REGISTRY[schema_name]
    except KeyError:
        raise BiDiSerializationError(f"unknown BiDi type {schema_name!r} (module not imported?)") from None


def _fields(obj: Any) -> tuple[dataclasses.Field[Any], ...]:
    """``dataclasses.fields`` for a Record subclass; the ``Record`` base is not itself a dataclass."""
    return dataclasses.fields(obj)


def _wire_of(f: dataclasses.Field) -> _Wire:
    return f.metadata[_META_KEY]


def _as_json(value: Any) -> Any:
    if isinstance(value, Record):
        return value.as_json()
    if isinstance(value, Enum):
        return value.value
    if isinstance(value, list):
        return [_as_json(item) for item in value]
    if isinstance(value, dict):
        return {key: _as_json(item) for key, item in value.items()}
    return value


class Record:
    """Immutable value-type base for generated params/results/event payloads.

    Subclasses are ``@dataclass(frozen=True)`` whose fields are declared with
    :func:`meta`. The object itself is permissive; validation lives at the boundaries.
    Outbound (:meth:`as_json`) omits ``UNSET``, emits ``null`` only for nullable fields,
    and errors if a required field is unset. Inbound (:meth:`from_json`) errors on a
    corrupt value but tolerates a missing required field or an undeclared property —
    it warns and carries on (``strict_inbound`` escalates to an error) — so a client
    generated from one spec revision keeps working against a browser on another.
    """

    _EXTENSIBLE: bool = False

    def __post_init__(self) -> None:
        for f in _fields(self):
            if f.name == "extensions":
                continue
            w = _wire_of(f)
            if w.fixed is not UNSET:
                continue
            value = getattr(self, f.name)
            if value is UNSET:
                continue
            if value is None:
                if not w.nullable:
                    raise BiDiSerializationError(f"{type(self).__name__}.{f.name} cannot be None")
                continue
            if w.enum is not None:
                self._validate_enum(f.name, w, value)

    def _validate_enum(self, name: str, w: _Wire, value: Any) -> None:
        enum_cls = resolve(w.enum)  # type: ignore[arg-type]
        for item in value if w.is_list else [value]:
            if isinstance(item, enum_cls):
                continue
            try:
                enum_cls(item)
            except ValueError:
                raise BiDiSerializationError(
                    f"{type(self).__name__}.{name}: {item!r} is not a valid {enum_cls.__name__}"
                ) from None

    def as_json(self) -> dict:
        payload: dict = {}
        for f in _fields(self):
            if f.name == "extensions":
                continue
            w = _wire_of(f)
            value = getattr(self, f.name)
            if value is UNSET:
                # Outbound requires every required field (ADR decision 1). Enforced here at
                # the boundary, not in the constructor, so the object stays permissive and
                # inbound can tolerate the same field being absent (see from_json).
                if w.required:
                    raise BiDiSerializationError(f"{type(self).__name__}.{f.name}: required {w.wire!r} is not set")
                continue
            if value is None and not w.nullable:
                continue
            _validate_outbound(type(self).__name__, f.name, w, value)
            payload[w.wire] = _as_json(value)
        if self._EXTENSIBLE:
            payload.update(getattr(self, "extensions", None) or {})
        return payload

    @classmethod
    def from_json(cls, payload: dict) -> Any:
        if not isinstance(payload, dict):
            got = type(payload).__name__
            raise BiDiSerializationError(f"{cls.__name__} expected an object on the wire, got {got} {payload!r}")
        kwargs: dict = {}
        known: set[str] = set()
        missing_required: list[str] = []
        for f in _fields(cls):
            w = _wire_of(f)
            known.add(w.wire)
            if w.fixed is not UNSET or f.name == "extensions":
                continue
            if w.wire not in payload:
                if w.required:
                    missing_required.append(w.wire)
                kwargs[f.name] = UNSET
                continue
            kwargs[f.name] = _read_field(cls, f.name, w, payload)
        undeclared = [k for k in payload if k not in known]
        # Tolerate a payload that lags or runs ahead of this schema (ADR decisions 2.2/2.3): a
        # missing required field is left unset; an undeclared property is kept only on an
        # extensible (re-sendable) type, else dropped. Each kind warns at most once per record —
        # never once per key, so a verbose payload cannot flood the log; strict_inbound raises.
        if missing_required:
            _tolerate(_summarize(cls.__name__, "missing required", missing_required, "left unset"))
        if undeclared:
            _tolerate(_summarize(cls.__name__, "undeclared", undeclared, "kept" if cls._EXTENSIBLE else "dropped"))
        if cls._EXTENSIBLE:
            kwargs["extensions"] = {k: payload[k] for k in undeclared}
        return cls(**kwargs)


def _read_field(cls: type, name: str, w: _Wire, payload: dict) -> Any:
    # Called only for a field present on the wire; from_json handles an absent field (an absent
    # required one is tolerated and warned there, in one bounded message per record).
    raw = payload[w.wire]
    if raw is None:
        if w.nullable:
            return None
        raise BiDiSerializationError(f"{cls.__name__}.{name} received null but is not nullable")
    if w.is_list != isinstance(raw, list) and (w.is_list or w.enum or w.ref or w.primitive):
        expected = "a list" if w.is_list else "a single value"
        raise BiDiSerializationError(f"{cls.__name__}.{name} expected {expected}, got {raw!r}")
    if w.is_list:
        if w.scalar is not None:
            return [_read_map_entry(cls, name, w, item) for item in raw]
        return [_read_scalar(cls, name, w, item) for item in raw]
    return _read_scalar(cls, name, w, raw)


def _read_map_entry(cls: type, name: str, w: _Wire, element: Any) -> list:
    """Read one ``[key, value]`` map entry into typed key/value.

    A map arrives as ``[[key, value], ...]``. The key is ``ref / text``: an object
    key deserializes; a bare-scalar key passes through once it matches the arm's
    ``scalar`` primitive. The value is the object-only ref and always deserializes,
    so a bare scalar there is rejected. A non-pair element is malformed.
    """
    if not (isinstance(element, list) and len(element) == 2):
        raise BiDiSerializationError(f"{cls.__name__}.{name} expected a [key, value] pair, got {element!r}")
    klass = resolve(w.ref)  # type: ignore[arg-type]
    key, value = element
    key = klass.from_json(key) if isinstance(key, dict) else _check_scalar(cls, name, w, key)  # type: ignore[attr-defined]
    return [key, klass.from_json(value)]  # type: ignore[attr-defined]


def _check_scalar(cls: type, name: str, w: _Wire, value: Any) -> Any:
    """A bare map key must match one of the union's scalar-arm primitives.

    A wrong-typed scalar (a number where a string is expected) is a wire error, not
    something to pass through. An unrecognized primitive is left unchecked, matching
    the lenient default elsewhere.
    """
    scalars = [s for s in (w.scalar if isinstance(w.scalar, list) else [w.scalar]) if s is not None]
    checks = [_PRIMITIVE_CHECKS[s] for s in scalars if s in _PRIMITIVE_CHECKS]
    if not checks or any(check(value) for check in checks):
        return value
    got = type(value).__name__
    raise BiDiSerializationError(f"{cls.__name__}.{name}: map key expected {' or '.join(scalars)}, got {got} {value!r}")


# JSON value -> the Python types a schema primitive accepts. ``integer`` accepts only an
# int (a non-integer float like 1.5 is a real mismatch, and even 5.0 is rejected under
# strict-first — relax reactively if a browser is ever seen sending it). ``number`` accepts
# an int or a float. ``bool`` is excluded from the numeric checks: it is an ``int`` subclass
# but is not a number.
_PRIMITIVE_CHECKS = {
    "str": lambda v: isinstance(v, str),
    "bool": lambda v: isinstance(v, bool),
    "int": lambda v: isinstance(v, int) and not isinstance(v, bool),
    "float": lambda v: isinstance(v, (int, float)) and not isinstance(v, bool),
}


def _read_scalar(cls: type, name: str, w: _Wire, raw: Any) -> Any:
    if w.enum is not None:
        enum_cls = resolve(w.enum)
        try:
            return enum_cls(raw)
        except ValueError:
            raise BiDiSerializationError(f"{cls.__name__}.{name}: {raw!r} is not a valid {enum_cls.__name__}") from None
    if w.ref is not None:
        klass = resolve(w.ref)
        # A record must arrive as an object; a union may legitimately be a bare scalar
        # arm (e.g. input.Origin's "viewport"), so let its from_json handle non-objects.
        if not issubclass(klass, Union) and not isinstance(raw, dict):
            got = type(raw).__name__
            raise BiDiSerializationError(f"{cls.__name__}.{name}: expected an object, got {got} {raw!r}")
        return klass.from_json(raw)  # type: ignore[attr-defined]
    if w.primitive is not None and raw is not None:
        check = _PRIMITIVE_CHECKS.get(w.primitive)
        if check and not check(raw):
            got = type(raw).__name__
            raise BiDiSerializationError(f"{cls.__name__}.{name}: expected {w.primitive}, got {got} {raw!r}")
    return raw


def _validate_outbound(owner: str, name: str, w: _Wire, value: Any) -> None:
    """Reject an outbound value that violates its wire type before it is sent (ADR decision 1).

    A caller mistake — a wrong primitive, a scalar where a list is expected, a raw dict where a
    typed record belongs — surfaces here as a local error rather than a remote protocol error.
    """
    if value is None:
        return  # nullability is handled by as_json
    if w.is_list:
        if not isinstance(value, list):
            raise BiDiSerializationError(f"{owner}.{name}: expected a list, got {type(value).__name__} {value!r}")
        for item in value:
            _validate_outbound_scalar(owner, name, w, item)
        return
    _validate_outbound_scalar(owner, name, w, value)


def _validate_outbound_scalar(owner: str, name: str, w: _Wire, value: Any) -> None:
    if value is None or w.scalar is not None:
        return  # map entries carry their own shape; null is handled upstream
    if w.enum is not None:
        return  # enum membership is validated at construction (__post_init__)
    if w.ref is not None:
        klass = resolve(w.ref)
        # Records must be passed as instances; unions/enums stay permissive (a union arm may be a
        # bare scalar or any variant, selected via Union.build rather than checked here).
        if isinstance(klass, type) and issubclass(klass, Record) and not isinstance(value, klass):
            raise BiDiSerializationError(
                f"{owner}.{name}: expected {klass.__name__}, got {type(value).__name__} {value!r}"
            )
        return
    if w.primitive is not None:
        check = _PRIMITIVE_CHECKS.get(w.primitive)
        if check and not check(value):
            raise BiDiSerializationError(
                f"{owner}.{name}: expected {w.primitive}, got {type(value).__name__} {value!r}"
            )


class Union:
    """Dispatch base for a discriminated union; subclassed, never instantiated.

    Carries the schema's authoritative ``selector`` as class attributes: a
    discriminator wire key + tag->variant table, and/or presence-ordered rules, and
    an optional declared fallback. Inbound (:meth:`from_json`) resolves a payload to a
    variant; outbound (:meth:`build`) selects the variant a command's kwargs describe.
    """

    _DISCRIMINATOR: str | None = None
    _VARIANTS: dict[Any, str] = {}
    _PRESENCE: tuple[tuple[str, tuple[str, ...]], ...] = ()
    _FALLBACK: str | None = None
    _DISCRIMINATOR_VALUES: frozenset[Any] | None = None
    _OBJECT_ONLY: bool = False

    @classmethod
    def from_json(cls, payload: Any) -> Any:
        if not isinstance(payload, dict):
            # Every arm is an object (the schema's ``objectOnly`` signal), so a
            # non-object payload can match no variant and is a wire error.
            if cls._OBJECT_ONLY:
                got = type(payload).__name__
                raise BiDiSerializationError(f"{cls.__name__} expected an object on the wire, got {got} {payload!r}")
            # A bare scalar arm (e.g. input.Origin's "viewport") has no object to
            # dispatch on, so it is returned unchanged.
            return payload
        variant = cls._select(payload)
        if variant is None:
            raise BiDiSerializationError(
                f"{cls.__name__} received a variant not in this Selenium's BiDi schema: {payload!r}"
            )
        return resolve(variant).from_json(payload)  # type: ignore[attr-defined]

    @classmethod
    def _select(cls, payload: dict) -> str | None:
        if cls._DISCRIMINATOR is not None and cls._DISCRIMINATOR in payload:
            tag = payload[cls._DISCRIMINATOR]
            if tag in cls._VARIANTS:
                return cls._VARIANTS[tag]
        for variant, keys in cls._PRESENCE:
            if all(key in payload for key in keys):
                return variant
        return cls._FALLBACK

    @classmethod
    def build(cls, **kwargs: Any) -> Any:
        cls._validate_discriminator(kwargs)
        variant = cls._outbound(kwargs)
        if variant is None:
            raise BiDiSerializationError(f"no {cls.__name__} variant matches {kwargs!r}")
        klass = resolve(variant)
        provided = {k: v for k, v in kwargs.items() if v is not UNSET}
        fields = {f.name for f in _fields(klass)}
        invalid = set(provided) - fields
        if invalid:
            raise BiDiSerializationError(f"invalid combination for {cls.__name__}: {', '.join(sorted(invalid))}")
        # A baked discriminator (init=False) is forced to its const, so drop it from
        # the constructor kwargs even though it is a valid field to have named.
        settable = {f.name for f in _fields(klass) if _wire_of(f).fixed is UNSET}
        return klass(**{k: v for k, v in provided.items() if k in settable})

    # Outbound-strict (V1): a supplied discriminator must be in the union-wide allowed
    # set, so an invalid value fails locally rather than routing to the fallback variant.
    @classmethod
    def _validate_discriminator(cls, kwargs: dict) -> None:
        if cls._DISCRIMINATOR is None or cls._DISCRIMINATOR_VALUES is None:
            return
        value = kwargs.get(cls._DISCRIMINATOR, UNSET)
        if isinstance(value, Enum):
            value = value.value
        if value is not UNSET and value not in cls._DISCRIMINATOR_VALUES:
            raise BiDiSerializationError(f"{cls.__name__}.{cls._DISCRIMINATOR}: {value!r} is not a valid discriminator")

    @classmethod
    def _outbound(cls, kwargs: dict) -> str | None:
        if cls._DISCRIMINATOR is not None:
            tag = kwargs.get(cls._DISCRIMINATOR, UNSET)
            if isinstance(tag, Enum):
                tag = tag.value
            if tag is not UNSET and tag in cls._VARIANTS:
                return cls._VARIANTS[tag]
        for variant, keys in cls._PRESENCE:
            if all(kwargs.get(key, UNSET) is not UNSET for key in keys):
                return variant
        return cls._FALLBACK
