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

import os
import sys
import tarfile

if __name__ == '__main__':
    outdir = sys.argv[2]
    if not os.path.exists(outdir):
        os.makedirs(outdir)

    tar = tarfile.open(sys.argv[1])
    for member in tar.getmembers():
        parts = member.name.split("/")
        parts.pop(0)
        if not len(parts):
            continue

        basepath = os.path.join(*parts)
        basepath = os.path.normpath(basepath)
        member.name = basepath

        dir = os.path.join(outdir, os.path.dirname(basepath))
        if not os.path.exists(dir):
            os.makedirs(dir)

        tar.extract(member, outdir)
    tar.close()
