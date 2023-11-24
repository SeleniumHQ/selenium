# Copyright 2017 The Bazel Authors. All rights reserved.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#    http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
"""Rules for creating password files and entries."""

load("@bazel_skylib//lib:paths.bzl", "paths")

_join_path = paths.join

PasswdFileContentProviderInfo = provider(
    fields = [
        "username",
        "uid",
        "gid",
        "info",
        "home",
        "create_home",
        "shell",
        "name",
    ],
)

def _passwd_entry_impl(ctx):
    """Creates a passwd_file_content_provider containing a single entry."""
    return [PasswdFileContentProviderInfo(
        username = ctx.attr.username,
        uid = ctx.attr.uid,
        gid = ctx.attr.gid,
        info = ctx.attr.info,
        home = ctx.attr.home,
        create_home = ctx.attr.create_home,
        shell = ctx.attr.shell,
        name = ctx.attr.name,
    )]

def _passwd_file_impl(ctx):
    """Core implementation of passwd_file."""
    f = "".join(["%s:x:%s:%s:%s:%s:%s\n" % (
        entry[PasswdFileContentProviderInfo].username,
        entry[PasswdFileContentProviderInfo].uid,
        entry[PasswdFileContentProviderInfo].gid,
        entry[PasswdFileContentProviderInfo].info,
        entry[PasswdFileContentProviderInfo].home,
        entry[PasswdFileContentProviderInfo].shell,
    ) for entry in ctx.attr.entries])
    passwd_file = ctx.actions.declare_file(ctx.label.name)
    ctx.actions.write(output = passwd_file, content = f)
    return DefaultInfo(files = depset([passwd_file]))

def _format_onwer(t):
    return ("--owners=%s=%s" % (t[0], t[1]))

def _build_homedirs_tar(ctx, passwd_file):
    homedirs = []
    owners_map = {}
    for entry in ctx.attr.entries:
        if entry[PasswdFileContentProviderInfo].create_home:
            homedir = entry[PasswdFileContentProviderInfo].home
            owners_map[homedir] = "{uid}.{gid}".format(
                uid = entry[PasswdFileContentProviderInfo].uid,
                gid = entry[PasswdFileContentProviderInfo].gid,
            )
            homedirs.append(homedir)
    dest_file = _join_path(
        ctx.attr.passwd_file_pkg_dir,
        ctx.label.name,
    )
    args = ctx.actions.args()
    args.add(ctx.outputs.passwd_tar, format = "--output=%s")
    args.add("--mode=0o700")
    args.add(passwd_file, format = "--file=%s=" + dest_file)
    args.add(dest_file, format = "--modes=%s=" + ctx.attr.passwd_file_mode)

    args.add_all(homedirs, format_each = "--empty_dir=%s")
    args.add_all(owners_map.items(), map_each = _format_onwer)
    ctx.actions.run(
        executable = ctx.executable.build_tar,
        inputs = [passwd_file],
        outputs = [ctx.outputs.passwd_tar],
        mnemonic = "PasswdTar",
        arguments = [args],
    )

def _passwd_tar_impl(ctx):
    """Core implementation of passwd_tar."""
    f = "".join(["%s:x:%s:%s:%s:%s:%s\n" % (
        entry[PasswdFileContentProviderInfo].username,
        entry[PasswdFileContentProviderInfo].uid,
        entry[PasswdFileContentProviderInfo].gid,
        entry[PasswdFileContentProviderInfo].info,
        entry[PasswdFileContentProviderInfo].home,
        entry[PasswdFileContentProviderInfo].shell,
    ) for entry in ctx.attr.entries])

    passwd_file = ctx.actions.declare_file(ctx.label.name)
    ctx.actions.write(output = passwd_file, content = f)

    _build_homedirs_tar(ctx, passwd_file)

    return DefaultInfo(files = depset([ctx.outputs.passwd_tar]))

passwd_entry = rule(
    attrs = {
        "create_home": attr.bool(default = True),
        "gid": attr.int(default = 1000),
        "home": attr.string(default = "/home"),
        "info": attr.string(default = "user"),
        "shell": attr.string(default = "/bin/bash"),
        "uid": attr.int(default = 1000),
        "username": attr.string(mandatory = True),
    },
    implementation = _passwd_entry_impl,
)

passwd_file = rule(
    attrs = {
        "entries": attr.label_list(
            allow_empty = False,
            providers = [PasswdFileContentProviderInfo],
        ),
    },
    executable = False,
    implementation = _passwd_file_impl,
)

passwd_tar = rule(
    attrs = {
        "build_tar": attr.label(
            default = Label("//container:build_tar"),
            cfg = "exec",
            executable = True,
            allow_files = True,
        ),
        "entries": attr.label_list(
            allow_empty = False,
            providers = [PasswdFileContentProviderInfo],
        ),
        "passwd_file_mode": attr.string(default = "0o644"),
        "passwd_file_pkg_dir": attr.string(mandatory = True),
    },
    executable = False,
    outputs = {
        "passwd_tar": "%{name}.tar",
    },
    implementation = _passwd_tar_impl,
)
