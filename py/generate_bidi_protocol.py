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

"""Generate the Python WebDriver BiDi protocol layer from the shared schema.

Consumes the binding-neutral schema produced by the JavaScript projector
(``//javascript/selenium-webdriver:create-bidi-src_schema`` -> schema.json). The
schema is already normalized (inline enums hoisted, unions canonicalized with a
dispatch ``selector``, group composition flattened, wire names + nullability
preserved), so this generator is a straight projection into Python — no CDDL
interpretation. Ported from the Ruby generator (PR #17731).

Output is close to ``ruff format`` style; the build applies a format pass so the
checked-in files (and the verify test's comparison) are canonical.

Usage:
    python generate_bidi_protocol.py <schema.json> <output_dir>
"""

from __future__ import annotations

import argparse
import json
import keyword
import os
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Any

BIDI_DOC_URL = "https://www.selenium.dev/documentation/warnings/bidi-implementation/"
LINE_LIMIT = 120
DEFAULT_OUTPUT = "py/selenium/webdriver/common/_bidi"

_HEADER = """# Licensed to the Software Freedom Conservancy (SFC) under one
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

# This file is generated from the WebDriver BiDi specification.
# DO NOT EDIT. Regenerate with:
#   bazel run //py:generate-bidi-protocol"""

_RESERVED_FIELDS = {"as_json", "from_json", "extensions"}


# --------------------------------------------------------------------------- #
# Naming helpers
# --------------------------------------------------------------------------- #
def camel_to_snake(name: str) -> str:
    name = re.sub(r"([A-Z]+)([A-Z][a-z])", r"\1_\2", name)
    name = re.sub(r"([a-z\d])([A-Z])", r"\1_\2", name)
    return name.lower()


def snake_to_class(name: str) -> str:
    return "".join(part.capitalize() for part in name.split("_"))


def type_class_name(type_name: str) -> str:
    """Local class name for a schema type; synthetic ``X_Y`` becomes CamelCase ``XY``."""
    local = type_name.split(".", 1)[-1]
    parts = [p for p in local.split("_") if p]
    return "".join(p[:1].upper() + p[1:] for p in parts) or local


def value_alias(type_name: str) -> str:
    """The TypeAlias name for a union's set of concrete variants."""
    return f"{type_class_name(type_name)}Value"


def safe_name(name: str) -> str:
    """A snake_case identifier safe as a Python attribute / parameter.

    Escapes hard keywords and names that would shadow the runtime API; soft
    keywords (``type``, ``match``) are valid identifiers and left alone.
    """
    return f"{name}_" if keyword.iskeyword(name) or name in _RESERVED_FIELDS else name


def enum_member(value: Any) -> str:
    token = camel_to_snake(str(value))
    token = re.sub(r"\A-(?=\d)", "neg", token)
    token = re.sub(r"\A-", "neg_", token)
    token = re.sub(r"[^a-z0-9]+", "_", token).strip("_").upper()
    if not token or token[0].isdigit():
        token = f"_{token}"
    return token


def lit(value: Any) -> str:
    """A Python source literal, double-quoted (ruff-format style) for strings."""
    if isinstance(value, bool):
        return "True" if value else "False"
    if isinstance(value, str):
        return json.dumps(value)
    if value is None:
        return "None"
    return repr(value)


def tuple_lit(items: tuple) -> str:
    """A tuple literal with double-quoted elements (single element keeps its comma)."""
    inner = ", ".join(lit(i) for i in items)
    return f"({inner},)" if len(items) == 1 else f"({inner})"


def frozenset_lit(values: list[str], indent: int) -> str:
    """`frozenset({...})` on one line, or ruff's wrapped form when it would overflow."""
    one_line = f"frozenset({{{', '.join(values)}}})"
    if indent + len(one_line) <= LINE_LIMIT:
        return one_line
    inner = ",\n".join(f"{' ' * (indent + 8)}{v}" for v in values)
    return f"frozenset(\n{' ' * (indent + 4)}{{\n{inner},\n{' ' * (indent + 4)}}}\n{' ' * indent})"


def wrap_call(prefix: str, args: list[str], suffix: str, indent: int) -> str:
    """`prefix(args)suffix` on one line, or one arg per line when it would exceed the limit."""
    one_line = f"{prefix}{', '.join(args)}{suffix}"
    if not args or indent + len(one_line) <= LINE_LIMIT:
        return one_line
    pad = " " * (indent + 4)
    body = ",\n".join(f"{pad}{a}" for a in args)
    return f"{prefix}\n{body},\n{' ' * indent}{suffix.lstrip()}"


# --------------------------------------------------------------------------- #
# IR
# --------------------------------------------------------------------------- #
_NO_FIXED = object()


@dataclass
class ParamIR:
    name: str
    wire: str
    required: bool
    py_type: str


@dataclass
class CommandIR:
    wire: str
    method: str
    params: list[ParamIR]
    params_class: str | None
    union_params: bool
    result_class: str | None  # runtime class passed to _execute (dispatch class)
    result_type: str  # return annotation
    spec_href: str | None = None


@dataclass
class EventIR:
    wire: str
    name: str
    payload_class: str | None


@dataclass
class EnumIR:
    class_name: str
    schema_name: str
    members: list[tuple[str, Any]]
    spec_href: str | None = None


@dataclass
class FieldIR:
    name: str
    wire: str
    required: bool
    nullable: bool
    ref: str | None
    is_list: bool
    enum: str | None
    primitive: str | None
    scalar: str | list[str] | None
    fixed: Any
    py_type: str


