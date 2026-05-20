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


#!/usr/bin/env ruby
# frozen_string_literal: true

USAGE = <<~USAGE
  Usage:
      merge_cddl.rb <output> <input1> [<input2> ...]
USAGE

def main
  if ARGV.length < 2
    warn USAGE
    exit 1
  end

  out_path = ARGV.shift
  input_paths = ARGV

  File.open(out_path, 'wb') do |out_f|
    input_paths.each_with_index do |input_path, index|
      if index > 0
        out_f.write("\n")
      end

      File.open(input_path, 'rb') do |in_f|
        out_f.write(in_f.read)
      end
    end
  end
end

if __FILE__ == $PROGRAM_NAME
  main
end
