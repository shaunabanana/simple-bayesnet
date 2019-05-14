from os.path import splitext
import pandas as pd
import pgmpy
from pgmpy.models import BayesianModel
from pgmpy.estimators import MaximumLikelihoodEstimator, BayesianEstimator
from pgmpy.inference import BeliefPropagation, VariableElimination


class InferenceEngine:

    def load_file(self, path):
        self.data = pd.read_excel(path)
        self.variables = list(self.data.columns)

        self.model = BayesianModel()
        for var in self.variables:
            self.model.add_node(var)

        self.model.fit(self.data, estimator=BayesianEstimator)


    def load_model(self, model):
        self.data = pd.read_json(model['dataset'])
        self.variables = list(self.data.columns)
        self.model = BayesianModel(model['modelStructure'])
        self.model.fit(self.data, estimator=BayesianEstimator)


    def load_structure(self, model_structure):
        self.model = BayesianModel(model_structure)
        self.model.fit(self.data, estimator=BayesianEstimator)


    def query(self, variables, evidence):
        bp = VariableElimination(self.model)
        return bp.query(variables, evidence=evidence)


if __name__ == "__main__":

    engine = InferenceEngine()

    engine.load_data("/Users/seana/Desktop Workspaces/毕业设计/Seana-training-data.xlsx")

    evidence = {
        "Creative": 0,
        "Diffucult": 1,
        "Time-consuming": 1,
        "Cooperative": 1,
        "Important": 1,
        "Last Working": 1,
        "Working": 1,
        "Engineering & Technology": 1,
        "Browsers": 1,
        "Games": 1,
        "General News & Opinion": 1,
        "General Reference & Learning": 1,
    }

    variables = [
        var for var in engine.variables if var not in evidence
    ]

    print(variables)

    result = engine.query(variables, evidence)

    reply = []
    for var in variables:
        reply.append({
            "title": var,
            "values": [
                {
                    "name": str(i),
                    "probability": v
                }
                for i, v in enumerate(list(result[var].values))
            ]
        })

    print(reply)