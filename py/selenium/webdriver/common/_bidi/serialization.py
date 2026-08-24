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
from collections.abc import Callable
from dataclasses import dataclass
from enum import Enum
from importlib import import_module
from typing import Any

from selenium.common.exceptions import WebDriverException

logger = logging.getLogger(__name__)


class BiDiSerializationError(WebDriverException):
    """A payload could not be (de)serialized against this Selenium's BiDi schema."""


# Cap how many key names one message spells out, so a payload with many unknown/absent keys
# yields a bounded log line / exception message instead of one built from every remote-supplied
# key; the remainder is summarized as a count.
_MAX_KEYS_SHOWN = 10


def _summarize(owner: str, kind: str, keys: list[str], suffix: str) -> str:
    """A bounded ``owner: kind 'a', 'b', … (+N more) (suffix)`` message."""
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
    target = f"{__package__}.{_camel_to_snake(schema_name.split('.', 1)[0])}"
    try:
        import_module(target)
    except ModuleNotFoundError as exc:
        # Only the target module itself being absent means "unknown type" (handled below). If the
        # module exists but one of *its* imports is missing, surface that real failure rather than
        # masking it — likewise a non-ModuleNotFoundError ImportError propagates untouched.
        if exc.name != target:
            raise
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
    corrupt value or a missing required field, and tolerates only an undeclared property,
    so a browser that adds a field does not break a client generated from an older schema.
    """

    _EXTENSIBLE: bool = False

    def __post_init__(self) -> None:
        for f in _fields(self):
            if f.name == "extensions":
                continue
            w = _wire_of(f)
            value = getattr(self, f.name)
            if w.fixed is not UNSET:
                # A baked discriminator (non-nullable) is forced to its const. A nullable constant
                # is settable and must be its literal or null.
                if w.nullable and value is not UNSET and value is not None and value != w.fixed:
                    raise BiDiSerializationError(
                        f"{type(self).__name__}.{f.name}: {value!r} must be {w.fixed!r} or None"
                    )
                continue
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
        declared: set[str] = set()
        for f in _fields(self):
            if f.name == "extensions":
                continue
            w = _wire_of(f)
            declared.add(w.wire)
            value = getattr(self, f.name)
            if value is UNSET:
                # The constructor already requires every required field; this backstops a
                # caller that passed the UNSET sentinel explicitly, so an unset required
                # field can never reach the wire as an omission.
                if w.required:
                    raise BiDiSerializationError(f"{type(self).__name__}.{f.name}: required {w.wire!r} is not set")
                continue
            if value is None and not w.nullable:
                continue
            _validate_outbound(type(self).__name__, f.name, w, value)
            payload[w.wire] = _as_json(value)
        if self._EXTENSIBLE:
            extras = getattr(self, "extensions", None) or {}
            # A key the type declares must never appear in the extras map, so an
            # extra can never shadow a declared field on the wire — whether or not that field is set.
            shadowed = [k for k in extras if k in declared]
            if shadowed:
                raise BiDiSerializationError(
                    _summarize(type(self).__name__, "extension shadows declared field", shadowed, "not allowed")
                )
            payload.update({k: _as_json(v) for k, v in extras.items()})
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
            # A baked discriminator (non-nullable const) is forced, not read from the wire; a
            # nullable const is read and held to its literal-or-null like any field (in _read_scalar).
            if (w.fixed is not UNSET and not w.nullable) or f.name == "extensions":
                continue
            if w.wire not in payload:
                if w.required:
                    missing_required.append(w.wire)
                kwargs[f.name] = UNSET
                continue
            kwargs[f.name] = _read_field(cls, f.name, w, payload)
        undeclared = [k for k in payload if k not in known]
        # A required field the remote omitted cannot yield a valid object, so it errors rather
        # than leaving a hole a caller cannot distinguish from a real value. An undeclared field
        # on an extensible type is spec-sanctioned, not a deviation: it is preserved in the extras
        # map silently. On a non-extensible type it is a deviation: warn and drop. Both messages
        # name at most a bounded number of keys, so a verbose payload cannot flood the log.
        if missing_required:
            raise BiDiSerializationError(
                _summarize(cls.__name__, "missing required", missing_required, "absent from the response")
            )
        if cls._EXTENSIBLE:
            kwargs["extensions"] = {k: payload[k] for k in undeclared}
        elif undeclared:
            logger.warning(_summarize(cls.__name__, "undeclared", undeclared, "dropped"))
        return cls(**kwargs)


def _read_field(cls: type, name: str, w: _Wire, payload: dict) -> Any:
    # Called only for a field present on the wire; from_json handles an absent field (an absent
    # required one errors there, in one bounded message naming every field that was missing).
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


def _is_whole(value: Any) -> bool:
    # A browser is free to encode a whole number either way (JS has no int/float split), so
    # ``5`` and ``5.0`` are both integers on the wire; only a fractional value is a mismatch.
    if isinstance(value, bool):
        return False
    if isinstance(value, int):
        return True
    return isinstance(value, float) and value.is_integer()


# JSON value -> the Python types a schema primitive accepts. A primitive matches by JSON kind,
# not Python type: ``integer`` admits any whole number, ``number`` an int or a float. ``bool``
# is excluded from the numeric checks: it is an ``int`` subclass but is not a number.
_PRIMITIVE_CHECKS = {
    "str": lambda v: isinstance(v, str),
    "bool": lambda v: isinstance(v, bool),
    "int": _is_whole,
    "float": lambda v: isinstance(v, (int, float)) and not isinstance(v, bool),
}


def _read_scalar(cls: type, name: str, w: _Wire, raw: Any) -> Any:
    if w.fixed is not UNSET:
        # A nullable constant (a non-nullable one is baked and never read): the wire value must be
        # the literal, else it is invalid. A null took the nullable
        # path in _read_field before reaching here.
        if raw != w.fixed:
            raise BiDiSerializationError(f"{cls.__name__}.{name}: {raw!r} is not the constant {w.fixed!r}")
        return raw
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
        if w.primitive == "int" and isinstance(raw, float):
            # A whole number is exact in both types, so the declared type is held with nothing lost.
            return int(raw)
    return raw


def _validate_outbound(owner: str, name: str, w: _Wire, value: Any) -> None:
    """Reject an outbound value that violates its wire type before it is sent.

    A caller mistake — a wrong primitive, a scalar where a list is expected, a raw dict where a
    typed record belongs — surfaces here as a local error rather than a remote protocol error.
    """
    if value is None:
        return  # nullability is handled by as_json
    if w.is_list:
        if not isinstance(value, list):
            raise BiDiSerializationError(f"{owner}.{name}: expected a list, got {type(value).__name__} {value!r}")
        validate_item = _validate_outbound_map_entry if w.scalar is not None else _validate_outbound_scalar
        for item in value:
            validate_item(owner, name, w, item)
        return
    _validate_outbound_scalar(owner, name, w, value)


def _validate_ref_value(owner: str, name: str, klass: Any, value: Any) -> None:
    """Validate an outbound value against its ref type: a record instance, or a union variant.

    A record ref requires an instance of that record; a union ref requires one of its variants (or a
    permitted bare scalar). An enum or opaque ref is left permissive, matching the inbound reader.
    """
    if isinstance(klass, type) and issubclass(klass, Record):
        if not isinstance(value, klass):
            raise BiDiSerializationError(
                f"{owner}.{name}: expected {klass.__name__}, got {type(value).__name__} {value!r}"
            )
    elif isinstance(klass, type) and issubclass(klass, Union):
        klass.validate_outbound(owner, name, value)


def _validate_outbound_map_entry(owner: str, name: str, w: _Wire, element: Any) -> None:
    """Validate one outbound ``[key, value]`` map entry: pair shape, key type, object-only value.

    Mirrors the inbound :func:`_read_map_entry` checks: an object key is a valid variant of the ref
    and a bare-scalar key must match the arm's ``scalar`` primitive, while the value is always a
    variant object of the ref.
    """
    if not (isinstance(element, list) and len(element) == 2):
        raise BiDiSerializationError(f"{owner}.{name}: expected a [key, value] pair, got {element!r}")
    key, value = element
    klass = resolve(w.ref)  # type: ignore[arg-type]
    if isinstance(key, Record):
        _validate_ref_value(owner, name, klass, key)
    else:
        scalars = [s for s in (w.scalar if isinstance(w.scalar, list) else [w.scalar]) if s is not None]
        checks = [_PRIMITIVE_CHECKS[s] for s in scalars if s in _PRIMITIVE_CHECKS]
        if checks and not any(check(key) for check in checks):
            raise BiDiSerializationError(
                f"{owner}.{name}: map key expected {' or '.join(scalars)}, got {type(key).__name__} {key!r}"
            )
    if not isinstance(value, Record):
        raise BiDiSerializationError(
            f"{owner}.{name}: map value expected an object, got {type(value).__name__} {value!r}"
        )
    _validate_ref_value(owner, name, klass, value)


def _validate_outbound_scalar(owner: str, name: str, w: _Wire, value: Any) -> None:
    if value is None:
        return  # null is handled upstream
    if w.enum is not None:
        return  # enum membership is validated at construction (__post_init__)
    if w.ref is not None:
        _validate_ref_value(owner, name, resolve(w.ref), value)
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
    _SCALAR_VALUES: frozenset = frozenset()
    _VARIANT_CLASSES: tuple[type, ...] | None = None  # per-subclass cache; see _variant_classes

    @classmethod
    def _variant_classes(cls) -> tuple[type, ...]:
        """The record classes this union resolves to, recursing through nested union arms.

        A union arm may itself be a union (e.g. ``LocalValue`` includes the ``RemoteReference``
        union, whose arms are ``SharedReference``/``RemoteObjectReference``), so a value can be a
        valid member transitively. Inbound dispatch recurses through ``from_json``; this mirrors it.

        Cached per class after the first call: a union's variant set is fixed by the schema, and
        outbound validation only runs once the value's whole type graph is imported and registered,
        so the first computation is complete. ``__dict__`` keeps the cache off the shared base class.
        """
        cached = cls.__dict__.get("_VARIANT_CLASSES")
        if cached is not None:
            return cached
        classes: list[type] = []
        seen: set[type] = set()

        def collect(union: type[Union]) -> None:
            if union in seen:
                return
            seen.add(union)
            names = set(union._VARIANTS.values())
            names.update(variant for variant, _ in union._PRESENCE)
            if union._FALLBACK is not None:
                names.add(union._FALLBACK)
            for n in names:
                klass = resolve(n)
                if isinstance(klass, type) and issubclass(klass, Union):
                    collect(klass)
                elif isinstance(klass, type):
                    classes.append(klass)

        collect(cls)
        cls._VARIANT_CLASSES = tuple(classes)
        return cls._VARIANT_CLASSES

    @classmethod
    def validate_outbound(cls, owner: str, name: str, value: Any) -> None:
        """Reject an outbound value that is not one of this union's variants.

        A variant instance passes. A bare scalar passes only for a union that has a scalar arm, and
        only as one of the literals that arm declares, so a stray string is a caller error rather
        than a wire round-trip. This mirrors inbound dispatch, which errors on the same values.
        """
        if isinstance(value, Record):
            if not isinstance(value, cls._variant_classes()):
                raise BiDiSerializationError(
                    f"{owner}.{name}: {type(value).__name__} is not a variant of {cls.__name__}"
                )
            return
        if cls._OBJECT_ONLY:
            got = type(value).__name__
            raise BiDiSerializationError(
                f"{owner}.{name}: expected an object variant of {cls.__name__}, got {got} {value!r}"
            )
        if value not in cls._SCALAR_VALUES:
            expected = ", ".join(repr(v) for v in sorted(cls._SCALAR_VALUES))
            raise BiDiSerializationError(f"{owner}.{name}: {value!r} is not one of {cls.__name__}'s arms ({expected})")

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
