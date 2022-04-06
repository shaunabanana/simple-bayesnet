import pandas as pd
import pgmpy
from pgmpy.models import BayesianNetwork
from pgmpy.estimators import MaximumLikelihoodEstimator, BayesianEstimator
from pgmpy.inference import BeliefPropagation, VariableElimination


class InferenceEngine:

    def __init__(self, estimator=MaximumLikelihoodEstimator):
        self.estimator = estimator

    def load_data(self, data):
        self.data = data
        self.variables = list(self.data.columns)

        self.model = BayesianNetwork()
        for var in self.variables:
            self.model.add_node(var)

        self.model.fit(self.data, estimator=self.estimator)


    def load_model(self, model):
        self.data = pd.read_json(model['dataset'])
        self.variables = list(self.data.columns)
        if len(model['modelStructure']) > 0:
            self.model = BayesianNetwork(model['modelStructure'])
        else:
            self.model = BayesianNetwork()
        
        for var in self.variables:
            self.model.add_node(var)
        self.model.fit(self.data, estimator=self.estimator)


    def load_structure(self, model_structure):
        self.model = BayesianNetwork(model_structure)
        self.model.fit(self.data, estimator=self.estimator)


    def query(self, variables, evidence):
        bp = VariableElimination(self.model)
        return bp.query(variables, evidence=evidence)


if __name__ == '__main__':

    engine = InferenceEngine()

    data = pd.read_excel('/Users/shauna/Desktop/datasets/mushroom.xlsx')
    engine.load_data(data)
    engine.load_structure([
        ('Edibility', 'Cap Shape'),
        ('Edibility', 'Cap Color'),
        ('Edibility', 'Odor'),
        ('Edibility', 'Habitat')
    ])

    print(engine.query(['Cap Shape'], {
        'Cap Color': 'white',
        'Odor': 'anise',
        'Habitat': 'grasses',
    }))

    print(
        MaximumLikelihoodEstimator(engine.model, data).estimate_cpd('Cap Shape')
    )

    from pgmpy.models import NaiveBayes

    model = NaiveBayes()
    model.fit(data, 'Edibility')
    bp = VariableElimination(model)
    print(bp.query(['Cap Shape'], {
        'Edibility': 'poisonous',
        'Cap Color': 'white',
        'Odor': 'anise',
        'Habitat': 'grasses',
    }))
    



