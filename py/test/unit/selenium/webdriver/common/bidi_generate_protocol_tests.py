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

"""Unit tests for the BiDi Python code generator (`py/generate_bidi_protocol.py`).

Exercises `Schema`'s type-resolution logic in isolation against small synthetic schema
fixtures, the way the Ruby (`rb/spec/unit/.../bidi_generate_spec.rb`) and Java
(`java/test/.../BiDiGeneratorTest.java`) generator tests do. The subject here is
`Schema#types_for`'s handling of a field-less synthetic "map" record (#18106): the
projector has no inline map form for a field, so a CDDL map such as
`script.NodeProperties.attributes` (`{*text => text}`) is hoisted into a record with no
fields and the value type under `map`, e.g. `script.NodePropertiesAttributes`. Before the
fix, `Schema` treated any field-less record as opaque (`Any`), dropping the map's value
type entirely.
"""

from generate_bidi_protocol import Schema


def _synthetic_map_record(value_type: dict) -> dict:
    return {
        "kind": "record",
        "fields": [],
        "map": value_type,
        "synthetic": True,
        "owner": "x.Owner",
        "label": "Attributes",
        "outbound": False,
        "inbound": True,
    }


def _schema(value_type: dict) -> Schema:
    types = {
        "x.Owner": {
            "kind": "record",
            "outbound": False,
            "inbound": True,
            "fields": [
                {
                    "name": "attributes",
                    "wire": "attributes",
                    "required": False,
                    "type": {"ref": "x.OwnerAttributes"},
                }
            ],
        },
        "x.OwnerAttributes": _synthetic_map_record(value_type),
        "x.Value": {
            "kind": "record",
            "outbound": False,
            "inbound": True,
            "fields": [{"name": "v", "wire": "v", "required": True, "type": {"primitive": "string"}}],
        },
    }
    return Schema({"types": types, "commands": [], "events": [], "domains": {"x": {}}})


def _attributes_field(value_type: dict):
    schema = _schema(value_type)
    schema._pending_refs = set()
    records, _ = schema.types_for("x")
    owner = next(r for r in records if r.schema_name == "x.Owner")
    return next(f for f in owner.fields if f.name == "attributes")


def test_primitive_valued_map_is_typed_as_a_dict():
    field = _attributes_field({"primitive": "string"})

    assert field.py_type == "dict[str, str]"


def test_primitive_valued_map_carries_a_map_descriptor_for_runtime_validation():
    field = _attributes_field({"primitive": "string"})

    assert field.map_of == "str"


def test_synthetic_map_record_is_not_emitted_as_its_own_class():
    schema = _schema({"primitive": "string"})
    schema._pending_refs = set()
    records, _ = schema.types_for("x")

    assert "x.OwnerAttributes" not in {r.schema_name for r in records}


def test_ref_valued_map_stays_opaque():
    # Only a primitive-valued map is modeled; a ref/union-valued map (the Mozilla vendor
    # types in the real schema) is left opaque until its value typing is decided (#18106).
    field = _attributes_field({"ref": "x.Value"})

    assert field.py_type == "Any"
    assert field.map_of is None


def test_other_integer_valued_map_is_typed_as_a_dict_of_int():
    field = _attributes_field({"primitive": "integer"})

    assert field.py_type == "dict[str, int]"
    assert field.map_of == "int"
