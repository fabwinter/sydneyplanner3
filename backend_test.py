#!/usr/bin/env python3
"""
Comprehensive Backend API Tests for Sydney Planner
Focus: Photo Upload functionality with validation and existing endpoint smoke tests
"""

import requests
import json
import io
import os
from PIL import Image
import base64
import tempfile

# Base URL from environment
BASE_URL = "https://sydney-planner-app.preview.emergentagent.com/api"

def create_test_image(format='JPEG', size=(100, 100), size_mb=None):
    """Create a test image file with specified format and size"""
    img = Image.new('RGB', size, color='red')
    img_buffer = io.BytesIO()
    
    if size_mb:
        # Create image of specific size in MB (approximate)
        target_size = size_mb * 1024 * 1024
        quality = 95
        while quality > 10:
            img_buffer.seek(0)
            img_buffer.truncate()
            img.save(img_buffer, format=format, quality=quality)
            if img_buffer.tell() >= target_size:
                break
            quality -= 5
        img_buffer.seek(0)
    else:
        img.save(img_buffer, format=format)
        img_buffer.seek(0)
    
    return img_buffer

def create_text_file():
    """Create a text file for invalid file type testing"""
    return io.BytesIO(b"This is not an image file")

def test_upload_valid_image():
    """Test uploading a valid image file"""
    print("🧪 Testing valid image upload...")
    
    try:
        img_buffer = create_test_image('JPEG')
        files = {'file': ('test.jpg', img_buffer, 'image/jpeg')}
        data = {'user_id': 'test_user_sydney'}
        
        response = requests.post(f"{BASE_URL}/upload", files=files, data=data)
        
        if response.status_code == 200:
            result = response.json()
            if result.get('success') and 'url' in result and 'storage' in result:
                print(f"✅ Valid image upload: Success with {result['storage']} storage")
                return True, result
            else:
                print(f"❌ Valid image upload: Missing required fields in response: {result}")
                return False, result
        else:
            print(f"❌ Valid image upload failed: Status {response.status_code}")
            print(f"Response: {response.text}")
            return False, None
    except Exception as e:
        print(f"❌ Valid image upload error: {str(e)}")
        return False, None

def test_upload_invalid_file_type():
    """Test uploading invalid file type (should reject)"""
    print("🧪 Testing invalid file type upload...")
    
    try:
        text_file = create_text_file()
        files = {'file': ('test.txt', text_file, 'text/plain')}
        data = {'user_id': 'test_user_sydney'}
        
        response = requests.post(f"{BASE_URL}/upload", files=files, data=data)
        
        if response.status_code == 415:
            result = response.json()
            if 'error' in result and 'Invalid file type' in result['error']:
                print("✅ Invalid file type: Properly rejected with 415 status")
                return True, result
            else:
                print(f"❌ Invalid file type: Wrong error message: {result}")
                return False, result
        else:
            print(f"❌ Invalid file type: Expected 415, got {response.status_code}")
            print(f"Response: {response.text}")
            return False, None
    except Exception as e:
        print(f"❌ Invalid file type test error: {str(e)}")
        return False, None

def test_upload_oversized_file():
    """Test uploading file over 5MB limit (should reject)"""
    print("🧪 Testing oversized file upload (>5MB)...")
    
    try:
        # Create 6MB image
        img_buffer = create_test_image('JPEG', size=(2000, 2000), size_mb=6)
        files = {'file': ('large.jpg', img_buffer, 'image/jpeg')}
        data = {'user_id': 'test_user_sydney'}
        
        response = requests.post(f"{BASE_URL}/upload", files=files, data=data)
        
        if response.status_code == 413:
            result = response.json()
            if 'error' in result and '5MB' in result['error']:
                print("✅ Oversized file: Properly rejected with 413 status")
                return True, result
            else:
                print(f"❌ Oversized file: Wrong error message: {result}")
                return False, result
        else:
            print(f"❌ Oversized file: Expected 413, got {response.status_code}")
            print(f"Response: {response.text}")
            return False, None
    except Exception as e:
        print(f"❌ Oversized file test error: {str(e)}")
        return False, None

def test_upload_no_file():
    """Test upload endpoint with no file (should reject)"""
    print("🧪 Testing upload with no file...")
    
    try:
        data = {'user_id': 'test_user_sydney'}
        
        response = requests.post(f"{BASE_URL}/upload", data=data)
        
        if response.status_code == 400:
            result = response.json()
            if 'error' in result and 'No file provided' in result['error']:
                print("✅ No file: Properly rejected with 400 status")
                return True, result
            else:
                print(f"❌ No file: Wrong error message: {result}")
                return False, result
        else:
            print(f"❌ No file: Expected 400, got {response.status_code}")
            print(f"Response: {response.text}")
            return False, None
    except Exception as e:
        print(f"❌ No file test error: {str(e)}")
        return False, None

