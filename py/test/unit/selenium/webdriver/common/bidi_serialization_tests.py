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

"""Unit tests for the hand-written BiDi serialization runtime.

Exercises `selenium.webdriver.common._bidi.serialization` — the Record/Union/UNSET
machinery every generated module builds on — in isolation, using small value
types declared here the way the generator emits them. The generated modules are
covered by the command-surface and browser round-trip tests; the subject here is
the runtime's own rules: boundary validation (tolerant inbound vs. strict mode),
UNSET omit-vs-null, and union dispatch.
"""

import logging
from dataclasses import dataclass, field
from enum import Enum
from typing import Any

import pytest

from selenium.webdriver.common._bidi.serialization import (
    UNSET,
    BiDiSerializationError,
    Record,
    Union,
    UnsetType,
    meta,
    register,
    resolve,
)

# --- fixtures: value types declared the way the generator emits them ---


@register("test.Color")
class Color(str, Enum):
    RED = "red"
    BLUE = "blue"


@register("test.Point")
@dataclass(frozen=True)
class Point(Record):
    x: int = field(metadata=meta("x", required=True, primitive="int"))
    y: int = field(metadata=meta("y", required=True, primitive="int"))


@register("test.Optionals")
@dataclass(frozen=True)
class Optionals(Record):
    req: str = field(metadata=meta("req", required=True, primitive="str"))
    nullable: str | None = field(metadata=meta("nullable", required=True, nullable=True, primitive="str"))
    opt: str | UnsetType = field(default=UNSET, metadata=meta("opt", primitive="str"))


@register("test.Scalars")
@dataclass(frozen=True)
class Scalars(Record):
    count: int = field(metadata=meta("count", required=True, primitive="int"))
    ratio: float = field(metadata=meta("ratio", required=True, primitive="float"))
    flag: bool = field(metadata=meta("flag", required=True, primitive="bool"))
    name: str = field(metadata=meta("name", required=True, primitive="str"))


@register("test.Painted")
@dataclass(frozen=True)
class Painted(Record):
    color: Color = field(metadata=meta("color", required=True, enum="test.Color"))


@register("test.Tags")
@dataclass(frozen=True)
class Tags(Record):
    tags: list[str] = field(metadata=meta("tags", required=True, is_list=True, primitive="str"))


@register("test.Line")
@dataclass(frozen=True)
class Line(Record):
    start: Point = field(metadata=meta("start", required=True, ref="test.Point"))


@register("test.Path")
@dataclass(frozen=True)
class Path(Record):
    points: list[Point] = field(metadata=meta("points", required=True, ref="test.Point", is_list=True))


@register("test.Extensible")
@dataclass(frozen=True)
class Extensible(Record):
    _EXTENSIBLE = True

    known: str = field(metadata=meta("known", required=True, primitive="str"))
    extensions: dict[str, Any] | UnsetType = field(default=UNSET, metadata=meta("extensions"))


@register("test.NullableConst")
@dataclass(frozen=True)
class NullableConst(Record):
    # Mirrors the generated shape of a spec ``flag: true / null`` field: a settable, nullable
    # constant held to its literal-or-null rather than a baked (forced) discriminator.
    flag: bool | None = field(metadata=meta("flag", required=True, nullable=True, fixed=True))


@register("test.Cat")
@dataclass(frozen=True)
class Cat(Record):
    meow: str = field(metadata=meta("meow", required=True, primitive="str"))
    kind: str = field(default="cat", init=False, metadata=meta("kind", required=True, fixed="cat"))


@register("test.Dog")
@dataclass(frozen=True)
class Dog(Record):
    bark: str = field(metadata=meta("bark", required=True, primitive="str"))
    kind: str = field(default="dog", init=False, metadata=meta("kind", required=True, fixed="dog"))


@register("test.Animal")
class Animal(Union):
    _DISCRIMINATOR = "kind"
    _VARIANTS = {"cat": "test.Cat", "dog": "test.Dog"}
    _DISCRIMINATOR_VALUES = frozenset({"cat", "dog"})


@register("test.Fallback")
class Fallback(Union):
    _DISCRIMINATOR = "kind"
    _VARIANTS = {"cat": "test.Cat"}
    _FALLBACK = "test.Dog"
    _DISCRIMINATOR_VALUES = frozenset({"cat"})


@register("test.Circle")
@dataclass(frozen=True)
class Circle(Record):
    radius: int = field(metadata=meta("radius", required=True, primitive="int"))


