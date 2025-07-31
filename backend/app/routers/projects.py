# projects.py
from fastapi import APIRouter, HTTPException
from urllib.parse import unquote
from .. import crud
from ..schemas import ProjectBase

router = APIRouter()

@router.get("/", response_model=list[ProjectBase])
def read_projects():
    projects = crud.get_projects()
    if not projects:
        raise HTTPException(404, "No se encontraron proyectos")
    return projects

@router.get("/{project_code:path}", response_model=ProjectBase)
def get_project(project_code: str):
    decoded_project_code = unquote(project_code)
    project = crud.get_project_by_code(decoded_project_code)
    if not project:
        raise HTTPException(404, f"Proyecto {decoded_project_code} no encontrado")
    return project

# Elimina el endpoint /stages ya que no existe en tu backend