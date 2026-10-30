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

require_relative '../spec_helper'
require 'json'

module Selenium
  module WebDriver
    # driver.accessibility_snapshot and element.accessibility_snapshot over BiDi (ADR 18205).
    # The shared corpus in common/src/web/accessibility is the cross-binding contract: every
    # page is snapshotted whole and compared with its recorded tree and text.
    describe AccessibilityNode, skip_unless: {bidi: true, reason: 'only executed when bidi is enabled'} do
      # The atom records frames as leaves; the binding fills them in, so this page has its own tests.
      let(:frames_page) { '014-iframe' }

      def corpus(file)
        path = File.expand_path("../../../../../../common/src/web/accessibility/#{file}", __dir__)
        File.exist?(path) ? File.read(path, encoding: 'UTF-8') : nil
      end

      def engine
        name = driver.capabilities.browser_name.to_s.downcase
        return 'firefox' if name.include?('firefox')
        return 'webkit' if name.include?('safari') || name.include?('webkit')

        'chromium'
      end

      # The engine-specific expectation when one is recorded, else the shared one.
      def expected(page, suffix)
        corpus("#{page}.expected.#{engine}.#{suffix}") || corpus("#{page}.expected.#{suffix}")
      end

      # The corpus JSON form: every field written, `element` as the element's id.
      def serialize(node)
        out = {'role' => node.role, 'name' => node.name, 'description' => node.description}
        out['value'] = node.value unless node.value.nil?
        out['states'] = node.states
        out['element'] = node.element.attribute('id') unless node.element.nil?
        out['children'] = node.children.map { |child| serialize(child) }
        out
      end

      def walk(node, &block)
        return enum_for(:walk, node) unless block

        yield node
        node.children.each { |child| walk(child, &block) }
      end

      def load_page(page)
        driver.navigate.to url_for("accessibility/#{page}.html")
      end

      describe 'Driver#accessibility_snapshot' do
        pages = File.expand_path('../../../../../../common/src/web/accessibility/index.json', __dir__)
        JSON.parse(File.read(pages, encoding: 'UTF-8')).reject { |page| page == '014-iframe' }.each do |page|
          it "matches the corpus for #{page}" do
            load_page(page)

            tree = driver.accessibility_snapshot

            expect(serialize(tree)).to eq JSON.parse(expected(page, 'json'))
            expect("#{tree.to_text}\n").to eq expected(page, 'txt')
          end
        end

        it 'is rooted at the document' do
          load_page('001-headings-and-landmarks')

          tree = driver.accessibility_snapshot

          expect(tree).to be_a described_class
          expect(tree.role).to eq 'document'
          expect(tree.element).to be_a Element
          expect(tree.element.tag_name).to eq 'html'
        end

        it 'returns element references usable for further commands' do
          load_page('003-links-and-buttons')

          tree = driver.accessibility_snapshot

          button = walk(tree).find { |node| node.role == 'button' }
          expect(button).not_to be_nil
          expect(button.element.tag_name).to eq('button').or eq('input').or eq('a')
          expect(button.element.attribute('id')).not_to be_empty
        end

        it 'stitches frames in' do
          load_page(frames_page)

          tree = driver.accessibility_snapshot

          frames = walk(tree).select { |node| node.role == 'iframe' }
          expect(frames.map(&:name)).to eq ['Embedded content', '']
          frames.each do |frame|
            expect(frame.children.size).to eq(1), 'a reachable frame carries its document as the one child'
            expect(frame.children.first.role).to eq 'document'
            expect(frame.children.first.element).to be_a Element
          end
          # The text form renders the stitched tree; the atom-level expectation stops at the leaves.
          expect(tree.to_text.scan('- document').size).to eq 3
          # A reference inside a frame works through classic commands once that frame is current.
          driver.switch_to.frame(frames.first.element)
          begin
            expect(frames.first.children.first.element.tag_name).to eq 'html'
          ensure
            driver.switch_to.default_content
          end
        end

        it 'ignores the frame the driver switched to' do
          load_page(frames_page)
          driver.switch_to.frame('frame')
          begin
            tree = driver.accessibility_snapshot
          ensure
            driver.switch_to.default_content
          end

          expect(tree.name).to eq 'Frames'
        end

        it 'is a copy' do
          load_page('005-lists')
          before = driver.accessibility_snapshot
          driver.execute_script("document.querySelector('li').textContent = 'changed'")

          after = driver.accessibility_snapshot

          expect(before.to_text).not_to eq after.to_text
          expect(after.to_text).to include 'changed'
        end

        it 'needs a BiDi session' do
          reset_driver!(web_socket_url: false) do |driver|
            driver.navigate.to url_for('accessibility/005-lists.html')
            expect { driver.accessibility_snapshot }
              .to raise_error(Error::UnsupportedOperationError, /BiDi.*web_socket_url/)
            expect { driver.find_element(tag_name: 'body').accessibility_snapshot }
              .to raise_error(Error::UnsupportedOperationError, /BiDi.*web_socket_url/)
          end
        end
      end

      describe 'Element#accessibility_snapshot' do
        it 'always produces a node for its root' do
          load_page('005-lists')
          root = driver.find_element(tag_name: 'body')

          tree = root.accessibility_snapshot

          expect(tree.role).to eq 'generic'
          expect(tree.element.tag_name).to eq 'body'
          expect(walk(tree).any? { |node| node.role == 'list' }).to be true
        end

        it 'snapshots a node from an earlier snapshot' do
          load_page('005-lists')
          first_list = walk(driver.accessibility_snapshot).find { |node| node.role == 'list' }

          tree = first_list.element.accessibility_snapshot

          expect(tree.role).to eq 'list'
          expect(tree.children.map(&:role)).to eq first_list.children.map(&:role)
        end

        it 'carries the document of an iframe taken as the root' do
          load_page(frames_page)
          frame = driver.find_element(id: 'frame')

          tree = frame.accessibility_snapshot

          expect(tree.role).to eq 'iframe'
          expect(tree.name).to eq 'Embedded content'
          expect(tree.children.map(&:role)).to eq ['document']
        end

        it 'snapshots a subtree inside a frame' do
          load_page(frames_page)
          driver.switch_to.frame('frame')
          begin
            body = driver.find_element(tag_name: 'body')
            tree = body.accessibility_snapshot
            # The root is the frame's body, not the top document that owns the window.
            expect(tree.role).to eq 'generic'
            expect(tree.name).to eq ''
            expect(tree.element.tag_name).to eq 'body'
          ensure
            driver.switch_to.default_content
          end
        end

        it 'raises the stale element error for a stale root' do
          load_page('005-lists')
          root = driver.find_element(tag_name: 'body')
          load_page('001-headings-and-landmarks')

          expect { root.accessibility_snapshot }.to raise_error(Error::StaleElementReferenceError)
        end

        it 'raises the stale element error for a detached root' do
          load_page('005-lists')
          item = driver.find_element(tag_name: 'li')
          driver.execute_script('arguments[0].remove()', item)

          expect { item.accessibility_snapshot }.to raise_error(Error::StaleElementReferenceError)
        end
      end
    end
  end
end