@register("test.Rect")
@dataclass(frozen=True)
class Rect(Record):
    width: int = field(metadata=meta("width", required=True, primitive="int"))
    height: int = field(metadata=meta("height", required=True, primitive="int"))


@register("test.Shape")
class Shape(Union):
    _PRESENCE = (("test.Circle", ("radius",)), ("test.Rect", ("width", "height")))
    _SCALAR_VALUES = frozenset({"blob"})


@register("test.BareOrObject")
class BareOrObject(Union):
    _DISCRIMINATOR = "type"
    _VARIANTS = {}


@register("test.ObjectOnly")
class ObjectOnly(Union):
    _DISCRIMINATOR = "kind"
    _VARIANTS = {"cat": "test.Cat", "dog": "test.Dog"}
    _OBJECT_ONLY = True


@register("test.StringMap")
@dataclass(frozen=True)
class StringMap(Record):
    # A map encoded as [key, value] pairs the way the generator emits one: the value
    # type is an object-only union and `scalar` lets a bare-string key pass through
    # (an object key still deserializes), while the value must stay an object.
    value: list[list[Any]] = field(
        metadata=meta("value", required=True, ref="test.ObjectOnly", is_list=True, scalar="str")
    )


@register("test.NestedUnion")
class NestedUnion(Union):
    # An arm that is itself a union (ObjectOnly), plus a direct record arm (Circle): a value can be
    # a member transitively (like LocalValue including the RemoteReference union).
    _PRESENCE = (("test.ObjectOnly", ("kind",)), ("test.Circle", ("radius",)))


@register("test.UnionField")
@dataclass(frozen=True)
class UnionField(Record):
    # A record with union-typed fields: `obj` is object-only, `shape` is not (it has scalar arms).
    obj: Any = field(default=UNSET, metadata=meta("obj", ref="test.ObjectOnly"))
    shape: Any = field(default=UNSET, metadata=meta("shape", ref="test.Shape"))
    nested: Any = field(default=UNSET, metadata=meta("nested", ref="test.NestedUnion"))


# --- UNSET sentinel ---


def test_unset_is_a_singleton():
    assert UnsetType() is UNSET


def test_unset_is_falsy():
    assert not UNSET


def test_unset_repr():
    assert repr(UNSET) == "UNSET"


# --- registry ---


def test_resolve_returns_the_registered_class():
    assert resolve("test.Point") is Point


def test_resolve_unknown_raises():
    with pytest.raises(BiDiSerializationError, match=r"unknown BiDi type 'test.Nope'"):
        resolve("test.Nope")


def test_resolve_lazily_imports_the_owning_module_on_a_cross_domain_miss(monkeypatch):
    # Cross-domain refs are only TYPE_CHECKING imports, so a type may be unregistered until its
    # module is imported. On a miss, resolve imports `_bidi.<domain>` (camelCase -> snake) — which
    # would run that module's @register — and retries; here the fake import registers nothing, so
    # it still raises, but must have tried the correctly-mapped module.
    from selenium.webdriver.common._bidi import serialization as _ser

    calls: list[str] = []
    monkeypatch.setattr(_ser, "import_module", lambda name: calls.append(name))
    with pytest.raises(BiDiSerializationError):
        resolve("lazyDomain.LazyType")
    assert calls == ["selenium.webdriver.common._bidi.lazy_domain"]


def test_resolve_reports_unknown_type_when_the_owning_module_is_absent(monkeypatch):
    from selenium.webdriver.common._bidi import serialization as _ser

    def module_absent(name):
        raise ModuleNotFoundError(f"No module named {name!r}", name=name)  # the target itself is missing

    monkeypatch.setattr(_ser, "import_module", module_absent)
    with pytest.raises(BiDiSerializationError, match=r"unknown BiDi type 'noSuchDomain.Type'"):
        resolve("noSuchDomain.Type")


def test_resolve_reraises_a_dependency_import_failure_instead_of_masking_it(monkeypatch):
    # The owning module exists but one of *its* imports is missing: surface that, don't report it
    # as an unknown type.
    from selenium.webdriver.common._bidi import serialization as _ser

    def dependency_missing(name):
        raise ModuleNotFoundError("No module named 'thirdparty'", name="thirdparty")

    monkeypatch.setattr(_ser, "import_module", dependency_missing)
    with pytest.raises(ModuleNotFoundError, match=r"thirdparty"):
        resolve("someDomain.SomeType")


