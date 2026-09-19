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

"""Sweeps every generated BiDi type against the behavioral contract.

The other suites pick representative types; this one covers all of them, because the
contract is checkable independently of how the layer is built and the generator is what
would quietly break it. A lost ``_EXTENSIBLE`` on one record, a required field emitted
optional, a union whose selector names a type nothing registers — each is silent in a
suite that samples, and loud here.

Types are discovered by importing every generated domain module and reading the
serialization registry, so a domain added to the schema is swept without touching this
file. See `docs/decisions/17786-bidi-low-level-behavioral-contract.md`.
"""

import dataclasses
import logging
import pkgutil
from importlib import import_module

import pytest

import selenium.webdriver.common._bidi as bidi_package
from selenium.webdriver.common._bidi.serialization import (
    _REGISTRY,
    UNSET,
    BiDiSerializationError,
    Record,
    Union,
    _Wire,
    resolve,
)

# A record nested more deeply than this is assumed to be a synthesis cycle rather than a real
# type; the affected records are reported rather than dropped quietly (see `unsynthesizable`).
_MAX_DEPTH = 12

_PRIMITIVE_SAMPLES = {"str": "sample", "int": 1, "float": 1.5, "bool": True}

_UNDECLARED_KEY = "__aFieldFromANewerSpec__"


class _Unsynthesizable(Exception):
    """No minimal payload could be built for a type (a cycle, or an unhandled wire shape)."""


def _load_every_generated_module():
    """Import every generated domain module so the registry holds the whole schema."""
    for module in pkgutil.iter_modules(bidi_package.__path__):
        import_module(f"{bidi_package.__name__}.{module.name}")


_load_every_generated_module()

_RECORDS = sorted(
    ((name, cls) for name, cls in _REGISTRY.items() if isinstance(cls, type) and issubclass(cls, Record)),
    key=lambda pair: pair[0],
)
_UNIONS = sorted(
    ((name, cls) for name, cls in _REGISTRY.items() if isinstance(cls, type) and issubclass(cls, Union)),
    key=lambda pair: pair[0],
)


def _wire_of(f):
    wires = [value for value in f.metadata.values() if isinstance(value, _Wire)]
    if len(wires) != 1:
        raise AssertionError(f"field {f.name!r} carries {len(wires)} wire descriptors, expected exactly 1")
    return wires[0]


def _sample_value(w, depth):
    """A minimal valid value for one field, as it would arrive on the wire."""
    if w.fixed is not UNSET:
        return w.fixed
    if w.nullable:
        return None  # a valid value for the field, and it stops the recursion early
    if w.is_list:
        return []  # a list's element type is exercised by the types that declare it directly
    if w.enum is not None:
        return next(iter(resolve(w.enum))).value
    if w.ref is not None:
        return _sample_payload(resolve(w.ref), depth + 1)
    if w.primitive is not None:
        return _PRIMITIVE_SAMPLES[w.primitive]
    return "sample"  # an undeclared/opaque type accepts any JSON value


def _sample_payload(cls, depth=0):
    """A minimal wire payload that should deserialize into ``cls``."""
    if depth > _MAX_DEPTH:
        raise _Unsynthesizable(f"{cls.__name__} nests past depth {_MAX_DEPTH}")
    if issubclass(cls, Union):
        return _sample_payload(resolve(_first_variant(cls)), depth + 1)
    payload = {}
    for f in dataclasses.fields(cls):
        if f.name == "extensions":
            continue
        w = _wire_of(f)
        # An optional field is left out: the point is the *minimal* payload, which is also the
        # one that proves every required field is genuinely required.
        if w.required or w.fixed is not UNSET:
            payload[w.wire] = _sample_value(w, depth)
    return payload


def _first_variant(union):
    for name in list(union._VARIANTS.values()):
        return name
    for name, _ in union._PRESENCE:
        return name
    if union._FALLBACK is not None:
        return union._FALLBACK
    raise _Unsynthesizable(f"{union.__name__} declares no variant")


def _synthesized():
    """``{schema name: (record class, minimal payload)}`` for every record that could be built."""
    built, failed = {}, []
    for name, cls in _RECORDS:
        try:
            built[name] = (cls, _sample_payload(cls))
        except (_Unsynthesizable, RecursionError, KeyError, StopIteration) as exc:
            failed.append(f"{name}: {exc}")
    return built, failed


_SYNTHESIZED, _UNSYNTHESIZABLE = _synthesized()


# --- the sweep covers what it claims to ---


def test_the_registry_holds_the_whole_generated_schema():
    assert len(_RECORDS) > 200, f"only {len(_RECORDS)} records found; did the domain modules import?"
    assert len(_UNIONS) > 10, f"only {len(_UNIONS)} unions found; did the domain modules import?"


def test_every_record_has_a_minimal_payload():
    # A record no payload can be built for is not swept by the behavioral checks below, so it is
    # a failure rather than a silent gap: either the type nests cyclically or its wire shape is
    # one this synthesizer does not model, and both want a human.
    assert _UNSYNTHESIZABLE == []


# --- representation (decisions 1 and 2) ---


