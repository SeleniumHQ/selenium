#!/usr/bin/env python

def main(argv=None):
    from os.path import join, isfile, dirname
    from tempfile import mkstemp
    from os import chdir, close, environ, pathsep
    from subprocess import Popen, call
    import sys
    from optparse import OptionParser

    argv = argv or sys.argv

    parser = OptionParser("%prog")
    opts, args = parser.parse_args(argv[1:])
    if args:
        parser.error("wrong number of arguments") # Will exit

    chdir(dirname(__file__))
    jarfile = join("..", "..", "..", "build", "webdriver-selenium.jar")
    if not isfile(jarfile):
        raise SystemExit("error: can't find selenium jar at %s" % jarfile)

    fd, name = mkstemp()
    close(fd)
    fo = open(name, "w")

    server = Popen(["java", "-jar", jarfile], shell=True, stdout=fo)
    srcdir = join("..", "..", "src", "py")

    env = environ.copy()
    env["PYTHONPATH"] = pathsep.join([env.get("PYTHONPATH", ""), srcdir])
    ok = call([sys.executable, "selenium_test_suite.py"], env=env)
    try:
        server.kill()
    except AttributeError:
        pass

    raise SystemExit(ok)

if __name__ == "__main__":
    main()
