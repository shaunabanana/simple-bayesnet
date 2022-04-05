import pandas as pd
import pgmpy
from pgmpy.models import BayesianNetwork
from pgmpy.estimators import MaximumLikelihoodEstimator, BayesianEstimator
from pgmpy.inference import BeliefPropagation, VariableElimination


class InferenceEngine:

    def load_data(self, data):
        self.data = data
        self.variables = list(self.data.columns)

        self.model = BayesianNetwork()
        for var in self.variables:
            self.model.add_node(var)

        self.model.fit(self.data, estimator=MaximumLikelihoodEstimator)


    def load_model(self, model):
        self.data = pd.read_json(model['dataset'])
        self.variables = list(self.data.columns)
        if len(model['modelStructure']) > 0:
            self.model = BayesianNetwork(model['modelStructure'])
        else:
            self.model = BayesianNetwork()
        
        for var in self.variables:
            self.model.add_node(var)
        self.model.fit(self.data, estimator=MaximumLikelihoodEstimator)


    def load_structure(self, model_structure):
        self.model = BayesianNetwork(model_structure)
        self.model.fit(self.data, estimator=MaximumLikelihoodEstimator)


    def query(self, variables, evidence):
        bp = VariableElimination(self.model)
        return bp.query(variables, evidence=evidence)


if __name__ == '__main__':

    engine = InferenceEngine()

    engine.load_file('/Users/shauna/Desktop/mushroom.csv')