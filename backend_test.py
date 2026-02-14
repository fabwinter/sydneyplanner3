#!/usr/bin/env python3
import requests
import json
import uuid
import os
from io import BytesIO

# Base URL from environment
BASE_URL = "https://sydney-planner-app.preview.emergentagent.com/api"

def test_checkins_api():
    """Test Check-ins API endpoints"""
    print("=" * 50)
    print("TESTING CHECK-INS API")
    print("=" * 50)
    
    # Test data
    test_venue_id = str(uuid.uuid4())
    test_data_full = {
        "venue_id": test_venue_id,
        "venue_name": "Test Bondi Beach",
        "venue_category": "Beach",
        "venue_address": "Bondi Beach NSW 2026",
        "venue_lat": -33.8915,
        "venue_lng": 151.2767,
        "venue_image": "https://images.unsplash.com/photo-1527731149372-fae504a1185f?w=400&h=300&fit=crop",
        "rating": 4.5,
        "comment": "Amazing beach day with perfect waves!",
        "photos": ["photo1.jpg", "photo2.jpg"],
        "user_id": "anonymous"
    }
    
    test_data_minimal = {
        "venue_id": str(uuid.uuid4()),
        "rating": 4.0
    }
    
    # Test 1: Create check-in with all fields
    print("\n1. Testing POST /api/checkins with all fields...")
    try:
        response = requests.post(f"{BASE_URL}/checkins", json=test_data_full)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success') and data.get('id') and data.get('storage'):
                print("✅ PASS: Check-in created successfully with all fields")
            else:
                print("❌ FAIL: Response missing required fields")
        else:
            print(f"❌ FAIL: Unexpected status code {response.status_code}")
    except Exception as e:
        print(f"❌ FAIL: Exception occurred: {e}")
    
    # Test 2: Create check-in with only required fields
    print("\n2. Testing POST /api/checkins with only required fields...")
    try:
        response = requests.post(f"{BASE_URL}/checkins", json=test_data_minimal)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success') and data.get('id'):
                print("✅ PASS: Check-in created successfully with minimal fields")
            else:
                print("❌ FAIL: Response missing required fields")
        else:
            print(f"❌ FAIL: Unexpected status code {response.status_code}")
    except Exception as e:
        print(f"❌ FAIL: Exception occurred: {e}")
    
    # Test 3: Try to create check-in without venue_id (should fail)
    print("\n3. Testing POST /api/checkins without venue_id (should fail)...")
    try:
        invalid_data = {"rating": 4.0}
        response = requests.post(f"{BASE_URL}/checkins", json=invalid_data)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        
        if response.status_code == 400:
            data = response.json()
            if 'error' in data and 'venue_id' in data['error']:
                print("✅ PASS: Correctly rejected request without venue_id")
            else:
                print("❌ FAIL: Error message doesn't mention venue_id")
        else:
            print(f"❌ FAIL: Expected 400, got {response.status_code}")
    except Exception as e:
        print(f"❌ FAIL: Exception occurred: {e}")
    
    # Test 4: Try to create check-in without rating (should fail)
    print("\n4. Testing POST /api/checkins without rating (should fail)...")
    try:
        invalid_data = {"venue_id": str(uuid.uuid4())}
        response = requests.post(f"{BASE_URL}/checkins", json=invalid_data)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        
        if response.status_code == 400:
            data = response.json()
            if 'error' in data and 'rating' in data['error']:
                print("✅ PASS: Correctly rejected request without rating")
            else:
                print("❌ FAIL: Error message doesn't mention rating")
        else:
            print(f"❌ FAIL: Expected 400, got {response.status_code}")
    except Exception as e:
        print(f"❌ FAIL: Exception occurred: {e}")
    
    # Test 5: Get check-ins for anonymous user
    print("\n5. Testing GET /api/checkins?user_id=anonymous...")
    try:
        response = requests.get(f"{BASE_URL}/checkins?user_id=anonymous")
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        
        if response.status_code == 200:
            data = response.json()
            if 'checkins' in data and 'total' in data and 'storage' in data:
                print(f"✅ PASS: Retrieved {data['total']} check-ins from {data['storage']}")
                
                # Check if checkins are sorted by created_at desc
                if len(data['checkins']) > 1:
                    checkins = data['checkins']
                    for i in range(len(checkins) - 1):
                        if checkins[i]['created_at'] < checkins[i+1]['created_at']:
                            print("❌ FAIL: Check-ins not sorted by created_at desc")
                            break
                    else:
                        print("✅ PASS: Check-ins properly sorted by created_at desc")
            else:
                print("❌ FAIL: Response missing required fields")
        else:
            print(f"❌ FAIL: Unexpected status code {response.status_code}")
    except Exception as e:
        print(f"❌ FAIL: Exception occurred: {e}")