@dataclass
class RecordIR:
    class_name: str
    schema_name: str
    fields: list[FieldIR]
    discriminator: FieldIR | None
    extensible: bool
    spec_href: str | None = None


@dataclass
class VariantIR:
    mode: str
    value: Any
    ref: str
    requires: tuple[str, ...] | None


@dataclass
class UnionIR:
    class_name: str
    schema_name: str
    discriminator: str | None
    discriminator_values: list[Any] | None
    variants: list[VariantIR]
    variant_types: list[str]  # annotation names for the value alias
    object_only: bool = False
    spec_href: str | None = None
    scalar_type: str | None = None  # Literal[...] for an alias-union's bare-scalar arms
    scalar_values: list[Any] | None = None  # the literals a bare-scalar arm admits


@dataclass
class ModuleIR:
    domain: str
    class_name: str
    filename: str
    enums: list[EnumIR]
    records: list[RecordIR]
    unions: list[UnionIR]
    commands: list[CommandIR]
    events: list[EventIR]
    imports: dict[str, set[str]]  # module filename -> annotation names (cross-domain)
    spec_href: str | None = None


# --------------------------------------------------------------------------- #
# Schema projection (ported from Ruby bidi_generate.rb Schema)
# --------------------------------------------------------------------------- #
# The complete set of primitives the projector emits; it rejects `unknown` upstream
# (an unhandled CDDL construct fails the schema check), so we never see one.
_PRIMITIVE = {"string": "str", "integer": "int", "number": "float", "boolean": "bool", "null": "None"}
_LEAF_PRIMITIVE = {"string": "str", "integer": "int", "number": "float", "boolean": "bool"}


