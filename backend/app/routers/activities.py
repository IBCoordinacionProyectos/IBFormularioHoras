from fastapi import APIRouter, HTTPException, Request
from urllib.parse import unquote, unquote_plus
from .. import crud
from ..schemas import ActivityItem
from ..database import supabase  # Importación añadida
import logging
import re

# Configuración del logger
logger = logging.getLogger(__name__)

router = APIRouter()

@router.get("/project/{project_code:path}/stages")
def get_stages_by_project(project_code: str):
    try:
        decoded_project_code = unquote(project_code)
        stages = crud.get_stages_by_project(decoded_project_code)
        return stages
    except Exception as e:
        raise HTTPException(500, f"Error retrieving stages: {str(e)}")
    
@router.get("/{params_str:path}/disciplines")
def get_disciplines(params_str: str):
    try:
        params = params_str.split('::')
        if len(params) != 2:
            raise HTTPException(status_code=400, detail="Invalid URL format. Expected project_code::stage.")

        decoded_project_code = unquote_plus(params[0]).strip()
        decoded_stage = unquote_plus(params[1]).strip()
        
        disciplines = crud.get_disciplines_by_stage(decoded_project_code, decoded_stage)
        return disciplines
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving disciplines: {str(e)}")

# Endpoint corregido para obtener actividades
@router.get("/{params_str:path}/activities")
async def get_activities(request: Request, params_str: str):
    """
    Obtiene actividades para un proyecto, etapa y disciplina específicos.
    
    Ejemplo de URL:
    /activities/0010/SIN/N%2FA%20-%20No%20Aplica/activities
    """
    try:
        # Dividir los parámetros usando '::' como delimitador
        params = params_str.split('::')
        if len(params) != 3:
            raise HTTPException(status_code=400, detail="Invalid URL format. Expected project_code::stage::discipline.")

        decoded_project_code = unquote_plus(params[0]).strip()
        decoded_stage = unquote_plus(params[1]).strip()
        decoded_discipline = unquote_plus(params[2]).strip()
        
        # Manejar el caso especial de N/A - No Aplica
        if decoded_discipline == 'N/A - No Aplica':
            # Intentar con diferentes variaciones
            discipline_variations = [
                'N/A - No Aplica',
                'N/A-No Aplica',
                'N/A - No Aplica ',
                ' N/A - No Aplica',
                'N/A - No Aplica',
                'N/A- No Aplica',
                'N/A -No Aplica'
            ]
        else:
            discipline_variations = [decoded_discipline]
        
        # Log para debugging
        logger.info(f"Searching activities for: project='{decoded_project_code}', stage='{decoded_stage}', discipline='{decoded_discipline}'")
        
        # Intentar con cada variación de disciplina
        response = None
        for variation in discipline_variations:
            logger.info(f"Trying with discipline: '{variation}'")
            
            # 1. Búsqueda exacta primero
            response = supabase.table("IB_Activities") \
                .select("activity") \
                .eq("project_code", decoded_project_code) \
                .eq("phase", decoded_stage) \
                .eq("discipline", variation) \
                .execute()
            
            if response.data:
                logger.info(f"Found exact match with variation: '{variation}'")
                break
                
            # 2. Búsqueda insensible a mayúsculas/minúsculas y espacios
            if not response.data:
                response = supabase.table("IB_Activities") \
                    .select("activity") \
                    .eq("project_code", decoded_project_code) \
                    .eq("phase", decoded_stage) \
                    .ilike("discipline", f"%{variation.strip()}%") \
                    .execute()
                
                if response.data:
                    logger.info(f"Found case-insensitive match with variation: '{variation}'")
                    break
        
        # Si aún no hay resultados, intentar una búsqueda más amplia
        if not response or not response.data:
            logger.info("Trying broader search with partial matches")
            response = supabase.table("IB_Activities") \
                .select("*") \
                .eq("project_code", decoded_project_code) \
                .eq("phase", decoded_stage) \
                .ilike("discipline", "%N/A%") \
                .execute()
            
            if response.data:
                logger.info(f"Found {len(response.data)} potential matches with 'N/A' in discipline")
        
        if not response.data:
            logger.warning(f"No activities found for discipline: '{decoded_discipline}'")
            return []
        
        # Extraer solo los nombres de las actividades
        activities = [item["activity"] for item in response.data]
        logger.info(f"Found {len(activities)} activities")
        return activities
    
    except Exception as e:
        logger.error(f"Error retrieving activities: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal Server Error")



    # Endpoint temporal para diagnóstico
