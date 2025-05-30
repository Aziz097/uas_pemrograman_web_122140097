from typing import List, Optional
from ..models.mymodel import Barang, Lokasi, KondisiBarang
import datetime

class BarangService:
    """Service for asset operations."""

    @staticmethod
    def get_all_barang(
        dbsession,
        search_term: Optional[str] = None,
        location_id: Optional[int] = None,
        condition: Optional[str] = None,
        penanggung_jawab: Optional[str] = None,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None
    ) -> List[Barang]:
        """Get all assets with various filters."""
        query = dbsession.query(Barang).join(Lokasi) # Join dengan Lokasi untuk filter/display

        if search_term:
            query = query.filter(
                (Barang.nama_barang.ilike(f'%{search_term}%')) |
                (Barang.kode_barang.ilike(f'%{search_term}%'))
            )
        if location_id:
            query = query.filter(Barang.id_lokasi == location_id)
        if condition:
            try:
                condition_enum = KondisiBarang(condition)
                query = query.filter(Barang.kondisi == condition_enum)
            except ValueError:
                # Handle invalid condition string, e.g., raise an error or log
                pass
        if penanggung_jawab:
            query = query.filter(Barang.penanggung_jawab.ilike(f'%{penanggung_jawab}%'))

        if start_date:
            try:
                start_dt = datetime.datetime.strptime(start_date, '%Y-%m-%d')
                query = query.filter(Barang.tanggal_masuk >= start_dt)
            except ValueError:
                pass
        if end_date:
            try:
                end_dt = datetime.datetime.strptime(end_date, '%Y-%m-%d') + datetime.timedelta(days=1)
                query = query.filter(Barang.tanggal_masuk < end_dt)
            except ValueError:
                pass

        return query.all()

    @staticmethod
    def get_barang_by_id(dbsession, barang_id: int) -> Optional[Barang]:
        """Get asset by ID."""
        return dbsession.query(Barang).get(barang_id) # Menggunakan .get() untuk PK

    @staticmethod
    def get_barang_by_kode(dbsession, kode_barang: str) -> Optional[Barang]:
        """Get asset by code."""
        return dbsession.query(Barang).filter(Barang.kode_barang == kode_barang).first()

    @staticmethod
    def create_barang(dbsession, barang_data: dict) -> Barang:
        """Create a new asset."""
        # Konversi string kondisi ke Enum
        barang_data['kondisi'] = KondisiBarang(barang_data['kondisi'])
        new_barang = Barang(**barang_data)
        dbsession.add(new_barang)
        dbsession.flush()
        return new_barang

    @staticmethod
    def update_barang(dbsession, barang: Barang, update_data: dict) -> Barang:
        """Update existing asset."""
        if 'kondisi' in update_data:
            barang.kondisi = KondisiBarang(update_data['kondisi'])
            del update_data['kondisi'] # Hapus dari update_data agar tidak diulang setattr

        for field, value in update_data.items():
            setattr(barang, field, value)
        
        # Update tanggal_pembaruan secara otomatis di model
        dbsession.add(barang)
        dbsession.flush()
        return barang

    @staticmethod
    def delete_barang(dbsession, barang: Barang) -> None:
        """Delete an asset."""
        dbsession.delete(barang)
        dbsession.flush()