def test_upload_different_formats():
    """Test uploading different valid image formats"""
    print("🧪 Testing different image formats...")
    
    formats = [
        ('PNG', 'test.png', 'image/png'),
        ('WEBP', 'test.webp', 'image/webp'),
        ('GIF', 'test.gif', 'image/gif')
    ]
    
    results = []
    for format_name, filename, mime_type in formats:
        try:
            img_buffer = create_test_image(format_name)
            files = {'file': (filename, img_buffer, mime_type)}
            data = {'user_id': 'test_user_sydney'}
            
            response = requests.post(f"{BASE_URL}/upload", files=files, data=data)
            
            if response.status_code == 200:
                result = response.json()
                if result.get('success'):
                    print(f"✅ {format_name} format: Success")
                    results.append((True, format_name))
                else:
                    print(f"❌ {format_name} format: Response not successful: {result}")
                    results.append((False, format_name))
            else:
                print(f"❌ {format_name} format: Status {response.status_code}")
                results.append((False, format_name))
        except Exception as e:
            print(f"❌ {format_name} format error: {str(e)}")
            results.append((False, format_name))
    
    return results

def test_signed_url_endpoint():
    """Test the signed URL generation endpoint"""
    print("🧪 Testing signed URL endpoint...")
    
    try:
        # Test with a sample path
        test_path = "test_user_sydney/sample-image.jpg"
        response = requests.get(f"{BASE_URL}/photos/signed-url?path={test_path}")
        
        if response.status_code == 200:
            result = response.json()
            if 'signedUrl' in result and 'success' in result and result['success']:
                print("✅ Signed URL: Success - returns signedUrl")
                return True, result
            else:
                print(f"❌ Signed URL: Missing required fields: {result}")
                return False, result
        else:
            print(f"❌ Signed URL: Status {response.status_code}")
            print(f"Response: {response.text}")
            return False, None
    except Exception as e:
        print(f"❌ Signed URL test error: {str(e)}")
        return False, None

def test_signed_url_no_path():
    """Test signed URL endpoint with missing path parameter"""
    print("🧪 Testing signed URL endpoint without path...")
    
    try:
        response = requests.get(f"{BASE_URL}/photos/signed-url")
        
        if response.status_code == 400:
            result = response.json()
            if 'error' in result and 'required' in result['error'].lower():
                print("✅ Signed URL no path: Properly rejected with 400 status")
                return True, result
            else:
                print(f"❌ Signed URL no path: Wrong error message: {result}")
                return False, result
        else:
            print(f"❌ Signed URL no path: Expected 400, got {response.status_code}")
            return False, None
    except Exception as e:
        print(f"❌ Signed URL no path test error: {str(e)}")
        return False, None

def test_checkin_with_photos():
    """Test creating a check-in with photos (integration test)"""
    print("🧪 Testing check-in creation with photos...")
    
    try:
        # First upload a photo
        img_buffer = create_test_image('JPEG')
        files = {'file': ('checkin_photo.jpg', img_buffer, 'image/jpeg')}
        data = {'user_id': 'test_user_sydney'}
        
        upload_response = requests.post(f"{BASE_URL}/upload", files=files, data=data)
        
        if upload_response.status_code != 200:
            print(f"❌ Check-in with photos: Photo upload failed: {upload_response.status_code}")
            return False, None
        
        upload_result = upload_response.json()
        photo_url = upload_result.get('url')
        
        if not photo_url:
            print(f"❌ Check-in with photos: No photo URL returned: {upload_result}")
            return False, None
        
        # Now create check-in with the photo
        checkin_data = {
            "venue_id": "bondi-beach-123",
            "venue_name": "Bondi Beach",
            "venue_category": "Beach",
            "venue_address": "Bondi Beach NSW 2026",
            "venue_lat": -33.8915,
            "venue_lng": 151.2767,
            "venue_image": "https://example.com/bondi.jpg",
            "rating": 5,
            "comment": "Beautiful day at the beach! Test check-in.",
            "photos": [photo_url],
            "user_id": "test_user_sydney"
        }
        
        checkin_response = requests.post(f"{BASE_URL}/checkins", json=checkin_data)
        
        if checkin_response.status_code == 200:
            result = checkin_response.json()
            if result.get('success') and 'id' in result:
                print("✅ Check-in with photos: Success - created check-in with uploaded photo")
                return True, result
            else:
                print(f"❌ Check-in with photos: Response not successful: {result}")
                return False, result
        else:
            print(f"❌ Check-in with photos: Status {checkin_response.status_code}")
            print(f"Response: {checkin_response.text}")
            return False, None
    except Exception as e:
        print(f"❌ Check-in with photos test error: {str(e)}")
        return False, None