# --- outbound: as_json ---


def test_as_json_maps_field_names_to_wire_keys():
    assert Point(x=1, y=2).as_json() == {"x": 1, "y": 2}


def test_as_json_omits_unset_but_emits_explicit_null_for_nullable():
    assert Optionals(req="r", nullable=None).as_json() == {"req": "r", "nullable": None}


def test_round_trips_through_the_wire():
    assert Point.from_json(Point(x=1, y=2).as_json()) == Point(x=1, y=2)


# --- outbound value validation (as_json) ---


def test_as_json_accepts_valid_outbound_values():
    assert Line(start=Point(x=1, y=2)).as_json() == {"start": {"x": 1, "y": 2}}
    assert Tags(tags=["a", "b"]).as_json() == {"tags": ["a", "b"]}


def test_as_json_rejects_a_wrong_typed_primitive():
    with pytest.raises(BiDiSerializationError, match=r"Point.x: expected int, got str"):
        Point(x="nope", y=2).as_json()


def test_as_json_rejects_a_fractional_value_on_an_integer_field():
    with pytest.raises(BiDiSerializationError, match=r"Point.x: expected int, got float"):
        Point(x=1.5, y=2).as_json()


def test_as_json_rejects_a_scalar_where_a_list_is_expected():
    with pytest.raises(BiDiSerializationError, match=r"Tags.tags: expected a list"):
        Tags(tags="a").as_json()


def test_as_json_rejects_a_raw_dict_where_a_typed_record_is_expected():
    with pytest.raises(BiDiSerializationError, match=r"Line.start: expected Point, got dict"):
        Line(start={"x": 1, "y": 2}).as_json()


def test_as_json_rejects_a_wrong_typed_item_in_a_list_of_records():
    with pytest.raises(BiDiSerializationError, match=r"Path.points: expected Point, got dict"):
        Path(points=[Point(x=1, y=2), {"x": 3, "y": 4}]).as_json()


def test_as_json_serializes_a_valid_map():
    assert StringMap(value=[["k", Cat(meow="hi")]]).as_json() == {"value": [["k", {"meow": "hi", "kind": "cat"}]]}


def test_as_json_rejects_a_malformed_map_pair():
    with pytest.raises(BiDiSerializationError, match=r"StringMap.value: expected a \[key, value\] pair"):
        StringMap(value=[["k"]]).as_json()


def test_as_json_rejects_a_wrong_typed_map_key():
    with pytest.raises(BiDiSerializationError, match=r"StringMap.value: map key expected str, got int"):
        StringMap(value=[[5, Cat(meow="hi")]]).as_json()


def test_as_json_rejects_a_non_object_map_value():
    with pytest.raises(BiDiSerializationError, match=r"StringMap.value: map value expected an object, got str"):
        StringMap(value=[["k", "not-an-object"]]).as_json()


def test_as_json_rejects_a_non_variant_object_map_value():
    with pytest.raises(BiDiSerializationError, match=r"StringMap.value: Circle is not a variant of ObjectOnly"):
        StringMap(value=[["k", Circle(radius=1)]]).as_json()


# --- outbound union fields ---


def test_as_json_serializes_a_valid_union_variant():
    assert UnionField(obj=Cat(meow="hi")).as_json() == {"obj": {"meow": "hi", "kind": "cat"}}
    assert UnionField(shape=Circle(radius=1)).as_json() == {"shape": {"radius": 1}}


def test_as_json_rejects_a_non_variant_object_on_a_union_field():
    with pytest.raises(BiDiSerializationError, match=r"UnionField.obj: Circle is not a variant of ObjectOnly"):
        UnionField(obj=Circle(radius=1)).as_json()


def test_as_json_rejects_a_scalar_on_an_object_only_union_field():
    with pytest.raises(BiDiSerializationError, match=r"UnionField.obj: expected an object variant of ObjectOnly"):
        UnionField(obj="cat").as_json()


def test_as_json_allows_a_pinned_bare_scalar_on_a_non_object_only_union_field():
    # Shape has a scalar arm (not object-only), so its pinned literal passes as inbound would return it.
    assert UnionField(shape="blob").as_json() == {"shape": "blob"}