class Schema:
    def __init__(self, raw: dict) -> None:
        self.types: dict = raw["types"]
        self.commands: list = raw["commands"]
        self.events: list = raw["events"]
        self._domain_links: dict = raw.get("domains", {})
        self._promote_command_params_records()

    def _promote_command_params_records(self) -> None:
        for cmd in self.commands:
            ref = (cmd.get("params") or {}).get("ref")
            if ref and ref in self.types and self._envelope_synthetic(self.types[ref]):
                for tag in ("synthetic", "owner", "label"):
                    self.types[ref].pop(tag, None)

    def domains(self) -> list[str]:
        seen: list[str] = []
        for entry in self.commands + self.events:
            if entry["domain"] not in seen:
                seen.append(entry["domain"])
        return seen

    def commands_for(self, domain: str) -> list:
        return [c for c in self.commands if c["domain"] == domain]

    def events_for(self, domain: str) -> list:
        return [e for e in self.events if e["domain"] == domain]

    def type_kind(self, ref: str | None) -> str | None:
        return self.types.get(ref, {}).get("kind") if ref else None

    def enums_for(self, domain: str) -> list[EnumIR]:
        prefix = f"{domain}."
        out = []
        for name, type_ in self.types.items():
            if type_.get("kind") != "enum" or not name.startswith(prefix):
                continue
            members = [(enum_member(v), v) for v in type_["values"]]
            out.append(
                EnumIR(
                    class_name=type_class_name(name), schema_name=name, members=members, spec_href=type_.get("specHref")
                )
            )
        return out

    def types_for(self, domain: str) -> tuple[list[RecordIR], list[UnionIR]]:
        prefix = f"{domain}."
        records: list[RecordIR] = []
        unions: list[UnionIR] = []
        for name, type_ in self.types.items():
            if not name.startswith(prefix):
                continue
            kind = type_["kind"]
            if kind == "record":
                if not type_["fields"] or self._suppressed_record(type_):
                    continue
                records.append(self._record_ir(name, type_))
            elif kind == "union":
                unions.append(self._union_ir(name))
            elif kind == "alias" and "union" in type_["type"]:
                unions.append(self._union_ir(name))
        return records, unions

    def _suppressed_record(self, type_: dict) -> bool:
        return self._message_envelope(type_) or self._envelope_synthetic(type_)

    def _message_envelope(self, type_: dict) -> bool:
        return any(f["wire"] == "method" and "const" in f["type"] for f in type_.get("fields", []))

    def _envelope_synthetic(self, type_: dict) -> bool:
        if not type_.get("synthetic"):
            return False
        owner = self.types.get(type_.get("owner"))
        return bool(owner and owner["kind"] == "record" and self._message_envelope(owner))

    def _record_ir(self, name: str, type_: dict) -> RecordIR:
        disc_field = next((f for f in type_["fields"] if self._baked_discriminator(f)), None)
        discriminator = self._field_ir(disc_field) if disc_field else None
        fields = [self._field_ir(f) for f in type_["fields"] if not self._baked_discriminator(f)]
        return RecordIR(
            class_name=type_class_name(name),
            schema_name=name,
            fields=fields,
            discriminator=discriminator,
            # A type the spec marks extensible carries an untyped map for the fields the spec does
            # not declare; every extensible type keeps them, received-only ones
            # included. A non-extensible type gets no store.
            extensible=bool(type_.get("extensible")),
            spec_href=type_.get("specHref"),
        )

    def _baked_discriminator(self, field_: dict) -> bool:
        return "const" in field_["type"] and not field_["type"].get("nullable")

    def _field_ir(self, field_: dict) -> FieldIR:
        resolved = self._resolve(field_["type"])
        # Carry a const literal whether or not it is nullable. A non-nullable const is a baked
        # discriminator (forced, init=False); a nullable const (e.g. ``bypass: true / null``) is a
        # settable field held to its literal-or-null by the runtime.
        const = field_["type"].get("const", _NO_FIXED)
        py, refs = self.py_type(field_["type"])
        self._pending_refs |= refs
        return FieldIR(
            name=safe_name(camel_to_snake(field_["name"])),
            wire=field_["wire"],
            required=bool(field_["required"]),
            nullable=resolved["nullable"],
            ref=resolved["ref"],
            is_list=resolved["list"],
            enum=self._enum_ref(field_["type"]),
            primitive=self._leaf_primitive(field_["type"]),
            scalar=self._scalar_py(resolved.get("scalar")),
            fixed=const,
            py_type=py,
        )

    # The projector's ``scalar`` primitive name(s) mapped to the runtime check names
    # (``string`` -> ``str``), so a map key's bare scalar is validated with the same
    # ``_PRIMITIVE_CHECKS`` table as a typed field. None when the field carries no scalar arm.
    def _scalar_py(self, scalar: str | list | None) -> str | list[str] | None:
        if scalar is None:
            return None
        if isinstance(scalar, list):
            return [_LEAF_PRIMITIVE[s] for s in scalar if s in _LEAF_PRIMITIVE] or None
        return _LEAF_PRIMITIVE.get(scalar)

    def _union_ir(self, name: str) -> UnionIR:
        type_ = self.types[name]
        if type_["kind"] == "union":
            ir = self._union_from_selector(name, type_["selector"])
        else:
            ir = self._union_from_alias(name)
        # A non-object_only union has a bare-scalar arm; only const-literal arms (scalarValues)
        # are modeled, so the runtime can validate an outbound scalar. Without them the runtime
        # would accept any scalar, so fail here, at generation, not at a caller's runtime.
        if not ir.object_only and not ir.scalar_values:
            raise ValueError(f"non-object_only union {name} has no scalarValues to validate its bare-scalar arm")
        for v in ir.variants:
            py = self._py_ref(v.ref, self._pending_refs)
            ir.variant_types.append(py)
        if ir.scalar_type:
            ir.variant_types.append(ir.scalar_type)
        return ir

    def _union_from_selector(self, name: str, selector: dict) -> UnionIR:
        if selector.get("correlated"):
            raise ValueError(f"correlated union {name} must not be emitted (resolved by request id)")
        variants = self._discriminated_variants(selector) if selector.get("by") else self._ordered_variants(selector)
        if not variants:
            raise ValueError(f"union {name} selector yielded no dispatch variants")
        values = self._discriminator_values(selector) if selector.get("by") else None
        return UnionIR(
            class_name=type_class_name(name),
            schema_name=name,
            discriminator=selector.get("by"),
            discriminator_values=values,
            variants=variants,
            variant_types=[],
            object_only=bool(self.types[name].get("objectOnly")),
            spec_href=self.types[name].get("specHref"),
        )

    def _discriminated_variants(self, selector: dict) -> list[VariantIR]:
        variants = [VariantIR("value", v["value"], v["ref"], None) for v in selector["variants"]]
        if selector.get("default"):
            variants.append(VariantIR("fallback", None, selector["default"], None))
        return variants

    def _ordered_variants(self, selector: dict) -> list[VariantIR]:
        return [VariantIR("presence", None, arm["ref"], tuple(arm["requires"])) for arm in selector.get("ordered", [])]

    # The union-wide allowed discriminator set: each variant's tag plus the default
    # variant's own enum values for the discriminator field (spec-faithful outbound check).
    def _discriminator_values(self, selector: dict) -> list[Any] | None:
        tagged = [v["value"] for v in selector["variants"]]
        if not tagged or not all(isinstance(v, str) for v in tagged):
            return None  # boolean/number tags need no membership check
        default = selector.get("default")
        by = selector["by"]
        extra: list[Any] = []
        default_type = self.types.get(default, {})
        if default and default_type.get("kind") == "record":
            df = next((f for f in default_type["fields"] if f["wire"] == by), None)
            ref = df and df["type"].get("ref")
            if ref and self.types.get(ref, {}).get("kind") == "enum":
                extra = self.types[ref]["values"]
        return list(dict.fromkeys(tagged + extra))

    def _union_from_alias(self, name: str) -> UnionIR:
        variants = []
        discriminator = None
        for arm in self.types[name]["type"]["union"]:
            ref = arm.get("ref")
            if not ref:
                continue
            const = next((f for f in self.types[ref]["fields"] if "const" in f["type"]), None)
            if not const:
                raise ValueError(f"alias-union {name} arm {ref} has no const discriminator")
            discriminator = const["wire"]
            variants.append(VariantIR("value", const["type"]["const"], ref, None))
        values = [v.value for v in variants] if all(isinstance(v.value, str) for v in variants) else None
        # An alias-union carries bare-scalar arms (input.Origin's "viewport"/"pointer"), so the
        # projector leaves it unflagged and a non-object payload still passes through. Those arms
        # have no ref, so they are absent from the record variants above; surface them in the value
        # alias as a Literal[...] so a caller sees the scalar options, not only the record variant.
        scalar_values = self.types[name]["type"].get("scalarValues") or []
        scalar_type = f"Literal[{', '.join(repr(c) for c in scalar_values)}]" if scalar_values else None
        object_only = bool(self.types[name].get("objectOnly"))
        return UnionIR(
            type_class_name(name),
            name,
            discriminator,
            values,
            variants,
            [],
            object_only=object_only,
            spec_href=self.types[name].get("specHref"),
            scalar_type=scalar_type,
            scalar_values=scalar_values,
        )

    def params_for(self, params_ref: dict | None) -> list[ParamIR] | None:
        if not params_ref:
            return []
        type_ = self.types.get(params_ref["ref"])
        if not type_:
            return None
        if type_["kind"] == "record":
            return [self._param_ir(f) for f in type_["fields"]]
        if type_["kind"] == "union":
            return self._union_params(type_, params_ref["ref"])
        return None

    def _param_ir(self, field_: dict, required: bool | None = None) -> ParamIR:
        py, refs = self.py_type(field_["type"])
        self._pending_refs |= refs
        return ParamIR(
            name=safe_name(camel_to_snake(field_["name"])),
            wire=field_["wire"],
            required=bool(field_["required"]) if required is None else required,
            py_type=py,
        )

    def _union_params(self, type_: dict, ref: str) -> list[ParamIR] | None:
        variants = [self.types.get(v) for v in type_["variants"]]
        if not all(v and v["kind"] == "record" for v in variants):
            return None
        self._guard_union_dispatch_keys(type_["selector"], ref)
        return self._merged_params([v["fields"] for v in variants])

    def _merged_params(self, variant_fields: list[list[dict]]) -> list[ParamIR]:
        all_fields = [f for fields in variant_fields for f in fields]
        out: list[ParamIR] = []
        for wire_name in dict.fromkeys(f["wire"] for f in all_fields):
            field_ = next(f for f in all_fields if f["wire"] == wire_name)
            required = all(any(f["wire"] == wire_name and f["required"] for f in fields) for fields in variant_fields)
            out.append(self._param_ir(field_, required=required))
        return out

    def _guard_union_dispatch_keys(self, selector: dict, ref: str) -> None:
        if selector.get("by"):
            keys = [selector["by"]]
        else:
            keys = [k for arm in selector.get("ordered", []) for k in arm["requires"]]
        camel = [k for k in keys if camel_to_snake(k) != k]
        if camel:
            raise ValueError(
                f"union command param {ref} dispatches on non-snake wire key(s) {camel}; "
                "Union.build matches kwargs to dispatch keys by name — add an explicit mapping first."
            )

    def structured_ref(self, name: str) -> str | None:
        resolved = self._resolve_named(name, {})
        return None if resolved["list"] else resolved["ref"]

    # --- type resolution (serialization facts) ---
    def _resolve(self, node: dict) -> dict:
        nullable = bool(node.get("nullable"))
        if "list" in node:
            element = self._resolve(node["list"])
            return {"ref": element["ref"], "list": True, "nullable": nullable, "scalar": element.get("scalar")}
        if "ref" in node:
            named = self._resolve_named(node["ref"], {})
            return {"ref": named["ref"], "list": named["list"], "nullable": nullable, "scalar": named.get("scalar")}
        if "union" in node:
            return self._resolve_union(node, nullable)
        return {"ref": None, "list": False, "nullable": nullable}

    # An inline union of one union-typed arm plus scalars (a map entry's RemoteValue / text)
    # collapses onto that union ref. Because the union is object_only, a bare-scalar sibling
    # would raise there, so forward the projector's ``scalar`` signal — the runtime passes a
    # non-object leaf (the map's string keys) through instead, checked against this primitive.
    def _resolve_union(self, node: dict, nullable: bool) -> dict:
        refs = [arm for arm in node["union"] if "ref" in arm]
        if len(refs) == 1 and self._union_ref(refs[0]["ref"]):
            named = self._resolve_named(refs[0]["ref"], {})
            return {"ref": named["ref"], "list": named["list"], "nullable": nullable, "scalar": node.get("scalar")}
        return {"ref": None, "list": False, "nullable": nullable}

    def _union_ref(self, name: str) -> bool:
        type_ = self.types.get(name)
        if not type_:
            return False
        if type_["kind"] == "alias" and "ref" in type_["type"]:
            return self._union_ref(type_["type"]["ref"])
        return type_["kind"] == "union"

    _OPAQUE = {"ref": None, "list": False}

    def _resolve_named(self, name: str | None, seen: dict) -> dict:
        if name is None or seen.get(name):
            return dict(self._OPAQUE)
        seen[name] = True
        type_ = self.types.get(name)
        if not type_:
            return dict(self._OPAQUE)
        kind = type_["kind"]
        if kind == "record":
            return dict(self._OPAQUE) if not type_["fields"] else {"ref": self._domain_ref(name), "list": False}
        if kind == "union":
            return {"ref": self._domain_ref(name), "list": False}
        if kind == "enum":
            return {"ref": None, "list": False}
        if kind == "alias":
            return self._resolve_named_alias(name, type_["type"], seen)
        return dict(self._OPAQUE)

    def _resolve_named_alias(self, name: str, inner: dict, seen: dict) -> dict:
        if "union" in inner:
            return {"ref": self._domain_ref(name), "list": False}
        if "ref" in inner:
            return self._resolve_named(inner["ref"], seen)
        if "list" in inner:
            element = self._resolve(inner["list"])
            return {"ref": element["ref"], "list": True, "scalar": element.get("scalar")}
        return {"ref": None, "list": False}

    def _domain_ref(self, name: str) -> str | None:
        return name if "." in name else None

    def _enum_ref(self, node: dict) -> str | None:
        ref = node.get("ref") or (node.get("list") or {}).get("ref")
        if ref and self.types.get(ref, {}).get("kind") == "enum":
            return ref
        return None

    # The runtime-checkable scalar type of a field (or of a list's elements),
    # following alias chains (e.g. js-uint -> integer). None for a record ref,
    # union, const, enum, or opaque/unknown type — those are validated elsewhere.
    def _leaf_primitive(self, node: dict, seen: set[str] | None = None) -> str | None:
        seen = seen or set()
        if "list" in node:
            return self._leaf_primitive(node["list"], seen)
        if "primitive" in node:
            return _LEAF_PRIMITIVE.get(node["primitive"])
        if "ref" in node:
            name = node["ref"]
            type_ = self.types.get(name)
            if name in seen or not type_ or type_["kind"] != "alias":
                return None
            seen.add(name)
            return self._leaf_primitive(type_["type"], seen)
        return None

    # --- Python type annotations ---
    def py_type(self, node: dict) -> tuple[str, set[str]]:
        refs: set[str] = set()
        base = self._py_base(node, refs)
        nullable = node.get("nullable") and base != "None"
        return (f"{base} | None" if nullable else base), refs

    def _py_base(self, node: dict, refs: set[str]) -> str:
        if "list" in node:
            inner, _ = self._py_inner(node["list"], refs)
            return f"list[{inner}]"
        if "ref" in node:
            return self._py_ref(node["ref"], refs)
        if "union" in node:
            return "Any"
        if "const" in node:
            value = node["const"]
            if isinstance(value, bool):
                return "bool"
            if isinstance(value, str):
                return "str"
            return "float" if isinstance(value, float) else "int"
        if "primitive" in node:
            return _PRIMITIVE[node["primitive"]]  # KeyError = a new schema primitive to handle (fail loud)
        return "Any"

    def _py_inner(self, node: dict, refs: set[str]) -> tuple[str, set[str]]:
        base = self._py_base(node, refs)
        return (f"{base} | None" if node.get("nullable") and base != "None" else base), refs

    def _py_ref(self, name: str, refs: set[str], seen: set[str] | None = None) -> str:
        seen = seen or set()
        if name in seen:
            return "Any"
        seen.add(name)
        type_ = self.types.get(name)
        if not type_:
            return "Any"
        kind = type_["kind"]
        if kind == "enum":
            refs.add(name)
            return type_class_name(name)
        if kind == "record":
            if not type_["fields"]:
                return "Any"
            refs.add(name)
            return type_class_name(name)
        if kind == "union":
            refs.add(name)
            return value_alias(name)
        if kind == "alias":
            inner = type_["type"]
            if "union" in inner:
                refs.add(name)
                return value_alias(name)
            if "ref" in inner:
                return self._py_ref(inner["ref"], refs, seen)
            if "list" in inner:
                elem, _ = self._py_inner(inner["list"], refs)
                return f"list[{elem}]"
            return self._py_base(inner, refs)
        return "Any"

    _pending_refs: set[str] = set()


