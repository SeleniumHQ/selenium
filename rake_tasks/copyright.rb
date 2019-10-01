# frozen_string_literal: true

module Copyright
  module_function

  def update(files, options = {})
    style = options[:style] || '//'
    prefix = options[:prefix] || nil

    notice_lines = notice.split(/\n/).map do |line|
      "#{style} #{line}".rstrip + "\n"
    end
    notice_lines = Array(prefix) + notice_lines
    notice = notice_lines.join('')

    files.each do |file|
      lines = IO.readlines(file)

      index = -1
      lines.any? do |line|
        done = true
        if (line.index(style).zero?) ||
           (notice_lines[index + 1] && (line.index(notice_lines[index + 1]).zero?))
          index += 1
          done = false
        end
        done
      end

      if index == -1
        write_update_notice(file, lines, notice)
      else
        current = lines.shift(index + 1).join('')
        if current != notice
          write_update_notice(file, lines, notice)
        end
      end
    end
  end

  def write_update_notice(file, lines, notice)
    puts "Adding notice to #{file}"
    File.open(file, 'w') do |f|
      f.write(notice + "\n")
      lines.each { |line| f.write(line) }
    end
  end

  def notice
    <<~eos
    Licensed to the Software Freedom Conservancy (SFC) under one
    or more contributor license agreements.  See the NOTICE file
    distributed with this work for additional information
    regarding copyright ownership.  The SFC licenses this file
    to you under the Apache License, Version 2.0 (the
    "License"); you may not use this file except in compliance
    with the License.  You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing,
    software distributed under the License is distributed on an
    "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
    KIND, either express or implied.  See the License for the
    specific language governing permissions and limitations
    under the License.
    eos
  end
end
