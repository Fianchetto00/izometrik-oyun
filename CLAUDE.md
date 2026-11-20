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
index.html                 canvas + ./src/main.js
src/main.js                veri yükleme, oyun döngüsü
src/loader.js              JSON yükleme (loadJSON, loadAll, mapPath)
src/iso.js                 grid <-> ekran dönüşümleri (TILE_W=64, TILE_H=32)
src/input.js               klavye durumu; moveVector() ekran-uzayı yönü verir
src/map.js                 harita ayrıştırma, isBlocked, tohumlu ağaç yerleşimi
src/player.js              hareket (ekranda sabit hız) + eksen eksen çarpışma
src/camera.js              oyuncuyu ortalayan kamera (zoom)
src/render/renderer.js     zemin katmanı + derinliğe göre sıralı nesneler
src/render/assets.js       manifest çözümleyici (shape | image)
src/render/shapes.js       flat / block / tree şekilleri, desenler
src/render/character.js    outfit'ten insan figürü, aksesuar kayıt tablosu
data/game.json             başlangıç haritası, oyuncu ayarları (outfit, hız, yarıçap), kamera zoom
data/tiles.json            karo türleri: walkable, floor asset, block asset
data/assets.json           görsel manifest
data/outfits.json          outfit'ler ("default")
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
- `npcs` listesi haritada duruyor ama Aşama 2'ye kadar kullanılmıyor.

## Aşamalar
1. [x] Harita yükleme, izometrik çizim, kamera, derinlik sıralaması, WASD, çarpışma
2. [ ] NPC'ler ve diyalog sistemi
3. [ ] Flag'ler, quest sistemi, quest günlüğü (hikaye metni bu aşamadan önce gelecek)
4. [ ] Eşya veritabanı, envanter, altın, envanter UI'ı
5. [ ] Sahne geçişleri (fade), dungeon, sandıklar, basit dövüş
6. [ ] Tüccar NPC'ler ve alışveriş ekranı
7. [ ] Demirci ve eşya geliştirme
8. [ ] Kaydet/yükle, başlangıç menüsü, hikaye sonu

Kapsam dışı (şimdilik): balıkçılık, duo mekaniği, kostümler, PNG sprite'lar.

**Şu an: Aşama 1 tamamlandı, onay bekleniyor.**