def test_saves_api():
    """Test Saves API endpoints"""
    print("\n" + "=" * 50)
    print("TESTING SAVES API")
    print("=" * 50)
    
    test_venue_id = str(uuid.uuid4())
    test_save_data = {
        "venue_id": test_venue_id,
        "venue_name": "Test Sydney Opera House",
        "venue_category": "Attraction",
        "venue_image": "https://images.unsplash.com/photo-1523059623039-a9ed027e7fad?w=400&h=300&fit=crop",
        "user_id": "anonymous"
    }
    
    # Test 6: Save a venue
    print("\n6. Testing POST /api/saves (save venue)...")
    try:
        response = requests.post(f"{BASE_URL}/saves", json=test_save_data)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success') and data.get('action') == 'saved':
                print("✅ PASS: Venue saved successfully")
                save_id = data.get('id')
                if save_id:
                    print(f"✅ PASS: Save ID returned: {save_id}")
                else:
                    print("❌ FAIL: No save ID returned")
            else:
                print("❌ FAIL: Response missing required fields or wrong action")
        else:
            print(f"❌ FAIL: Unexpected status code {response.status_code}")
    except Exception as e:
        print(f"❌ FAIL: Exception occurred: {e}")
    
    # Test 7: Get saves
    print("\n7. Testing GET /api/saves?user_id=anonymous...")
    try:
        response = requests.get(f"{BASE_URL}/saves?user_id=anonymous")
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        
        if response.status_code == 200:
            data = response.json()
            if 'saves' in data and 'total' in data:
                print(f"✅ PASS: Retrieved {data['total']} saves")
                
                # Check if the venue we just saved is there
                if data['total'] > 0:
                    saved_venue_ids = [save['venue_id'] for save in data['saves']]
                    if test_venue_id in saved_venue_ids:
                        print("✅ PASS: Previously saved venue found in saves")
                    else:
                        print("❌ FAIL: Previously saved venue not found in saves")
            else:
                print("❌ FAIL: Response missing required fields")
        else:
            print(f"❌ FAIL: Unexpected status code {response.status_code}")
    except Exception as e:
        print(f"❌ FAIL: Exception occurred: {e}")
    
    # Test 8: Save same venue again (should unsave it)
    print("\n8. Testing POST /api/saves (unsave venue)...")
    try:
        response = requests.post(f"{BASE_URL}/saves", json=test_save_data)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success') and data.get('action') == 'removed':
                print("✅ PASS: Venue unsaved successfully (toggle functionality working)")
            else:
                print("❌ FAIL: Response missing required fields or wrong action")
        else:
            print(f"❌ FAIL: Unexpected status code {response.status_code}")
    except Exception as e:
        print(f"❌ FAIL: Exception occurred: {e}")
    
    # Test for missing venue_id
    print("\n9. Testing POST /api/saves without venue_id (should fail)...")
    try:
        invalid_data = {"venue_name": "Test Venue"}
        response = requests.post(f"{BASE_URL}/saves", json=invalid_data)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        
        if response.status_code == 400:
            data = response.json()
            if 'error' in data and 'venue_id' in data['error']:
                print("✅ PASS: Correctly rejected request without venue_id")
            else:
                print("❌ FAIL: Error message doesn't mention venue_id")
        else:
            print(f"❌ FAIL: Expected 400, got {response.status_code}")
    except Exception as e:
        print(f"❌ FAIL: Exception occurred: {e}")

def test_upload_api():
    """Test Upload API endpoint"""
    print("\n" + "=" * 50)
    print("TESTING UPLOAD API")
    print("=" * 50)
    
    # Test 9: Test upload endpoint (will return placeholder URL)
    print("\n10. Testing POST /api/upload with image file...")
    try:
        # Create a fake image file in memory
        fake_image_data = b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15\xc4\x89\x00\x00\x00\nIDATx\x9cc\x00\x01\x00\x00\x05\x00\x01\r\n-\xdb\x00\x00\x00\x00IEND\xaeB`\x82'
        files = {'file': ('test.png', BytesIO(fake_image_data), 'image/png')}
        
        response = requests.post(f"{BASE_URL}/upload", files=files)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success') and data.get('url'):
                print("✅ PASS: Upload endpoint working (returns URL)")
                if 'placeholder' in data.get('note', '').lower():
                    print("✅ PASS: Using placeholder URL as expected (Supabase Storage not fully configured)")
                else:
                    print("✅ PASS: Upload successful to Supabase Storage")
            else:
                print("❌ FAIL: Response missing required fields")
        else:
            print(f"❌ FAIL: Unexpected status code {response.status_code}")
    except Exception as e:
        print(f"❌ FAIL: Exception occurred: {e}")
    
    # Test upload without file
    print("\n11. Testing POST /api/upload without file (should fail)...")
    try:
        response = requests.post(f"{BASE_URL}/upload", files={})
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        
        if response.status_code == 400:
            data = response.json()
            if 'error' in data and 'file' in data['error'].lower():
                print("✅ PASS: Correctly rejected request without file")
            else:
                print("❌ FAIL: Error message doesn't mention file")
        else:
            print(f"❌ FAIL: Expected 400, got {response.status_code}")
    except Exception as e:
        print(f"❌ FAIL: Exception occurred: {e}")

def main():
    """Run all backend tests"""
    print("Starting Sydney Planner Backend API Tests...")
    print(f"Base URL: {BASE_URL}")
    
    try:
        # Test Check-ins API
        test_checkins_api()
        
        # Test Saves API
        test_saves_api()
        
        # Test Upload API
        test_upload_api()
        
        print("\n" + "=" * 50)
        print("ALL TESTS COMPLETED")
        print("=" * 50)
        
    except Exception as e:
        print(f"Fatal error during testing: {e}")

if __name__ == "__main__":
    main()