@pytest.mark.parametrize(("name", "cls"), _RECORDS, ids=[name for name, _ in _RECORDS])
def test_every_field_declares_its_wire_facts(name, cls):
    for f in dataclasses.fields(cls):
        w = _wire_of(f)
        assert w.wire, f"{name}.{f.name} has no wire name"


@pytest.mark.parametrize(("name", "cls"), _RECORDS, ids=[name for name, _ in _RECORDS])
def test_extensibility_and_the_extras_map_agree(name, cls):
    # Decision 1: an extensible type carries the untyped map, a non-extensible one has no such
    # store. Either half alone would silently change what happens to an undeclared field.
    has_store = any(f.name == "extensions" for f in dataclasses.fields(cls))
    assert cls._EXTENSIBLE == has_store, f"{name}: _EXTENSIBLE={cls._EXTENSIBLE} but extras map present={has_store}"


@pytest.mark.parametrize(("name", "cls"), _UNIONS, ids=[name for name, _ in _UNIONS])
def test_every_union_variant_resolves(name, cls):
    variants = set(cls._VARIANTS.values()) | {variant for variant, _ in cls._PRESENCE}
    if cls._FALLBACK is not None:
        variants.add(cls._FALLBACK)
    assert variants, f"{name} declares no variant to dispatch to"
    for variant in variants:
        assert isinstance(resolve(variant), type), f"{name} names {variant!r}, which does not resolve to a type"


@pytest.mark.parametrize(("name", "cls"), _UNIONS, ids=[name for name, _ in _UNIONS])
def test_a_union_with_a_bare_scalar_arm_pins_its_values(name, cls):
    # A union that is not object-only can receive a bare scalar, and decision 4 admits only the
    # literals the spec pins — so an unpinned scalar arm would accept anything.
    if not cls._OBJECT_ONLY:
        assert cls._SCALAR_VALUES, f"{name} is not object-only but pins no scalar values"


# --- inbound (decisions 7, 8, 9, 10) ---


@pytest.mark.parametrize("name", sorted(_SYNTHESIZED), ids=sorted(_SYNTHESIZED))
def test_a_minimal_payload_round_trips(name):
    cls, payload = _SYNTHESIZED[name]

    obj = cls.from_json(payload)

    assert isinstance(obj, cls)
    # Decision 10: what was received is reproduced, so a second pass yields the same object.
    assert cls.from_json(obj.as_json()) == obj


@pytest.mark.parametrize("name", sorted(_SYNTHESIZED), ids=sorted(_SYNTHESIZED))
def test_dropping_any_required_field_raises(name):
    cls, payload = _SYNTHESIZED[name]
    required = [
        _wire_of(f).wire
        for f in dataclasses.fields(cls)
        # A baked discriminator is forced rather than read, so its absence is not an error.
        if f.name != "extensions" and _wire_of(f).required and _wire_of(f).fixed is UNSET
    ]

    for wire in required:
        short = {k: v for k, v in payload.items() if k != wire}
        with pytest.raises(BiDiSerializationError, match=r"missing required"):
            cls.from_json(short)


@pytest.mark.parametrize("name", sorted(_SYNTHESIZED), ids=sorted(_SYNTHESIZED))
def test_an_undeclared_field_is_kept_or_dropped_by_extensibility(name, caplog):
    # Decision 9: a remote end on a newer spec version must not break the binding, whichever
    # way the type handles the field it adds.
    cls, payload = _SYNTHESIZED[name]

    with caplog.at_level(logging.WARNING):
        obj = cls.from_json({**payload, _UNDECLARED_KEY: "value"})

    if cls._EXTENSIBLE:
        assert obj.extensions == {_UNDECLARED_KEY: "value"}
        assert not [r for r in caplog.records if _UNDECLARED_KEY in r.getMessage()]
    else:
        assert [r for r in caplog.records if _UNDECLARED_KEY in r.getMessage()], "undeclared field dropped silently"


@pytest.mark.parametrize("name", sorted(_SYNTHESIZED), ids=sorted(_SYNTHESIZED))
def test_a_non_object_payload_raises(name):
    cls, _ = _SYNTHESIZED[name]

    with pytest.raises(BiDiSerializationError, match=r"expected an object on the wire"):
        cls.from_json("not-an-object")


# --- outbound (decisions 5 and 6) ---


@pytest.mark.parametrize("name", sorted(_SYNTHESIZED), ids=sorted(_SYNTHESIZED))
def test_a_deserialized_record_serializes_back_to_its_payload(name):
    cls, payload = _SYNTHESIZED[name]

    assert cls.from_json(payload).as_json() == payload


@pytest.mark.parametrize("name", sorted(_SYNTHESIZED), ids=sorted(_SYNTHESIZED))
def test_a_non_extensible_record_cannot_carry_an_extra(name):
    # Decision 6: an extra field can only be sent on an extensible type, and the absence of the
    # map is what makes that structural rather than a rule to enforce.
    cls, _ = _SYNTHESIZED[name]

    if not cls._EXTENSIBLE:
        assert "extensions" not in {f.name for f in dataclasses.fields(cls)}
