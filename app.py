import pandas as pd

# 📂 Baca file CSV yang penuh dengan beban masa lalu
df = pd.read_csv('siswa_rows.csv')

# 🗡️ Tebas semua kolom tak berguna, sisakan trio maut!
kolom_pilihan = ['id', 'nama', 'qr_token']
df_glowing = df[kolom_pilihan]

# 💾 Simpan kembali ke dalam lembaran suci yang baru
df_glowing.to_csv('siswa_rows_glowing.csv', index=False)

print("✨ BERHASIL BOS! CSV SUDAH BERSIH DARI SEGA-LA MAKINAN DOSA DUNIAWI! 🥳🎉💃")
