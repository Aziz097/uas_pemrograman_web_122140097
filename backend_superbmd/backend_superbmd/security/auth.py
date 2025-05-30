import bcrypt # <-- Ini adalah import bcrypt
from pyramid.security import Allow, Everyone, Authenticated
from pyramid.request import Request
from ..models.mymodel import User, UserRole

# Hash password
def hash_password(password):
    hashed_bytes = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
    return hashed_bytes.decode('utf-8')

# Verify password
def verify_password(password, hashed_password):
    return bcrypt.checkpw(password.encode('utf-8'), hashed_password.encode('utf-8'))