def test_as_json_rejects_an_unpinned_bare_scalar_on_a_non_object_only_union_field():
    with pytest.raises(BiDiSerializationError, match=r"UnionField.shape: 'whatever' is not one of Shape's arms"):
        UnionField(shape="whatever").as_json()


def test_as_json_accepts_a_transitively_nested_union_variant():
    # Cat is a variant of ObjectOnly, which is itself an arm of NestedUnion — valid transitively.
    assert UnionField(nested=Cat(meow="hi")).as_json() == {"nested": {"meow": "hi", "kind": "cat"}}


def test_as_json_rejects_an_object_outside_a_nested_union():
    with pytest.raises(BiDiSerializationError, match=r"UnionField.nested: Rect is not a variant of NestedUnion"):
        UnionField(nested=Rect(width=1, height=2)).as_json()


def test_a_unions_variant_classes_are_computed_once_and_cached():
    # The transitive variant set is fixed by the schema, so it is memoized per class rather than
    # rebuilt on every outbound validation.
    first = NestedUnion._variant_classes()
    assert NestedUnion._variant_classes() is first
    assert Cat in first  # transitively, via the ObjectOnly arm


# --- inbound: required / optional / null ---


def test_a_missing_required_field_inbound_is_an_error():
    with pytest.raises(BiDiSerializationError, match=r"missing required 'y'"):
        Point.from_json({"x": 1})


def test_every_missing_required_field_is_named_in_one_error():
    with pytest.raises(BiDiSerializationError, match=r"missing required 'x', 'y'"):
        Point.from_json({})


def test_as_json_errors_when_a_required_field_is_unset():
    # Nothing inbound can leave a required field unset any more, but a caller can pass the
    # sentinel, and outbound requires every required field, so serializing one errors.
    incomplete = Point(x=1, y=UNSET)
    with pytest.raises(BiDiSerializationError, match=r"Point.y: required 'y' is not set"):
        incomplete.as_json()


def test_from_json_with_a_non_object_payload_raises_a_serialization_error():
    with pytest.raises(BiDiSerializationError, match=r"Point expected an object on the wire, got str"):
        Point.from_json("not-an-object")


def test_missing_optional_field_becomes_unset():
    assert Optionals.from_json({"req": "r", "nullable": "n"}).opt is UNSET


def test_explicit_null_for_a_nullable_field_becomes_none():
    assert Optionals.from_json({"req": "r", "nullable": None}).nullable is None


def test_explicit_null_for_a_non_nullable_field_raises():
    with pytest.raises(BiDiSerializationError, match=r"Point.x received null but is not nullable"):
        Point.from_json({"x": None, "y": 2})


# --- construction-time validation (__post_init__) ---


def test_constructing_with_none_for_a_non_nullable_field_raises():
    with pytest.raises(BiDiSerializationError, match=r"Point.x cannot be None"):
        Point(x=None, y=2)


def test_constructing_with_an_invalid_enum_value_raises():
    with pytest.raises(BiDiSerializationError, match=r"is not a valid Color"):
        Painted(color="green")


def test_constructing_with_a_valid_enum_member_is_accepted():
    assert Painted(color=Color.RED).as_json() == {"color": "red"}


# --- strict primitive checks (inbound) ---


def test_integer_rejects_a_fractional_float():
    with pytest.raises(BiDiSerializationError, match=r"expected int"):
        Scalars.from_json({"count": 1.5, "ratio": 1.0, "flag": True, "name": "n"})


def test_integer_accepts_a_whole_valued_float_and_holds_it_as_an_int():
    parsed = Scalars.from_json({"count": 5.0, "ratio": 1.0, "flag": True, "name": "n"})
    assert parsed.count == 5
    assert isinstance(parsed.count, int)


def test_integer_rejects_a_bool():
    with pytest.raises(BiDiSerializationError, match=r"expected int"):
        Scalars.from_json({"count": True, "ratio": 1.0, "flag": True, "name": "n"})


def test_number_accepts_both_int_and_float():
    assert Scalars.from_json({"count": 1, "ratio": 2, "flag": True, "name": "n"}).ratio == 2
    assert Scalars.from_json({"count": 1, "ratio": 2.5, "flag": True, "name": "n"}).ratio == 2.5


def test_number_rejects_a_bool():
    with pytest.raises(BiDiSerializationError, match=r"expected float"):
        Scalars.from_json({"count": 1, "ratio": True, "flag": True, "name": "n"})


