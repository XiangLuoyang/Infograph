import unittest
from engine import load
from compiler import compile_plan
class CompilerTest(unittest.TestCase):
    def test_default(self):
        p=compile_plan(load("design.example.json"))
        self.assertEqual(p["scenes"][0]["blocks"][0]["span"]["mobile"],12)
        self.assertEqual(p["scenes"][0]["evidence_ids"],["E1"])
    def test_duplicate(self):
        x=load("design.example.json"); x["scenes"].append(x["scenes"][0])
        with self.assertRaises(ValueError): compile_plan(x)
if __name__=="__main__": unittest.main()
