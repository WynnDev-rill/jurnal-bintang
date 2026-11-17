package com.wynn.jurnalbintang.data

import java.time.LocalDate

object Prompts {
    val all = listOf(
        Prompt("g1","Syukur","Hal kecil apa yang ingin kamu ingat dari hari ini?",listOf("Ceritakan momen itu: di mana, dengan siapa, dan apa yang kamu rasakan?","Mengapa hal sederhana itu berarti untukmu?")),
        Prompt("s1","Mengenal diri","Kapan hari ini kamu merasa paling menjadi dirimu sendiri?",listOf("Apa yang sedang kamu lakukan saat itu?","Nilai atau kebutuhan apa yang terlihat dari momen itu?")),
        Prompt("r1","Melepas","Apa yang terasa berat, tetapi tidak harus kamu selesaikan malam ini?",listOf("Pisahkan hal yang bisa kamu kendalikan dari yang tidak.","Apa bentuk istirahat yang bisa kamu izinkan untuk dirimu?")),
        Prompt("t1","Bertumbuh","Apa satu langkah kecil menuju hal yang penting untukmu?",listOf("Mengapa hal itu penting, di luar harapan orang lain?","Apa langkah yang cukup ringan untuk kamu lakukan besok?")),
        Prompt("h1","Hubungan","Percakapan apa yang masih tinggal dalam pikiranmu?",listOf("Bagian mana yang menyentuhmu, dan mengapa?","Apa yang ingin kamu sampaikan jika ada kesempatan lagi?")),
        Prompt("p1","Merawat diri","Apa yang tubuh dan pikiranmu butuhkan hari ini?",listOf("Perhatikan satu sinyal tanpa menghakiminya.","Kebaikan kecil apa yang bisa kamu berikan kepada dirimu?")),
        Prompt("g2","Syukur","Apa tiga hal yang berjalan lebih baik dari perkiraanmu?",listOf("Tidak harus besar. Tuliskan satu momen untuk setiap hal.","Bagian mana yang bisa kamu hadirkan lagi dalam keseharian?")),
        Prompt("s2","Mengenal diri","Apa yang kamu banggakan, tetapi sering kamu abaikan?",listOf("Usaha apa yang mungkin tidak terlihat oleh orang lain?","Bagaimana kamu akan menghargai usaha itu pada seorang teman?")),
        Prompt("r2","Melepas","Kekhawatiran apa yang bisa kamu letakkan dulu untuk malam ini?",listOf("Apa faktanya, dan apa yang masih berupa dugaan?","Jika perlu ditindaklanjuti, kapan waktu yang lebih baik?")),
        Prompt("t2","Bertumbuh","Apa yang kamu pelajari dari kesalahan terakhir?",listOf("Ceritakan kejadiannya tanpa memberi label buruk pada dirimu.","Apa satu hal yang akan kamu coba dengan cara berbeda?")),
        Prompt("h2","Hubungan","Siapa yang membuatmu merasa didengar belakangan ini?",listOf("Apa yang orang itu lakukan sehingga kamu merasa aman?","Bagaimana kamu ingin membalas perhatian itu?")),
        Prompt("p2","Merawat diri","Batas apa yang perlu kamu jaga dengan lebih lembut dan tegas?",listOf("Situasi apa yang paling sering menguras energimu?","Tuliskan satu kalimat yang bisa kamu pakai untuk menyampaikan batas itu.")),
        Prompt("g3","Syukur","Kebaikan kecil apa yang kamu terima hari ini?",listOf("Dari siapa, atau dari hal apa, kebaikan itu datang?","Apa yang berubah dalam dirimu setelah menerimanya?")),
        Prompt("s3","Mengenal diri","Apa yang sedang kamu hindari, dan apa yang ada di baliknya?",listOf("Apakah yang kamu rasakan takut, lelah, ragu, atau hal lain?","Apa yang membuat langkah pertama terasa lebih aman?")),
        Prompt("r3","Melepas","Harapan siapa yang terasa paling berat kamu bawa?",listOf("Mana yang benar-benar sejalan dengan keinginanmu?","Apa yang ingin kamu pilih jika tidak perlu membuktikan apa pun?")),
        Prompt("t3","Bertumbuh","Apa yang sedang tumbuh dalam hidupmu meski pelan?",listOf("Bandingkan dengan dirimu beberapa bulan lalu, bukan dengan orang lain.","Dukungan apa yang membantu pertumbuhan itu?")),
        Prompt("h3","Hubungan","Hubungan mana yang ingin kamu rawat minggu ini?",listOf("Apa yang kamu hargai dari hubungan itu?","Apa bentuk perhatian yang realistis, tanpa mengabaikan kebutuhanmu sendiri?")),
        Prompt("p3","Merawat diri","Kapan terakhir kali kamu merasa benar-benar tenang?",listOf("Ingat suasana, suara, dan sensasi tubuhmu saat itu.","Bagian kecil mana yang bisa kamu bawa ke hari ini?")),
        Prompt("g4","Syukur","Apa satu hal yang layak dirayakan meski kecil?",listOf("Apa yang kamu lakukan untuk sampai ke titik itu?","Bagaimana kamu ingin menandai momen ini?")),
        Prompt("s4","Mengenal diri","Jika hari ini punya judul, apa judulnya?",listOf("Momen apa yang membuat judul itu terasa tepat?","Apakah ada cerita lain dari hari ini yang juga ingin kamu beri ruang?")),
        Prompt("r4","Melepas","Apa yang ingin kamu maafkan dari dirimu yang dulu?",listOf("Apa yang belum kamu ketahui atau belum kamu miliki saat itu?","Tuliskan pesan penuh pengertian untuk dirimu pada masa itu.")),
        Prompt("t4","Bertumbuh","Pilihan kecil apa yang ingin kamu ulangi besok?",listOf("Apa dampaknya pada perasaan atau waktumu hari ini?","Bagaimana kamu bisa membuat pilihan itu lebih mudah diulang?")),
        Prompt("h4","Hubungan","Apa yang belum sempat kamu katakan kepada seseorang?",listOf("Tulis seolah kamu sedang berbicara dengannya; kamu tidak harus mengirimkannya.","Setelah menulis, apa yang sebenarnya kamu butuhkan?")),
        Prompt("p4","Merawat diri","Apa yang bisa kamu buat lebih mudah untuk dirimu besok?",listOf("Pilih satu bagian hari yang biasanya terasa penuh.","Apa yang bisa disederhanakan, diminta bantuannya, atau ditunda?")),
        Prompt("g5","Syukur","Apa yang membuatmu tersenyum tanpa kamu rencanakan?",listOf("Ceritakan detail yang ingin kamu simpan.","Apa yang momen itu ingatkan tentang hal-hal yang kamu sukai?")),
        Prompt("s5","Mengenal diri","Apa yang paling ingin kamu pahami, sebelum mencoba memperbaikinya?",listOf("Pertanyaan apa yang belum kamu beri waktu untuk dijawab?","Apa yang berubah jika kamu mendengarkan dulu?")),
        Prompt("r5","Melepas","Apa yang dulu terasa penting, tetapi kini boleh kamu lepaskan?",listOf("Bagaimana kebutuhan atau nilaimu telah berubah?","Ruang untuk apa yang akan terbuka setelah kamu melepasnya?")),
        Prompt("t5","Bertumbuh","Seperti apa hari yang terasa cukup untukmu?",listOf("Bedakan hal yang kamu butuhkan dari yang sekadar terlihat mengesankan.","Apa satu penyesuaian kecil menuju hari seperti itu?")),
        Prompt("h5","Hubungan","Apa arti hadir untuk seseorang tanpa harus menyelesaikan masalahnya?",listOf("Ingat saat seseorang cukup menemanimu.","Bagaimana kamu bisa menawarkan kehadiran yang serupa?")),
        Prompt("p5","Merawat diri","Apa hal sederhana yang ingin kamu lakukan lebih pelan?",listOf("Apa yang biasanya kamu lewatkan saat terburu-buru?","Pilih satu momen besok untuk memberi perhatian penuh."))
    )
    fun daily(date: LocalDate = LocalDate.now()): Prompt = all[Math.floorMod(date.toEpochDay(), all.size.toLong()).toInt()]
}
