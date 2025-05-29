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
from .meta import Base
import datetime
import enum

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

class User(Base):
    __tablename__ = 'users'
    id_user = Column(Integer, primary_key=True)
    username = Column(String(50), unique=True, nullable=False)
    password = Column(Text, nullable=False) # Hashed password
    role = Column(SQLEnum(UserRole), default=UserRole.VIEWER, nullable=False)

class Lokasi(Base):
    __tablename__ = 'lokasi'
    id_lokasi = Column(Integer, primary_key=True)
    nama_lokasi = Column(String(100), nullable=False)
    kode_lokasi = Column(String(50), unique=True, nullable=False)
    alamat_lokasi = Column(Text, nullable=False)

    # Relasi balik ke Barang (opsional, untuk akses barang dari lokasi)
    barang = relationship("Barang", back_populates="lokasi_obj")

class Barang(Base):
    __tablename__ = 'barang'
    id_barang = Column(Integer, primary_key=True)
    nama_barang = Column(String(200), nullable=False)
    kode_barang = Column(String(100), unique=True, nullable=False)
    kondisi = Column(SQLEnum(KondisiBarang), default=KondisiBarang.BAIK, nullable=False)
    id_lokasi = Column(Integer, ForeignKey('lokasi.id_lokasi'), nullable=False)
    penanggung_jawab = Column(String(50), nullable=False) # Bisa diubah menjadi FK ke tabel User jika penanggung_jawab adalah user sistem
    tanggal_masuk = Column(DateTime, default=datetime.datetime.now, nullable=False)
    tanggal_pembaruan = Column(DateTime, default=datetime.datetime.now, onupdate=datetime.datetime.now, nullable=True)
    gambar_aset = Column(Text, nullable=True) # Untuk URL atau path gambar

    # Relasi ke Lokasi
    lokasi_obj = relationship("Lokasi", back_populates="barang")

# Contoh indeks (opsional, untuk performa pencarian)
# Index('my_index', Barang.nama_barang, Barang.kode_barang)