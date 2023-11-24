def _copy_cmd(ctx, file_list, target_dir):
    dest_list = []

    if file_list == None or len(file_list) == 0:
        return dest_list

    shell_content = ""
    batch_file_name = "%s-copy-files.bat" % (ctx.label.name)
    bat = ctx.actions.declare_file(batch_file_name)
    src_file_list = []
    for (src_file, relative_dest_file) in file_list:
        src_file_list.append(src_file)
        dest_file = ctx.actions.declare_file("{}/{}".format(target_dir, relative_dest_file))
        dest_list.append(dest_file)
        shell_content += "@copy /Y \"%s\" \"%s\" >NUL\n" % (
            src_file.path.replace("/", "\\"),
            dest_file.path.replace("/", "\\"),
        )

    ctx.actions.write(
        output = bat,
        content = shell_content,
        is_executable = True,
    )
    ctx.actions.run(
        inputs = src_file_list,
        tools = [bat],
        outputs = dest_list,
        executable = "cmd.exe",
        arguments = ["/C", bat.path.replace("/", "\\")],
        mnemonic = "CopyFile",
        progress_message = "Copying files",
        use_default_shell_env = True,
    )

    return dest_list

def _copy_bash(ctx, src_list, target_dir):
    dest_list = []
    for (src_file, relative_dest_file) in src_list:
        dest_file = ctx.actions.declare_file("{}/{}".format(target_dir, relative_dest_file))
        dest_list.append(dest_file)

        ctx.actions.run_shell(
            tools = [src_file],
            outputs = [dest_file],
            command = "cp -f \"$1\" \"$2\"",
            arguments = [src_file.path, dest_file.path],
            mnemonic = "CopyFile",
            progress_message = "Copying files",
            use_default_shell_env = True,
        )

    return dest_list

def copy_files(ctx, file_list, base_dest_directory, is_windows):
    dest_list = []
    if is_windows:
        dest_list = _copy_cmd(ctx, file_list, base_dest_directory)
    else:
        dest_list = _copy_bash(ctx, file_list, base_dest_directory)

    return dest_list
