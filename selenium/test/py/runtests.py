#!/usr/bin/env python

def main(argv=None):
    from os.path import join, isfile, dirname
    from tempfile import mkstemp
    from os import chdir, close, environ, pathsep
    import os # So we can look kill up later
    from subprocess import Popen, call
    import sys
    import signal
    from time import sleep
    from optparse import OptionParser

    argv = argv or sys.argv

    parser = OptionParser("%prog")
    opts, args = parser.parse_args(argv[1:])
    if args:
        parser.error("wrong number of arguments") # Will exit

    chdir(dirname(__file__))
    jarfile = join("..", "..", "..", "build", "selenium-server-standalone.jar")
    if not isfile(jarfile):
        raise SystemExit("error: can't find selenium jar at %s" % jarfile)
    corefile = join("..", "..", "..", "build", "selenium-core.jar")
    if not isfile(corefile):
        raise SystemExit("error: can't find selenium jar at %s" % corefile)


    fd, name = mkstemp()
    close(fd)
    fo = open(name, "w")

    server = Popen(["java", "-cp", jarfile + pathsep + corefile, "org.openqa.selenium.server.SeleniumServer"], shell=False, stdout=fo)
    srcdir = join("..", "..", "src", "py")

    # we should really be waiting for the server to be up and running
    sleep(5)

    try:
        env = environ.copy()
        env["PYTHONPATH"] = pathsep.join([env.get("PYTHONPATH", ""), srcdir])
        ok = call([sys.executable, "selenium_test_suite.py"], env=env)
    except AttributeError:
        pass

    # try the python 2.6 way of killing the task
    try:
        server.kill
    except:
        os.kill(server.pid, signal.SIGTERM)
        
    raise SystemExit(ok)

if __name__ == "__main__":
    main()
