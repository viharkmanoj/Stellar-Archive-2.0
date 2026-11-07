
from fastapi import FastAPI, HTTPException, Query
from sqlalchemy.exc import SQLAlchemyError

from database import (
    test_connection,
    get_tables,
    get_table_data,
    get_paginated_data,
    get_table_columns,
    search_astronomy
)

app = FastAPI(
    title="StellarMind AI",
    description="Astronomical Database and Research API",
    version="1.0.0"
)


# 1. Home endpoint
@app.get("/")
def home():
    return {
        "project": "StellarMind AI",
        "status": "running",
        "version": "1.0.0"
    }


# 2. PostgreSQL connection check
@app.get("/database")
def database_status():
    try:
        database_name = test_connection()

        return {
            "database": database_name,
            "status": "connected"
        }

    except SQLAlchemyError:
        raise HTTPException(
            status_code=503,
            detail="Database connection failed"
        )


# 3. List all database tables
@app.get("/tables")
def list_tables():
    try:
        return {
            "tables": get_tables()
        }

    except SQLAlchemyError:
        raise HTTPException(
            status_code=503,
            detail="Unable to retrieve tables"
        )


# 4. Retrieve a limited number of records
@app.get("/api/data/{table_name}")
def fetch_table_data(
    table_name: str,
    limit: int = Query(default=20, ge=1, le=100)
):
    try:
        records = get_table_data(table_name, limit)

        if records is None:
            raise HTTPException(
                status_code=404,
                detail="Table not found"
            )

        return {
            "table": table_name,
            "count": len(records),
            "data": records
        }

    except SQLAlchemyError:
        raise HTTPException(
            status_code=503,
            detail="Database query failed"
        )


# 5. Paginated astronomy catalog
@app.get("/api/catalog/{table_name}")
def fetch_catalog(
    table_name: str,
    page: int = Query(default=1, ge=1),
    size: int = Query(default=20, ge=1, le=100)
):
    try:
        result = get_paginated_data(
            table_name=table_name,
            page=page,
            size=size
        )

        if result is None:
            raise HTTPException(
                status_code=404,
                detail="Table not found"
            )

        return result

    except SQLAlchemyError:
        raise HTTPException(
            status_code=503,
            detail="Database query failed"
        )


# 6. Get column metadata for a table
@app.get("/api/columns/{table_name}")
def fetch_columns(table_name: str):
    try:
        columns = get_table_columns(table_name)

        if columns is None:
            raise HTTPException(
                status_code=404,
                detail="Table not found"
            )

        return {
            "table": table_name,
            "columns": columns
        }

    except SQLAlchemyError:
        raise HTTPException(
            status_code=503,
            detail="Unable to retrieve columns"
        )


@app.get("/api/search")
def search_objects(
    q: str = Query(min_length=2, max_length=100),
    limit: int = Query(default=20, ge=1, le=50)
):
    try:
        return search_astronomy(
            query=q,
            limit=limit
        )

    except SQLAlchemyError:
        raise HTTPException(
            status_code=503,
            detail="Astronomical search failed"
        )