def test_bool_accepts_a_bool_but_rejects_an_int():
    assert Scalars.from_json({"count": 1, "ratio": 1.0, "flag": False, "name": "n"}).flag is False
    with pytest.raises(BiDiSerializationError, match=r"expected bool"):
        Scalars.from_json({"count": 1, "ratio": 1.0, "flag": 1, "name": "n"})


def test_string_rejects_a_number():
    with pytest.raises(BiDiSerializationError, match=r"expected str"):
        Scalars.from_json({"count": 1, "ratio": 1.0, "flag": True, "name": 3})


# --- list vs scalar shape ---


def test_a_scalar_for_a_list_field_raises():
    with pytest.raises(BiDiSerializationError, match=r"expected a list"):
        Tags.from_json({"tags": "a"})


def test_a_list_for_a_scalar_field_raises():
    with pytest.raises(BiDiSerializationError, match=r"expected a single value"):
        Point.from_json({"x": [1], "y": 2})


def test_a_list_of_primitives_round_trips():
    assert Tags.from_json({"tags": ["a", "b"]}).tags == ["a", "b"]


# --- nested refs ---


def test_a_nested_record_round_trips():
    line = Line.from_json({"start": {"x": 1, "y": 2}})
    assert line.start == Point(x=1, y=2)
    assert line.as_json() == {"start": {"x": 1, "y": 2}}


def test_a_non_object_for_a_record_ref_raises():
    with pytest.raises(BiDiSerializationError, match=r"Line.start: expected an object"):
        Line.from_json({"start": "nope"})


def test_a_list_of_records_round_trips():
    path = Path.from_json({"points": [{"x": 1, "y": 2}, {"x": 3, "y": 4}]})
    assert path.points == [Point(x=1, y=2), Point(x=3, y=4)]


# --- enum inbound ---


def test_an_inbound_enum_token_is_restored_to_its_member():
    assert Painted.from_json({"color": "blue"}).color is Color.BLUE


def test_an_inbound_enum_value_outside_the_schema_raises():
    with pytest.raises(BiDiSerializationError, match=r"is not a valid Color"):
        Painted.from_json({"color": "green"})


# --- extensible records ---


def test_an_extensible_record_keeps_undeclared_properties_silently(caplog):
    # An undeclared field on an extensible type is spec-sanctioned (preserved), not a deviation,
    # so it is kept without a warning.
    with caplog.at_level(logging.WARNING):
        result = Extensible.from_json({"known": "k", "extra": "e", "more": 1})
    assert result.extensions == {"extra": "e", "more": 1}
    assert caplog.records == []


def test_an_extensible_record_merges_captured_keys_back_on_serialization():
    assert Extensible(known="k", extensions={"extra": "e"}).as_json() == {"known": "k", "extra": "e"}


def test_an_extension_may_not_shadow_a_declared_field_on_serialization():
    # A key the type declares must never appear in the extras map, so an extra
    # cannot overwrite a declared field on the wire.
    with pytest.raises(BiDiSerializationError, match=r"shadows declared field 'known'"):
        Extensible(known="k", extensions={"known": "evil"}).as_json()


# --- nullable constants ---


def test_a_nullable_constant_accepts_its_literal_and_null_outbound():
    assert NullableConst(flag=True).as_json() == {"flag": True}
    assert NullableConst(flag=None).as_json() == {"flag": None}


def test_a_nullable_constant_rejects_a_non_literal_outbound():
    with pytest.raises(BiDiSerializationError, match=r"flag: False must be True or None"):
        NullableConst(flag=False)


def test_a_nullable_constant_accepts_its_literal_and_null_inbound():
    assert NullableConst.from_json({"flag": True}) == NullableConst(flag=True)
    assert NullableConst.from_json({"flag": None}) == NullableConst(flag=None)


def test_a_nullable_constant_rejects_a_non_literal_inbound():
    with pytest.raises(BiDiSerializationError, match=r"flag: False is not the constant True"):
        NullableConst.from_json({"flag": False})


def test_a_closed_record_drops_and_warns_on_undeclared_properties(caplog):
    with caplog.at_level(logging.WARNING):
        result = Point.from_json({"x": 1, "y": 2, "z": 3})
    assert result == Point(x=1, y=2)
    assert "'z'" in caplog.text


