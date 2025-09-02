import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.routers.auth import pwd_context
from app.crud import get_user_by_username

def test_password_verification_fixed():
    """Test the fixed password verification logic"""
    try:
        # Get user data
        user = get_user_by_username("yeison.duque")
        if not user:
            print("ERROR: User not found")
            return False
            
        user_password = user.get('password')
        print(f"Stored password: {user_password}")
        
        # Test with correct password
        correct_password = "123"
        print(f"Testing with correct password: {correct_password}")
        
        # Try to verify as bcrypt hash first
        try:
            password_valid = pwd_context.verify(correct_password, user_password)
            print(f"BCRYPT verification result: {password_valid}")
        except Exception as pwd_e:
            print(f"BCRYPT verification failed: {pwd_e}")
            # If that fails, check if it's plain text
            if str(pwd_e) == "hash could not be identified":
                # Plain text comparison
                password_valid = correct_password == user_password
                print(f"Plain text comparison result: {password_valid}")
                if password_valid:
                    print("Plain text password detected - should be migrated to hashed")
            else:
                print(f"Unexpected error: {pwd_e}")
                return False
        
        # Test with incorrect password
        incorrect_password = "wrong"
        print(f"Testing with incorrect password: {incorrect_password}")
        
        # Try to verify as bcrypt hash first
        try:
            password_valid = pwd_context.verify(incorrect_password, user_password)
            print(f"BCRYPT verification result (incorrect): {password_valid}")
        except Exception as pwd_e:
            print(f"BCRYPT verification failed (incorrect): {pwd_e}")
            # If that fails, check if it's plain text
            if str(pwd_e) == "hash could not be identified":
                # Plain text comparison
                password_valid = incorrect_password == user_password
                print(f"Plain text comparison result (incorrect): {password_valid}")
            else:
                print(f"Unexpected error: {pwd_e}")
                return False
        
        return True
    except Exception as e:
        print(f"ERROR: Test failed with exception: {str(e)}")
        return False

if __name__ == "__main__":
    print("=== Testing Fixed Authentication Logic ===")
    print()
    
    success = test_password_verification_fixed()
    
    if success:
        print("\nTest completed successfully")
    else:
        print("\nTest failed")