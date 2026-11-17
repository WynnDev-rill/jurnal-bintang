# Aster Journal — hasil pengembangan native Android

Implementasi berada di branch `feat/native-android-redesign`. Aplikasi yang dikirim menggunakan Kotlin, Jetpack Compose dan Material 3; source React/Capacitor lama dipertahankan di `legacy/web`, tidak dimasukkan ke APK.

## APK
- Versi 3.0.0 / versionCode 30000, package `com.wynn.jurnalbintang`.
- Android 8+ (minSdk 26), compile/target Android 16 (API 36).
- APK universal termasuk ARM64 untuk POCO F6; status **debug**, bukan release dengan private signing key produksi.
- Unduhan: [APK debug langsung](https://github.com/WynnDev-rill/jurnal-bintang/releases/download/native-android-3.0.0-debug/Aster-Journal-3.0.0-debug.apk), diterbitkan sebagai prerelease berlabel debug. `artifacts/SHA256SUMS` mencatat hash APK yang dikirim; signature dan badging tersimpan di `android16/`.

## Pengalaman yang diimplementasikan
Catatan teks, checklist, autosave terurut dengan status berhasil/gagal yang jujur dan flush sebelum kembali; 30 prompt refleksi dalam enam tema, masing-masing dua pertanyaan pendalaman, mood opsional; pencarian, folder/tag, pin/favorit, arsip/sampah/pemulihan; foto opsional dengan batas ukuran dan koreksi orientasi; backup JSON, impor aman termasuk format web lama, ekspor Markdown dan native sharing. Setelan menyediakan tema sistem/light/dark, privasi screenshot/recents dan pengingat lokal opsional.

Data utama berada di Room, preferensi di DataStore. Tidak ada akun, analytics, server, WebView, atau permission Internet. Tidak ada klaim enkripsi database atau biometrik. Impor divalidasi sebelum transaksi, tidak menimpa data lama, dan menangani konflik serta impor ulang. Android automatic backup/device transfer dinonaktifkan; ekspor manual tetap plaintext.

## Riset, aset dan integrasi permanen
Ketiga referensi desain telah dilihat; empat pembanding resmi adalah Day One, Journey, Keep dan Standard Notes. Komponen AndroidX/Material/platform dipilih sebelum implementasi sendiri, dengan font OFL dan ikon Apache berlisensi. Teks lisensi lengkap juga dimuat dalam APK.

Ponytail `full`/`ultra`, UI/UX Pro Max, Impeccable dan Graphify dipasang satu salinan kanonis dengan versi/hash terkunci. Smoke check benar-benar mengeksekusi pencarian Compose, Impeccable dan Graphify. Graph Kotlin lokal dapat dicari dan divisualisasikan secara interaktif tanpa CDN/LLM; mekanisme refresh/watch dan instruksi AI ada di AGENTS.md serta docs/TOOLING.md.

## Verifikasi
CI akhir [44016168317](https://github.com/WynnDev-rill/jurnal-bintang/actions/runs/44016168317), source `02f71d2a783cd378a1edc809e2073e189ea78d23`: **16 unit test, delapan tes perangkat Android 16, lint dan build APK lulus**. Delapan tes perangkat selesai 49,622 detik, tanpa gagal/error/skipped. Review visual menemukan masalah inset IME pada pencarian, yang sudah diperbaiki; panduan dan FAB dapat dijangkau di atas keyboard.

Cakupan unit: filter/word count/prompt deterministik, backup native/legacy dan batas data, merge konflik/idempotensi, autosave saat write lambat/error/retry/flush. Cakupan perangkat: Room reopen/transaksi, organisasi catatan dan pemulihan, rotasi foto/metadata, tulis-kembali-buka ulang/recreation, refleksi, checklist, serta tangkapan layar native dengan IME/tema/font besar/rail.

Lint lokal: nol error, 16 warning (10 versi dependency, dua rekomendasi AndroidX ExifInterface, dua versi baru tersedia, satu AGP, satu monochrome-icon detector meskipun varian v33 sudah tersedia). Warning tidak disembunyikan. `apksigner` memverifikasi signature debug; manifest tidak meminta akses Internet/storage luas. Zip/native ARM64 mendukung alignment 16 KiB.

Tangkapan layar tidak diklaim berasal dari satu run: dua gambar dengan keyboard nyata berasal dari run pascaperbaikan `55940cc`; run tersebut gagal kemudian pada fixture rekreasi konfigurasi, bukan pada pemeriksaan IME. Source produksi dan konfigurasi build `55940cc` identik dengan APK final `02f71d2` (git tree `app/src/main`: `924d1f3ed4ab5e4c9a23d793ca8de361b4091d7f`). Tujuh gambar lain dan XML tes berasal dari run akhir yang lulus. Gambar keyboard dari run akhir yang tidak menampilkan IME ditolak. `android16/capture-provenance.json` mencatat run/source/hash setiap gambar; gambar tidak diedit atau disintesis. Assertion inset saja tidak dijadikan bukti keyboard telah dirender.

SHA-256 APK: `2f5c63fde4c47fe0ea335624c974c90d7d727e30ce116d84195a9c0d6e61d798`.

Review independen final: **`ship`**, tanpa material fix tersisa untuk sembilan tangkapan native yang diperiksa; lihat VISUAL_REVIEW.md. Keputusan ini tidak mengklaim acceptance POCO fisik atau audit TalkBack lengkap.

## Batas bukti dan penggunaan
Emulator tidak membuktikan performa POCO atau kelancaran 120 Hz. Diagnostik cold launch, memori dan frame disimpan apa adanya; sampel frame awal bukan benchmark scrolling atau klaim 60 fps. Audit TalkBack menyeluruh, gesture/performa perangkat fisik, integrasi picker/file provider serta pengingat di HyperOS tetap perlu acceptance pada perangkat pengguna; lihat DEVICE_CHECKLIST.md.

Sebelum mengganti instalasi lama, ekspor dan verifikasi backup JSON. Sertifikat debug dapat berbeda dari aplikasi lama sehingga update langsung ditolak; jangan uninstall sebelum backup aman. Native Android tidak dapat membaca localStorage website lama secara otomatis. Source/riwayat tidak di-force-push; signing material historis yang terekspos tidak digunakan kembali dan pemilik perlu merotasinya terpisah.
