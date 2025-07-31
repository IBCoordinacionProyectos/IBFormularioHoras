import os
from dotenv import load_dotenv
from ..database import supabase

load_dotenv()

def test_supabase_connection():
    """Test connection to Supabase and check for required tables."""
    try:
        # Test basic connection
        response = supabase.table("IB_Projects").select("*").limit(1).execute()
        print("✅ Connection to Supabase successful")
        print(f"✅ IB_Projects table found with {len(response.data)} projects")
        
        # Test IB_Reported_Hours table
        response = supabase.table("IB_Reported_Hours").select("*").limit(1).execute()
        print(f"✅ IB_Reported_Hours table found with {len(response.data)} records")
        
        return True
        
    except Exception as e:
        print(f"❌ Error connecting to Supabase: {str(e)}")
        return False

if __name__ == "__main__":
    test_supabase_connection()
