import unittest
from engine import route,validate,load
class TestEngine(unittest.TestCase):
    def test_route(self):
        self.assertEqual(route('deviation',['actual','target'])['status'],'candidate-only')
        self.assertEqual(route('flow',['source'])['status'],'missing-fields')
        self.assertEqual(route('unknown',[])['status'],'unknown-task')
    def test_ir(self):
        x=load('design.example.json'); self.assertEqual(validate(x),[])
        x['scenes'][0]['evidence_ids']=['missing']; self.assertTrue(validate(x))
if __name__=='__main__': unittest.main()
