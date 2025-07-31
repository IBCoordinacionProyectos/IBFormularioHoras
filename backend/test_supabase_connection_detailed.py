import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import supabase

def test_supabase_connection():
    """Test the connection to Supabase"""
    try:
        # Test basic connection
        response = supabase.auth.get_user()
        print("✅ Conexión exitosa a Supabase")
        print(f"Estado de autenticación: {response}")
        return True
    except Exception as e:
        print(f"❌ Error de conexión a Supabase: {str(e)}")
        return False

def list_available_tables():
    """List available tables in the database"""
    try:
        # Query to get all tables from information_schema
        response = supabase.rpc('get_tables').execute()
        print("✅ Consulta de tablas exitosa")
        print(f"Tablas disponibles: {response.data}")
        return True
    except Exception as e:
        print(f"❌ Error al listar tablas: {str(e)}")
        
        # Alternative method: try to query common tables
        common_tables = ['employees', 'projects', 'activities', 'daily_activities', 'hours']
        available_tables = []
        
        for table in common_tables:
            try:
                response = supabase.table(table).select("*").limit(1).execute()
                available_tables.append(table)
            except:
                pass
        
        if available_tables:
            print(f"✅ Tablas encontradas: {available_tables}")
            return True
        else:
            print("⚠️ No se encontraron tablas en la base de datos")
            return False

def test_database_health():
    """Test overall database health"""
    try:
        # Test a simple query
        response = supabase.rpc('version').execute()
        print("✅ Base de datos responde correctamente")
        print(f"Versión de PostgreSQL: {response.data}")
        return True
    except Exception as e:
        print(f"❌ Error en la base de datos: {str(e)}")
        return False

if __name__ == "__main__":
    print("=== Verificación detallada de conexión a Supabase ===")
    print(f"URL: {supabase.supabase_url}")
    print(f"Key: {supabase.supabase_key[:20]}...")
    print()
    
    print("1. Probando conexión...")
    connection_ok = test_supabase_connection()
    
    print("\n2. Probando salud de la base de datos...")
    health_ok = test_database_health()
    
    print("\n3. Verificando tablas disponibles...")
    tables_ok = list_available_tables()
    
    print("\n" + "="*50)
    if connection_ok and health_ok:
        print("🎉 Conexión a Supabase establecida correctamente")
        if not tables_ok:
            print("💡 Nota: Las tablas aún no han sido creadas en la base de datos")
    else:
        print("⚠️ Problemas detectados con la conexión")
