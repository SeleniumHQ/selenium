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
                                    'type' => {'primitive' => 'string'}}]}
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

    it 'leaves a ref-valued map opaque' do
      field = attributes_field('ref' => 'x.Value')

      expect(field.spec_entry).to eq("attributes: {wire_key: 'attributes', required: false}")
      expect(field.rbs).to eq('untyped')
    end
  end
end
