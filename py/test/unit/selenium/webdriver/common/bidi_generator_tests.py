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

"""Unit tests for the BiDi protocol generator.

Ruby covers its generator in `rb/spec/unit/selenium/webdriver/bidi/support/bidi_generate_spec.rb`;
the Python port had no equivalent, so every helper and emitter here was unverified.

The schema the generator consumes is already gated upstream: the JavaScript projector's
`bidi_schema_diff_test.mjs` diffs it against `cddl2ts` as an independent oracle, and
`checkSchema` / `checkCompleteness` verify referential integrity and that nothing in the
CDDL AST goes missing. What none of that covers is the step *after* it — turning a correct
schema into correct Python. A field emitted optional that the schema marks required, a lost
`_EXTENSIBLE`, a discriminator baked when it should stay settable: all are invisible to the
schema gate and to any check that reads the generator's own output, because the generated
tree is the thing under suspicion.

So the expectations below are written by hand from the intended output rather than derived
from the generator, which is what makes them an oracle.
"""

import re

import pytest
from generate_bidi_protocol import (
    _NO_FIXED,
    CommandIR,
    EnumIR,
    FieldIR,
    ParamIR,
    RecordIR,
    UnionIR,
    VariantIR,
    _emit_command,
    _emit_enum,
    _emit_field,
    _emit_record,
    _emit_union,
    camel_to_snake,
    enum_member,
    frozenset_lit,
    lit,
    safe_name,
    snake_to_class,
    tuple_lit,
    type_class_name,
    value_alias,
    wrap_call,
)


def _field(name="value", **overrides):
    """A minimal `FieldIR`; every test states only the attributes it is about."""
    attrs = {
        "name": name,
        "wire": overrides.pop("wire", name),
        "required": False,
        "nullable": False,
        "ref": None,
        "is_list": False,
        "enum": None,
        "primitive": "string",
        "scalar": None,
        "fixed": _NO_FIXED,
        "py_type": "str",
    }
    attrs.update(overrides)
    return FieldIR(**attrs)


def _declared_order(emitted):
    """Field names in declaration order, ignoring the lines a wrapped field spills onto."""
    return re.findall(r"^    (\w+):", emitted, re.MULTILINE)


# --------------------------------------------------------------------------- #
# Naming helpers
# --------------------------------------------------------------------------- #


@pytest.mark.parametrize(
    ("name", "expected"),
    [
        ("browsingContext", "browsing_context"),
        ("setViewport", "set_viewport"),
        ("URL", "url"),
        ("namespaceURI", "namespace_uri"),
        ("HTTPResponse", "http_response"),
        ("already_snake", "already_snake"),
    ],
)
def test_camel_to_snake_splits_on_word_boundaries_and_keeps_acronym_runs(name, expected):
    assert camel_to_snake(name) == expected


def test_snake_to_class_capitalizes_each_part():
    assert snake_to_class("browsing_context") == "BrowsingContext"


@pytest.mark.parametrize(
    ("schema_name", "expected"),
    [
        # A dotted schema name keeps only its local part: the module is the namespace.
        ("script.RemoteValue", "RemoteValue"),
        # A synthetic type hoisted out of an inline definition is `X_Y` on the wire side.
        ("network.Cookie_value", "CookieValue"),
        ("session.CapabilitiesRequest", "CapabilitiesRequest"),
    ],
)
def test_type_class_name_localizes_and_camel_cases(schema_name, expected):
    assert type_class_name(schema_name) == expected


def test_value_alias_suffixes_the_class_name():
    assert value_alias("script.RemoteValue") == "RemoteValueValue"


@pytest.mark.parametrize(
    ("name", "expected"),
    [
        # A hard keyword cannot be a parameter name.
        ("from", "from_"),
        ("class", "class_"),
        # Shadowing the runtime API would make the field unreachable.
        ("as_json", "as_json_"),
        ("from_json", "from_json_"),
        ("extensions", "extensions_"),
        # Soft keywords are valid identifiers, and `type` is a real BiDi wire key.
        ("type", "type"),
        ("match", "match"),
        ("context", "context"),
    ],
)
def test_safe_name_escapes_only_what_would_break(name, expected):
    assert safe_name(name) == expected


@pytest.mark.parametrize(
    ("value", "expected"),
    [
        ("interactive", "INTERACTIVE"),
        ("beforeRequestSent", "BEFORE_REQUEST_SENT"),
        # Punctuation collapses to a single underscore and is stripped at the edges.
        ("text/html", "TEXT_HTML"),
        ("no-store", "NO_STORE"),
        # A leading minus reads as a negative number, not a word boundary.
        ("-1", "NEG1"),
        ("-webkit", "NEG_WEBKIT"),
        # A member cannot start with a digit.
        ("2xx", "_2XX"),
    ],
)
def test_enum_member_produces_a_valid_unique_identifier(value, expected):
    assert enum_member(value) == expected