# --------------------------------------------------------------------------- #
# IR builders
# --------------------------------------------------------------------------- #
_PARAMS_CLASS_KINDS = {"record", "union"}


def build_command(schema: Schema, cmd: dict) -> CommandIR:
    params = schema.params_for(cmd.get("params"))
    if cmd.get("params") and params is None:
        raise ValueError(f"command {cmd['method']} has params that cannot be expressed as a typed object")
    params_ref = (cmd.get("params") or {}).get("ref")
    kind = schema.type_kind(params_ref)
    params_class = type_class_name(params_ref) if params and kind in _PARAMS_CLASS_KINDS else None
    result_ref = (cmd.get("result") or {}).get("ref")
    result_name = schema.structured_ref(result_ref) if result_ref else None
    _guard_same_domain(cmd["domain"], params_ref if params_class else None, result_name, cmd["method"])
    result_class = type_class_name(result_name) if result_name else None
    if result_name and schema.type_kind(result_name) == "union":
        result_type = value_alias(result_name)
    elif result_class:
        result_type = result_class
    else:
        result_type = "Any"
    return CommandIR(
        wire=cmd["method"],
        method=safe_name(camel_to_snake(cmd["name"])),
        params=params or [],
        params_class=params_class,
        union_params=(kind == "union"),
        result_class=result_class,
        result_type=result_type,
        spec_href=cmd.get("specHref"),
    )


