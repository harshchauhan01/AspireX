import requests
import json

def test_duplicate_feedback():
    url = "http://localhost:8000/api/student/feedback/"
    
    data = {
        'mentor_id': 'M000001',
        'meeting_id': 'MTG-250712-19E2',
        'rating': 5,
        'feedback_text': 'Test feedback for duplicate prevention'
    }
    
    headers = {
        'Content-Type': 'application/json'
    }
    
    try:
        print("Testing duplicate feedback prevention...")
        print(f"URL: {url}")
        print(f"Data: {data}")
        
        # First submission
        print("\n1. First feedback submission:")
        response1 = requests.post(url, json=data, headers=headers)
        print(f"Status Code: {response1.status_code}")
        print(f"Response: {response1.text}")
        
        if response1.status_code == 201:
            print("✅ SUCCESS: First feedback submitted successfully!")
        else:
            print("❌ FAILED: First feedback submission failed")
            return
        
        # Second submission (should fail)
        print("\n2. Second feedback submission (should fail):")
        response2 = requests.post(url, json=data, headers=headers)
        print(f"Status Code: {response2.status_code}")
        print(f"Response: {response2.text}")
        
        if response2.status_code == 400:
            print("✅ SUCCESS: Duplicate feedback correctly prevented!")
        else:
            print("❌ FAILED: Duplicate feedback was not prevented")
            
    except requests.exceptions.ConnectionError:
        print("❌ CONNECTION ERROR: Make sure the Django server is running on localhost:8000")
    except Exception as e:
        print(f"❌ ERROR: {e}")

if __name__ == "__main__":
    test_duplicate_feedback() 