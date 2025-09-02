import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import supabase
from app.crud import get_user_by_username

def test_supabase_connection():
    """Test the connection to Supabase"""
    try:
        # Test basic connection by accessing a table
        response = supabase.table('IB_Authentication').select("*").limit(1).execute()
        print("SUCCESS: Connection to Supabase established")
        print(f"Sample data: {response.data}")
        return True
    except Exception as e:
        print(f"ERROR: Connection to Supabase failed: {str(e)}")
        return False

def test_user_access():
    """Test if we can access user data"""
    try:
        # Test accessing a user (this will help us understand the data structure)
        user = get_user_by_username("test")
        print("SUCCESS: User access function works")
        print(f"User data: {user}")
        return True
    except Exception as e:
        print(f"ERROR: User access failed: {str(e)}")
        return False

if __name__ == "__main__":
    print("=== Simple Supabase Connection Test ===")
    print(f"URL: {supabase.supabase_url}")
    print()
    
    connection_ok = test_supabase_connection()
    print()
    user_ok = test_user_access()
    
    if connection_ok and user_ok:
        print("\nAll tests passed successfully")
    else:
        print("\nSome tests failed")