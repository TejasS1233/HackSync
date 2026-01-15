import requests
import json

url = "https://api.convai.com/character/get"

payload = json.dumps({
  "charID": "31b4cb2e-f15a-11f0-bc9c-42010a7be027"
})
headers = {
  'CONVAI-API-KEY': '31a5618a20514ae4ec36e95307bdc165',
  'Content-Type': 'application/json'
}

response = requests.request("POST", url, headers=headers, data=payload)

print(response.text)