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

"""List element metadata and annotations from small, independent schema fixtures."""

from dataclasses import dataclass, field, fields

import pytest
from generate_bidi_protocol import Schema, _emit_record

from selenium.webdriver.common._bidi.serialization import (
    UNSET,
    BiDiSerializationError,
    Record,
    UnsetType,
    meta,
    register,
)


def _schema(node, aliases=None):
    return Schema(
        {
            "types": {
                "x.Owner": {
                    "kind": "record",
                    "fields": [{"name": "values", "wire": "values", "required": False, "type": node}],
                },
                "js-uint": {"kind": "alias", "type": {"primitive": "integer", "min": 0, "max": 2**53 - 1}},
                **(aliases or {}),
            },
            "commands": [],
            "events": [],
        }
    )


def _record(node, aliases=None):
    records, _ = _schema(node, aliases).types_for("x")
    return next(r for r in records if r.schema_name == "x.Owner")


_UNION = {"union": [{"ref": "js-uint"}, {"primitive": "string"}]}


def test_scalar_union_list_has_typed_annotation_and_wire_facts():
    record = _record({"list": _UNION})
    field = record.fields[0]
    assert field.py_type == "list[int | str]"
    assert field.primitive == ["int", "str"]
    assert field.bounds == {"min": 0, "max": 2**53 - 1}
    assert field.scalar is None
    emitted = _emit_record(record)
    assert 'primitive=["int", "str"]' in emitted
    assert 'bounds={"min": 0, "max": 9007199254740991}' in emitted


@pytest.mark.parametrize(
    "element",
    [
        {"primitive": "string", "nullable": True},
        {"ref": "x.Nullable"},
        {"ref": "x.Indirect"},
    ],
)
def test_nullable_elements_carry_separate_metadata_through_aliases(element):
    aliases = {
        "x.Nullable": {"kind": "alias", "type": {"primitive": "string", "nullable": True}},
        "x.Indirect": {"kind": "alias", "type": {"ref": "x.Nullable"}},
    }
    record = _record({"list": element}, aliases)
    item = record.fields[0]
    assert item.element_nullable
    assert not item.nullable
    assert item.py_type == "list[str | None]"
    assert "element_nullable=True" in _emit_record(record)
    owner = _generated(record)
    assert owner(values=[None, "a"]).as_json() == {"values": [None, "a"]}
    assert owner.from_json({"values": [None, "a"]}).values == [None, "a"]


def test_nullable_list_field_keeps_non_nullable_element_facts():
    field = _record({"list": _UNION, "nullable": True}).fields[0]
    assert field.nullable
    assert field.py_type == "list[int | str] | None"
    assert field.primitive == ["int", "str"]


def test_alias_to_list_retains_element_nullability():
    record = _record(
        {"ref": "x.Values"},
        {"x.Values": {"kind": "alias", "type": {"list": {"primitive": "string", "nullable": True}}}},
    )
    assert record.fields[0].element_nullable
    assert not record.fields[0].nullable
    owner = _generated(record)
    assert owner.from_json({"values": [None]}).as_json() == {"values": [None]}


def test_union_arm_alias_bounds_are_narrowed():
    union = {"union": [{"ref": "x.Positive", "min": 3}, {"primitive": "string"}]}
    field = _record(
        {"list": union},
        {
            "x.Positive": {"kind": "alias", "type": {"ref": "js-uint", "min": 1, "exclusiveMin": True}},
        },
    ).fields[0]
    assert field.bounds == {"min": 3, "max": 2**53 - 1}


def test_union_numeric_arms_with_different_bounds_fail_generation():
    union = {"union": [{"ref": "js-uint"}, {"primitive": "number"}]}
    with pytest.raises(ValueError, match="different bounds"):
        _record({"list": union})


def test_primitive_union_alias_is_resolved_without_a_record_union_class():
    field = _record(
        {"list": {"ref": "x.Range"}},
        {
            "x.Range": {"kind": "alias", "type": _UNION},
        },
    ).fields[0]
    assert field.py_type == "list[int | str]"
    assert field.ref is None
    assert field.primitive == ["int", "str"]


def test_const_or_record_arms_are_not_widened_to_primitives():
    assert _record({"list": {"union": [{"const": "only"}, {"primitive": "integer"}]}}).fields[0].primitive is None


@pytest.mark.parametrize(
    "candidate",
    [
        {"min": 1},
        {"min": 1, "exclusiveMin": True},
        {"min": 0},
        {"max": 9},
        {"max": 9, "exclusiveMax": True},
        {"max": 10},
    ],
)
def test_alias_bounds_keep_the_tighter_side_and_exclusivity(candidate):
    union = {"union": [{"ref": "x.Small", **candidate}, {"primitive": "string"}]}
    field = _record(
        {"list": union},
        {
            "x.Small": {
                "kind": "alias",
                "type": {
                    "primitive": "integer",
                    "min": 1,
                    "max": 9,
                    "exclusiveMin": True,
                    "exclusiveMax": True,
                },
            },
        },
    ).fields[0]
    assert field.bounds == {"min": 1, "max": 9, "exclusiveMin": True, "exclusiveMax": True}