def build_event(schema: Schema, event: dict) -> EventIR:
    params = event.get("params")
    payload_ref = params.get("ref") if params else None
    payload = schema.structured_ref(payload_ref) if payload_ref else None
    _guard_same_domain(event["domain"], None, payload, event["method"])
    return EventIR(
        wire=event["method"],
        name=safe_name(camel_to_snake(event["name"])),
        payload_class=type_class_name(payload) if payload else None,
    )


def _guard_same_domain(domain: str, *type_names: str | None) -> None:
    for name in type_names:
        if name and "." in name and name.split(".", 1)[0] != domain:
            raise ValueError(f"{domain}: cross-domain type reference {name!r} not yet supported")


def build_module(schema: Schema, domain: str) -> ModuleIR:
    schema._pending_refs = set()
    records, unions = schema.types_for(domain)
    commands = [build_command(schema, c) for c in schema.commands_for(domain)]
    events = [build_event(schema, e) for e in schema.events_for(domain)]
    imports = _cross_domain_imports(schema, domain)
    return ModuleIR(
        domain=domain,
        class_name=snake_to_class(camel_to_snake(domain)),
        filename=camel_to_snake(domain),
        enums=schema.enums_for(domain),
        records=records,
        unions=unions,
        commands=commands,
        events=events,
        imports=imports,
        spec_href=schema._domain_links.get(domain, {}).get("specHref"),
    )


def _cross_domain_imports(schema: Schema, domain: str) -> dict[str, set[str]]:
    imports: dict[str, set[str]] = {}
    for ref in schema._pending_refs:
        ref_domain = ref.split(".", 1)[0]
        if ref_domain == domain:
            continue
        module = camel_to_snake(ref_domain)
        is_union = schema.type_kind(ref) == "union" or _is_alias_union(schema, ref)
        name = value_alias(ref) if is_union else type_class_name(ref)
        imports.setdefault(module, set()).add(name)
    return imports


