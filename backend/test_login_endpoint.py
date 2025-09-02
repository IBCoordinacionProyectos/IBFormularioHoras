import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.routers.auth import login
from app.schemas import UserLogin
import asyncio

class MockRequest:
    """Mock request object for testing"""
    def __init__(self):
        self.headers = {}

async def test_login_endpoint():
    """Test the login endpoint with correct credentials"""
    try:
        # Create user credentials
        credentials = UserLogin(username="yeison.duque", password="123")
        request = MockRequest()
        
        # Call the login function
        result = await login(credentials, request)
        
        print("SUCCESS: Login endpoint works correctly")
        print(f"Response: {result}")
        return True
    except Exception as e:
        print(f"ERROR: Login endpoint failed: {str(e)}")
        return False

async def test_login_endpoint_wrong_password():
    """Test the login endpoint with wrong credentials"""
    try:
        # Create user credentials with wrong password
        credentials = UserLogin(username="yeison.duque", password="wrong")
        request = MockRequest()
        
        # Call the login function
        result = await login(credentials, request)
        
        print("ERROR: Login should have failed but didn't")
        return False
    except Exception as e:
        print(f"SUCCESS: Login correctly failed with wrong password: {str(e)}")
        return True

if __name__ == "__main__":
    print("=== Testing Login Endpoint ===")
    print()
    
    # Test with correct credentials
    success1 = asyncio.run(test_login_endpoint())
    print()
    
    # Test with wrong credentials
    success2 = asyncio.run(test_login_endpoint_wrong_password())
    
    if success1 and success2:
        print("\nAll login endpoint tests passed successfully")
    else:
        print("\nSome login endpoint tests failed")