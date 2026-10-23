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

require File.expand_path('../../spec_helper', __dir__)
require File.expand_path('../../../../../../lib/selenium/webdriver/bidi/support/bidi_generate', __dir__)

module BiDiGenerate
  describe '.camel_to_snake' do
    it 'splits camelCase on word boundaries' do
      expect(BiDiGenerate.camel_to_snake('browsingContext')).to eq('browsing_context')
    end

    it 'keeps acronym runs together' do
      expect(BiDiGenerate.camel_to_snake('setBypassCSP')).to eq('set_bypass_csp')
    end
  end

  describe '.safe_field_name' do
    it 'renames extensions on an extensible record, where it holds the undeclared fields' do
      expect(BiDiGenerate.safe_field_name('extensions', extensible: true)).to eq('extensions_')
    end

    it 'keeps extensions on a closed record' do
      expect(BiDiGenerate.safe_field_name('extensions', extensible: false)).to eq('extensions')
    end
  end

  describe '.enum_key' do
    it 'maps a leading minus before a word to neg_' do
      expect(BiDiGenerate.enum_key('-Infinity')).to eq('neg_infinity')
    end

    it 'maps a leading minus before a digit to neg (no underscore, stays normalcase)' do
      expect(BiDiGenerate.enum_key('-0')).to eq('neg0')
    end

    it 'collapses punctuation' do
      expect(BiDiGenerate.enum_key('dedicated-worker')).to eq('dedicated_worker')
    end

    it 'prefixes a numeric value so the key is a valid symbol' do
      expect(BiDiGenerate.enum_key(0)).to eq('_0')
    end
  end

  describe 'FieldIR#spec_entry' do
    let(:field) { BiDiGenerate::FieldIR.new(ruby_name: 'n', wire_key: 'n', required: false, bounds: {}) }

    it 'stays on one line when it fits with its separating comma' do
      expect(field.spec_entry(84, trailing: 1)).to eq("n: {wire_key: 'n', required: false}")
    end

    it 'wraps when its separating comma would pass the line limit' do
      expect(field.spec_entry(85, trailing: 1)).to start_with("n: {\n")
    end

    it 'stays on one line at the line limit when no comma follows it' do
      expect(field.spec_entry(85)).to eq("n: {wire_key: 'n', required: false}")
    end
  end

  describe '.check_accessor_collisions!' do
    def accessor(name)
      BiDiGenerate::Accessor.new(method_name: name, type_name: 'T', union: false)
    end

    def command(name)
      BiDiGenerate::Command.new(wire_name: "x.#{name}", method_name: name, params: [], result_ref: nil,
                                params_class: nil, union_params: false, spec_href: nil)
    end

    def mod(accessors:, commands: [])
      BiDiGenerate::Module.new(name: 'x', ruby_class: 'X', filename: 'x', commands: commands, events: [],
                               enums: [], types: [], accessors: accessors, vendor_modules: [], spec_href: nil)
    end

    it 'passes when accessor names are unique and unshadowed' do
      expect { BiDiGenerate.check_accessor_collisions!(mod(accessors: [accessor('extension_path')])) }
        .not_to raise_error
    end

    it 'fails when an accessor shadows a command method' do
      expect { BiDiGenerate.check_accessor_collisions!(mod(accessors: [accessor('foo')], commands: [command('foo')])) }
        .to raise_error(/collides with a command method/)
    end

    it 'fails when an accessor shadows an inherited method' do
      expect { BiDiGenerate.check_accessor_collisions!(mod(accessors: [accessor('hash')])) }
        .to raise_error(/collides with an inherited method/)
    end

    it 'fails when two accessors share a name' do
      expect { BiDiGenerate.check_accessor_collisions!(mod(accessors: [accessor('dupe'), accessor('dupe')])) }
        .to raise_error(/collides with the accessor/)
    end
  end

  describe 'Schema#types_for with a field-less synthetic map record' do
    # The projector has no inline map form for a field, so `{*text => text}` is hoisted into a
    # field-less record carrying the value type under `map` (script.NodeProperties.attributes).
    def synthetic_map(value_type)
      {'kind' => 'record', 'fields' => [], 'map' => value_type, 'synthetic' => true,
       'owner' => 'x.Owner', 'label' => 'Attributes', 'outbound' => false, 'inbound' => true}
    end

    def schema(value_type)
      types = {
        'x.Owner' => {'kind' => 'record', 'outbound' => false, 'inbound' => true,
                      'fields' => [{'name' => 'attributes', 'wire' => 'attributes', 'required' => false,
                                    'type' => {'ref' => 'x.OwnerAttributes'}}]},
        'x.OwnerAttributes' => synthetic_map(value_type),
        'x.Value' => {'kind' => 'record', 'outbound' => false, 'inbound' => true,
                      'fields' => [{'name' => 'v', 'wire' => 'v', 'required' => true,
                                    'type' => {'primitive' => 'string'}}]},
        'x.Int' => {'kind' => 'alias', 'type' => {'primitive' => 'integer'}}
      }
      BiDiGenerate::Schema.new('types' => types, 'commands' => [], 'events' => [], 'domains' => {'x' => {}})
    end

    def attributes_field(value_type)
      owner = schema(value_type).types_for('x').find { |t| t.schema_name == 'x.Owner' }
      owner.fields.find { |f| f.ruby_name == 'attributes' }
    end

    it 'carries a primitive-valued map as a map descriptor' do
      expect(attributes_field('primitive' => 'string').spec_entry)
        .to eq("attributes: {wire_key: 'attributes', required: false, map: 'string'}")
    end

    it 'types a primitive-valued map as a Hash of its value type' do
      expect(attributes_field('primitive' => 'string').rbs).to eq('Hash[String, String]')
    end

    it 'does not emit the synthetic map record as a class' do
      expect(schema('primitive' => 'string').types_for('x').map(&:schema_name)).not_to include('x.OwnerAttributes')
    end

    it 'carries a map whose values are a union of primitives as the list of them' do
      field = attributes_field('union' => [{'primitive' => 'string'}, {'primitive' => 'boolean'}, {'ref' => 'x.Int'}])

      expect(field.spec_entry)
        .to eq("attributes: {wire_key: 'attributes', required: false, map: %w[string boolean integer]}")
      expect(field.rbs).to eq('Hash[String, String | bool | Integer]')
    end

    it 'leaves a map whose union includes a non-primitive opaque' do
      field = attributes_field('union' => [{'primitive' => 'string'}, {'ref' => 'x.Value'}])

      expect(field.spec_entry).to eq("attributes: {wire_key: 'attributes', required: false}")
    end

    it 'leaves a ref-valued map opaque' do
      field = attributes_field('ref' => 'x.Value')

      expect(field.spec_entry).to eq("attributes: {wire_key: 'attributes', required: false}")
      expect(field.rbs).to eq('untyped')
    end
  end

  describe 'Schema#types_for with numeric bounds' do
    def alias_of(type) = {'kind' => 'alias', 'type' => type}

    def prefs_map(*arms)
      {'kind' => 'record', 'fields' => [], 'map' => {'union' => arms}, 'synthetic' => true,
       'owner' => 'x.Owner', 'label' => 'Prefs', 'outbound' => true, 'inbound' => false}
    end

    def spec_entry(type)
      owner = {'kind' => 'record', 'outbound' => true, 'inbound' => true,
               'fields' => [{'name' => 'n', 'wire' => 'n', 'required' => true, 'type' => type}]}
      types = {
        'x.Owner' => owner,
        'x.Uint' => alias_of('primitive' => 'integer', 'min' => 0, 'max' => 9_007_199_254_740_991),
        'x.Percent' => alias_of('ref' => 'x.Uint', 'max' => 100),
        'x.Fraction' => alias_of('primitive' => 'number', 'max' => 1, 'exclusiveMax' => true),
        'x.OwnerPrefs' => prefs_map({'primitive' => 'string'}, {'ref' => 'x.Uint'}),
        'x.OwnerMixed' => prefs_map({'ref' => 'x.Uint'}, {'primitive' => 'number'})
      }
      schema = BiDiGenerate::Schema.new('types' => types, 'commands' => [], 'events' => [], 'domains' => {'x' => {}})
      schema.types_for('x').find { |t| t.schema_name == 'x.Owner' }.fields.first.spec_entry
    end

    it "carries a primitive field's own bounds" do
      expect(spec_entry('primitive' => 'number', 'min' => 0, 'exclusiveMin' => true))
        .to eq("n: {wire_key: 'n', primitive: 'number', min: 0, exclusive_min: true}")
    end

    it 'carries the bounds of the alias a field names' do
      expect(spec_entry('ref' => 'x.Uint'))
        .to eq("n: {wire_key: 'n', primitive: 'integer', min: 0, max: 9_007_199_254_740_991}")
    end

    it "narrows the alias's bounds with the field's own" do
      expect(spec_entry('ref' => 'x.Uint', 'min' => 1))
        .to eq("n: {wire_key: 'n', primitive: 'integer', min: 1, max: 9_007_199_254_740_991}")
    end

    it 'keeps the tighter bound along an alias chain' do
      expect(spec_entry('ref' => 'x.Percent', 'min' => -5, 'max' => 50))
        .to eq("n: {wire_key: 'n', primitive: 'integer', min: 0, max: 50}")
    end

    it 'treats an exclusive bound as tighter than an inclusive one at the same value' do
      expect(spec_entry('ref' => 'x.Fraction', 'max' => 1))
        .to eq("n: {wire_key: 'n', primitive: 'number', max: 1, exclusive_max: true}")
      expect(spec_entry('ref' => 'x.Percent', 'max' => 100, 'exclusiveMax' => true))
        .to eq("n: {wire_key: 'n', primitive: 'integer', min: 0, max: 100, exclusive_max: true}")
    end

    it "carries the bounds of a list's elements" do
      expect(spec_entry('list' => {'ref' => 'x.Percent'}))
        .to eq("n: {wire_key: 'n', list: true, primitive: 'integer', min: 0, max: 100}")
    end

    it "carries the bounds of a scalar union's numeric arm" do
      expect(spec_entry('list' => {'union' => [{'ref' => 'x.Percent'}, {'primitive' => 'string'}]}))
        .to eq("n: {wire_key: 'n', list: true, primitive: %w[integer string], min: 0, max: 100}")
    end

    it "carries the bounds of a map's numeric value arm" do
      expect(spec_entry('ref' => 'x.OwnerPrefs'))
        .to eq("n: {wire_key: 'n', map: %w[string integer], min: 0, max: 9_007_199_254_740_991}")
    end

    it 'fails generation when the numeric arms of a map carry different bounds' do
      expect { spec_entry('ref' => 'x.OwnerMixed') }.to raise_error(/different bounds/)
    end
  end

  describe 'Schema with a vendor extension' do
    def scope_field(required: false)
      {'name' => 'moz:scope', 'wire' => 'moz:scope', 'required' => required,
       'type' => {'enum' => %w[chrome content], 'primitive' => 'string'}}
    end

    def record(fields, outbound: true, extensible: false)
      {'kind' => 'record', 'outbound' => outbound, 'inbound' => !outbound, 'extensible' => extensible,
       'fields' => fields.map { |name, type| {'name' => name, 'wire' => name, 'required' => false, 'type' => type} }}
    end

    def schema(extra_types = {})
      types = {
        'x.Info' => record({'id' => {'primitive' => 'string'}}, outbound: false),
        'x.GetParameters' => record({'depth' => {'primitive' => 'integer'}}),
        'x.Request' => record({'name' => {'primitive' => 'string'}}, extensible: true)
      }.merge(extra_types)
      command = {'domain' => 'x', 'name' => 'get', 'method' => 'x.get',
                 'params' => {'ref' => 'x.GetParameters'}, 'result' => {'ref' => 'x.Info'}}
      extends = {'x.Info' => {'fields' => [scope_field(required: true)]},
                 'x.GetParameters' => {'fields' => [scope_field]},
                 'x.Request' => {'fields' => [{'name' => 'moz:opts', 'wire' => 'moz:opts', 'required' => false,
                                               'type' => {'ref' => 'x.RequestMozOpts'}}]}}
      vendor_types = {'x.RequestMozOpts' => record({'debug' => {'primitive' => 'boolean'}})}
      BiDiGenerate::Schema.new('types' => types, 'commands' => [command], 'events' => [], 'domains' => {'x' => {}},
                               'vendor' => {'moz' => {'extends' => extends, 'types' => vendor_types}})
    end

    def shared(name) = schema.types_for('x').find { |t| t.schema_name == name }

    it 'adds a vendor field to a received type as an optional typed field, keeping the type closed' do
      info = shared('x.Info')

      expect(info.extensible).to be(false)
      expect(info.fields.last.spec_entry)
        .to eq("moz_scope: {wire_key: 'moz:scope', required: false, enum: 'X::MOZ_SCOPE'}")
    end

    it 'emits the hoisted vendor enum in the extended type domain' do
      expect(schema.enums_for('x').map(&:constant_name)).to include('MOZ_SCOPE')
    end

    it 'gives the vendor variant its own closed params record, leaving the shared one untouched' do
      vendor = schema.vendor_modules_for('x').first
      record = vendor.types.first

      expect(record.extensible).to be(false)
      expect(record.fields.map(&:ruby_name)).to eq(%w[depth scope])
      expect(vendor.commands.first.params_class).to eq(record.ruby_name)
      expect(shared('x.GetParameters').fields.map(&:ruby_name)).to eq(%w[depth])
    end

    it 'types a vendor field on a spec-extensible type, keeping the type extensible' do
      request = shared('x.Request')

      expect(request.extensible).to be(true)
      expect(request.fields.last.spec_entry)
        .to eq("moz_opts: {wire_key: 'moz:opts', required: false, ref: 'X::RequestMozOpts'}")
    end

    it 'emits the vendor types a folded vendor field references' do
      expect(schema.types_for('x').map(&:schema_name)).to include('x.RequestMozOpts')
    end

    it 'raises when a hoisted vendor enum conflicts with an existing type' do
      conflicting = {'x.MozScope' => {'kind' => 'enum', 'values' => %w[other], 'primitive' => 'string'}}

      expect { schema(conflicting) }.to raise_error(/vendor enum x.MozScope conflicts/)
    end
  end

  describe 'Schema#types_for with a list field' do
    def items_field(type)
      types = {
        'x.Owner' => {'kind' => 'record', 'outbound' => true, 'inbound' => true,
                      'fields' => [{'name' => 'items', 'wire' => 'items', 'required' => true, 'type' => type}]},
        'x.Id' => {'kind' => 'alias', 'type' => {'primitive' => 'string'}},
        'x.Uint' => {'kind' => 'alias', 'type' => {'primitive' => 'integer'}},
        'x.Kind' => {'kind' => 'enum', 'values' => %w[a b], 'primitive' => 'string'},
        'x.Value' => {'kind' => 'record', 'outbound' => true, 'inbound' => true,
                      'fields' => [{'name' => 'v', 'wire' => 'v', 'required' => true,
                                    'type' => {'primitive' => 'string'}}]}
      }
      schema = BiDiGenerate::Schema.new('types' => types, 'commands' => [], 'events' => [], 'domains' => {'x' => {}})
      schema.types_for('x').find { |t| t.schema_name == 'x.Owner' }.fields.first
    end

    it 'carries the element primitive of a primitive list' do
      expect(items_field('list' => {'primitive' => 'string'}).spec_entry)
        .to eq("items: {wire_key: 'items', list: true, primitive: 'string'}")
    end

    it 'resolves an alias element to its primitive' do
      expect(items_field('list' => {'ref' => 'x.Id'}).spec_entry)
        .to eq("items: {wire_key: 'items', list: true, primitive: 'string'}")
    end

    it 'carries every allowed primitive of a scalar-union element' do
      field = items_field('list' => {'union' => [{'ref' => 'x.Uint'}, {'primitive' => 'string'}]})

      expect(field.spec_entry).to eq("items: {wire_key: 'items', list: true, primitive: %w[integer string]}")
      expect(field.rbs).to eq('Array[Integer | String]')
    end

    it 'leaves a union element with a non-scalar arm opaque' do
      field = items_field('list' => {'union' => [{'primitive' => 'number'}, {'ref' => 'x.Kind'}]})

      expect(field.spec_entry).to eq("items: {wire_key: 'items', list: true}")
    end

    it 'leaves a list of refs typed by its ref alone' do
      expect(items_field('list' => {'ref' => 'x.Value'}).spec_entry)
        .to eq("items: {wire_key: 'items', ref: 'X::Value', list: true}")
    end

    it 'fails generation for a nullable element, which the runtime would reject' do
      expect { items_field('list' => {'primitive' => 'string', 'nullable' => true}) }
        .to raise_error(/nullable list element/)
    end
  end
end
