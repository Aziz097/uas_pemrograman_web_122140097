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
    id_user = fields.Integer(attribute='id', dump_only=True) # Map 'id' from BaseModel to 'id_user' in JSON [cite: 39]
    username = fields.String(required=True, validate=validate.Length(min=3, max=50))
    password = fields.String(load_only=True, required=False, validate=validate.Length(min=6)) # load_only agar tidak terlihat di respons API
    role = fields.String(required=True, validate=validate.OneOf(["admin", "penanggung_jawab", "viewer"]))
    created_at = fields.DateTime(dump_only=True) # Dari BaseModel [cite: 30]
    updated_at = fields.DateTime(dump_only=True) # Dari BaseModel [cite: 30]

class UserCreateSchema(UserSchema):
    """Schema for user creation (password is required here)."""
    password = fields.String(load_only=True, required=True, validate=validate.Length(min=6))

class UserUpdateSchema(Schema):
    """Schema for user updates (only updatable fields, password optional)."""
    username = fields.String(validate=validate.Length(min=3, max=50))
    password = fields.String(load_only=True, validate=validate.Length(min=6))
    role = fields.String(validate=validate.OneOf(["admin", "penanggung_jawab", "viewer"]))

class LoginSchema(Schema):
    username = fields.String(required=True)
    password = fields.String(required=True)

# --- Lokasi Schemas ---

class LokasiSchema(Schema):
    """Schema for location data validation and serialization."""
    id_lokasi = fields.Integer(attribute='id', dump_only=True) # Map 'id' from BaseModel to 'id_lokasi' in JSON [cite: 39]
    nama_lokasi = fields.String(required=True, validate=validate.Length(min=3, max=100))
    kode_lokasi = fields.String(required=True, validate=validate.Length(min=3, max=50))
    alamat_lokasi = fields.String(required=True, validate=validate.Length(min=5))
    created_at = fields.DateTime(dump_only=True) # Dari BaseModel [cite: 30]
    updated_at = fields.DateTime(dump_only=True) # Dari BaseModel [cite: 30]

class LokasiCreateSchema(LokasiSchema):
    """Schema for location creation."""
    pass # All fields are required by default in LokasiSchema for creation

class LokasiUpdateSchema(Schema):
    """Schema for location updates."""
    nama_lokasi = fields.String(validate=validate.Length(min=3, max=100))
    kode_lokasi = fields.String(validate=validate.Length(min=3, max=50))
    alamat_lokasi = fields.String(validate=validate.Length(min=5))

# --- Barang Schemas ---

class BarangSchema(Schema):
    """Schema for asset data validation and serialization."""
    id_barang = fields.Integer(attribute='id', dump_only=True) # Map 'id' from BaseModel to 'id_barang' in JSON [cite: 39]
    nama_barang = fields.String(required=True, validate=validate.Length(min=3, max=200))
    kode_barang = fields.String(required=True, validate=validate.Length(min=3, max=100))
    kondisi = fields.String(required=True, validate=validate.OneOf(["Baik", "Rusak Ringan", "Rusak Berat"]))
    id_lokasi = fields.Integer(required=True) # Ini adalah Foreign Key, bukan PK model
    penanggung_jawab = fields.String(required=True, validate=validate.Length(min=3, max=50))
    tanggal_masuk = fields.DateTime(format="%Y-%m-%d", required=True)
    tanggal_pembaruan = fields.DateTime(format="%Y-%m-%d", allow_none=True)
    gambar_aset = fields.String(allow_none=True)
    created_at = fields.DateTime(dump_only=True) # Dari BaseModel [cite: 30]
    updated_at = fields.DateTime(dump_only=True) # Dari BaseModel [cite: 30]

    # Nested schema untuk detail lokasi (lokasi_obj di model Barang)
    # Ini akan mengembalikan objek Lokasi (sesuai LokasiSchema) dalam respons Barang
    lokasi = fields.Nested(LokasiSchema, dump_only=True, exclude=['alamat_lokasi', 'created_at', 'updated_at'])

class BarangCreateSchema(BarangSchema):
    """Schema for asset creation."""
    # id_barang tidak diperlukan saat membuat (dump_only=True di BarangSchema)
    pass

class BarangUpdateSchema(Schema):
    """Schema for asset updates."""
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
    items = fields.List(fields.Nested(UserSchema, exclude=['password']))
    pagination = fields.Nested(PaginationSchema)

class LokasiListSchema(Schema):
    items = fields.List(fields.Nested(LokasiSchema))
    pagination = fields.Nested(PaginationSchema)

class BarangListSchema(Schema):
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