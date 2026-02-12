#!/usr/bin/env python3
"""
Sydney Planner Backend API Testing Script
Tests all backend endpoints according to test_result.md requirements
"""

import requests
import json
import sys
import os
from urllib.parse import urljoin

# Get base URL from environment
BASE_URL = "https://ai-chat-map-demo.preview.emergentagent.com"
API_BASE = f"{BASE_URL}/api"

def test_root_endpoints():
    """Test GET /api/ and GET /api/root endpoints"""
    print("\n=== Testing Root Endpoints ===")
    
    endpoints = [
        ("GET /api/", f"{API_BASE}/"),
        ("GET /api/root", f"{API_BASE}/root")
    ]
    
    results = []
    for name, url in endpoints:
        try:
            print(f"Testing {name}...")
            response = requests.get(url, timeout=10)
            
            print(f"Status: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print(f"Response: {json.dumps(data, indent=2)}")
                
                # Check response structure
                if 'message' in data and 'version' in data:
                    results.append(f"✅ {name} - Working correctly")
                else:
                    results.append(f"❌ {name} - Missing expected fields (message, version)")
            else:
                results.append(f"❌ {name} - HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            results.append(f"❌ {name} - Error: {str(e)}")
            print(f"Error: {e}")
    
    return results

def test_chat_endpoint():
    """Test POST /api/chat endpoint"""
    print("\n=== Testing AI Chat Endpoint ===")
    
    results = []
    url = f"{API_BASE}/chat"
    
    # Test 1: Valid chat request
    try:
        print("Testing POST /api/chat with valid query...")
        payload = {"query": "best brunch cafes in Sydney"}
        response = requests.post(url, json=payload, timeout=15)
        
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Response keys: {list(data.keys())}")
            
            # Check response structure
            required_fields = ['message', 'venues', 'query']
            missing_fields = [field for field in required_fields if field not in data]
            
            if not missing_fields:
                # Validate data types
                if (isinstance(data['message'], str) and 
                    isinstance(data['venues'], list) and 
                    isinstance(data['query'], str)):
                    
                    print(f"Message: {data['message'][:100]}...")
                    print(f"Venues count: {len(data['venues'])}")
                    print(f"Query echoed: {data['query']}")
                    
                    # Check venue structure
                    if data['venues'] and len(data['venues']) > 0:
                        venue = data['venues'][0]
                        venue_fields = ['id', 'name', 'category', 'address', 'rating']
                        venue_missing = [field for field in venue_fields if field not in venue]
                        
                        if not venue_missing:
                            results.append("✅ POST /api/chat - Working correctly with valid response structure")
                        else:
                            results.append(f"❌ POST /api/chat - Venue missing fields: {venue_missing}")
                    else:
                        results.append("❌ POST /api/chat - No venues returned")
                else:
                    results.append("❌ POST /api/chat - Invalid data types in response")
            else:
                results.append(f"❌ POST /api/chat - Missing required fields: {missing_fields}")
        else:
            results.append(f"❌ POST /api/chat - HTTP {response.status_code}: {response.text}")
            
    except Exception as e:
        results.append(f"❌ POST /api/chat - Error: {str(e)}")
        print(f"Error: {e}")
    
    # Test 2: Missing query parameter
    try:
        print("Testing POST /api/chat with missing query...")
        response = requests.post(url, json={}, timeout=10)
        
        print(f"Status: {response.status_code}")
        
        if response.status_code == 400:
            data = response.json()
            if 'error' in data:
                results.append("✅ POST /api/chat - Error handling working (missing query)")
            else:
                results.append("❌ POST /api/chat - Bad request but no error message")
        else:
            results.append(f"❌ POST /api/chat - Should return 400 for missing query, got {response.status_code}")
            
    except Exception as e:
        results.append(f"❌ POST /api/chat missing query test - Error: {str(e)}")
        print(f"Error: {e}")
    
    return results

def test_venues_endpoint():
    """Test GET /api/venues endpoint"""
    print("\n=== Testing Get All Venues Endpoint ===")
    
    results = []
    url = f"{API_BASE}/venues"
    
    try:
        print("Testing GET /api/venues...")
        response = requests.get(url, timeout=10)
        
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Response keys: {list(data.keys())}")
            
            # Check response structure
            if 'venues' in data and 'total' in data:
                venues = data['venues']
                total = data['total']
                
                print(f"Total venues: {total}")
                print(f"Venues array length: {len(venues)}")
                
                # Validate data types and structure
                if isinstance(venues, list) and isinstance(total, int):
                    if len(venues) == total and total > 0:
                        # Check first venue structure
                        venue = venues[0]
                        required_fields = ['id', 'name', 'category', 'address', 'lat', 'lng', 'rating']
                        missing_fields = [field for field in required_fields if field not in venue]
                        
                        if not missing_fields:
                            results.append(f"✅ GET /api/venues - Working correctly ({total} venues)")
                        else:
                            results.append(f"❌ GET /api/venues - Venue missing fields: {missing_fields}")
                    else:
                        results.append(f"❌ GET /api/venues - Mismatch: venues array length {len(venues)} != total {total}")
                else:
                    results.append("❌ GET /api/venues - Invalid data types")
            else:
                results.append("❌ GET /api/venues - Missing required fields (venues, total)")
        else:
            results.append(f"❌ GET /api/venues - HTTP {response.status_code}: {response.text}")
            
    except Exception as e:
        results.append(f"❌ GET /api/venues - Error: {str(e)}")
        print(f"Error: {e}")
    
    return results

def test_search_endpoint():
    """Test GET /api/search?q=query endpoint"""
    print("\n=== Testing Search Venues Endpoint ===")
    
    results = []
    
    # Test searches
    test_cases = [
        ("beach", "beach venues"),
        ("cafe", "cafe venues"),
        ("restaurant", "restaurant venues"),
        ("", "empty query")
    ]
    
    for query, description in test_cases:
        try:
            url = f"{API_BASE}/search"
            params = {"q": query} if query else {}
            
            print(f"Testing GET /api/search?q={query} ({description})...")
            response = requests.get(url, params=params, timeout=10)
            
            print(f"Status: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print(f"Response keys: {list(data.keys())}")
                
                # Check response structure
                required_fields = ['venues', 'query', 'total']
                missing_fields = [field for field in required_fields if field not in data]
                
                if not missing_fields:
                    venues = data['venues']
                    echoed_query = data['query']
                    total = data['total']
                    
                    print(f"Query echoed: '{echoed_query}'")
                    print(f"Venues found: {total}")
                    
                    # Validate data types
                    if (isinstance(venues, list) and 
                        isinstance(echoed_query, str) and 
                        isinstance(total, int)):
                        
                        if len(venues) == total:
                            if query and total > 0:
                                # Check if venues match search criteria
                                venue = venues[0]
                                print(f"Sample venue: {venue.get('name', 'N/A')} - {venue.get('category', 'N/A')}")
                            
                            results.append(f"✅ GET /api/search?q={query} - Working correctly ({total} results)")
                        else:
                            results.append(f"❌ GET /api/search?q={query} - Array length {len(venues)} != total {total}")
                    else:
                        results.append(f"❌ GET /api/search?q={query} - Invalid data types")
                else:
                    results.append(f"❌ GET /api/search?q={query} - Missing fields: {missing_fields}")
            else:
                results.append(f"❌ GET /api/search?q={query} - HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            results.append(f"❌ GET /api/search?q={query} - Error: {str(e)}")
            print(f"Error: {e}")
    
    return results

def main():
    """Run all backend API tests"""
    print("🧪 Sydney Planner Backend API Testing")
    print(f"Base URL: {BASE_URL}")
    print(f"API Base: {API_BASE}")
    print("=" * 50)
    
    all_results = []
    
    # Test in priority order: high -> medium -> low
    try:
        # High priority: AI Chat endpoint
        chat_results = test_chat_endpoint()
        all_results.extend(chat_results)
        
        # Medium priority: Venues endpoints
        venues_results = test_venues_endpoint()
        all_results.extend(venues_results)
        
        search_results = test_search_endpoint()
        all_results.extend(search_results)
        
        # Low priority: Root endpoints
        root_results = test_root_endpoints()
        all_results.extend(root_results)
        
    except KeyboardInterrupt:
        print("\n\nTesting interrupted by user")
        return 1
    
    # Summary
    print("\n" + "=" * 50)
    print("🏁 BACKEND TEST SUMMARY")
    print("=" * 50)
    
    passed = 0
    failed = 0
    
    for result in all_results:
        print(result)
        if result.startswith("✅"):
            passed += 1
        else:
            failed += 1
    
    print(f"\nTotal Tests: {len(all_results)}")
    print(f"✅ Passed: {passed}")
    print(f"❌ Failed: {failed}")
    
    if failed == 0:
        print("\n🎉 ALL BACKEND TESTS PASSED!")
        return 0
    else:
        print(f"\n⚠️  {failed} backend tests failed")
        return 1

if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code)