# --------------------------------------------------------------------------- #
# Literal helpers
# --------------------------------------------------------------------------- #


@pytest.mark.parametrize(
    ("value", "expected"),
    [
        ("text", '"text"'),
        # A quote inside the value must not terminate the literal.
        ('say "hi"', '"say \\"hi\\""'),
        (None, "None"),
        # `bool` is checked before `int`, or True would emit as 1.
        (True, "True"),
        (False, "False"),
        (5, "5"),
        (1.5, "1.5"),
    ],
)
def test_lit_emits_a_faithful_python_literal(value, expected):
    assert lit(value) == expected


def test_tuple_lit_keeps_the_trailing_comma_on_a_single_element():
    # ("x") is a string, not a tuple, so the comma is what makes the emitted code correct.
    assert tuple_lit(("x",)) == '("x",)'
    assert tuple_lit(("x", "y")) == '("x", "y")'


def test_frozenset_lit_stays_on_one_line_when_it_fits():
    assert frozenset_lit(['"a"', '"b"'], indent=4) == 'frozenset({"a", "b"})'


def test_frozenset_lit_wraps_when_it_would_overflow():
    values = [f'"value_number_{i}"' for i in range(12)]

    wrapped = frozenset_lit(values, indent=4)

    assert "\n" in wrapped
    assert all(len(line) <= 120 for line in wrapped.splitlines())
    # The set literal survives the wrap: a frozenset over a bare string would iterate its
    # characters instead of holding the value.
    assert wrapped.startswith("frozenset(\n")
    assert '"value_number_0",' in wrapped


def test_wrap_call_stays_on_one_line_when_it_fits():
    assert wrap_call("f(", ["a", "b"], ")", indent=4) == "f(a, b)"


def test_wrap_call_breaks_one_argument_per_line_when_it_would_overflow():
    args = [f"argument_number_{i}" for i in range(12)]

    wrapped = wrap_call("    result = f(", args, ")", indent=4)

    assert all(len(line) <= 120 for line in wrapped.splitlines())
    assert "argument_number_0,\n" in wrapped


def test_wrap_call_emits_an_empty_call_unchanged():
    assert wrap_call("f(", [], ")", indent=4) == "f()"


# --------------------------------------------------------------------------- #
# Field emission (ADR 17786 decisions 1, 5 and 8)
# --------------------------------------------------------------------------- #


def test_a_required_field_is_emitted_without_a_default():
    # Decisions 5 and 8 make required-ness symmetric: a required field is validated, never
    # represented as absent. A default here would make it constructible without a value and
    # silently satisfy an inbound payload that omits it.
    emitted = _emit_field(_field("context", required=True), optional_default=False)

    assert emitted == '    context: str = field(metadata=meta("context", required=True, primitive="string"))'


def test_an_optional_field_is_emitted_unset_rather_than_none():
    # UNSET is what keeps an omitted field distinct from an explicit null, the baseline the
    # spec fixes and the whole reason the layer does not default to None.
    emitted = _emit_field(_field("sandbox"), optional_default=True)

    expected = '    sandbox: str | UnsetType = field(default=UNSET, metadata=meta("sandbox", primitive="string"))'
    assert emitted == expected


def test_a_nullable_field_records_nullability_on_the_wire_metadata():
    emitted = _emit_field(_field("parent", nullable=True, required=True), optional_default=False)

    assert 'meta("parent", required=True, nullable=True' in emitted


def test_a_list_field_records_its_cardinality():
    emitted = _emit_field(_field("contexts", is_list=True, py_type="list[str]"), optional_default=True)

    assert "is_list=True" in emitted
    assert emitted.startswith("    contexts: list[str] | UnsetType")


def test_a_reference_field_records_the_schema_name_it_resolves_to():
    emitted = _emit_field(
        _field("value", ref="script.RemoteValue", primitive=None, py_type="RemoteValue"),
        optional_default=True,
    )

    assert 'ref="script.RemoteValue"' in emitted


def test_a_non_nullable_constant_is_baked_and_not_constructor_settable():
    # A discriminator is forced by the type, not chosen by the caller, so it is `init=False`
    # and its annotation is the bare type rather than `| UnsetType`.
    emitted = _emit_field(_field("type", fixed="success", required=True), optional_default=False)

    assert emitted == (
        "    type: str = field(\n"
        '        default="success",\n'
        "        init=False,\n"
        '        metadata=meta("type", required=True, primitive="string", fixed="success"),\n'
        "    )"
    )


def test_a_nullable_constant_stays_settable():
    # `x / null` admits two values, so the caller has a real choice and the field must not be
    # baked to the literal.
    emitted = _emit_field(_field("value", fixed="null", nullable=True), optional_default=True)

    assert "init=False" not in emitted


