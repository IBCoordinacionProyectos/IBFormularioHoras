import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.routers.auth import pwd_context
from app.crud import get_user_by_username, update_user_password

def test_password_migration():
    """Test the password migration functionality"""
    try:
        # Get user data
        user = get_user_by_username("yeison.duque")
        if not user:
            print("ERROR: User not found")
            return False
            
        user_password = user.get('password')
        print(f"Current stored password: {user_password}")
        
        # Check if it's already hashed
        try:
            # Try to verify as a bcrypt hash
            pwd_context.verify("123", user_password)
            print("Password is already hashed")
            return True
        except Exception as e:
            if str(e) == "hash could not be identified":
                print("Password is plain text - needs migration")
                # Hash the password
                hashed_password = pwd_context.hash("123")
                print(f"Hashed password: {hashed_password}")
                
                # Update the database
                update_user_password("yeison.duque", hashed_password)
                print("Password successfully migrated to hashed version")
                
                # Verify the update
                updated_user = get_user_by_username("yeison.duque")
                updated_password = updated_user.get('password')
                print(f"Updated stored password: {updated_password}")
                
                # Verify it can be validated
                try:
                    pwd_context.verify("123", updated_password)
                    print("SUCCESS: Hashed password verification works")
                    return True
                except Exception as verify_e:
                    print(f"ERROR: Hashed password verification failed: {verify_e}")
                    return False
            else:
                print(f"ERROR: Unexpected error: {e}")
                return False
    except Exception as e:
        print(f"ERROR: Test failed with exception: {str(e)}")
        return False

if __name__ == "__main__":
    print("=== Testing Password Migration ===")
    print()
    
    success = test_password_migration()
    
    if success:
        print("\nPassword migration test passed successfully")
    else:
        print("\nPassword migration test failed")