def _is_alias_union(schema: Schema, ref: str) -> bool:
    t = schema.types.get(ref, {})
    return t.get("kind") == "alias" and "union" in t.get("type", {})


# --------------------------------------------------------------------------- #
# Emission
# --------------------------------------------------------------------------- #
def _annotation(f: FieldIR) -> str:
    if f.fixed is not _NO_FIXED:
        return f.py_type
    if f.required:
        return f.py_type
    return f"{f.py_type} | UnsetType"


def _wire_args(f: FieldIR) -> list[str]:
    args = [lit(f.wire)]
    if f.required:
        args.append("required=True")
    if f.nullable:
        args.append("nullable=True")
    if f.ref:
        args.append(f"ref={lit(f.ref)}")
    if f.is_list:
        args.append("is_list=True")
    if f.enum:
        args.append(f"enum={lit(f.enum)}")
    if f.primitive:
        args.append(f"primitive={lit(f.primitive)}")
    if f.scalar:
        value = f"[{', '.join(lit(s) for s in f.scalar)}]" if isinstance(f.scalar, list) else lit(f.scalar)
        args.append(f"scalar={value}")
    if f.fixed is not _NO_FIXED:
        args.append(f"fixed={lit(f.fixed)}")
    return args


def _emit_field(f: FieldIR, optional_default: bool) -> str:
    meta_call = f"meta({', '.join(_wire_args(f))})"
    field_args = []
    # Bake only a non-nullable const (a discriminator): it is forced and not constructor-settable.
    # A nullable const stays settable so a caller can pass its literal or ``None``.
    if f.fixed is not _NO_FIXED and not f.nullable:
        field_args += [f"default={lit(f.fixed)}", "init=False"]
    elif optional_default:
        field_args.append("default=UNSET")
    field_args.append(f"metadata={meta_call}")
    prefix = f"    {f.name}: {_annotation(f)} = field("
    return wrap_call(prefix, field_args, ")", 4)


def _spec_docstring(name: str, spec_href: str | None) -> list[str]:
    """Class docstring lines (with trailing blank) linking the element to its BiDi definition."""
    if not spec_href:
        return []
    return [f'    """{name}.', "", f"    See {spec_href}", '    """', ""]


def _emit_enum(e: EnumIR) -> str:
    lines = [f"@register({lit(e.schema_name)})", f"class {e.class_name}(str, Enum):"]
    lines += _spec_docstring(e.schema_name, e.spec_href)
    for member, value in e.members:
        lines.append(f"    {member} = {lit(value)}")
    return "\n".join(lines)


def _emit_record(r: RecordIR) -> str:
    lines = [f"@register({lit(r.schema_name)})", "@dataclass(frozen=True)", f"class {r.class_name}(Record):"]
    doc = _spec_docstring(r.schema_name, r.spec_href)
    lines += doc
    if r.extensible:
        lines.append("    _EXTENSIBLE = True")
    required = [f for f in r.fields if f.required]
    optional = [f for f in r.fields if not f.required]
    for f in required:
        lines.append(_emit_field(f, optional_default=False))
    if r.discriminator:
        lines.append(_emit_field(r.discriminator, optional_default=False))
    for f in optional:
        lines.append(_emit_field(f, optional_default=True))
    if r.extensible:
        lines.append('    extensions: dict[str, Any] | UnsetType = field(default=UNSET, metadata=meta("extensions"))')
    if not r.fields and not r.discriminator and not r.extensible and not doc:
        lines.append("    pass")
    return "\n".join(lines)


def _emit_union(u: UnionIR) -> str:
    lines = [f"@register({lit(u.schema_name)})", f"class {u.class_name}(Union):"]
    lines += _spec_docstring(u.schema_name, u.spec_href)
    value_variants = [v for v in u.variants if v.mode == "value"]
    fallback = next((v for v in u.variants if v.mode == "fallback"), None)
    presence = [v for v in u.variants if v.mode == "presence"]
    if u.discriminator is not None:
        lines.append(f"    _DISCRIMINATOR = {lit(u.discriminator)}")
    if value_variants:
        lines.append("    _VARIANTS = {")
        for v in value_variants:
            lines.append(f"        {lit(v.value)}: {lit(v.ref)},")
        lines.append("    }")
    if presence:
        entries = [f"({lit(v.ref)}, {tuple_lit(v.requires)})" for v in presence]
        lines.append(wrap_call("    _PRESENCE = (", entries, ")", 4))
    if fallback:
        lines.append(f"    _FALLBACK = {lit(fallback.ref)}")
    if u.discriminator_values:
        # Set literal inside frozenset (never frozenset(("x")) — a single value with no
        # trailing comma is not a tuple, so it would iterate the string into characters).
        values = [lit(v) for v in u.discriminator_values]
        lines.append(f"    _DISCRIMINATOR_VALUES = {frozenset_lit(values, 4)}")
    if u.object_only:
        lines.append("    _OBJECT_ONLY = True")
    if u.scalar_values:
        values = [lit(v) for v in u.scalar_values]
        lines.append(f"    _SCALAR_VALUES = {frozenset_lit(values, 4)}")
    alias = _emit_type_alias(value_alias(u.schema_name), u.variant_types)
    return "\n".join(lines) + "\n\n\n" + alias


