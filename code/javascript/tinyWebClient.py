import sys
import httplib

if ( len(sys.argv) != 5 ):
	print "usage tinyWebClient.py [host] [port] [method] [path]"
else:	
	host = sys.argv[1]
	port = sys.argv[2]
	method = sys.argv[3]
	path = sys.argv[4]

	info = (host, port)
	print("%s:%s" % info)
	conn = httplib.HTTPConnection("%s:%s" % info)
	conn.request(method, path)
	print(conn.getresponse().msg)