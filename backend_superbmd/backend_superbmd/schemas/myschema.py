# superbmd_backend/schemas/myschema.py

from marshmallow import Schema, fields, validate

# --- Shared Schemas ---

class PaginationSchema(Schema):
    total_items = fields.Integer(required=True)
    total_pages = fields.Integer(required=True)
    current_page = fields.Integer(required=True)
    items_per_page = fields.Integer(required=True)

# --- User Schemas ---

class UserSchema(Schema):
    """Schema for user data validation and serialization."""
    # Ubah id_user menjadi id
    id = fields.Integer(dump_only=True) 
    username = fields.String(required=True, validate=validate.Length(min=3, max=50))
    password = fields.String(load_only=True, required=False, validate=validate.Length(min=6))
    role = fields.String(required=True, validate=validate.OneOf(["admin", "penanggung_jawab", "viewer"]))
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)

class UserCreateSchema(UserSchema):
    password = fields.String(load_only=True, required=True, validate=validate.Length(min=6))

class UserUpdateSchema(Schema):
    username = fields.String(validate=validate.Length(min=3, max=50))
    password = fields.String(load_only=True, validate=validate.Length(min=6))
    role = fields.String(validate=validate.OneOf(["admin", "penanggung_jawab", "viewer"]))

class LoginSchema(Schema):
    username = fields.String(required=True)
    password = fields.String(required=True)

# --- Lokasi Schemas ---

class LokasiSchema(Schema):
    """Schema for location data validation and serialization."""
    # Ubah id_lokasi menjadi id
    id = fields.Integer(dump_only=True) 
    nama_lokasi = fields.String(required=True, validate=validate.Length(min=3, max=100))
    kode_lokasi = fields.String(required=True, validate=validate.Length(min=3, max=50))
    alamat_lokasi = fields.String(required=True, validate=validate.Length(min=5))
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)

class LokasiCreateSchema(LokasiSchema):
    pass

class LokasiUpdateSchema(Schema):
    nama_lokasi = fields.String(validate=validate.Length(min=3, max=100))
    kode_lokasi = fields.String(validate=validate.Length(min=3, max=50))
    alamat_lokasi = fields.String(validate=validate.Length(min=5))

# --- Barang Schemas ---

class BarangSchema(Schema):
    """Schema for asset data validation and serialization."""
    # Ubah id_barang menjadi id
    id = fields.Integer(dump_only=True) 
    nama_barang = fields.String(required=True, validate=validate.Length(min=3, max=200))
    kode_barang = fields.String(required=True, validate=validate.Length(min=3, max=100))
    kondisi = fields.String(required=True, validate=validate.OneOf(["Baik", "Rusak Ringan", "Rusak Berat"]))
    # id_lokasi tetap karena ini adalah Foreign Key (bukan primary key objek itu sendiri)
    id_lokasi = fields.Integer(required=True) 
    penanggung_jawab = fields.String(required=True, validate=validate.Length(min=3, max=50))
    tanggal_masuk = fields.DateTime(format="%Y-%m-%d", required=True)
    tanggal_pembaruan = fields.DateTime(format="%Y-%m-%d", allow_none=True)
    gambar_aset = fields.String(allow_none=True)
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)

    # Nested schema untuk detail lokasi. Pastikan LokasiSchema yang digunakan sudah dimodifikasi (menggunakan 'id')
    lokasi = fields.Nested(LokasiSchema(only=('id', 'nama_lokasi', 'kode_lokasi', 'alamat_lokasi')), dump_only=True)

class BarangCreateSchema(BarangSchema):
    pass

class BarangUpdateSchema(Schema):
    nama_barang = fields.String(validate=validate.Length(min=3, max=200))
    kode_barang = fields.String(validate=validate.Length(min=3, max=100))
    kondisi = fields.String(validate=validate.OneOf(["Baik", "Rusak Ringan", "Rusak Berat"]))
    id_lokasi = fields.Integer()
    penanggung_jawab = fields.String(validate=validate.Length(min=3, max=50))
    tanggal_masuk = fields.DateTime(format="%Y-%m-%d")
    tanggal_pembaruan = fields.DateTime(format="%Y-%m-%d", allow_none=True)
    gambar_aset = fields.String(allow_none=True)

# --- Response List Schemas (tetap sama, hanya memastikan nested schema terbaru) ---

class UserListSchema(Schema):
    # Pastikan UserSchema yang di-nested sudah dimodifikasi (menggunakan 'id')
    items = fields.List(fields.Nested(UserSchema, exclude=['password'])) 
    pagination = fields.Nested(PaginationSchema)

class LokasiListSchema(Schema):
    # Pastikan LokasiSchema yang di-nested sudah dimodifikasi (menggunakan 'id')
    items = fields.List(fields.Nested(LokasiSchema)) 
    pagination = fields.Nested(PaginationSchema)

class BarangListSchema(Schema):
    # Pastikan BarangSchema yang di-nested sudah dimodifikasi (menggunakan 'id')
    items = fields.List(fields.Nested(BarangSchema)) 
    pagination = fields.Nested(PaginationSchema)

# --- Laporan Schemas (tetap sama) ---

class ReportAssetByLocationSchema(Schema):
    location_name = fields.String()
    total_assets = fields.Integer()
    baik = fields.Integer()
    rusak_ringan = fields.Integer()
    rusak_berat = fields.Integer()

class ReportAssetByConditionSchema(Schema):
    condition = fields.String()
    total_assets = fields.Integer()

class ReportAssetInOutSchema(Schema):
    nama_barang = fields.String()
    kode_barang = fields.String()
    tipe_transaksi = fields.String()
    tanggal = fields.DateTime(format="%Y-%m-%d")
    lokasi = fields.String()
    kondisi_lama = fields.String(allow_none=True)
    kondisi_baru = fields.String(allow_none=True)