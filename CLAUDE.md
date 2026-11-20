# Köy Macerası — izometrik hikaye/macera oyunu

Tarayıcıda çalışan, tek oyunculu, izometrik (2:1, 64x32 karo) bir macera oyunu.
Oyuncu köyde dolaşır, NPC'lerle konuşur, alışveriş yapar, demirciye eşya
geliştirtir, dungeon'a girer; dungeon bitince köye döner ve hikaye ilerler.

## Çalıştırma
```bash
python -m http.server 8000
```
Sonra `http://localhost:8000/` aç. Build adımı yok.

## Kurallar
- Vanilla JavaScript (ES modules) + Canvas 2D. Framework/bundler yok.
- Kod, dosya, değişken adları İngilizce; oyun içi metinler Türkçe.
- Tüm yollar göreli (`./data/...`, `./src/...`); `/` ile başlayan yol yok.
- Hiçbir dosya 300 satırı geçmez. Küçük, modüler dosyalar.
- Veri odaklı: harita, NPC, diyalog, quest, eşya, dükkân, dungeon `/data`
  altında JSON. İçerik kodda sabit yazılmaz.
- Görsel asset yok; her şey kodla çizilir. Çizim kodu yalnızca `src/render/`
  altında. Görseller `data/assets.json` manifestinden çözülür: her girdi ya
  `{"type":"shape","shape":...}` ya da `{"type":"image","src":"./assets/x.png","anchor":[ax,ay]}`.
  PNG'ye geçiş yalnızca manifest değişikliğiyle olur.
- Karakter çizimi sabit renk kullanmaz; `data/outfits.json` içindeki outfit
  nesnesinden (renkler + aksesuarlar) okur.
- Sahne geçişleri 0,5 sn fade. Açılışta canvas'a "Yükleniyor..." yazılır,
  ayrı yükleme ekranı yok.
- Aynı anda tek aşama; sonraki aşamanın kodu yazılmaz. Dosyalar baştan
  yazılmaz, yalnızca değişen kısım düzenlenir. Birden fazla yol varsa en
  basiti seçilir.
- Her aşama ayrı git commit'i, doğrudan `main`'e push edilir (Pull Request yok).
  Depo: Fianchetto00/izometrik-oyun. GitHub Pages `main`'den yayınlar:
  https://fianchetto00.github.io/izometrik-oyun/

## Proje yapısı
```
index.html                 canvas + ./style.css + ./src/main.js
style.css                  HTML arayüz stilleri (giriş ekranı)
src/main.js                veri yükleme, oyun döngüsü
src/loader.js              JSON yükleme (loadJSON, loadAll, mapPath)
src/iso.js                 grid <-> ekran dönüşümleri (TILE_W=64, TILE_H=32)
src/input.js               klavye durumu; moveVector() ekran-uzayı yönü verir
src/map.js                 harita ayrıştırma, isBlocked, tohumlu ağaç yerleşimi
src/player.js              hareket (ekranda sabit hız) + eksen eksen çarpışma
src/camera.js              oyuncuyu ortalayan kamera (zoom)
src/menu.js                giriş ekranı (HTML): takma ad, sınıf, cinsiyet, önizleme
src/inventory.js           eşya veritabanı (createItemDb) + envanter kuralları (ekle/çıkar/kuşan)
src/inventoryUi.js         envanter paneli (HTML, I/Esc), seçili eşya ayrıntısı
src/hud.js                 köşe göstergesi: altın, tuş ipucu
src/npc.js                 haritadaki npcs listesinden karakterler (engel + isim etiketi)
src/render/renderer.js     zemin katmanı + derinliğe göre sıralı nesneler
src/render/assets.js       manifest çözümleyici (shape | image)
src/render/shapes.js       flat / block / tree şekilleri, desenler
src/render/icons.js        eşya simgeleri (glyph: sword, staff, potion...)
src/render/character.js    outfit'ten insan figürü, aksesuar kayıt tablosu
data/game.json             oyun adı, başlangıç haritası, oyuncu ayarları (hız, yarıçap), kamera zoom
data/characters.json       giriş ekranı: sınıflar (+ başlangıç eşyaları), cinsiyetler, takma ad sınırı, metinler
data/items.json            eşya türleri, istatistik adları, 17 eşya (id, ad, tür, fiyat, stats, icon, açıklama)
data/ui.json               HUD ve envanter arayüz metinleri
data/tiles.json            karo türleri: walkable, floor asset, block asset
data/assets.json           görsel manifest
data/outfits.json          outfit'ler: oyuncu için {sınıf}_{cinsiyet} (6 adet), her NPC'nin kendi outfit'i
data/maps/koy.json         köy: legend + rows (80x42), trees, playerStart, npcs
docs/harita.png            köy krokisi (Paint çizimi)
```

