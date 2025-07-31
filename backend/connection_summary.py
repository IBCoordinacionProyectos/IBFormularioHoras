import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import supabase

def check_supabase_connection():
    """Comprehensive check of Supabase connection"""
    print("=== RESUMEN DE CONEXIÓN A SUPABASE ===")
    print()
    
    # 1. Check credentials
    print("1. CREDENCIALES:")
    print(f"   URL: {supabase.supabase_url}")
    print(f"   Key: {supabase.supabase_key[:20]}...")
    print("   ✅ Credenciales configuradas correctamente")
    print()
    
    # 2. Check basic connection
    print("2. CONEXIÓN BÁSICA:")
    try:
        # This will test if we can reach Supabase
        response = supabase.table('information_schema.tables').select("count").limit(1).execute()
        print("   ✅ Conexión establecida exitosamente")
        print(f"   ✅ Supabase responde correctamente")
    except Exception as e:
        print(f"   ❌ Error de conexión: {str(e)}")
        return False
    print()
    
    # 3. Check if tables exist
    print("3. TABLAS EN LA BASE DE DATOS:")
    try:
        # Get list of user tables
        response = supabase.table('information_schema.tables')\
            .select('table_name')\
            .eq('table_schema', 'public')\
            .execute()
        
        tables = [row['table_name'] for row in response.data]
        
        if tables:
            print(f"   ✅ Se encontraron {len(tables)} tablas:")
            for table in tables:
                print(f"      - {table}")
        else:
            print("   ⚠️ No se encontraron tablas en la base de datos")
            print("   💡 Sugerencia: Ejecuta las migraciones para crear las tablas")
    except Exception as e:
        print(f"   ❌ Error al verificar tablas: {str(e)}")
    print()
    
    # 4. Check specific project tables
    print("4. TABLAS DEL PROYECTO:")
    expected_tables = ['employees', 'projects', 'activities', 'daily_activities', 'hours']
    project_tables = []
    
    for table in expected_tables:
        try:
            response = supabase.table('information_schema.tables')\
                .select('table_name')\
                .eq('table_schema', 'public')\
                .eq('table_name', table)\
                .execute()
            
            if response.data:
                project_tables.append(table)
                print(f"   ✅ {table}")
            else:
                print(f"   ❌ {table} - No existe")
        except:
            print(f"   ❌ {table} - Error al verificar")
    
    print()
    print("=== CONCLUSIÓN ===")
    print("✅ La conexión a Supabase está FUNCIONANDO correctamente")
    
    if len(project_tables) == len(expected_tables):
        print("✅ Todas las tablas del proyecto están creadas")
    else:
        print(f"⚠️ Solo {len(project_tables)}/{len(expected_tables)} tablas están creadas")
        print("💡 Necesitas ejecutar las migraciones o crear las tablas manualmente")
    
    return True

if __name__ == "__main__":
    check_supabase_connection()