def test_existing_endpoints_smoke():
    """Quick smoke tests for existing endpoints"""
    print("\n🚀 Running smoke tests for existing endpoints...")
    
    # Test GET /api/venues
    print("🧪 Testing GET /api/venues...")
    try:
        response = requests.get(f"{BASE_URL}/venues")
        if response.status_code == 200:
            result = response.json()
            if 'venues' in result and isinstance(result['venues'], list):
                print(f"✅ GET /api/venues: Success - {len(result['venues'])} venues")
            else:
                print(f"❌ GET /api/venues: Invalid response format: {result}")
        else:
            print(f"❌ GET /api/venues: Status {response.status_code}")
    except Exception as e:
        print(f"❌ GET /api/venues error: {str(e)}")
    
    # Test GET /api/checkins
    print("🧪 Testing GET /api/checkins...")
    try:
        response = requests.get(f"{BASE_URL}/checkins?user_id=anonymous")
        if response.status_code == 200:
            result = response.json()
            if 'checkins' in result and isinstance(result['checkins'], list):
                print(f"✅ GET /api/checkins: Success - {len(result['checkins'])} check-ins")
            else:
                print(f"❌ GET /api/checkins: Invalid response format: {result}")
        else:
            print(f"❌ GET /api/checkins: Status {response.status_code}")
    except Exception as e:
        print(f"❌ GET /api/checkins error: {str(e)}")
    
    # Test POST /api/checkins (simple creation)
    print("🧪 Testing POST /api/checkins...")
    try:
        checkin_data = {
            "venue_id": "test-venue-123",
            "venue_name": "Test Venue",
            "venue_category": "Cafe",
            "venue_address": "123 Test St, Sydney NSW",
            "rating": 4,
            "comment": "Great coffee and atmosphere!",
            "user_id": "test_user_sydney"
        }
        response = requests.post(f"{BASE_URL}/checkins", json=checkin_data)
        if response.status_code == 200:
            result = response.json()
            if result.get('success'):
                print("✅ POST /api/checkins: Success - check-in created")
            else:
                print(f"❌ POST /api/checkins: Response not successful: {result}")
        else:
            print(f"❌ POST /api/checkins: Status {response.status_code}")
    except Exception as e:
        print(f"❌ POST /api/checkins error: {str(e)}")

def main():
    """Run all photo upload tests"""
    print("=" * 60)
    print("🏖️  SYDNEY PLANNER PHOTO UPLOAD API TESTS")
    print("=" * 60)
    
    # Track results
    total_tests = 0
    passed_tests = 0
    
    print("\n📸 PHOTO UPLOAD TESTS")
    print("-" * 40)
    
    # Core upload functionality tests
    tests = [
        test_upload_valid_image,
        test_upload_invalid_file_type,
        test_upload_oversized_file,
        test_upload_no_file,
        test_signed_url_endpoint,
        test_signed_url_no_path,
        test_checkin_with_photos
    ]
    
    for test_func in tests:
        total_tests += 1
        success, result = test_func()
        if success:
            passed_tests += 1
        print()
    
    # Test different formats
    print("🧪 Testing different image formats...")
    format_results = test_upload_different_formats()
    for success, format_name in format_results:
        total_tests += 1
        if success:
            passed_tests += 1
    
    print()
    
    # Existing endpoints smoke tests
    test_existing_endpoints_smoke()
    
    # Final summary
    print("\n" + "=" * 60)
    print("📊 TEST SUMMARY")
    print("=" * 60)
    print(f"Total Photo Upload Tests: {total_tests}")
    print(f"Passed: {passed_tests}")
    print(f"Failed: {total_tests - passed_tests}")
    print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
    
    if passed_tests == total_tests:
        print("🎉 ALL PHOTO UPLOAD TESTS PASSED!")
    else:
        print(f"⚠️  {total_tests - passed_tests} tests failed - see details above")
    
    print("\n✨ Photo upload functionality testing complete!")

if __name__ == "__main__":
    main()