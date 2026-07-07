# frozen_string_literal: true

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

require 'json'
require 'erb'
require 'fileutils'

# Generates Ruby WebDriver BiDi protocol modules from the shared, binding-neutral
# BiDi schema produced by the JavaScript generator (see PR #17700):
#   //javascript/selenium-webdriver:create-bidi-src_schema -> bidi-schema.json
#
# The schema is already normalized (inline enums hoisted, unions canonicalized,
# group composition flattened, wire names and nullability preserved verbatim), so
# this generator is a straight projection into Ruby with no CDDL interpretation.
#
# Invoked via `bazel run //rb/lib/selenium/webdriver:bidi-generate`. Bazel passes
# the schema path (resolved through runfiles) plus the workspace-relative output
# directory as ARGV. Can also be run directly:
#   ruby bidi_generate.rb schema.json output/dir
#
# @api private
module BiDiGenerate
  # Companion to the generated `@api private` tags: the page explaining why the BiDi
  # implementation layer is internal and what higher-level API to use instead (see #17628).
  BIDI_DOC_URL = 'https://www.selenium.dev/documentation/warnings/bidi-implementation/'

  # RuboCop's Layout/LineLength max; emitted Serialization::Record.define calls wrap to stay within it.
  LINE_LIMIT = 120

  # Ruby keywords that cannot be used as method names unquoted.
  RUBY_RESERVED = %w[begin end rescue ensure raise return yield if unless while until for do
                     case when then class module def].freeze

  def self.camel_to_snake(str)
    str
      .gsub(/([A-Z]+)([A-Z][a-z])/, '\1_\2')
      .gsub(/([a-z\d])([A-Z])/, '\1_\2')
      .downcase
  end

  def self.snake_to_class_name(snake)
    snake.split('_').map(&:capitalize).join
  end

  # Local constant for a domain-scoped type: "script.LocalValue" -> "LocalValue".
  # The first letter is capitalized so a lower-cased spec name (e.g.
  # "permissions.setPermission") still yields a valid Ruby constant.
  def self.type_class_name(type_name)
    type_name.split('.', 2).last.sub(/\A[a-z]/, &:upcase)
  end

  # Protocol-relative class path: "script.LocalValue" -> "Script::LocalValue".
  def self.type_ruby_path(type_name)
    domain = type_name.split('.', 2).first
    "#{snake_to_class_name(camel_to_snake(domain))}::#{type_class_name(type_name)}"
  end

  # Source literal for a discriminator/const value (string, boolean, or number).
  def self.ruby_literal(value)
    return 'nil' if value.nil?

    value.is_a?(String) ? "'#{value}'" : value.to_s
  end

  # Renders `prefix(args)` on one line, or one argument per line when it would exceed
  # LINE_LIMIT at the given indent. open/close default to parentheses (pass {} for a
  # hash literal) so emitted calls and literals stay within RuboCop's length limit.
  def self.wrap_call(prefix, args, indent, open: '(', close: ')')
    one_line = "#{prefix}#{open}#{args.join(', ')}#{close}"
    return one_line if args.empty? || indent + one_line.length <= LINE_LIMIT

    pad = ' ' * (indent + 2)
    "#{prefix}#{open}\n#{pad}#{args.join(",\n#{pad}")}\n#{' ' * indent}#{close}"
  end

  # Append underscore to avoid clashing with Ruby reserved keywords.
  def self.safe_method_name(name)
    RUBY_RESERVED.include?(name) ? "#{name}_" : name
  end

  # Object/Data methods a Data member name would shadow (breaking value semantics
  # or reflection), e.g. a "method" field overriding Object#method.
  RESERVED_FIELD_NAMES = (RUBY_RESERVED + %w[method hash class send dup clone freeze inspect
                                             to_h to_s members with deconstruct deconstruct_keys
                                             object_id tap itself then display
                                             extensible extensions]).freeze

  # Append underscore to a field name that would shadow a core method; the wire
  # name is unaffected, only the Ruby reader is renamed.
  def self.safe_field_name(name)
    RESERVED_FIELD_NAMES.include?(name) ? "#{name}_" : name
  end

  # SCREAMING_SNAKE constant name for an enum, matching the EVENTS map style
  # (ReadinessState → READINESS_STATE).
  def self.screaming_snake(camel)
    camel_to_snake(camel).upcase
  end

  # Makes an RBS type admit nil, idempotently (an already-nilable or opaque type is left
  # as-is). Applied to a field whose schema type is nullable, so its value type allows nil;
  # keyword-optionality is expressed separately by the `?` prefix (see rbs_part / rbs_arg).
  def self.rbs_nilable(type)
    return type if type == 'untyped' || type == 'nil' || type.end_with?('?')

    "#{type}?"
  end

  # Domain-qualified path to an enum's frozen hash constant
  # ("browsingContext.ReadinessState" → "BrowsingContext::READINESS_STATE"), so a
  # generated command method can reference it for an outbound membership check.
  def self.enum_const_path(type_name)
    domain, local = type_name.split('.', 2)
    "#{snake_to_class_name(camel_to_snake(domain))}::#{screaming_snake(local)}"
  end

  # snake_case hash key for an enum value (only a label for the wire value it maps to).
  # Preserves camelCase word boundaries (beforeRequestSent → before_request_sent), maps a
  # leading minus to "neg" (-0 → neg0, -Infinity → neg_infinity; no underscore before a
  # digit, so the key stays normalcase), and collapses other punctuation
  # (dedicated-worker → dedicated_worker).
  def self.enum_key(value)
    camel_to_snake(value.to_s)
      .sub(/\A-(?=\d)/, 'neg')
      .sub(/\A-/, 'neg_')
      .gsub(/[^a-z0-9]+/, '_')
      .gsub(/\A_+|_+\z/, '')
  end

  # ruby_name is the snake_case keyword argument; wire_name is the exact key the
  # protocol expects (baked verbatim from the schema, no runtime conversion). enum is
  # the allowed-values constant path for an enum-typed param (nil otherwise).
  Param = Struct.new(:ruby_name, :wire_name, :required, :enum, :rbs, keyword_init: true) do
    # Optionals default to UNSET (omitted), so an explicit nil can still reach a
    # nullable field as wire null.
    def sig_part
      required ? "#{ruby_name}:" : "#{ruby_name}: Serialization::UNSET"
    end

    def enum_check(indent)
      return unless enum

      BiDiGenerate.wrap_call('Serialization.validate!', ["'#{wire_name}'", ruby_name, enum], indent)
    end

    # An RBS keyword parameter carrying the param's value type. The `?` prefix marks the
    # keyword omittable; the value type already carries the schema's nullability, so nil is
    # admitted only for a nullable field (a non-nullable one rejects nil at construction).
    def rbs_part
      type = rbs || 'untyped'
      required ? "#{ruby_name}: #{type}" : "?#{ruby_name}: #{type}"
    end
  end

  # params_class is the Parameters class the named args construct (nil for a no-arg
  # command); union_params picks its variant via `.build` rather than `.new`. result_ref
  # is the Protocol-relative result class path, or nil to return the raw hash.
  Command = Struct.new(:wire_name, :method_name, :params, :result_ref, :params_class,
                       :union_params, keyword_init: true) do
    def required_params = params.select(&:required)
    def optional_params = params.reject(&:required)
    def enum_checks(indent) = params.filter_map { |p| p.enum_check(indent) }

    # `def name` or `def name(...)` — wrapped one argument per line when the signature
    # would exceed the line limit.
    def def_header(indent)
      return "def #{method_name}" if params.empty?

      BiDiGenerate.wrap_call("def #{method_name}", required_params.map(&:sig_part) + optional_params.map(&:sig_part),
                             indent)
    end

    # The RBS method signature `(params) -> return` — the return is the typed result class
    # when the command parses one, else `untyped`.
    def rbs_signature
      "(#{rbs_params}) -> #{rbs_return}"
    end

    def rbs_params
      (required_params.map(&:rbs_part) + optional_params.map(&:rbs_part)).join(', ')
    end

    def rbs_return
      result_ref ? "::Selenium::WebDriver::BiDi::Protocol::#{result_ref}" : 'untyped'
    end

    # The `params = …` line built before the execute call, or nil for a no-arg command. A
    # record builds its Parameters object and a union dispatches via `.build` (whose typed
    # as_json emits explicit null where a flat hash through Transport could not). Wrapped
    # one entry per line when long, so it (and the short execute call) stay within the limit.
    def params_assignment(indent)
      return nil if params.empty?

      kwargs = params.map { |p| "#{p.ruby_name}: #{p.ruby_name}" }
      BiDiGenerate.wrap_call("params = #{params_class}.#{union_params ? 'build' : 'new'}", kwargs, indent)
    end

    # `@transport.execute(cmd:[, params: params][, result:])`. The result type is
    # referenced directly (resolved lazily in the method body, and unambiguous within
    # Protocol). Params, when present, are the `params` local built above.
    def execute_call(indent)
      args = ["cmd: '#{wire_name}'"]
      args << 'params: params' unless params.empty?
      args << "result: #{result_ref}" if result_ref
      BiDiGenerate.wrap_call('execute', args, indent)
    end
  end

  # payload_ref is the Protocol-relative class the event's params parse into (nil when
  # non-structured, dispatched raw) — the inbound counterpart to a command's result_ref.
  Event = Struct.new(:wire_name, :event_name, :payload_ref, keyword_init: true) do
    # An EVENT_TYPES entry mapping the wire method to the type its params parse into.
    def type_entry = "'#{wire_name}' => #{payload_ref || 'nil'}"
  end

  # constant_name is the SCREAMING_SNAKE hash name; pairs are [symbol_key, wire_value] tuples.
  Enum = Struct.new(:constant_name, :pairs, keyword_init: true)

  # ref is the Protocol-relative class path for a nested structured field (nil
  # for a scalar/opaque field); list wraps it in an array. wire_key is the exact
  # JSON payload key (the schema's `wire` name, baked verbatim).
  FieldIR = Struct.new(:ruby_name, :wire_key, :required, :nullable, :ref, :list, :enum, :primitive, :rbs,
                       keyword_init: true) do
    # A `Serialization::Record.define` spec entry: `name: 'jsonKey'` shorthand, or
    # `name: {wire_key:, …}` when the field carries JSON facts beyond its name.
    # enum carries the allowed-values constant path, validated at construction.
    def spec_entry(indent = 0)
      meta = []
      meta << 'required: false' unless required
      meta << 'nullable: true' if nullable
      meta << "ref: '#{ref}'" if ref
      meta << 'list: true' if list
      meta << "enum: '#{enum}'" if enum
      meta << "primitive: '#{primitive}'" if primitive
      return "#{ruby_name}: '#{wire_key}'" if meta.empty?

      meta.unshift("wire_key: '#{wire_key}'")
      BiDiGenerate.wrap_call("#{ruby_name}: ", meta, indent, open: '{', close: '}')
    end

    # The `self.new` keyword for this field — a user-supplied input carrying the field's
    # value type. The `?` prefix marks the field omittable; its value type already carries
    # the schema's nullability, so nil is admitted only for a nullable field.
    def rbs_arg
      required ? "#{ruby_name}: #{rbs}" : "?#{ruby_name}: #{rbs}"
    end

    # The `attr_reader` type. A present value is `rbs`; an omitted optional reads back
    # the UNSET sentinel, which a value type can't capture, so optionals stay `untyped`.
    def rbs_reader
      "#{ruby_name}: #{required ? rbs : 'untyped'}"
    end
  end

  # A generated immutable value type (a Serialization::Record.define(...) class). discriminator is the
  # baked variant tag {ruby_name:, wire:, value:} or nil; schema_name/synthetic/owner/
  # nested drive owner-nesting (see nest_synthetic).
  TypeClass = Struct.new(:ruby_name, :fields, :discriminator, :extensible,
                         :schema_name, :synthetic, :owner, :label, :nested, keyword_init: true) do
    def union? = false
    def nested_types = nested || []

    # Keyword arguments for `Serialization::Record.define(...)`: the fixed discriminator member
    # first, then the fields, then the extensible flag.
    def define_entries(entry_indent)
      entries = []
      entries << discriminator_entry if discriminator
      entries.concat(fields.map { |f| f.spec_entry(entry_indent) })
      entries << 'extensible: true' if extensible
      entries
    end

    # `Name = Serialization::Record.define(...)` as one line when it fits within the line limit at the
    # given indent, else wrapped one entry per line — so the emitted source stays inside
    # RuboCop's length limit without a per-file exception. Entries render at indent + 2, the
    # indent a long field hash wraps itself against.
    def define_assignment(name, indent)
      BiDiGenerate.wrap_call("#{name} = Serialization::Record.define", define_entries(indent + 2), indent)
    end

    def discriminator_entry
      literal = BiDiGenerate.ruby_literal(discriminator[:value])
      if discriminator[:wire] == discriminator[:ruby_name].to_s
        "#{discriminator[:ruby_name]}: {fixed: #{literal}}"
      else
        "#{discriminator[:ruby_name]}: {wire_key: '#{discriminator[:wire]}', fixed: #{literal}}"
      end
    end

    # Every Data member gets a typed `attr_reader`: the baked discriminator (untyped),
    # each field (typed when required; UNSET-bearing optionals stay untyped), then the
    # extensible passthrough.
    def rbs_readers
      readers = []
      readers << "#{discriminator[:ruby_name]}: untyped" if discriminator
      readers.concat(fields.map(&:rbs_reader))
      readers << 'extensions: Hash[String, untyped]' if extensible
      readers
    end

    # The keyword arguments `self.new` accepts: each constructable field with its value
    # type, plus the optional extensions bag. The fixed discriminator is baked, so its
    # value is ignored — but the lenient `**kwargs` constructor still accepts it (and a
    # command method passes it through), so it is advertised as an optional keyword.
    def rbs_new_args
      parts = []
      parts << "?#{discriminator[:ruby_name]}: untyped" if discriminator
      parts.concat(fields.map(&:rbs_arg))
      parts << '?extensions: untyped' if extensible
      parts.join(', ')
    end
  end

  # mode is :value (matched by discriminator), :fallback (the no-tag variant), or
  # :presence (selected when its required wire keys are all present).
  VariantIR = Struct.new(:mode, :value, :ref, :requires, keyword_init: true) do
    # A string tag becomes an idiomatic symbol key; a bool/number tag stays a literal.
    def symbolic? = value.is_a?(::String)

    # The variant table entry: `sym: 'Ref'` for a string tag, else `true => 'Ref'`.
    def variant_entry
      key = symbolic? ? "#{BiDiGenerate.enum_key(value)}:" : "#{BiDiGenerate.ruby_literal(value)} =>"
      "#{key} '#{ref}'"
    end

    # `sym: 'wireToken'` feeding the union's inbound wire->symbol map (string tags only).
    def discriminator_pair
      "#{BiDiGenerate.enum_key(value)}: '#{value}'" if symbolic?
    end
  end

  # A generated discriminated union (< Serialization::Union, resolved by lexical scope).
  # nested holds its synthetic variant records (see nest_synthetic).
  UnionClass = Struct.new(:ruby_name, :discriminator_wire, :variants, :schema_name, :nested, keyword_init: true) do
    def union? = true
    def value_variants = variants.select { |v| v.mode == :value }
    def presence_variants = variants.select { |v| v.mode == :presence }
    def fallback_variant = variants.find { |v| v.mode == :fallback }
    def nested_types = nested || []

    # `discriminator 'wire'`, or `discriminator 'wire', {sym: 'token', …}` (wrapped when
    # long) carrying the inbound wire->symbol map for string-tagged variants.
    def discriminator_decl(indent)
      pairs = value_variants.filter_map(&:discriminator_pair)
      head = "discriminator '#{discriminator_wire}'"
      return head if pairs.empty?

      BiDiGenerate.wrap_call("#{head}, ", pairs, indent, open: '{', close: '}')
    end
  end

  Module = Struct.new(:name, :ruby_class, :filename, :commands, :events, :enums, :types, keyword_init: true)

  class Schema
    def initialize(schema)
      @types = schema['types']
      @commands = schema['commands']
      @events = schema['events']
      promote_command_params_records!
    end

    # A command written in CDDL map form carries its params as an *inline* object (rather
    # than the usual group form referencing a named params type). The projector links the
    # command to those params, but hoists them into a synthetic record owned by the
    # command's message envelope. That envelope is suppressed (Transport forms it), so the
    # synthetic params record would never be emitted even though the command's params ref
    # points straight at it. Promote it to a top-level domain record so the generator emits
    # and references it like any other params type. Today this is exactly
    # `userAgentClientHints.setClientHintsOverride`.
    def promote_command_params_records!
      @commands.each do |cmd|
        ref = cmd.dig('params', 'ref')
        next unless ref

        type = @types[ref]
        promote_to_domain_type!(ref) if type && envelope_synthetic?(type)
      end
    end

    # Strip the synthetic/owner/label tags so a lifted-out type emits as a top-level
    # domain record instead of nesting under its (suppressed) envelope.
    def promote_to_domain_type!(name)
      type = @types[name]
      type&.delete('synthetic')
      type&.delete('owner')
      type&.delete('label')
    end

    # Domains that carry a command or event each become one generated module.
    def domains
      (@commands + @events).map { |entry| entry['domain'] }.uniq
    end

    def commands_for(domain)
      @commands.select { |c| c['domain'] == domain }
    end

    def type_kind(ref)
      @types[ref]&.fetch('kind', nil)
    end

    def events_for(domain)
      @events.select { |e| e['domain'] == domain }
    end

    # Flat params for a command: the record's fields, or — for a union of
    # records — the merged superset of variant fields. Returns [] for commands
    # with no params, or nil when params can't be flattened (alias, or a union
    # whose variants aren't all records) so the caller forwards verbatim.
    def params_for(params_ref)
      return [] unless params_ref

      type = @types[params_ref['ref']]
      return nil unless type

      case type['kind']
      when 'record' then record_params(type['fields'])
      when 'union' then union_params(type, params_ref['ref'])
      end
    end

    # Enum types declared under "<domain>." become nested constant modules.
    def enums_for(domain)
      @types.filter_map do |name, type|
        next unless type['kind'] == 'enum'
        next unless name.start_with?("#{domain}.")

        pairs = type['values'].map { |v| [BiDiGenerate.enum_key(v), v.to_s] }
        Enum.new(constant_name: BiDiGenerate.screaming_snake(name.sub("#{domain}.", '')), pairs: pairs)
      end
    end

    # Structured value classes (records + discriminated unions) declared under
    # "<domain>." Empty records are projector artifacts with nothing to carry, so
    # they stay opaque hashes; only non-empty records and unions become classes.
    # Command/event message envelopes (the `{method, params}` wire wrapper) are
    # skipped — Transport forms that envelope, so nothing references them.
    def types_for(domain)
      prefix = "#{domain}."
      @types.filter_map do |name, type|
        next unless name.start_with?(prefix)

        case type['kind']
        when 'record' then record_class(name, type) unless type['fields'].empty? || suppressed_record?(type)
        when 'union' then union_class(name)
        when 'alias' then union_class(name) if type['type'].key?('union')
        end
      end
    end

    # Records the generator deliberately does not emit: a message envelope, or a
    # synthetic params record lifted out of one. Both are reachable only through the
    # envelope, which Transport replaces — so nothing else references them.
    def suppressed_record?(type)
      message_envelope?(type) || envelope_synthetic?(type)
    end

    # A protocol message envelope is a record with a baked `method` discriminator
    # (`{method: <const>, params: …}`) — the wire shape of a command/event message.
    # No value type carries a const `method` field, so this is unambiguous.
    def message_envelope?(type)
      type['fields'].any? { |f| f['wire'] == 'method' && f['type'].key?('const') }
    end

    # A synthetic record lifted out as an envelope's params (its owner is an envelope).
    def envelope_synthetic?(type)
      return false unless type['synthetic']

      owner = @types[type['owner']]
      owner && owner['kind'] == 'record' && message_envelope?(owner)
    end

    # The Protocol-relative class path a command result parses into, or nil when
    # it is non-structured (or a bare list, returned raw).
    def structured_ref(name)
      resolved = resolve_named(name)
      resolved[:list] ? nil : resolved[:ref]
    end

    private

    def domain_path(name)
      name.include?('.') ? ruby_path(name) : nil
    end

    # Class path, nesting a synthetic type under its owner as `Owner::Label` so a ref
    # resolves to the same nested constant the type is emitted as.
    def ruby_path(name)
      type = @types[name]
      return BiDiGenerate.type_ruby_path(name) unless type && type['synthetic']

      "#{ruby_path(type['owner'])}::#{type['label']}"
    end

    # Resolution for anything not modeled as a value type (scalar, enum, empty record).
    # Frozen because it is shared across callers.
    OPAQUE = {ref: nil, list: false, rbs: 'untyped'}.freeze

    # Projects a schema type node to {ref:, list:, nullable:, rbs:}. Deriving the
    # serialization facts and the RBS signature from one walk keeps them from drifting
    # apart when the schema shape changes.
    def resolve(node)
      nullable = node['nullable'] ? true : false
      if node.key?('list')
        element = resolve(node['list'])
        return {ref: element[:ref], list: true, nullable: nullable, rbs: nilable("Array[#{element[:rbs]}]", nullable)}
      end
      if node.key?('ref')
        named = resolve_named(node['ref'])
        return {ref: named[:ref], list: named[:list], nullable: nullable, rbs: nilable(named[:rbs], nullable)}
      end
      return resolve_union(node, nullable) if node.key?('union')

      {ref: nil, list: false, nullable: nullable, primitive: checkable_primitive(node),
       rbs: nilable(scalar_rbs(node), nullable)}
    end

    # An inline union of one union-typed arm plus scalars (e.g. a MappingRemoteValue entry,
    # RemoteValue / string) parses through that arm — its from_json returns a non-Hash value
    # unchanged, so the scalar siblings pass through. Carry its ref so nested entries are typed;
    # any other shape (a record arm, multiple structured arms, all scalars) stays opaque.
    def resolve_union(node, nullable)
      refs = node['union'].select { |arm| arm.key?('ref') }
      opaque = {ref: nil, list: false, nullable: nullable, rbs: nilable('untyped', nullable)}
      return opaque unless refs.one? && union_ref?(refs.first['ref'])

      named = resolve_named(refs.first['ref'])
      {ref: named[:ref], list: named[:list], nullable: nullable, rbs: nilable('untyped', nullable)}
    end

    # True when a ref (following aliases) is a union — the only arm whose from_json tolerates a
    # scalar sibling. A record arm would raise on one, so it is not carried.
    def union_ref?(name)
      type = @types[name]
      return false unless type
      return union_ref?(type['type']['ref']) if type['kind'] == 'alias' && type['type'].key?('ref')

      type['kind'] == 'union'
    end

    # Resolves a named ref to the same {ref:, list:, rbs:} facts, transparently
    # following aliases — including alias-to-list — so an element type behind an alias
    # (e.g. script.ListLocalValue -> [script.LocalValue]) is preserved. Nullability is a
    # property of the referencing node (applied by +resolve+), so it is not threaded
    # here. seen guards against cyclic ref-aliases.
    def resolve_named(name, seen = {})
      return OPAQUE if name.nil? || seen[name]

      seen[name] = true
      type = @types[name]
      return OPAQUE unless type

      case type['kind']
      when 'record' then type['fields'].empty? ? OPAQUE : named_type(name)
      when 'union' then named_type(name)
      when 'enum' then {ref: nil, list: false, rbs: 'Symbol'}
      when 'alias' then resolve_named_alias(name, type['type'], seen)
      else OPAQUE
      end
    end

    # A named structured type's serialization ref (nil for a dotless/global type, never
    # emitted as a class) and its absolute RBS class path, derived independently so each
    # output keeps its own treatment of dotless names.
    def named_type(name)
      {ref: domain_path(name), list: false, rbs: rbs_abs(ruby_path(name))}
    end

    def resolve_named_alias(name, inner, seen)
      return named_type(name) if inner.key?('union')
      return resolve_named(inner['ref'], seen) if inner.key?('ref')

      if inner.key?('list')
        element = resolve(inner['list'])
        return {ref: element[:ref], list: true, rbs: "Array[#{element[:rbs]}]"}
      end

      {ref: nil, list: false, rbs: scalar_rbs(inner)}
    end

    def nilable(type, flag)
      flag ? BiDiGenerate.rbs_nilable(type) : type
    end

    def record_class(name, type)
      const = type['fields'].find { |f| baked_discriminator?(f) }
      discriminator = const && {ruby_name: BiDiGenerate.safe_field_name(BiDiGenerate.camel_to_snake(const['name'])),
                                wire: const['wire'], value: const['type']['const']}
      fields = type['fields'].reject { |f| baked_discriminator?(f) }.map { |f| field_ir(f) }
      TypeClass.new(ruby_name: BiDiGenerate.type_class_name(name), fields: fields,
                    discriminator: discriminator, extensible: type['extensible'] ? true : false,
                    schema_name: name, synthetic: type['synthetic'] ? true : false,
                    owner: type['owner'], label: type['label'])
    end

    # A const field is a baked discriminator tag, unless it is also nullable: the spec's
    # `literal | null` (browsingContext.setBypassCSP, emulation.setScriptingEnabled) is a
    # settable value (the literal to set, null to clear), so it stays a normal field that
    # can serialize null rather than a fixed tag that can only ever emit the literal.
    def baked_discriminator?(field)
      field['type'].key?('const') && !field['type']['nullable']
    end

    def field_ir(field)
      resolved = resolve(field['type'])
      ruby_name = BiDiGenerate.safe_field_name(BiDiGenerate.camel_to_snake(field['name']))
      FieldIR.new(ruby_name: ruby_name, wire_key: field['wire'],
                  required: field['required'], nullable: resolved[:nullable],
                  ref: resolved[:ref], list: resolved[:list], enum: enum_const(field['type']),
                  primitive: resolved[:primitive], rbs: resolved[:rbs])
    end

    def union_class(name)
      type = @types[name]
      # A first-class union carries the schema's authoritative dispatch `selector`
      # (derived spec-faithfully, including null discriminators and the spec's choice
      # order); consume it rather than re-deriving and silently depending on emit
      # order. An alias-to-union (only input.Origin) has no selector — its const-string
      # arms aren't first-class types — so it keeps the structural re-derivation.
      type['kind'] == 'union' ? union_from_selector(name, type['selector']) : union_from_alias(name)
    end

    # Map a union `selector` to dispatch variants the template renders:
    #   { by, variants, default? } -> a discriminator table (value => ref), `default`
    #     as the fallback (it may itself be a union, which finishes the dispatch).
    #   { ordered: [{ ref, requires }] } -> presence rules in the spec's choice order.
    #   { correlated: true } -> resolved by request id, not the payload, so no payload
    #     dispatch. Unreachable here: every correlated union is a top-level result
    #     grouping, never domain-scoped, so it is never emitted as a class.
    def union_from_selector(name, selector)
      # A correlated union is resolved by request id, never the payload, so it carries
      # no dispatch — it must never be emitted (every one is a top-level result
      # grouping). Fail loudly if a future schema makes one domain-scoped rather than
      # emit a Union whose every parse would raise.
      if selector['correlated']
        raise "correlated union #{name} must not be emitted (resolved by request id, not payload)"
      end

      variants = selector['by'] ? discriminated_variants(selector) : ordered_variants(selector)
      raise "union #{name} selector yielded no dispatch variants" if variants.empty?

      UnionClass.new(ruby_name: BiDiGenerate.type_class_name(name),
                     discriminator_wire: selector['by'], variants: variants, schema_name: name)
    end

    def discriminated_variants(selector)
      variants = selector['variants'].map do |variant|
        VariantIR.new(mode: :value, value: variant['value'], ref: ruby_path(variant['ref']), requires: nil)
      end
      return variants unless selector['default']

      variants << VariantIR.new(mode: :fallback, value: nil, ref: ruby_path(selector['default']), requires: nil)
    end

    def ordered_variants(selector)
      (selector['ordered'] || []).map do |arm|
        VariantIR.new(mode: :presence, value: nil, ref: ruby_path(arm['ref']), requires: arm['requires'])
      end
    end

    # The sole alias-union is input.Origin ("viewport" | "pointer" | ElementOrigin): a
    # scalar-or-object union the object-payload selector model doesn't cover, so the
    # projector leaves it an alias with no selector. Its object arm(s) carry a const
    # discriminator; the bare-string arms need no dispatch (Union.from_json returns a
    # non-Hash payload unchanged). So dispatch the ref arms by their const tag.
    def union_from_alias(name)
      consts = @types[name]['type']['union'].filter_map { |arm| arm['ref'] }.to_h do |ref|
        const = @types[ref]['fields'].find { |f| f['type'].key?('const') }
        const || raise("alias-union #{name} arm #{ref} has no const discriminator to dispatch on")
        [ref, const]
      end
      variants = consts.map do |ref, const|
        VariantIR.new(mode: :value, value: const['type']['const'], ref: ruby_path(ref), requires: nil)
      end
      UnionClass.new(ruby_name: BiDiGenerate.type_class_name(name),
                     discriminator_wire: consts.values.first['wire'], variants: variants, schema_name: name)
    end

    def record_params(fields)
      fields.map do |field|
        Param.new(
          ruby_name: BiDiGenerate.safe_field_name(BiDiGenerate.camel_to_snake(field['name'])),
          wire_name: field['wire'],
          required: field['required'],
          enum: enum_const(field['type']),
          rbs: rbs_type(field['type'])
        )
      end
    end

    def rbs_type(node)
      resolve(node)[:rbs]
    end

    PRIMITIVE_RBS = {
      'string' => 'String', 'number' => 'Numeric', 'integer' => 'Integer',
      'boolean' => 'bool', 'null' => 'nil', 'unknown' => 'untyped'
    }.freeze

    # Scalar primitives worth an inbound type-shape check; `null`/`unknown` are opaque, so
    # an unmarked field is left unchecked (lenient default — a missed check fails open,
    # whereas a wrong strict default would reject valid data).
    CHECKABLE_PRIMITIVES = %w[string number integer boolean].freeze

    def checkable_primitive(node)
      node['primitive'] if node.key?('primitive') && CHECKABLE_PRIMITIVES.include?(node['primitive'])
    end

    # The leaf of +resolve+: the bare scalar type, before any nullable wrap. An alias's
    # own nullable is intentionally left off — only the referencing node's is applied.
    def scalar_rbs(node)
      return PRIMITIVE_RBS.fetch(node['primitive'], 'untyped') if node.key?('primitive')
      return rbs_const(node['const']) if node.key?('const')

      'untyped'
    end

    def rbs_const(value)
      case value
      when true, false then 'bool'
      when ::String then 'String'
      when ::Numeric then 'Numeric'
      else 'untyped'
      end
    end

    def rbs_abs(path)
      "::Selenium::WebDriver::BiDi::Protocol::#{path}"
    end

    # The allowed-values constant path when a field (or a list's element) is an enum
    # type, else nil. Union command-params skip this (their merged superset can blur a
    # discriminator's const vs enum); only flat record params get the outbound check.
    def enum_const(field_type)
      ref = field_type['ref'] || field_type.dig('list', 'ref')
      return unless ref && @types[ref] && @types[ref]['kind'] == 'enum'

      BiDiGenerate.enum_const_path(ref)
    end

    # Merge a union's record variants into one flat param list for the command
    # signature. A field is only required when every variant declares it required;
    # variant-specific fields become optional. The command body dispatches these
    # kwargs to the matching variant via `Union.build`, whose typed `as_json` handles
    # null-vs-absent — so no nullable allowlist is needed.
    def union_params(type, ref = nil)
      variants = type['variants'].map { |variant_ref| @types[variant_ref] }
      return nil unless variants.all? { |v| v && v['kind'] == 'record' }

      selector = type['selector']
      guard_union_dispatch_keys_simple!(selector, ref)
      params = merged_params(variants.map { |v| v['fields'] })
      annotate_discriminator_enum!(params, selector)
      params
    end

    # A discriminated union's `by` field is validated against the whole allowed set:
    # the const values that tag each variant plus the default variant's own enum
    # values (e.g. continueWithAuth.action = {provideCredentials} + {default, cancel}).
    # That spans variants, so no single enum constant fits — emit an inline symbol=>wire
    # hash so the check accepts the idiomatic symbol like every other enum.
    # Boolean discriminators (handleRequestDevicePrompt.accept) need no membership check.
    def annotate_discriminator_enum!(params, selector)
      by = selector['by']
      tagged = by ? selector['variants'].map { |v| v['value'] } : []
      return unless !tagged.empty? && tagged.all?(String)

      allowed = (tagged + default_variant_enum_values(selector, by)).uniq
      pairs = allowed.map { |v| "#{BiDiGenerate.enum_key(v)}: '#{v}'" }
      param = params.find { |p| p.wire_name == by }
      return unless param

      param.enum = "{#{pairs.join(', ')}}"
      param.rbs = 'Symbol'
    end

    def default_variant_enum_values(selector, by)
      default = selector['default']
      field = default && @types[default]['fields'].find { |f| f['wire'] == by }
      ref = field && field['type']['ref']
      ref && @types[ref] && @types[ref]['kind'] == 'enum' ? @types[ref]['values'] : []
    end

    # Merge variant field lists into one flat param superset. A field is required only
    # when every variant declares it required; variant-specific fields become optional.
    def merged_params(variant_fields)
      all_fields = variant_fields.flatten
      all_fields.map { |f| f['wire'] }.uniq.map do |wire|
        field = all_fields.find { |f| f['wire'] == wire }
        required = variant_fields.all? { |fields| fields.any? { |f| f['wire'] == wire && f['required'] } }
        Param.new(ruby_name: BiDiGenerate.safe_field_name(BiDiGenerate.camel_to_snake(field['name'])),
                  wire_name: wire, required: required, rbs: rbs_type(field['type']))
      end
    end

    # `Union.build` matches the command's kwargs to the selector's dispatch keys by
    # symbol, which holds only while each dispatch wire key equals its ruby kwarg.
    # Every current key is a single lowercase word; fail generation if a new one is
    # camelCase so the outbound dispatch gets an explicit wire<->ruby mapping then.
    def guard_union_dispatch_keys_simple!(selector, ref)
      keys = selector['by'] ? [selector['by']] : (selector['ordered'] || []).flat_map { |arm| arm['requires'] }
      camel = keys.reject { |k| BiDiGenerate.camel_to_snake(k) == k }
      return if camel.empty?

      raise "union command param #{ref} dispatches on non-snake wire key(s) #{camel.inspect}; " \
            'Union.build matches kwargs to dispatch keys by symbol, so give the outbound ' \
            'dispatch an explicit wire<->ruby mapping before shipping this.'
    end
  end

  # Param kinds the named args can construct a Parameters object for (record fields,
  # or a union dispatched to one of its variants); anything else forwards a raw hash.
  PARAMS_CLASS_KINDS = %w[record union].freeze

  def self.build_ir(schema)
    schema.domains.map do |domain|
      Module.new(
        name: domain,
        ruby_class: snake_to_class_name(camel_to_snake(domain)),
        filename: camel_to_snake(domain),
        commands: schema.commands_for(domain).map { |cmd| build_command(schema, cmd) },
        events: schema.events_for(domain).map { |ev| build_event(schema, ev) },
        enums: schema.enums_for(domain),
        types: nest_synthetic(schema.types_for(domain))
      )
    end
  end

  def self.build_command(schema, cmd)
    params = schema.params_for(cmd['params'])
    # A param that can't flatten to a typed object (alias or non-record union) would be
    # silently dropped, so fail generation and handle that shape deliberately if it appears.
    if cmd['params'] && params.nil?
      raise "command #{cmd['method']} has params that cannot be expressed as a typed object"
    end

    params_ref = cmd['params'] && cmd['params']['ref']
    params_kind = schema.type_kind(params_ref)
    params_class = type_class_name(params_ref) if !params.empty? && PARAMS_CLASS_KINDS.include?(params_kind)
    Command.new(
      wire_name: cmd['method'],
      method_name: safe_method_name(camel_to_snake(cmd['name'])),
      params: params,
      result_ref: cmd['result'] && schema.structured_ref(cmd['result']['ref']),
      params_class: params_class,
      union_params: params_kind == 'union'
    )
  end

  def self.build_event(schema, event)
    params = event['params']
    payload_ref = params && params['ref'] && schema.structured_ref(params['ref'])
    Event.new(wire_name: event['method'], event_name: camel_to_snake(event['name']), payload_ref: payload_ref)
  end

  # The projector tags lifted-out types with {synthetic, owner, label}. Emit each
  # synthetic record inside its owner's class body under its bare label, so
  # `Owner_Label` becomes the nested `Owner::Label` (refs resolve there via
  # ruby_path). Synthetic enums stay domain-level. Raises on a missing owner.
  def self.nest_synthetic(types)
    index = types.to_h { |t| [t.schema_name, t] }
    children = types.select { |t| !t.union? && t.synthetic }
    children.each do |child|
      owner = index[child.owner] ||
              raise("synthetic type #{child.schema_name} has no emitted owner #{child.owner}")
      owner.nested = (owner.nested || []) << child
      child.ruby_name = child.label
    end
    types - children
  end

  def self.render(mod, template_path)
    ERB.new(File.read(template_path), trim_mode: '-').result(binding)
  end

  def self.call(schema_path, output_dir)
    raw = load_json(schema_path)
    schema = Schema.new(raw)
    modules = build_ir(schema)

    emit(modules, output_dir, 'module.rb.erb', 'rb')
    emit(modules, sig_dir(output_dir), 'module.rbs.erb', 'rbs')
  end

  # Renders every module through one template and writes the result into target,
  # one file per module. Used for both the Ruby source and its RBS signatures.
  def self.emit(modules, output_dir, template, extension)
    target = File.join(workspace_root, output_dir)
    FileUtils.mkdir_p(target)

    tmpl = File.join(File.dirname(__FILE__), 'templates', template)
    modules.each do |mod|
      path = File.join(target, "#{mod.filename}.#{extension}")
      File.write(path, render(mod, tmpl))
      warn "bidi-generate: wrote #{path}"
    end
  end

  # The RBS signatures mirror the source tree under sig/ (the repo's convention),
  # e.g. rb/lib/.../protocol -> rb/sig/lib/.../protocol.
  def self.sig_dir(output_dir)
    output_dir.sub(%r{(\A|/)lib/}, '\1sig/lib/')
  end

  private_class_method def self.load_json(path)
    resolved = File.exist?(path) ? path : File.join(Dir.pwd, path)
    JSON.parse(File.read(resolved))
  end

  private_class_method def self.workspace_root
    ENV['BUILD_WORKSPACE_DIRECTORY'] || Dir.pwd
  end
end

BiDiGenerate.call(*ARGV) if $PROGRAM_NAME == __FILE__
