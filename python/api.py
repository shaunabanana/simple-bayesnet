import sys
import json
import zerorpc

from inference import InferenceEngine


class InferenceApi(object):

    def loadFile(self, path):
        self.engine = InferenceEngine()
        self.engine.load_file(path)
        variables = []
        for cpd in self.engine.model.get_cpds():
            variables.append({
                "title": cpd.variable,
                "values": [
                    {
                        "name": str(i),
                        "probability": v
                    }
                    for i, v in enumerate(list(cpd.values))
                ]
            })
            print(cpd.variable)
            print(list(cpd.values))
        return json.dumps(variables)

    def loadModel(self, model):
        self.engine = InferenceEngine()
        self.engine.load_model( model )
        return ""

    def getData(self, _):
        return self.engine.data.to_json()

    def updateModel(self, model_string):
        model_structure = json.loads(model_string)
        if self.engine.load_structure(model_structure):
            return "good."


    def query(self, query_string):
        query = json.loads(query_string)
        result = self.engine.query( query["variables"], query["evidence"] )

        reply = []
        for var in query["variables"]:
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
        return json.dumps( reply )



def parse_port():
    return 4242

def main():
    addr = 'tcp://127.0.0.1:{}'.format(parse_port())
    s = zerorpc.Server(InferenceApi())
    s.bind(addr)
    print('start running on {}'.format(addr))
    s.run()

if __name__ == '__main__':
    main()
    '''
    api = InferenceApi()
    api.loadFile("/Users/seana/Desktop Workspaces/毕业设计/Seana-training-data.xlsx")

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
        var for var in api.engine.variables if var not in evidence
    ]

    api.query(
        json.dumps( {
            "variables": variables,
            "evidence": evidence
        } )
    )
    '''