def _emit_type_alias(name: str, variants: list[str]) -> str:
    unique = list(dict.fromkeys(variants))
    one_line = f'{name}: TypeAlias = "{" | ".join(unique)}"'
    if len(one_line) <= LINE_LIMIT:
        return one_line
    # Wrap into parenthesized implicit string concatenation (E501-safe); adjacent
    # string literals concatenate, and the " | " separators are kept intact.
    tokens = [unique[0]] + [f" | {v}" for v in unique[1:]]
    lines: list[str] = []
    cur = ""
    for tok in tokens:
        if cur and len(f'    "{cur}{tok}"') > LINE_LIMIT:
            lines.append(f'    "{cur}"')
            cur = tok
        else:
            cur += tok
    lines.append(f'    "{cur}"')
    return f"{name}: TypeAlias = (\n" + "\n".join(lines) + "\n)"


def _emit_command(c: CommandIR) -> list[str]:
    required = [p for p in c.params if p.required]
    optional = [p for p in c.params if not p.required]
    sig = ["self"]
    sig += [f"{p.name}: {p.py_type}" for p in required]
    sig += [f"{p.name}: {p.py_type} | UnsetType = UNSET" for p in optional]
    lines = [wrap_call(f"    def {c.method}(", sig, f") -> {c.result_type}:", 4)]
    if c.spec_href:
        lines.append(f'        """Execute {c.wire} (internal, unsupported).')
        lines.append("")
        lines.append(f"        See {c.spec_href}")
        lines.append('        """')
    else:
        lines.append(f'        """Execute {c.wire} (internal, unsupported)."""')
    if c.params_class:
        kwargs = [f"{p.name}={p.name}" for p in c.params]
        method = "build" if c.union_params else ""
        prefix = f"        params = {c.params_class}.{method}(" if method else f"        params = {c.params_class}("
        lines.append(wrap_call(prefix, kwargs, ")", 8))
        params_arg = "params=params"
    else:
        params_arg = "params=None"
    result_arg = f"result={c.result_class}" if c.result_class else "result=None"
    lines.append(f"        return self._execute({lit(c.wire)}, {params_arg}, {result_arg})")
    return lines


def _emit_domain_class(mod: ModuleIR) -> str:
    doc = ['    """Internal, unsupported.', "", f"    See {BIDI_DOC_URL}"]
    if mod.spec_href:
        doc.append(f"    See {mod.spec_href}")
    doc.append('    """')
    lines = [f"class {mod.class_name}(Domain):", *doc]
    if mod.events:
        # A blank line separates the class docstring from the first body statement; the
        # command methods below carry their own leading blank, so only EVENTS needs one here.
        lines.append("")
        lines.append("    EVENTS = {")
        for e in mod.events:
            lines.append(f"        {lit(e.name)}: {lit(e.wire)},")
        lines.append("    }")
        lines.append("    EVENT_TYPES = {")
        for e in mod.events:
            payload = lit(f"{mod.domain}.{e.payload_class}") if e.payload_class else "None"
            lines.append(f"        {lit(e.wire)}: {payload},")
        lines.append("    }")
    body = []
    for c in mod.commands:
        body.append("")
        body.extend(_emit_command(c))
    return "\n".join(lines + body)


def _import_order(name: str) -> tuple[int, str]:
    """Ruff isort 'order-by-type': constants (UPPER), then classes, then functions."""
    if name.isupper():
        rank = 0
    elif name[0].isupper():
        rank = 1
    else:
        rank = 2
    return (rank, name)


def _imports(mod: ModuleIR) -> list[str]:
    has_records = bool(mod.records)
    has_unions = bool(mod.unions)
    uses_literal = any((u.scalar_type or "").startswith("Literal[") for u in mod.unions)
    uses_unset = (
        any(not f.required for r in mod.records for f in r.fields)
        or any(r.extensible for r in mod.records)
        or any(not p.required for c in mod.commands for p in c.params)
    )
    # "Any" appears in any emitted annotation
    text_blob = " ".join(
        [f.py_type for r in mod.records for f in r.fields]
        + [p.py_type for c in mod.commands for p in c.params]
        + [c.result_type for c in mod.commands]
        + ["dict[str, Any]" if any(r.extensible for r in mod.records) else ""]
    )
    uses_any = "Any" in text_blob.split() or "Any]" in text_blob or "[Any" in text_blob

    typing_names = ["TYPE_CHECKING"] if mod.imports else []
    if uses_any:
        typing_names.append("Any")
    if uses_literal:
        typing_names.append("Literal")
    if has_unions:
        typing_names.append("TypeAlias")

    runtime = []
    if has_records:
        runtime += ["Record", "meta"]
    if has_unions:
        runtime.append("Union")
    if uses_unset:
        runtime += ["UNSET", "UnsetType"]
    if mod.enums or has_records or has_unions:
        runtime.append("register")

    lines = ["from __future__ import annotations", ""]
    if has_records:
        lines.append("from dataclasses import dataclass, field")
    if mod.enums:
        lines.append("from enum import Enum")
    if typing_names:
        lines.append(f"from typing import {', '.join(dict.fromkeys(typing_names))}")
    lines.append("")
    lines.append("from selenium.webdriver.common._bidi.domain import Domain")
    if runtime:
        names = ", ".join(sorted(set(runtime), key=_import_order))
        lines.append(f"from selenium.webdriver.common._bidi.serialization import {names}")
    if mod.imports:
        lines += ["", "if TYPE_CHECKING:"]
        for module in sorted(mod.imports):
            names = ", ".join(sorted(mod.imports[module]))
            lines.append(f"    from selenium.webdriver.common._bidi.{module} import {names}")
    return lines


