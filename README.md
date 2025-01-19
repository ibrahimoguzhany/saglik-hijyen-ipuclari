# Next.js Web Uygulaması

Bu proje [Next.js](https://nextjs.org) kullanılarak geliştirilmiş bir web uygulamasıdır.

## Kurulum Gereksinimleri

Projeyi çalıştırmadan önce aşağıdaki yazılımların bilgisayarınızda kurulu olduğundan emin olun:

- [Node.js](https://nodejs.org/) (v18 veya daha yüksek versiyon)
- npm (Node.js ile birlikte gelir) veya yarn veya pnpm

## Kurulum Adımları

1. Projeyi bilgisayarınıza indirin:
```bash
git clone [proje-repository-url]
```

2. Proje klasörüne gidin:
```bash
cd [proje-klasörü]
```

3. Bağımlılıkları yükleyin:
```bash
npm install
# veya
yarn install
# veya
pnpm install
```

## Projeyi Çalıştırma

1. Geliştirme sunucusunu başlatın:
```bash
npm run dev
# veya
yarn dev
# veya
pnpm dev
```

2. Tarayıcınızda [http://localhost:3000](http://localhost:3000) adresine giderek uygulamayı görüntüleyebilirsiniz.

## Yapı ve Özellikler

- Modern Next.js 14 App Router yapısı
- TypeScript desteği
- Responsive tasarım
- Admin paneli

## Admin Paneli Erişimi

Admin paneline erişmek için:

1. [http://localhost:3000/admin](http://localhost:3000/admin) adresine gidin
2. Aşağıdaki bilgilerle giriş yapın:

```
Email: admin@example.com
Şifre: admin123
```

## Yardımcı Kaynaklar

- [Next.js Dokümantasyonu](https://nextjs.org/docs)
- [Next.js Öğreticisi](https://nextjs.org/learn)
- [Next.js GitHub Deposu](https://github.com/vercel/next.js)

## Sorun Giderme

Eğer kurulum sırasında sorunlarla karşılaşırsanız:

1. Node.js versiyonunuzun uyumlu olduğundan emin olun
2. node_modules klasörünü silip yeniden npm install yapın
3. .next klasörünü silip yeniden build alın

## Lisans

Bu proje MIT lisansı altında lisanslanmıştır.
