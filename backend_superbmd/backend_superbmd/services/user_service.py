from typing import List, Optional
from ..models.mymodel import User, UserRole # Import UserRole jika perlu
from ..security.auth import hash_password # Untuk hashing password

class UserService:
    """Service for user operations."""

    @staticmethod
    def get_all_users(dbsession, search_term: Optional[str] = None) -> List[User]:
        """Get all users, with optional search."""
        query = dbsession.query(User)
        if search_term:
            query = query.filter(User.username.ilike(f'%{search_term}%'))
        return query.all()

    @staticmethod
    def get_user_by_id(dbsession, user_id: int) -> Optional[User]:
        """Get user by ID."""
        return dbsession.query(User).get(user_id) # Menggunakan .get() untuk PK

    @staticmethod
    def get_user_by_username(dbsession, username: str) -> Optional[User]:
        """Get user by username."""
        return dbsession.query(User).filter(User.username == username).first()

    @staticmethod
    def create_user(dbsession, user_data: dict) -> User:
        """Create a new user."""
        hashed_password = hash_password(user_data['password'])
        new_user = User(
            username=user_data['username'],
            password=hashed_password,
            role=UserRole(user_data['role']) # Konversi string role ke Enum
        )
        dbsession.add(new_user)
        dbsession.flush() # Flush untuk mendapatkan ID jika diperlukan segera
        return new_user

    @staticmethod
    def update_user(dbsession, user: User, update_data: dict) -> User:
        """Update existing user."""
        if 'password' in update_data and update_data['password']:
            user.password = hash_password(update_data['password'])
            del update_data['password'] # Hapus dari update_data agar tidak diulang setattr
        
        if 'role' in update_data:
            user.role = UserRole(update_data['role'])
            del update_data['role'] # Hapus dari update_data

        for field, value in update_data.items():
            setattr(user, field, value) # Update field lainnya

        dbsession.add(user) # Pastikan objek tetap dikelola oleh sesi
        dbsession.flush()
        return user

    @staticmethod
    def delete_user(dbsession, user: User) -> None:
        """Delete a user."""
        dbsession.delete(user)
        dbsession.flush()