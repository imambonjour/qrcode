import csv
import os
import qrcode
import re

def sanitize_filename(name):
    # Keep only alphanumeric characters, spaces, hyphens, and underscores
    # to avoid invalid characters in file names.
    return re.sub(r'[^\w\s\.-]', '', name).strip()

def main():
    # Paths are relative to the directory where this script is run
    csv_path = 'siswa_rows_glowing.csv'
    output_dir = 'QR'
    
    # Check if CSV file exists
    if not os.path.exists(csv_path):
        print(f"Error: File CSV '{csv_path}' tidak ditemukan!")
        return

    # Create output directory if it doesn't exist
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
        print(f"Membuat direktori baru: {output_dir}")

    # Read CSV and get all rows
    try:
        with open(csv_path, mode='r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            rows = list(reader)
    except Exception as e:
        print(f"Error saat membaca CSV: {e}")
        return

    total_siswa = len(rows)
    print(f"Menemukan {total_siswa} data siswa. Memulai pembuatan QR Code...")

    success_count = 0
    for idx, row in enumerate(rows, 1):
        student_id = row.get('id')
        nama = row.get('nama')
        qr_token = row.get('qr_token')

        if not student_id or not qr_token:
            print(f"[{idx}/{total_siswa}] ⚠️ Baris tidak lengkap: id={student_id}, nama={nama}, qr_token={qr_token}")
            continue

        # Sanitize nama for filename
        nama_safe = sanitize_filename(nama)
        # Naming format: ID_Nama.png (spaces replaced with underscore)
        filename = f"{student_id}_{nama_safe.replace(' ', '_')}.png"
        filepath = os.path.join(output_dir, filename)

        try:
            # Setup QR Code
            qr = qrcode.QRCode(
                version=1,
                error_correction=qrcode.constants.ERROR_CORRECT_H,
                box_size=10,
                border=4,
            )
            qr.add_data(qr_token)
            qr.make(fit=True)

            # Generate and save image
            img = qr.make_image(fill_color="black", back_color="white")
            img.save(filepath)
            
            print(f"[{idx}/{total_siswa}] ✅ Berhasil: {filename}")
            success_count += 1
        except Exception as e:
            print(f"[{idx}/{total_siswa}] ❌ Gagal untuk {nama}: {e}")

    print(f"\nSelesai! Berhasil membuat {success_count} dari {total_siswa} QR Code.")
    print(f"Semua QR Code disimpan di direktori: {os.path.abspath(output_dir)}")

if __name__ == '__main__':
    main()