def test_many_undeclared_properties_warn_once_for_the_record_not_once_per_key(caplog):
    with caplog.at_level(logging.WARNING):
        Point.from_json({"x": 1, "y": 2, "a": 1, "b": 2, "c": 3})
    undeclared_warnings = [r for r in caplog.records if "undeclared" in r.getMessage()]
    assert len(undeclared_warnings) == 1
    assert "'a'" in caplog.text
    assert "'b'" in caplog.text
    assert "'c'" in caplog.text


def test_a_flood_of_undeclared_properties_is_summarized_rather_than_dumped(caplog):
    payload = {"x": 1, "y": 2, **{f"k{i}": i for i in range(50)}}
    with caplog.at_level(logging.WARNING):
        Point.from_json(payload)
    assert "'k0'" in caplog.text  # first few named
    assert "'k49'" not in caplog.text  # the rest omitted
    assert "more)" in caplog.text  # summarized as a count


# --- union dispatch: inbound ---


def test_a_discriminated_union_dispatches_by_its_tag():
    assert Animal.from_json({"kind": "cat", "meow": "hi"}) == Cat(meow="hi")


def test_a_structural_union_dispatches_by_which_fields_are_present():
    assert Shape.from_json({"radius": 5}) == Circle(radius=5)
    assert Shape.from_json({"width": 3, "height": 4}) == Rect(width=3, height=4)


def test_an_unknown_discriminator_falls_back_to_the_declared_variant():
    assert Fallback.from_json({"kind": "fish", "bark": "woof"}) == Dog(bark="woof")


def test_a_bare_scalar_arm_is_returned_unchanged():
    assert BareOrObject.from_json("viewport") == "viewport"


def test_a_variant_outside_the_schema_raises_instead_of_passing_through():
    with pytest.raises(BiDiSerializationError, match=r"not in this Selenium's BiDi schema"):
        Animal.from_json({"kind": "fish"})


# --- object-only unions: a non-object payload is a wire error, not a scalar arm ---


def test_an_object_only_union_still_dispatches_an_object():
    assert ObjectOnly.from_json({"kind": "cat", "meow": "hi"}) == Cat(meow="hi")


def test_an_object_only_union_rejects_a_non_object():
    with pytest.raises(BiDiSerializationError, match=r"expected an object on the wire"):
        ObjectOnly.from_json("viewport")


# --- scalar map entries: object-only value, but a bare-string key still passes ---


def test_a_map_entry_deserializes_object_key_and_value():
    payload = {"value": [[{"kind": "cat", "meow": "a"}, {"kind": "dog", "bark": "b"}]]}
    assert StringMap.from_json(payload).value == [[Cat(meow="a"), Dog(bark="b")]]


def test_a_map_entry_passes_a_bare_string_key_through():
    assert StringMap.from_json({"value": [["k", {"kind": "cat", "meow": "a"}]]}).value == [["k", Cat(meow="a")]]


def test_a_map_entry_rejects_a_wrong_typed_scalar_key():
    with pytest.raises(BiDiSerializationError, match=r"map key expected str"):
        StringMap.from_json({"value": [[5, {"kind": "cat", "meow": "a"}]]})


def test_a_map_entry_value_is_object_only():
    with pytest.raises(BiDiSerializationError, match=r"expected an object on the wire"):
        StringMap.from_json({"value": [["k", "not-an-object"]]})


def test_a_malformed_map_entry_raises():
    with pytest.raises(BiDiSerializationError, match=r"expected a \[key, value\] pair"):
        StringMap.from_json({"value": [["k"]]})


# --- union dispatch: outbound (build) ---


def test_build_selects_a_variant_by_its_discriminator_and_bakes_the_tag():
    animal = Animal.build(kind="cat", meow="hi")
    assert animal == Cat(meow="hi")
    assert animal.kind == "cat"


def test_build_selects_a_variant_by_which_fields_are_supplied():
    assert Shape.build(radius=5) == Circle(radius=5)


def test_build_rejects_a_discriminator_value_outside_the_allowed_set():
    with pytest.raises(BiDiSerializationError, match=r"not a valid discriminator"):
        Animal.build(kind="fish", meow="hi")


def test_build_rejects_a_field_that_does_not_belong_to_the_selected_variant():
    with pytest.raises(BiDiSerializationError, match=r"invalid combination.*bark"):
        Animal.build(kind="cat", bark="woof")


def test_build_raises_when_no_variant_matches():
    with pytest.raises(BiDiSerializationError, match=r"no Shape variant matches"):
        Shape.build(depth=5)
