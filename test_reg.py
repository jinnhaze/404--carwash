import urllib.request
import urllib.parse
import json

url = "http://127.0.0.1:8000/api/users/register/"
data = {
    "username": "test_user_unique_456",
    "email": "test_unique_456@example.com",
    "phone": "9998887776",
    "password": "Password123!"
}

params = json.dumps(data).encode('utf8')
req = urllib.request.Request(url, data=params, headers={'content-type': 'application/json'})

try:
    with urllib.request.urlopen(req) as response:
        print(f"Status Code: {response.getcode()}")
        print(f"Response Body: {response.read().decode('utf-8')}")
except urllib.error.HTTPError as e:
    print(f"HTTP Status Code: {e.code}")
    print(f"HTTP Response Body: {e.read().decode('utf-8')}")
except Exception as e:
    print(f"Error: {e}")