def _generated(record):
    namespace = {
        "__name__": __name__,
        "dataclass": dataclass,
        "field": field,
        "Record": Record,
        "UNSET": UNSET,
        "UnsetType": UnsetType,
        "meta": meta,
        "register": register,
    }
    exec("from __future__ import annotations\n" + _emit_record(record), namespace)
    return namespace["Owner"]


@pytest.mark.parametrize("aliased", [False, True])
def test_generated_nullable_union_elements_preserve_other_element_checks(aliased):
    union = {**_UNION, "nullable": True}
    aliases = {"x.Range": {"kind": "alias", "type": union}} if aliased else {}
    element = {"ref": "x.Range"} if aliased else union
    record = _record({"list": element}, aliases)
    item = record.fields[0]
    assert item.py_type == "list[int | str | None]"
    assert item.primitive == ["int", "str"]
    assert item.bounds == {"min": 0, "max": 2**53 - 1}
    owner = _generated(record)
    descriptor = fields(owner)[0].metadata["bidi"]
    assert descriptor.element_nullable
    assert not descriptor.nullable
    assert owner(values=[None, 5.0, "1-3"]).as_json() == {"values": [None, 5.0, "1-3"]}
    parsed = owner.from_json({"values": [None, 5.0, "1-3"]})
    assert parsed.values == [None, 5, "1-3"]
    assert type(parsed.values[1]) is int
    assert owner().as_json() == {}
    assert owner.from_json({}).values is UNSET
    for bad in [True, 1.5, {}, [], -1, 2**53]:
        with pytest.raises(BiDiSerializationError):
            owner(values=[None, bad]).as_json()
        with pytest.raises(BiDiSerializationError):
            owner.from_json({"values": [None, bad]})
    with pytest.raises(BiDiSerializationError):
        owner(values=None).as_json()
    with pytest.raises(BiDiSerializationError):
        owner.from_json({"values": None})


def test_nullable_enum_alias_retains_its_enum_descriptor():
    record = _record(
        {"list": {"ref": "x.NullableColor"}},
        {
            "x.Color": {"kind": "enum", "primitive": "string", "values": ["red", "blue"]},
            "x.NullableColor": {"kind": "alias", "type": {"ref": "x.Color", "nullable": True}},
        },
    )
    item = record.fields[0]
    assert item.element_nullable
    assert item.enum == "x.Color"
    assert item.py_type == "list[Color | None]"


_NULL_ONLY_SHAPES = ("direct", "element_alias", "alias_chain", "list_alias")


def _null_only_record(shape):
    aliases = {
        "x.Null": {"kind": "alias", "type": {"primitive": "null"}},
        "x.Indirect": {"kind": "alias", "type": {"ref": "x.Null"}},
        "x.Values": {"kind": "alias", "type": {"list": {"ref": "x.Indirect"}}},
    }
    nodes = {
        "direct": {"list": {"primitive": "null"}},
        "element_alias": {"list": {"ref": "x.Null"}},
        "alias_chain": {"list": {"ref": "x.Indirect"}},
        "list_alias": {"ref": "x.Values"},
    }
    return _record(nodes[shape], aliases)


@pytest.mark.parametrize("shape", _NULL_ONLY_SHAPES)
@pytest.mark.parametrize("direction", ["outbound", "inbound"])
@pytest.mark.parametrize("invalid", [True, 1, "a", {}])
def test_generated_null_only_list_rejects_non_null_elements(shape, direction, invalid):
    owner = _generated(_null_only_record(shape))
    with pytest.raises(BiDiSerializationError):
        if direction == "outbound":
            owner(values=[invalid]).as_json()
        else:
            owner.from_json({"values": [invalid]})


@pytest.mark.parametrize("shape", _NULL_ONLY_SHAPES)
def test_null_only_list_preserves_its_primitive_descriptor(shape):
    record = _null_only_record(shape)
    item = record.fields[0]
    assert item.py_type == "list[None]"
    assert item.primitive == "None"
    assert item.element_nullable
    assert not item.nullable
    descriptor = fields(_generated(record))[0].metadata["bidi"]
    assert descriptor.primitive == "None"


@pytest.mark.parametrize("shape", _NULL_ONLY_SHAPES)
def test_generated_null_only_list_accepts_null_but_not_a_null_container(shape):
    owner = _generated(_null_only_record(shape))
    for values in ([], [None], [None, None]):
        assert owner(values=values).as_json() == {"values": values}
        assert owner.from_json({"values": values}).values == values
    assert owner().as_json() == {}
    assert owner.from_json({}).values is UNSET
    with pytest.raises(BiDiSerializationError):
        owner(values=None).as_json()
    with pytest.raises(BiDiSerializationError):
        owner.from_json({"values": None})
