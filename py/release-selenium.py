#!/usr/bin/env python3

import sys
from twine import cli

def main():
    cli.configure_output()
    return cli.dispatch(sys.argv[1:])

if __name__ == "__main__":
    sys.exit(main())
