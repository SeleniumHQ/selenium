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
require File.expand_path('../../../../../../lib/selenium/webdriver/bidi/protocol', __dir__)

module Selenium
  module WebDriver
    describe Network::UrlPatterns do
      def wire(patterns)
        described_class.build(patterns).map(&:as_json)
      end

      it 'matches every URL when there are no patterns' do
        expect(described_class.build(nil)).to be_nil
      end

      it 'forwards a string as a pattern string' do
        expect(wire('https://example.com/orders'))
          .to eq([{'type' => 'string', 'pattern' => 'https://example.com/orders'}])
      end

      it 'takes a single pattern or a list' do
        expect(wire(['https://a.example/', 'https://b.example/']).size).to eq(2)
      end

      it 'forwards a URI as a pattern string rather than taking it apart' do
        expect(wire(URI('https://example.com/a?b=c')))
          .to eq([{'type' => 'string', 'pattern' => 'https://example.com/a?b=c'}])
      end

      it 'sends a hash as pattern components, with a port given as an Integer' do
        expect(wire({hostname: 'cdn.example.com', 'port' => 8080}))
          .to eq([{'type' => 'pattern', 'hostname' => 'cdn.example.com', 'port' => '8080'}])
      end

      it 'refuses a string that is not an absolute URL' do
        expect { described_class.build('/orders') }.to raise_error(ArgumentError, /absolute URL/)
      end

      it 'refuses empty protocol, hostname and port components' do
        %i[protocol hostname port].each do |component|
          expect { described_class.build({component => ''}) }.to raise_error(ArgumentError, /cannot be empty/)
        end
      end

      it 'allows empty pathname and search components' do
        expect(wire({pathname: '', search: ''})).to eq([{'type' => 'pattern', 'pathname' => '', 'search' => ''}])
      end

      it 'refuses characters the remote end refuses in a component' do
        {protocol: 'https:', hostname: 'example.com:443', port: '80a', pathname: '/a?b', search: 'a#b'}
          .each do |component, value|
          expect { described_class.build({component => value}) }
            .to raise_error(ArgumentError, /#{component} .* cannot contain/)
        end
      end

      it 'allows a colon inside a bracketed IPv6 hostname' do
        expect(wire({hostname: '[::1]'})).to eq([{'type' => 'pattern', 'hostname' => '[::1]'}])
      end

      it 'refuses a colon outside closed IPv6 brackets' do
        ['[::1]:443', '[::1:443', '[example.com:8080'].each do |hostname|
          expect { described_class.build({hostname: hostname}) }
            .to raise_error(ArgumentError, /hostname .* cannot contain ":"/)
        end
      end

      it 'refuses a glob, since the remote end reserves its characters' do
        expect { described_class.build('https://*.example.com/') }
          .to raise_error(ArgumentError, /"\*", which WebDriver BiDi reserves/)
        expect { described_class.build({pathname: '/orders/{id}'}) }.to raise_error(ArgumentError, /reserves/)
      end

      it 'forwards glob syntax the remote end accepts, noting it is not a wildcard' do
        patterns = %w[https://example.com/a? https://example.com/file?.txt https://example.com/[ab]]

        patterns.each do |pattern|
          expect { expect(wire(pattern).first['pattern']).to eq(pattern) }.to have_info(:network_url_pattern_glob)
        end
        expect { wire({pathname: '/[ab]'}) }.to have_info(:network_url_pattern_glob)
      end

      it 'notes nothing for a query string, an IPv6 host or other characters the remote end accepts' do
        patterns = %w[https://example.com/search?q=1 https://[::1]/ https://example.com/a+b https://example.com/:id]

        expect { wire(patterns) }.not_to have_info(:network_url_pattern_glob)
      end

      it 'forwards an escaped reserved character unchanged' do
        expect(wire('https://example.com/\*')).to eq([{'type' => 'string', 'pattern' => 'https://example.com/\*'}])
      end
    end
  end
end