# --------------------------------------------------------------------------- #
# Record emission (decisions 1 and 6)
# --------------------------------------------------------------------------- #


def test_a_record_emits_required_fields_before_optional_ones():
    # Not cosmetic: a dataclass rejects a non-default field after a defaulted one, so the
    # order is what makes the emitted module importable at all.
    record = RecordIR(
        class_name="Sample",
        schema_name="x.Sample",
        fields=[_field("later"), _field("first", required=True)],
        discriminator=None,
        extensible=False,
    )

    lines = _emit_record(record).splitlines()

    assert lines[0] == '@register("x.Sample")'
    assert lines[1] == "@dataclass(frozen=True)"
    assert lines[2] == "class Sample(Record):"
    assert lines[3].startswith("    first: str = field(metadata=")
    assert lines[4].startswith("    later: str | UnsetType = field(default=UNSET,")


def test_a_record_emits_its_discriminator_between_required_and_optional_fields():
    record = RecordIR(
        class_name="Sample",
        schema_name="x.Sample",
        fields=[_field("optional"), _field("required_one", required=True)],
        discriminator=_field("type", fixed="sample", required=True),
        extensible=False,
    )

    assert _declared_order(_emit_record(record)) == ["required_one", "type", "optional"]


def test_an_extensible_record_carries_both_the_flag_and_the_extras_map():
    # Decision 1 pairs them: the flag alone changes nothing, and the map alone is never read.
    record = RecordIR(
        class_name="Sample",
        schema_name="x.Sample",
        fields=[_field("declared", required=True)],
        discriminator=None,
        extensible=True,
    )

    emitted = _emit_record(record)

    assert "    _EXTENSIBLE = True" in emitted
    assert '    extensions: dict[str, Any] | UnsetType = field(default=UNSET, metadata=meta("extensions"))' in emitted


def test_a_non_extensible_record_has_no_extras_map():
    # Decision 6: an extra field cannot be sent on a non-extensible type, and the absence of
    # the map is what makes that structural rather than a rule to enforce.
    record = RecordIR(
        class_name="Sample",
        schema_name="x.Sample",
        fields=[_field("declared", required=True)],
        discriminator=None,
        extensible=False,
    )

    emitted = _emit_record(record)

    assert "_EXTENSIBLE" not in emitted
    assert "extensions" not in emitted


def test_an_empty_record_emits_a_body():
    record = RecordIR(
        class_name="Empty",
        schema_name="x.Empty",
        fields=[],
        discriminator=None,
        extensible=False,
    )

    assert _emit_record(record).splitlines()[-1] == "    pass"


# --------------------------------------------------------------------------- #
# Enum emission (decision 4, by vocabulary)
# --------------------------------------------------------------------------- #


@pytest.mark.parametrize(
    ("primitive", "expected_bases"),
    [
        ("string", "(str, Enum)"),
        ("integer", "(int, Enum)"),
        ("number", "(float, Enum)"),
        # bool cannot be subclassed, so the member keeps its type through `.value` instead.
        ("boolean", "(Enum)"),
        (None, "(Enum)"),
    ],
)
def test_an_enum_mixes_in_its_declared_primitive(primitive, expected_bases):
    enum = EnumIR(class_name="Sample", schema_name="x.Sample", members=[("A", "a")], primitive=primitive)

    assert _emit_enum(enum).splitlines()[1] == f"class Sample{expected_bases}:"


def test_an_enum_emits_each_member_with_its_wire_value():
    enum = EnumIR(
        class_name="ReadinessState",
        schema_name="browsingContext.ReadinessState",
        members=[("NONE", "none"), ("INTERACTIVE", "interactive")],
        primitive="string",
    )

    lines = _emit_enum(enum).splitlines()

    assert lines[0] == '@register("browsingContext.ReadinessState")'
    assert lines[2:] == ['    NONE = "none"', '    INTERACTIVE = "interactive"']


# --------------------------------------------------------------------------- #
# Union emission (decision 1: each variant a distinct type)
# --------------------------------------------------------------------------- #


def test_a_discriminated_union_maps_each_value_to_its_variant():
    union = UnionIR(
        class_name="Sample",
        schema_name="x.Sample",
        discriminator="type",
        discriminator_values=["a", "b"],
        variants=[
            VariantIR(mode="value", value="a", ref="x.A", requires=None),
            VariantIR(mode="value", value="b", ref="x.B", requires=None),
        ],
        variant_types=["A", "B"],
        object_only=True,
    )

    emitted = _emit_union(union)

    assert '    _DISCRIMINATOR = "type"' in emitted
    assert '        "a": "x.A",' in emitted
    assert '    _DISCRIMINATOR_VALUES = frozenset({"a", "b"})' in emitted
    assert "    _OBJECT_ONLY = True" in emitted
    assert 'SampleValue: TypeAlias = "A | B"' in emitted


