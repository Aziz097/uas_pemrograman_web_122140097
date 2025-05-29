from pyramid.security import Allow, Everyone, Authenticated
from pyramid.request import Request
from ..models.mymodel import User, UserRole # Import model User dan Enum UserRole
from sqlalchemy.orm.exc import NoResultFound
import bcrypt

# Hash password
def hash_password(password):
    hashed_bytes = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
    return hashed_bytes.decode('utf-8')

# Verify password
def verify_password(password, hashed_password):
    return bcrypt.checkpw(password.encode('utf-8'), hashed_password.encode('utf-8'))

# Fungsi callback untuk JWT / AuthTktPolicy untuk mendapatkan role user
def get_user_roles(userid, request):
    """
    This callback is used by both AuthTktAuthenticationPolicy and pyramid_jwt.
    It returns the roles (principals) for a given userid.
    """
    try:
        user = request.dbsession.query(User).filter(User.username == userid).one_or_none()
        if user:
            # Roles harus dalam format 'role:<rolename>'
            return [f'role:{user.role.value}']
    except NoResultFound:
        pass
    return [] # Return empty list if user not found or no roles

class RootFactory(object):
    __acl__ = [
        (Allow, Everyone, 'view'),
        (Allow, Authenticated, 'authenticated'),
        (Allow, 'role:viewer', 'view_data'),
        (Allow, 'role:penanggung_jawab', ['view_data', 'manage_own_assets']),
        (Allow, 'role:admin', ['view_data', 'manage_all_data', 'admin_access']),
    ]
    def __init__(self, request):
        self.request = request