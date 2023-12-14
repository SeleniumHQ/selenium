# Selenium Manager

Selenium Manager is a command-line tool implemented in Rust that provides automated driver and browser management for Selenium. For details about its features, visit the [Selenium Manager documentation page](https://www.selenium.dev/documentation/selenium_manager/).

## Rust installation
Selenium Manager has been implemented as a CLI (Command-Line Interface) tool using [Rust](https://www.rust-lang.org/). Therefore, to run it from the source code, you need to [install Rust and Cargo](https://doc.rust-lang.org/cargo/getting-started/installation.html). On Linux and macOS systems, this is done as follows:

```
curl https://sh.rustup.rs -sSf | sh
```

Alternatively, you can build it using [Bazel](https://bazel.build) by executing `bazel build //rust:selenium-manager` from the top-level directory of the Selenium repo (the same one where the `WORKSPACE` file is).

## Usage
Selenium Manager can be executed using Cargo as follows:

```
$ cargo run -- --help
```

For instance, the command required to manage chromedriver is the following:

```
$ cargo run -- --browser chrome
```

Alternatively, you can replace `cargo run` with `bazel run //rust:selenium-manager`, for example `bazel run //rust:selenium-manager -- --browser chrome --debug`

### Windows ARM

There are issues when building on Windows ARM64. To workaround, use `cargo` with `--config Cargo.aarch64-pc-windows-msvc.toml` flag.