## Temel kavramlar
- Koordinatlar: karo (x, y) grid'de [x, x+1] x [y, y+1] alanını kaplar.
  Oyuncu konumu ayak noktasıdır (ondalıklı grid birimi).
- WASD ekran yönündedir; `screenToGrid` ile grid hızına çevrilir.
- Derinlik: önce tüm zemin, sonra bloklar/ağaçlar (`x+y+1`) ve varlıklar
  (`x+y`) sıralanarak çizilir. Kamera +x/+y yönünden bakar; kuzey ve batı
  yüzler görünmez (K ve X kapıları kuzey kenarda olduğu için çatıda girinti
  olarak görünür).
- Ağaçlar: `trees.seed` + `density` ile çalışma anında üretilir; `clear`
  dikdörtgenleri (köprü ağzı, batı yolu) boş kalır.
- Köy, orijinal 40x21 ızgaranın her karosu 2x2 yapılarak 80x42'ye büyütüldü;
  kapılar (K, X) 2 karo geniş, 1 karo derin. Kamera `game.json` → `camera.zoom`
  (şu an 1.5) ile yakınlaştırılır.
- `npcs` girdileri: id, role, name (Türkçe, etiket), outfit, x, y. `outfit`'i
  olanlar çizilir ve karolarını engeller; olmayanlar (dungeon girişi) sadece
  etkileşim noktasıdır. Sarı NPC Krios (role "duo"). Krokiye göre yerleri
  verildi; atölye/kışla önündekiler bina arkasında kalmasın diye birkaç karo
  öne alındı. Görünümleri geçici, modellemeler sonra.

## Giriş ekranı
- Oyun açılınca köy arka planda çizilir, üstünde HTML form: takma ad (2-16),
  sınıf (Savaşçı / Şaman / Ninja), cinsiyet (Erkek / Kadın) ve canlı önizleme.
- Seçim `outfitPattern` ile outfit'e çevrilir (ör. `ninja_female`). Oyuncunun
  `name`, `classId`, `gender` alanları tutulur; takma ad başının üstünde yazar.
- Sınıfların henüz oyun mekaniği yok (dövüş Aşama 5'te). Kayıt (Aşama 8)
  gelince bu alanlar da kaydedilecek; Yeni Oyun / Devam Et menüsü bu ekrana bağlanacak.

## Envanter
- Durum düz veri: `{ gold, items: [{id, count}], equipped: {weapon, armor} }`
  (kayıt için hazır). Eşya ayrıntıları yalnızca `items.json`'da.
- Başlangıç: `game.json` → `startGold`, sınıfın `start.items` ve `start.equip`'i.
- I tuşu paneli açar; açıkken oyuncu hareket etmez. Silah/zırh kuşan/çıkar.
  Tüketilebilirler can sistemi (Aşama 5) gelene kadar kullanılamaz.
- Simgeler manifestte `icon_*` girdileri (`shape: icon`), PNG ile değiştirilebilir.

## Aşamalar
1. [x] Harita yükleme, izometrik çizim, kamera, derinlik sıralaması, WASD, çarpışma
2. [ ] NPC'ler ve diyalog sistemi — NPC'ler yerleştirildi ve çiziliyor; diyalog bekliyor
3. [ ] Flag'ler, quest sistemi, quest günlüğü (hikaye metni bu aşamadan önce gelecek)
4. [x] Eşya veritabanı, envanter, altın, envanter UI'ı (kullanıcı isteğiyle diyalogdan önce yapıldı)
5. [ ] Sahne geçişleri (fade), dungeon, sandıklar, basit dövüş
6. [ ] Tüccar NPC'ler ve alışveriş ekranı
7. [ ] Demirci ve eşya geliştirme
8. [ ] Kaydet/yükle, başlangıç menüsü, hikaye sonu

Kapsam dışı (şimdilik): balıkçılık, duo mekaniği, kostümler, PNG sprite'lar.

**Şu an: Aşama 4 bitti. Aşama 2'nin diyalog kısmı hâlâ bekliyor; sıradaki adım için onay bekleniyor.**
