#!/usr/bin/env python3

import subprocess

if __name__ == '__main__':
    revision = subprocess.check_output(["git", "rev-parse", "--short", "HEAD"]).decode().rstrip()
    dirty_out = subprocess.check_output(["git", "status", "--porcelain", "--untracked-files=no"]).decode().split("\n")
    dirty = ""
    if len(dirty_out) > 1:
        dirty = "*"

    print("STABLE_GIT_REVISION %s%s\n" % (revision, dirty))