# Endpoint corregido para diagnóstico
@router.get("/debug/{params_str:path}")
async def debug_activities(request: Request, params_str: str):
    try:
        # Dividir los parámetros usando '::' como delimitador
        params = params_str.split('::')
        if len(params) != 3:
            raise HTTPException(status_code=400, detail="Invalid URL format for debug. Expected project_code::stage::discipline.")

        project_code = params[0]
        stage = params[1]
        discipline = params[2]

        decoded_project_code = unquote_plus(project_code).strip()
        decoded_stage = unquote_plus(stage).strip()
        decoded_discipline = unquote_plus(discipline).strip()
        
        debug_info = {
            "original_values": {
                "project_code": project_code,
                "stage": stage,
                "discipline": discipline
            },
            "decoded_values": {
                "project_code": f"'{decoded_project_code}'",
                "stage": f"'{decoded_stage}'",
                "discipline": f"'{decoded_discipline}'"
            },
            "value_lengths": {
                "project_code": len(decoded_project_code),
                "stage": len(decoded_stage),
                "discipline": len(decoded_discipline)
            }
        }
        
        # Consulta exacta
        response = supabase.table("IB_Activities") \
            .select("*") \
            .eq("project_code", decoded_project_code) \
            .eq("phase", decoded_stage) \
            .eq("discipline", decoded_discipline) \
            .execute()
        
        debug_info["exact_match_count"] = len(response.data) if response.data else 0
        
        # Si no hay coincidencias exactas, buscar similares
        if not response.data:
            # Buscar todas las disciplinas para este proyecto y etapa
            all_disciplines_response = supabase.table("IB_Activities") \
                .select("discipline") \
                .eq("project_code", decoded_project_code) \
                .eq("phase", decoded_stage) \
                .execute()
            
            unique_disciplines = list(set([item["discipline"] for item in all_disciplines_response.data])) if all_disciplines_response.data else []
            debug_info["available_disciplines"] = unique_disciplines
            
            # Buscar disciplinas que contengan "N/A" si es el caso
            if "N/A" in decoded_discipline.upper():
                na_disciplines = [d for d in unique_disciplines if "N/A" in d.upper()]
                debug_info["na_related_disciplines"] = na_disciplines
                
                # Mostrar diferencias de caracteres
                for na_disc in na_disciplines:
                    debug_info[f"comparison_with_{na_disc.replace(' ', '_').replace('/', '_')}"] = {
                        "database_value": f"'{na_disc}'",
                        "search_value": f"'{decoded_discipline}'",
                        "database_length": len(na_disc),
                        "search_length": len(decoded_discipline),
                        "are_equal": na_disc == decoded_discipline,
                        "database_bytes": [ord(c) for c in na_disc],
                        "search_bytes": [ord(c) for c in decoded_discipline]
                    }
            
            # Buscar coincidencias aproximadas
            similar_response = supabase.table("IB_Activities") \
                .select("*") \
                .ilike("project_code", decoded_project_code) \
                .ilike("phase", decoded_stage) \
                .ilike("discipline", decoded_discipline) \
                .execute()
            
            debug_info["similar_match_count"] = len(similar_response.data) if similar_response.data else 0
            
            if similar_response.data:
                debug_info["first_similar_item"] = similar_response.data[0]
        else:
            debug_info["first_exact_item"] = response.data[0]
        
        return debug_info
        
    except Exception as e:
        return {"error": str(e)}
    
    
