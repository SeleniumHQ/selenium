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

"""Concatenate multiple CDDL files into a single output file.

Usage:
    merge_cddl.py <output> <input1> [<input2> ...]
"""

import sys


def main() -> None:
    if len(sys.argv) < 3:
        usage = (__doc__ or "Usage:\n    merge_cddl.py <output> <input1> [<input2> ...]\n").strip()
        print(usage, file=sys.stderr)
        raise SystemExit(1)

    out_path = sys.argv[1]
    input_paths = sys.argv[2:]
    with open(out_path, "wb") as out_f:
        for index, input_path in enumerate(input_paths):
            if index > 0:
                # Ensure files that lack a trailing newline don't accidentally
                # join their last and first tokens across the boundary.
                out_f.write(b"\n")
            with open(input_path, "rb") as in_f:
                out_f.write(in_f.read())


if __name__ == "__main__":
    main()
