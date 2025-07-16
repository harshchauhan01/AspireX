import requests
import json

def test_mentor_feedback():
    print("Testing Mentor Feedback Viewing Functionality")
    print("=" * 50)
    
    base_url = "http://localhost:8000/api/mentor"
    
    # Test data
    mentor_token = "your_mentor_token_here"  # Replace with actual token
    
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Token {mentor_token}'
    }
    
    try:
        print("1. Testing feedback list endpoint:")
        response1 = requests.get(f"{base_url}/feedback/", headers=headers)
        print(f"   Status Code: {response1.status_code}")
        if response1.status_code == 200:
            feedbacks = response1.json()
            print(f"   ✅ SUCCESS: Found {len(feedbacks)} feedback entries")
            if feedbacks:
                print(f"   Sample feedback: {feedbacks[0]}")
        else:
            print(f"   ❌ FAILED: {response1.text}")
        
        print("\n2. Testing feedback stats endpoint:")
        response2 = requests.get(f"{base_url}/feedback/stats/", headers=headers)
        print(f"   Status Code: {response2.status_code}")
        if response2.status_code == 200:
            stats = response2.json()
            print(f"   ✅ SUCCESS: Stats retrieved")
            print(f"   Total Feedback: {stats.get('total_feedback', 0)}")
            print(f"   Average Rating: {stats.get('average_rating', 0)}")
            print(f"   Approved: {stats.get('approved_feedback', 0)}")
            print(f"   Pending: {stats.get('pending_feedback', 0)}")
        else:
            print(f"   ❌ FAILED: {response2.text}")
        
        print("\n3. Testing mentor profile with feedback count:")
        response3 = requests.get(f"{base_url}/profile/", headers=headers)
        print(f"   Status Code: {response3.status_code}")
        if response3.status_code == 200:
            profile = response3.json()
            feedback_count = profile.get('feedback_count', 0)
            print(f"   ✅ SUCCESS: Profile retrieved with feedback count: {feedback_count}")
        else:
            print(f"   ❌ FAILED: {response3.text}")
            
    except requests.exceptions.ConnectionError:
        print("❌ CONNECTION ERROR: Make sure the Django server is running on localhost:8000")
    except Exception as e:
        print(f"❌ ERROR: {e}")

if __name__ == "__main__":
    test_mentor_feedback() 