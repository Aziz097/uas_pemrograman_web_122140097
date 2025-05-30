from typing import List, Optional
from ..models.mymodel import Lokasi

class LokasiService:
    """Service for location operations."""

    @staticmethod
    def get_all_lokasi(dbsession, search_term: Optional[str] = None) -> List[Lokasi]:
        """Get all locations, with optional search."""
        query = dbsession.query(Lokasi)
        if search_term:
            query = query.filter(
                (Lokasi.nama_lokasi.ilike(f'%{search_term}%')) |
                (Lokasi.kode_lokasi.ilike(f'%{search_term}%'))
            )
        return query.all()

    @staticmethod
    def get_lokasi_by_id(dbsession, lokasi_id: int) -> Optional[Lokasi]:
        """Get location by ID."""
        return dbsession.query(Lokasi).get(lokasi_id) # Menggunakan .get() untuk PK

    @staticmethod
    def get_lokasi_by_kode(dbsession, kode_lokasi: str) -> Optional[Lokasi]:
        """Get location by code."""
        return dbsession.query(Lokasi).filter(Lokasi.kode_lokasi == kode_lokasi).first()

    @staticmethod
    def create_lokasi(dbsession, lokasi_data: dict) -> Lokasi:
        """Create a new location."""
        new_lokasi = Lokasi(**lokasi_data)
        dbsession.add(new_lokasi)
        dbsession.flush()
        return new_lokasi

    @staticmethod
    def update_lokasi(dbsession, lokasi: Lokasi, update_data: dict) -> Lokasi:
        """Update existing location."""
        for field, value in update_data.items():
            setattr(lokasi, field, value)
        dbsession.add(lokasi)
        dbsession.flush()
        return lokasi

    @staticmethod
    def delete_lokasi(dbsession, lokasi: Lokasi) -> None:
        """Delete a location."""
        dbsession.delete(lokasi)
        dbsession.flush()