import eel
import json
import pandas as pd
from os.path import splitext
from tempfile import TemporaryFile
from datauri import DataURI

from inference import InferenceEngine

engine = None

@eel.expose
def loadFile(filename, data):
    global engine

    extension = splitext(filename)[1].lower()
    tempfile = TemporaryFile()

    uri = DataURI(data)
    tempfile.write(uri.data)
    tempfile.seek(0)

    data = None
    if extension == '.xlsx' or extension == '.xls':
        data = pd.read_excel(tempfile)
    elif extension == '.csv':
        data = pd.read_csv(tempfile)
    else:
        raise ValueError('Currently only CSV and Excel files are supported!')

    engine = InferenceEngine()
    engine.load_data(data)

    variables = []
    for cpd in engine.model.get_cpds():
        variables.append({
            "title": cpd.variable,
            "values": [
                {
                    "name": cpd.get_state_names(cpd.variable, i),
                    "probability": v
                }
                for i, v in enumerate(list(cpd.values))
            ]
        })
    return json.dumps(variables)


@eel.expose
def loadModel(modelUri):
    global engine

    uri = DataURI(modelUri)
    jsonstr = uri.data.decode('utf-8')

    engine = InferenceEngine()
    engine.load_model( json.loads(jsonstr) )
    return jsonstr


@eel.expose
def getData():
    global engine
    return engine.data.to_json()


@eel.expose
def updateModel(model_string):
    global engine

    model_structure = json.loads(model_string)
    if engine.load_structure(model_structure):
        return "good."


@eel.expose
def query(query_string):
    global engine

    query = json.loads(query_string)
    result = engine.query( query["variables"], query["evidence"] )

    reply = []
    for var in query["variables"]:
        marginals = set(query["variables"])
        marginals.remove(var)
        cpd = result.marginalize(marginals, inplace=False)
        reply.append({
            "title": var,
            "values": [
                {
                    "name": cpd.get_state_names(var, i),
                    "probability": v
                }
                for i, v in enumerate(list(cpd.values))
            ]
        })
    return json.dumps( reply )


if __name__ == '__main__':
    eel.init('gui')
    eel.start('index.html')