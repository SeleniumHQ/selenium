import sys
import unittest

if __name__ == '__main__':
    sys.path.insert(0, '..')

from Dispatcher import Dispatcher

class REQUEST:
    """ a mock HTTP request object """
    form = {}


class DispatcherTests(unittest.TestCase):

    ### addCommand test    
    def test_addCommand(self):
        dispatcher = Dispatcher()
        getSize = dispatcher._v_commands.qsize        
        self.assertEquals(0, getSize(), '_v_commands queue should be empty')  
        
        test_command = '|open|http://localhost/||'              
        dispatcher.addCommand(test_command)
        
        # Now verify that the queue has one item 
        self.assertEquals(1, getSize(), 
                          '_v_commands queue should have size of 1')   
        
        # and check that we get out what we put in...
        self.assertEquals(test_command, dispatcher._v_commands.get(),
                          "received unexpected value when calling 'get()' on the queue")

    ### getCommand tests
    def test_getCommand(self):
        dispatcher = Dispatcher()
        sample_command = expected_result = '|open|http://localhost/||'
        dispatcher.addCommand(sample_command)                
        retrieved_result = dispatcher.getCommand()
        self.assertEquals(expected_result, retrieved_result)               

    def test_getCommand_with_empty_command_queue(self):
        dispatcher = Dispatcher()
        #speed up the queue timeout for testing
        dispatcher.QUEUE_TIMEOUT = .001        
        expected_result = 'ERROR: Command queue was empty'
        retrieved_result = dispatcher.getCommand()        
        self.assertEquals(expected_result, retrieved_result)                   

    ### command queue query test
    def test_getCommandQueueSize(self):
        dispatcher = Dispatcher()        
        expected_size  = dispatcher._v_commands.qsize() 
        retrieved_size = dispatcher.getCommandQueueSize()  
        
        self.assertEquals(0, retrieved_size)
        self.assertEquals(expected_size, retrieved_size,
                          'queue size does not match results from getCommandQueueSize()')



    ### addResult test
    def test_addResult(self):
        dispatcher = Dispatcher()
        getSize = dispatcher._v_results.qsize        
        self.assertEquals(0, getSize(), '_v_results queue should be empty')  
        
        # TODO: Find out what a 'real' sample result is.
        sample_result = expected_result = 'OK'              
        dispatcher.addResult(sample_result)
        
        # Now verify that the queue has one item 
        self.assertEquals(1, getSize(), 
                          '_v_results queue should have size of 1')   
        
        # and check that we get out what we put in...
        self.assertEquals(expected_result, dispatcher._v_results.get(),
                          "received unexpected value when calling 'get()' on the queue")

    ### getResult tests
    def test_getResult(self):
        dispatcher = Dispatcher()
        expected_result = "I'm a sample test result"
        dispatcher._v_results.put(expected_result)    
        retrieved_result = dispatcher.getResult()
        self.assertEquals(expected_result, retrieved_result)               

    def test_getResult_with_empty_result_queue(self):
        dispatcher = Dispatcher()
        #speed up the queue timeout for testing
        dispatcher.QUEUE_TIMEOUT = .001        
        expected_result = 'ERROR: Result queue was empty'
        retrieved_result = dispatcher.getResult()        
        self.assertEquals(expected_result, retrieved_result)                   

    ### result queue query test
    def test_getResultQueueSize(self):
        dispatcher = Dispatcher()        
        expected_size  = dispatcher._v_results.qsize() 
        retrieved_size = dispatcher.getResultQueueSize()  
        
        self.assertEquals(0, retrieved_size)
        self.assertEquals(expected_size, retrieved_size,
                          'queue size does not match results from getCommandQueueSize()')                              
        
        
        
    ### webDriver tests
    def test_webDriver(self):
        dispatcher = Dispatcher()    
        sample_command = expected_result = '|open|http://localhost/||'
        
        # Add one command to the command queue
        dispatcher.addCommand(sample_command)
        
        # Create a mock web request that simulates hitting 'driver'
        # for the first time
        req = REQUEST()
        req.form['seleniumStart'] = 'true'
        
        retrieved_result = dispatcher.webDriver(req)
        self.assertEquals(expected_result, retrieved_result)   
        

    def test_webDriver_with_no_REQUEST(self):
        """ This error would come up if 'driver()' was called from an XML-RPC client instead 
        of a 'straight' page request from a web browser """
        
        dispatcher = Dispatcher()
        self.assertEquals(dispatcher.webDriver(),
                          "ERROR: Missing an HTTP REQUEST")  
                          
    def test_webDriver_with_empty_command_queue(self):
        req = REQUEST()
        dispatcher = Dispatcher()
        
        #speed up the queue timeout for testing
        dispatcher.QUEUE_TIMEOUT = .001
       
        self.assertEquals(dispatcher.webDriver(req),
                          'ERROR: Command queue was empty')

    ### apiDriver tests
    def test_apiDriver(self):
        self.fail('test not written yet')

    def test_apiDriver_with_empty_result_queue(self):
        self.fail('test not written yet')

                          
if __name__ == '__main__':
    unittest.main()
