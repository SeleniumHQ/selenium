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

require File.expand_path('../spec_helper', __dir__)

module Selenium
  module WebDriver
    describe ListenerErrors do
      subject(:errors) { described_class.new }

      it 'raises nothing when no error is stored' do
        expect { errors.check }.not_to raise_error
      end

      it 'raises a stored error once' do
        errors.add(ArgumentError.new('boom'))

        expect { errors.check }.to raise_error(ArgumentError, 'boom')
        expect { errors.check }.not_to raise_error
      end

      it 'keeps the first error until it is raised' do
        errors.add(ArgumentError.new('first'))
        errors.add(ArgumentError.new('second'))

        expect { errors.check }.to raise_error(ArgumentError, 'first')
      end

      it 'leaves a stored error for the driving thread when checked on a listener thread' do
        errors.add(ArgumentError.new('boom'))

        Thread.new {
          described_class.listener_thread!
          errors.check
        }.join

        expect { errors.check }.to raise_error(ArgumentError, 'boom')
      end

      it 'leaves a stored error alone when checked from a fiber on a listener thread' do
        errors.add(ArgumentError.new('boom'))

        Thread.new {
          described_class.listener_thread!
          Fiber.new { errors.check }.resume
        }.join

        expect { errors.check }.to raise_error(ArgumentError, 'boom')
      end

      it 'does not mark other threads as listener threads' do
        Thread.new { described_class.listener_thread! }.join

        expect(described_class.listener_thread?).to be false
      end
    end
  end
end
