import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import supabase

def test_supabase_connection():
    """Test the connection to Supabase"""
    try:
        # Test basic connection by fetching the user
        response = supabase.auth.get_user()
        print("✅ Conexión exitosa a Supabase")
        print(f"Usuario autenticado: {response}")
        return True
    except Exception as e:
        print(f"❌ Error de conexión a Supabase: {str(e)}")
        return False

def test_database_tables():
    """Test if we can access the database tables"""
    try:
        # Test accessing a table (assuming 'employees' table exists)
        response = supabase.table('employees').select("*").limit(1).execute()
        print("✅ Acceso exitoso a las tablas de la base de datos")
        print(f"Datos de prueba: {response.data}")
        return True
    except Exception as e:
        print(f"❌ Error al acceder a las tablas: {str(e)}")
        return False

if __name__ == "__main__":
    print("=== Verificación de conexión a Supabase ===")
    print(f"URL: {supabase.supabase_url}")
    print(f"Key: {supabase.supabase_key[:20]}...")
    print()
    
    connection_ok = test_supabase_connection()
    tables_ok = test_database_tables()
    
    if connection_ok and tables_ok:
        print("\n🎉 Todos los tests pasaron exitosamente")
    else:
        print("\n⚠️ Algunos tests fallaron")
