from sqlalchemy import (
    Column,
    Index,
    Integer,
    Text,
    String,
    DateTime,
    ForeignKey,
    Boolean,
    Enum as SQLEnum
)
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.schema import MetaData
from .meta import Base # Tetap import Base untuk BaseModel mewarisinya
import datetime
import enum

from .base import BaseModel # <-- Import BaseModel dari base.py [cite: 30]

# --- Enums ---
class KondisiBarang(enum.Enum):
    BAIK = "Baik"
    RUSAK_RINGAN = "Rusak Ringan"
    RUSAK_BERAT = "Rusak Berat"

class UserRole(enum.Enum):
    ADMIN = "admin"
    PENANGGUNG_JAWAB = "penanggung_jawab"
    VIEWER = "viewer"

# --- Models ---

# User sekarang mewarisi dari BaseModel
class User(BaseModel): # <-- Ubah dari Base menjadi BaseModel [cite: 30]
    """Model for Users."""
    __tablename__ = 'users'
    # id_user tidak perlu didefinisikan ulang karena sudah ada di BaseModel sebagai 'id' [cite: 30]
    username = Column(String(50), unique=True, nullable=False)
    password = Column(Text, nullable=False) # Hashed password
    role = Column(SQLEnum(UserRole), default=UserRole.VIEWER, nullable=False)

    def __repr__(self):
        return f"<User(id={self.id}, username='{self.username}')>" # id dari BaseModel [cite: 30]

# Lokasi sekarang mewarisi dari BaseModel
class Lokasi(BaseModel): # <-- Ubah dari Base menjadi BaseModel [cite: 30]
    """Model for Locations."""
    __tablename__ = 'lokasi'
    # id_lokasi tidak perlu didefinisikan ulang karena sudah ada di BaseModel sebagai 'id' [cite: 30]
    nama_lokasi = Column(String(100), nullable=False)
    kode_lokasi = Column(String(50), unique=True, nullable=False)
    alamat_lokasi = Column(Text, nullable=False)

    # Relasi balik ke Barang (opsional, untuk akses barang dari lokasi)
    barang = relationship("Barang", back_populates="lokasi_obj")

    def __repr__(self):
        return f"<Lokasi(id={self.id}, nama='{self.nama_lokasi}')>" # id dari BaseModel [cite: 30]

# Barang sekarang mewarisi dari BaseModel
class Barang(BaseModel): # <-- Ubah dari Base menjadi BaseModel [cite: 30]
    """Model for Assets."""
    __tablename__ = 'barang'
    # id_barang tidak perlu didefinisikan ulang karena sudah ada di BaseModel sebagai 'id' [cite: 30]
    nama_barang = Column(String(200), nullable=False)
    kode_barang = Column(String(100), unique=True, nullable=False)
    kondisi = Column(SQLEnum(KondisiBarang), default=KondisiBarang.BAIK, nullable=False)
    id_lokasi = Column(Integer, ForeignKey('lokasi.id'), nullable=False) # <-- Ubah FK ke 'lokasi.id' [cite: 30]
    penanggung_jawab = Column(String(50), nullable=False)
    tanggal_masuk = Column(DateTime, default=datetime.datetime.now, nullable=False)
    tanggal_pembaruan = Column(DateTime, default=datetime.datetime.now, onupdate=datetime.datetime.now, nullable=True)
    gambar_aset = Column(Text, nullable=True)

    # Relasi ke Lokasi
    lokasi_obj = relationship("Lokasi", back_populates="barang")

    def __repr__(self):
        return f"<Barang(id={self.id}, nama='{self.nama_barang}', kode='{self.kode_barang}')>" # id dari BaseModel [cite: 30]

# Contoh indeks (opsional, untuk performa pencarian)
# Index('my_index', Barang.nama_barang, Barang.kode_barang)