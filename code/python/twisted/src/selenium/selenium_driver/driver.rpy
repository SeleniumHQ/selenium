from twisted.web import resource, server
from twisted.internet.threads import deferToThread

from Interpreter import SeleniumInterpreter

"""
Called from an web browser like so:

http://localhost:8081/selenium-driver/driver?seleniumStart=true
or
http://localhost:8081/selenium-driver/driver?commandResult=OK
"""

interpreter = registry.getComponent(SeleniumInterpreter)
if not interpreter:
    registry.setComponent(SeleniumInterpreter, SeleniumInterpreter())
    interpreter = registry.getComponent(SeleniumInterpreter)

class Driver(resource.Resource):
    """ called by SeleneseRunner to get commands and post results """
    
    def printResult(self, r):
        return "%s" % r
    
    def render_GET(self, request):  
        # It was hard to figure out how to wait for a response and not return
        # the deferred object back to user. This doc helped:
        #http://twistedmatrix.com/documents/current/howto/tutorial/components           
        d = deferToThread(interpreter.driver, request)   
        d.addCallback(self.printResult).addErrback(self.printResult)
        d.addCallback(request.write)
        d.addCallback(lambda _: request.finish())
        return server.NOT_DONE_YET

resource = Driver()
