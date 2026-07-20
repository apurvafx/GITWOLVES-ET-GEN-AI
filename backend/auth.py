import hashlib
import os
import secrets
import sqlite3
from datetime import datetime, timedelta
from database import get_db_connection

SESSION_DURATION_HOURS = 24

def hash_password(password: str, salt: str = None) -> tuple[str, str]:
    if salt is None:
        salt = os.urandom(16).hex()
    pwd_bytes = password.encode('utf-8')
    salt_bytes = bytes.fromhex(salt)
    pwd_hash = hashlib.pbkdf2_hmac('sha256', pwd_bytes, salt_bytes, 100000).hex()
    return pwd_hash, salt

def create_company_and_admin(company_name: str, admin_username: str, admin_password: str) -> tuple[str, str]:
    conn = get_db_connection()
    cursor = conn.cursor()
    company_id = secrets.token_hex(8)
    admin_id = secrets.token_hex(8)
    created_at = datetime.utcnow().isoformat()
    pwd_hash, salt = hash_password(admin_password)
    try:
        cursor.execute(
            "INSERT INTO companies (id, name, created_at) VALUES (?, ?, ?)",
            (company_id, company_name, created_at)
        )
        cursor.execute(
            "INSERT INTO users (id, username, password_hash, password_plain, salt, role, company_id) VALUES (?, ?, ?, ?, ?, ?, ?)",
            (admin_id, admin_username, pwd_hash, admin_password, salt, 'admin', company_id)
        )
        conn.commit()
        return company_id, admin_id
    except sqlite3.IntegrityError as e:
        conn.rollback()
        raise ValueError("Username already exists.") from e
    finally:
        conn.close()

def create_employee(employee_username: str, employee_password: str, company_id: str) -> str:
    conn = get_db_connection()
    cursor = conn.cursor()
    employee_id = secrets.token_hex(8)
    pwd_hash, salt = hash_password(employee_password)
    try:
        cursor.execute(
            "INSERT INTO users (id, username, password_hash, password_plain, salt, role, company_id) VALUES (?, ?, ?, ?, ?, ?, ?)",
            (employee_id, employee_username, pwd_hash, employee_password, salt, 'employee', company_id)
        )
        conn.commit()
        return employee_id
    except Exception as e:
        conn.rollback()
        raise ValueError("Failed to create employee. Username may already exist.") from e
    finally:
        conn.close()

def list_company_employees(company_id: str) -> list[dict]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT id, username, password_plain, role, company_id FROM users WHERE company_id = ? AND role = 'employee'",
        (company_id,)
    )
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

def delete_company_employee(employee_id: str, company_id: str) -> bool:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "DELETE FROM users WHERE id = ? AND company_id = ? AND role = 'employee'",
        (employee_id, company_id)
    )
    affected = cursor.rowcount
    conn.commit()
    conn.close()
    return affected > 0

def authenticate_user(username: str, password: str) -> dict | None:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT id, username, password_hash, salt, role, company_id FROM users WHERE username = ?",
        (username,)
    )
    user = cursor.fetchone()
    conn.close()
    if user:
        stored_hash = user['password_hash']
        salt = user['salt']
        calculated_hash, _ = hash_password(password, salt)
        if secrets.compare_digest(stored_hash, calculated_hash):
            return {
                "id": user['id'],
                "username": user['username'],
                "role": user['role'],
                "company_id": user['company_id']
            }
    return None

def create_session(user_id: str) -> str:
    conn = get_db_connection()
    cursor = conn.cursor()
    token = secrets.token_hex(32)
    expires_at = (datetime.utcnow() + timedelta(hours=SESSION_DURATION_HOURS)).isoformat()
    cursor.execute(
        "INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)",
        (token, user_id, expires_at)
    )
    conn.commit()
    conn.close()
    return token

def verify_session(token: str) -> dict | None:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        """
        SELECT u.id, u.username, u.role, u.company_id, s.expires_at 
        FROM sessions s
        JOIN users u ON s.user_id = u.id
        WHERE s.token = ?
        """,
        (token,)
    )
    session = cursor.fetchone()
    if not session:
        conn.close()
        return None
    expires_at = datetime.fromisoformat(session['expires_at'])
    if datetime.utcnow() > expires_at:
        cursor.execute("DELETE FROM sessions WHERE token = ?", (token,))
        conn.commit()
        conn.close()
        return None
    conn.close()
    return {
        "id": session['id'],
        "username": session['username'],
        "role": session['role'],
        "company_id": session['company_id']
    }

def delete_session(token: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM sessions WHERE token = ?", (token,))
    conn.commit()
    conn.close()
