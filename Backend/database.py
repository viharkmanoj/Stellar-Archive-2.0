
import os
from datetime import date, datetime, time
from decimal import Decimal
from uuid import UUID
from sqlalchemy import String, cast, or_

from dotenv import load_dotenv
from sqlalchemy import (
    create_engine,
    inspect,
    MetaData,
    Table,
    select,
    func,
    text
)

load_dotenv()

DATABASE_URL = os.environ["DATABASE_URL"]
SCHEMA = "stellar_archive"

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True
)


# 1. Test PostgreSQL connection
def test_connection():
    with engine.connect() as connection:
        return connection.execute(
            text("SELECT current_database()")
        ).scalar_one()


# 2. Retrieve all user-defined tables
def get_tables():
    inspector = inspect(engine)
    tables = []

    for schema in inspector.get_schema_names():

        if (
            schema in ("information_schema", "pg_catalog")
            or schema.startswith("pg_toast")
            or schema.startswith("pg_temp")
        ):
            continue

        for table_name in inspector.get_table_names(schema=schema):
            tables.append({
                "schema": schema,
                "table": table_name
            })

    return tables


# 3. Load a validated astronomy table
def load_table(table_name: str):
    inspector = inspect(engine)

    available_tables = inspector.get_table_names(
        schema=SCHEMA
    )

    if table_name not in available_tables:
        return None

    return Table(
        table_name,
        MetaData(),
        schema=SCHEMA,
        autoload_with=engine
    )


# 4. Convert database values to JSON-compatible values
def serialize_record(row):
    record = {}

    for key, value in row._mapping.items():

        if isinstance(value, Decimal):
            record[key] = str(value)

        elif isinstance(value, (datetime, date, time)):
            record[key] = value.isoformat()

        elif isinstance(value, UUID):
            record[key] = str(value)

        elif isinstance(value, bytes):
            record[key] = value.hex()

        else:
            record[key] = value

    return record


# 5. Retrieve records (existing API)
def get_table_data(table_name: str, limit: int = 20):
    table = load_table(table_name)

    if table is None:
        return None

    with engine.connect() as connection:
        result = connection.execute(
            select(table).limit(limit)
        )

        return [
            serialize_record(row)
            for row in result
        ]


# 6. Retrieve records with pagination
def get_paginated_data(
    table_name: str,
    page: int = 1,
    size: int = 20
):
    table = load_table(table_name)

    if table is None:
        return None

    offset = (page - 1) * size

    with engine.connect() as connection:

        # Count total rows
        total = connection.execute(
            select(func.count()).select_from(table)
        ).scalar_one()

        # Prefer primary-key columns for consistent ordering
        order_columns = list(table.primary_key.columns)

        # Fallback if the imported table has no primary key
        if not order_columns:
            order_columns = list(table.columns)

        query = select(table)

        if order_columns:
            query = query.order_by(*order_columns)

        query = query.limit(size).offset(offset)

        result = connection.execute(query)

        records = [
            serialize_record(row)
            for row in result
        ]

    return {
        "table": table_name,
        "schema": SCHEMA,
        "page": page,
        "size": size,
        "total": total,
        "total_pages": (total + size - 1) // size,
        "data": records
    }


# 7. Retrieve table column information
def get_table_columns(table_name: str):
    table = load_table(table_name)

    if table is None:
        return None

    return [
        {
            "name": column.name,
            "type": str(column.type),
            "nullable": column.nullable,
            "primary_key": column.primary_key
        }
        for column in table.columns
    ]

#Search
def search_astronomy(
    query: str,
    limit: int = 20
):
    inspector = inspect(engine)

    table_names = inspector.get_table_names(
        schema=SCHEMA
    )

    results = []

    with engine.connect() as connection:

        for table_name in table_names:

            table = load_table(table_name)

            # Search text-based columns
            text_columns = [
                column
                for column in table.columns
                if isinstance(column.type, String)
            ]

            if not text_columns:
                continue

            # Escape SQL LIKE wildcards
            safe_query = (
                query.replace("\\", "\\\\")
                     .replace("%", "\\%")
                     .replace("_", "\\_")
            )

            conditions = [
                column.ilike(
                    f"%{safe_query}%",
                    escape="\\"
                )
                for column in text_columns
            ]

            statement = (
                select(table)
                .where(or_(*conditions))
                .limit(limit - len(results))
            )

            rows = connection.execute(statement)

            for row in rows:
                results.append({
                    "table": table_name,
                    "record": serialize_record(row)
                })

            if len(results) >= limit:
                break

    return {
        "query": query,
        "count": len(results),
        "results": results
    }