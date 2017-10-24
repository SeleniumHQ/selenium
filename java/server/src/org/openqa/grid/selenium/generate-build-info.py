import sys


def main(argv):
    print """
Name: Build-Info
Selenium-Version: %s
    """ % (argv[1])


sys.exit(main(sys.argv))