def render_module(mod: ModuleIR) -> str:
    blocks: list[str] = [_HEADER, "\n".join(_imports(mod))]
    for e in mod.enums:
        blocks.append(_emit_enum(e))
    for r in mod.records:
        blocks.append(_emit_record(r))
    for u in mod.unions:
        blocks.append(_emit_union(u))
    blocks.append(_emit_domain_class(mod))
    return "\n\n\n".join(blocks) + "\n"


def exception_class_name(code: str) -> str:
    """The Python exception class name for a BiDi wire error code."""
    return "".join(word.capitalize() for word in re.split(r"[^a-zA-Z0-9]+", code) if word) + "Exception"


_ERRORS_DOCSTRING = '''"""Exception classes for BiDi wire error codes.

Codes the classic WebDriver error handler already types keep that class, so
``except NoSuchElementException`` catches a BiDi failure and a classic one alike, even
where the classic name does not follow from the wire code (``"no such alert"`` is
``NoAlertPresentException``, ``"unable to capture screen"`` is ``ScreenshotException``).
The rest are declared here as ``WebDriverException`` subclasses.

This is internal, unsupported implementation. See
https://www.selenium.dev/documentation/warnings/bidi-implementation/
"""'''


def _classic_exceptions() -> dict[str, type]:
    """Wire code to the classic exception the error handler already raises for it.

    Read from the handler's own tables rather than a second copy of them, so a class it
    retypes later follows here on the next build. A code the handler resolves to bare
    ``WebDriverException`` counts as untyped: a subclass declared in the generated module
    is strictly more specific and still caught by anyone catching the base.
    """
    from selenium.common.exceptions import WebDriverException
    from selenium.webdriver.remote.errorhandler import ErrorCode, ExceptionMapping

    classic: dict[str, type] = {}
    for name in dir(ErrorCode):
        codes = getattr(ErrorCode, name)
        mapped = getattr(ExceptionMapping, name, None)
        if not isinstance(codes, list) or mapped is None or mapped is WebDriverException:
            continue
        for code in codes:
            if isinstance(code, str):
                classic.setdefault(code, mapped)
    return classic


def render_errors(schema: Schema) -> str:
    """Render the exception classes for the BiDi ``ErrorCode`` enum.

    Emitted as real class statements rather than synthesized at import, so the classes
    type-check, autocomplete and document like every other exception in the bindings.
    """
    classic = _classic_exceptions()
    resolved = {code: classic.get(code) for code in schema.types["ErrorCode"]["values"]}

    imported = sorted({exc.__name__ for exc in resolved.values() if exc is not None} | {"WebDriverException"})
    import_block = "\n".join(["from selenium.common.exceptions import (", *(f"    {n}," for n in imported), ")"])

    declarations = [
        f'class {exception_class_name(code)}(WebDriverException):\n    """Raised for the BiDi {lit(code)} error."""'
        for code, exc in resolved.items()
        if exc is None
    ]

    entries = [
        f"    {lit(code)}: {exc.__name__ if exc is not None else exception_class_name(code)},"
        for code, exc in resolved.items()
    ]
    table = "\n".join(["EXCEPTIONS: dict[str, type[WebDriverException]] = {", *entries, "}"])

    lookup = '''def exception_for(code: str | None) -> type[WebDriverException]:
    """The exception class for a wire error code, falling back for an unrecognized one.

    An error the remote end reports must surface as that error even when the code is one
    this schema does not declare, so an unknown code is never a serialization failure.
    """
    return EXCEPTIONS.get(code, WebDriverException) if code else WebDriverException'''

    blocks = [_HEADER, _ERRORS_DOCSTRING, "from __future__ import annotations", import_block]
    blocks += declarations
    blocks += [table, lookup]
    return "\n\n\n".join(blocks) + "\n"


def render_all(schema_path: str) -> dict[str, str]:
    """Render every domain module plus the error classes; returns {filename: contents}.

    The package ``__init__.py`` is hand-written (it carries only the package
    docstring), so it is intentionally not emitted here.
    """
    schema = Schema(json.loads(Path(schema_path).read_text(encoding="utf-8")))
    modules = [build_module(schema, domain) for domain in schema.domains()]
    rendered = {f"{mod.filename}.py": render_module(mod) for mod in modules}
    rendered["errors.py"] = render_errors(schema)
    return rendered


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("schema", help="Path to the binding-neutral BiDi schema JSON")
    parser.add_argument(
        "output_dir",
        nargs="?",
        help="Output directory (default: <workspace>/py/selenium/webdriver/common/_bidi under `bazel run`)",
    )
    parser.add_argument(
        "--modules",
        help="Comma-separated module names the caller expects; errors if the schema's domains differ",
    )
    args = parser.parse_args()

    out_dir = args.output_dir
    if out_dir is None:
        workspace = os.environ.get("BUILD_WORKSPACE_DIRECTORY")
        if not workspace:
            parser.error("output_dir is required unless run via `bazel run` (sets BUILD_WORKSPACE_DIRECTORY)")
        out_dir = os.path.join(workspace, DEFAULT_OUTPUT)

    rendered = render_all(args.schema)
    if args.modules:
        expected = set(args.modules.split(","))
        actual = {name.removesuffix(".py") for name in rendered}
        if expected != actual:
            parser.error(
                f"BiDi schema domains drifted from the declared module list: "
                f"missing={sorted(expected - actual)} extra={sorted(actual - expected)}"
            )

    out = Path(out_dir)
    out.mkdir(parents=True, exist_ok=True)
    for name, contents in rendered.items():
        (out / name).write_text(contents, encoding="utf-8", newline="\n")
        print(f"bidi-generate: wrote {name}")


if __name__ == "__main__":
    main()
