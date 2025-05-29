from marshmallow import Schema, fields, validate

# Shared fields for pagination metadata
class PaginationSchema(Schema):
    total_items = fields.Integer(required=True)
    total_pages = fields.Integer(required=True)
    current_page = fields.Integer(required=True)
    items_per_page = fields.Integer(required=True)

# User Schema
class UserSchema(Schema):
    id_user = fields.Integer(dump_only=True)
    username = fields.String(required=True, validate=validate.Length(min=3, max=50))
    password = fields.String(load_only=True, required=False, validate=validate.Length(min=6)) # load_only agar tidak terlihat di respons API
    role = fields.String(required=True, validate=validate.OneOf(["admin", "penanggung_jawab", "viewer"]))

class LoginSchema(Schema):
    username = fields.String(required=True)
    password = fields.String(required=True)

# Lokasi Schema
class LokasiSchema(Schema):
    id_lokasi = fields.Integer(dump_only=True)
    nama_lokasi = fields.String(required=True, validate=validate.Length(min=3, max=100))
    kode_lokasi = fields.String(required=True, validate=validate.Length(min=3, max=50))
    alamat_lokasi = fields.String(required=True, validate=validate.Length(min=5))

# Barang Schema
class BarangSchema(Schema):
    id_barang = fields.Integer(dump_only=True)
    nama_barang = fields.String(required=True, validate=validate.Length(min=3, max=200))
    kode_barang = fields.String(required=True, validate=validate.Length(min=3, max=100))
    kondisi = fields.String(required=True, validate=validate.OneOf(["Baik", "Rusak Ringan", "Rusak Berat"]))
    id_lokasi = fields.Integer(required=True)
    penanggung_jawab = fields.String(required=True, validate=validate.Length(min=3, max=50))
    tanggal_masuk = fields.DateTime(format="%Y-%m-%d", required=True) # Format untuk frontend
    tanggal_pembaruan = fields.DateTime(format="%Y-%m-%d", allow_none=True)
    gambar_aset = fields.String(allow_none=True) # Untuk URL atau path gambar

    # Nested schema untuk detail lokasi
    lokasi = fields.Nested(LokasiSchema, dump_only=True, exclude=['alamat_lokasi']) # Exclude alamat_lokasi jika tidak perlu di detail barang

# --- Response Schemas ---

class UserListSchema(Schema):
    items = fields.List(fields.Nested(UserSchema, exclude=['password'])) # Jangan tampilkan password di list
    pagination = fields.Nested(PaginationSchema)

class LokasiListSchema(Schema):
    items = fields.List(fields.Nested(LokasiSchema))
    pagination = fields.Nested(PaginationSchema)

class BarangListSchema(Schema):
    items = fields.List(fields.Nested(BarangSchema))
    pagination = fields.Nested(PaginationSchema)

# Laporan Schemas (contoh, akan diisi di View Laporan)
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
    tipe_transaksi = fields.String() # "MASUK", "PEMBARUAN"
    tanggal = fields.DateTime(format="%Y-%m-%d")
    lokasi = fields.String()
    kondisi_lama = fields.String(allow_none=True)
    kondisi_baru = fields.String(allow_none=True)