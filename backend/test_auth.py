import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.crud import get_user_by_username
from app.crud import get_member_by_id
from passlib.context import CryptContext

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def test_user_retrieval():
    """Test retrieving a user by username"""
    try:
        # Test with existing user
        user = get_user_by_username("yeison.duque")
        print("SUCCESS: User retrieval works")
        print(f"User data: {user}")
        return user
    except Exception as e:
        print(f"ERROR: User retrieval failed: {str(e)}")
        return None

def test_password_verification():
    """Test password verification"""
    user = test_user_retrieval()
    if not user:
        print("Cannot test password verification without user")
        return False
        
    try:
        # Test password verification
        password = "123"  # From the sample data
        user_password = user.get('password')
        print(f"Stored password hash: {user_password}")
        
        if user_password is None:
            print("ERROR: User password is None")
            return False
            
        password_valid = pwd_context.verify(password, user_password)
        print(f"Password verification result: {password_valid}")
        return password_valid
    except Exception as e:
        print(f"ERROR: Password verification failed: {str(e)}")
        return False

def test_member_retrieval():
    """Test retrieving member by ID"""
    user = test_user_retrieval()
    if not user:
        print("Cannot test member retrieval without user")
        return False
        
    try:
        member_id = user.get('id_members')
        print(f"Member ID: {member_id}")
        
        if member_id is None:
            print("ERROR: Member ID is None")
            return False
            
        member = get_member_by_id(member_id)
        print("SUCCESS: Member retrieval works")
        print(f"Member data: {member}")
        return True
    except Exception as e:
        print(f"ERROR: Member retrieval failed: {str(e)}")
        return False

if __name__ == "__main__":
    print("=== Authentication Test ===")
    print()
    
    user_ok = test_user_retrieval() is not None
    print()
    password_ok = test_password_verification()
    print()
    member_ok = test_member_retrieval()
    
    if user_ok and password_ok and member_ok:
        print("\nAll authentication tests passed successfully")
    else:
        print("\nSome authentication tests failed")