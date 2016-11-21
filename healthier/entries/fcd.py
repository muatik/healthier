import requests


class FCD(object):
    FORMAT = "json"
    API_KEY = "grUlFDyIk0ME56qOAskk4d9BplKgWbBVy7fQSJil"
    API_URL = "http://api.nal.usda.gov/ndb/{}/?format={}&api_key={}"

    def __init__(self):
        super(FCD, self).__init__()

    @staticmethod
    def get_url(command):
        return FCD.API_URL.format(command, FCD.FORMAT, FCD.API_KEY)

    @staticmethod
    def find(name):
        """
        searchs for the given food

        :return: returns a list of matching food objects 
        """
        base_url = FCD.get_url("search")
        url = base_url + "&q={}".format(name)
        json_response = requests.get(url).json()["list"]["item"]
        return json_response

    @staticmethod
    def get_report(ndbno):
        """
        fetches and returns the full report of food associated with ndbno

        :param ndbno: food ndbno
        :return: full food report
        """
        base_url = FCD.get_url("reports")
        url = base_url + "&type=f&ndbno={}".format(ndbno)
        json_response = requests.get(url).json()["report"]
        return json_response

    @staticmethod
    def get_nutrients(ndbno, measure=None):
        """
        fetches amd returns the nutrients list of the food associated with ndbno
        :param ndbno:
        :param measure: filtered with this measure
        :return: nutrients list
        """
        report = FCD.get_report(ndbno)
        nutrients = report["food"]["nutrients"]

        if not measure:
            return nutrients

        filtered = []
        for nutrient in nutrients:
            for i_measure in nutrient["measures"]:
                if i_measure["label"] == measure and i_measure["value"] != 0:
                    filtered.append({
                        "label": nutrient["name"],
                        "unit": nutrient["unit"],
                        "quantity": float(i_measure["value"])
                    })
        return filtered

    @staticmethod
    def get_measures(ndbno):
        """
        fetches and returns the measures of the food associated with ndbno
        :param ndbno:
        :return: set of measures
        """
        nutrients = FCD.get_nutrients(ndbno)
        return set(m["label"] for n in nutrients for m in n["measures"])

    @staticmethod
    def filter_sum_nutrients(nutrients, label, unit):
        label = label.lower()
        unit = unit.lower()
        return sum(n["quantity"] for n in nutrients
                   if n["label"].lower() == label and n["unit"].lower() == unit)