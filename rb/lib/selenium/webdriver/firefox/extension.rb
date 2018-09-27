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

module Selenium
  module WebDriver
    module Firefox
      #
      # @api private
      #

      class Extension
        NAMESPACE = 'http://www.mozilla.org/2004/em-rdf#'.freeze

        def initialize(path)
          unless File.exist?(path)
            raise Error::WebDriverError, "could not find extension at #{path.inspect}"
          end

          @path             = path
          @should_reap_root = false
        end

        def write_to(extensions_dir)
          root_dir = create_root
          ext_path = File.join extensions_dir, read_id(root_dir)

          FileUtils.rm_rf ext_path
          FileUtils.mkdir_p File.dirname(ext_path), mode: 0o700
          FileUtils.cp_r root_dir, ext_path

          FileReaper.reap(root_dir) if @should_reap_root
        end

        private

        def create_root
          if File.directory? @path
            @path
          else
            unless Zipper::EXTENSIONS.include? File.extname(@path)
              raise Error::WebDriverError, "expected #{Zipper::EXTENSIONS.join(' or ')}, got #{@path.inspect}"
            end

            @should_reap_root = true
            Zipper.unzip(@path)
          end
        end

        def read_id(directory)
          read_id_from_install_rdf(directory) || read_id_from_manifest_json(directory)
        end

        def read_id_from_install_rdf(directory)
          rdf_path = File.join(directory, 'install.rdf')
          return unless File.exist?(rdf_path)

          doc = REXML::Document.new(File.read(rdf_path))
          namespace = doc.root.namespaces.key(NAMESPACE)

          if namespace
            id_node = REXML::XPath.first(doc, "//#{namespace}:id")
            return id_node.text if id_node

            attr_node = REXML::XPath.first(doc, "//@#{namespace}:id")
            return attr_node.value if attr_node
          end

          raise Error::WebDriverError, "cannot locate extension id in #{rdf_path}"
        end

        def read_id_from_manifest_json(directory)
          manifest_path = File.join(directory, 'manifest.json')
          return unless File.exist?(manifest_path)

          manifest = JSON.parse(File.read(manifest_path))
          [manifest['name'].delete(' '), manifest['version']].join('@')
        end
      end # Extension
    end # Firefox
  end # WebDriver
end # Selenium