def test_a_single_discriminator_value_keeps_its_set_literal():
    # frozenset(("x")) would iterate the string into characters; the set literal is what
    # keeps a one-arm union holding the value it declares.
    union = UnionIR(
        class_name="Sample",
        schema_name="x.Sample",
        discriminator="type",
        discriminator_values=["only"],
        variants=[VariantIR(mode="value", value="only", ref="x.Only", requires=None)],
        variant_types=["Only"],
    )

    assert '    _DISCRIMINATOR_VALUES = frozenset({"only"})' in _emit_union(union)


def test_a_presence_union_records_the_fields_each_variant_requires():
    union = UnionIR(
        class_name="Sample",
        schema_name="x.Sample",
        discriminator=None,
        discriminator_values=None,
        variants=[VariantIR(mode="presence", value=None, ref="x.A", requires=("width", "height"))],
        variant_types=["A"],
    )

    assert '    _PRESENCE = (("x.A", ("width", "height")))' in _emit_union(union)


def test_a_union_with_a_fallback_arm_records_it():
    union = UnionIR(
        class_name="Sample",
        schema_name="x.Sample",
        discriminator=None,
        discriminator_values=None,
        variants=[VariantIR(mode="fallback", value=None, ref="x.Other", requires=None)],
        variant_types=["Other"],
    )

    assert '    _FALLBACK = "x.Other"' in _emit_union(union)


def test_a_union_admitting_a_bare_scalar_pins_the_literals_it_accepts():
    # Decision 4 admits only the literals the spec pins, so an unpinned scalar arm would
    # accept any value of that primitive.
    union = UnionIR(
        class_name="Sample",
        schema_name="x.Sample",
        discriminator=None,
        discriminator_values=None,
        variants=[VariantIR(mode="fallback", value=None, ref="x.Other", requires=None)],
        variant_types=["Other"],
        scalar_values=["null"],
    )

    emitted = _emit_union(union)

    assert '    _SCALAR_VALUES = frozenset({"null"})' in emitted
    assert "_OBJECT_ONLY" not in emitted


def test_a_union_deduplicates_repeated_variant_types_in_its_alias():
    # Decision 1 lets variants with identical fields share one type, so the same annotation
    # can appear twice; repeating it in the alias is a type error.
    union = UnionIR(
        class_name="Sample",
        schema_name="x.Sample",
        discriminator="type",
        discriminator_values=["a", "b"],
        variants=[
            VariantIR(mode="value", value="a", ref="x.Shared", requires=None),
            VariantIR(mode="value", value="b", ref="x.Shared", requires=None),
        ],
        variant_types=["Shared", "Shared"],
    )

    assert 'SampleValue: TypeAlias = "Shared"' in _emit_union(union)


# --------------------------------------------------------------------------- #
# Command emission (decision 2: mirror the spec's names)
# --------------------------------------------------------------------------- #


def test_a_command_sends_the_spec_method_name_verbatim():
    # Decision 2 ties the wire string to the spec; the Python method name is the idiom.
    command = CommandIR(
        wire="browsingContext.activate",
        method="activate",
        params=[],
        params_class=None,
        union_params=False,
        result_class=None,
        result_type="None",
    )

    lines = _emit_command(command)

    assert lines[0] == "    def activate(self) -> None:"
    assert lines[-1] == '        return self._execute("browsingContext.activate", params=None, result=None)'


def test_a_command_defaults_its_optional_parameters_to_unset():
    command = CommandIR(
        wire="x.doThing",
        method="do_thing",
        params=[
            ParamIR(name="required_one", wire="requiredOne", required=True, py_type="str"),
            ParamIR(name="optional_one", wire="optionalOne", required=False, py_type="int"),
        ],
        params_class="DoThingParameters",
        union_params=False,
        result_class="DoThingResult",
        result_type="DoThingResult",
    )

    lines = _emit_command(command)

    assert lines[0] == (
        "    def do_thing(self, required_one: str, optional_one: int | UnsetType = UNSET) -> DoThingResult:"
    )
    assert lines[-2] == "        params = DoThingParameters(required_one=required_one, optional_one=optional_one)"
    assert lines[-1] == '        return self._execute("x.doThing", params=params, result=DoThingResult)'


def test_a_command_with_union_parameters_dispatches_through_build():
    command = CommandIR(
        wire="x.doThing",
        method="do_thing",
        params=[ParamIR(name="value", wire="value", required=True, py_type="str")],
        params_class="DoThingParameters",
        union_params=True,
        result_class=None,
        result_type="None",
    )

    assert "        params = DoThingParameters.build(value=value)" in _emit_command(command)
