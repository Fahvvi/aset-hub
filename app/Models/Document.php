<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Document extends Model
{
    protected $fillable = ['documentable_type', 'documentable_id', 
    'nama_file', 'tipe_dokumen', 'path', 'ukuran_kb', 'mime_type', 'uploaded_by'];
}
