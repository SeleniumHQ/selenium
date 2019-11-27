# frozen_string_literal: true

class Copyright
  def initialize(comment_characters: '//', prefix: nil)
    @comment_characters = comment_characters
    @prefix = prefix
  end

  def update(files)
    files.each do |file|
      lines = IO.readlines(file)

      index = -1
      lines.any? do |line|
        done = true
        if starts_with_comment_character?(line) || valid_copyright_notice_line?(line, index)
          index += 1
          done = false
        end
        done
      end

      if index == -1
        write_update_notice(file, lines, copyright_notice)
      else
        current = lines.shift(index + 1).join('')
        if current != copyright_notice
          write_update_notice(file, lines, copyright_notice)
        end
      end
    end
  end

  def starts_with_comment_character?(line)
    line.index(@comment_characters)&.zero?
  end

  def valid_copyright_notice_line?(line, index)
    copyright_notice_lines[index + 1] &&
      line.index(copyright_notice_lines[index + 1])&.zero?
  end

  def copyright_notice
    copyright_notice_lines.join('')
  end

  def copyright_notice_lines
    @copyright_notice_lines ||= Array(@prefix) + commented_notice_lines
  end

  def commented_notice_lines
    notice_lines.map do |line|
      "#{@comment_characters} #{line}".rstrip + "\n"
    end
  end

  def notice_lines
    notice.split(/\n/)
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
