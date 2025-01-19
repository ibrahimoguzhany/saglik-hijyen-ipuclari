'use client';

import { tips } from '@/data/tips';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';

interface Step {
  title: string;
  content: string;
  image: string;
}

interface TipDetail {
  steps: Step[];
  additionalInfo: string;
  sources: string[];
  recommendations?: string[];
}

const tipImages = {
  'düzenli-el-yıkama': 'https://picsum.photos/seed/handwash/800/600',
  'yeterli-uyku': 'https://picsum.photos/seed/sleep/800/600',
  'dengeli-beslenme': 'https://picsum.photos/seed/nutrition/800/600',
  'çevre-temizliği': 'https://picsum.photos/seed/cleaning/800/600',
  'su-tüketimi': 'https://picsum.photos/seed/water/800/600',
  'düzenli-egzersiz': 'https://picsum.photos/seed/exercise/800/600',
  'doğru-germe-egzersizleri': 'https://picsum.photos/seed/stretch/800/600',
  'yürüyüş-alışkanlığı': 'https://picsum.photos/seed/walking/800/600',
};

const categoryColors = {
  'sağlık': 'bg-green-100 text-green-800',
  'hijyen': 'bg-blue-100 text-blue-800',
  'spor': 'bg-purple-100 text-purple-800'
};

const tipDetails: Record<number, TipDetail> = {
  1: {
    steps: [
      {
        title: 'Doğru El Yıkama Adımları',
        content: `1. Ellerinizi temiz suyla ıslatın
2. Avuç içinize yeterli miktarda sabun alın
3. Avuç içlerinizi birbirine sürtün
4. Parmak aralarını ve tırnakları özellikle temizleyin
5. Bileklere kadar yıkamayı unutmayın
6. En az 20 saniye boyunca bu işlemi sürdürün
7. Temiz suyla iyice durulayın
8. Tek kullanımlık kağıt havlu ile kurulayın`,
        image: 'https://picsum.photos/seed/handwash1/400/300'
      },
      {
        title: 'Önemli Yıkama Zamanları',
        content: `• Yemek hazırlamadan önce ve sonra
• Tuvaleti kullandıktan sonra
• Hasta birinin bakımını yaptıktan sonra
• Dışarıdan eve geldiğinizde
• Burnu temizledikten, öksürdükten veya hapşırdıktan sonra
• Çiğ et, tavuk veya balık ile temastan sonra
• Çöplere dokunduktan sonra
• Evcil hayvanlarla temastan sonra`,
        image: 'https://picsum.photos/seed/handwash2/400/300'
      },
      {
        title: 'Yaygın El Yıkama Hataları',
        content: `• Çok hızlı yıkama (20 saniyeden az)
• Sabun kullanmama veya az kullanma
• Parmak aralarını atlama
• Tırnakların altını temizlememe
• Bilekleri yıkamayı unutma
• Yeterince durulamama
• Islak elle havlu veya musluk kullanma
• Kirli havlu kullanma`,
        image: 'https://picsum.photos/seed/handwash3/400/300'
      }
    ],
    additionalInfo: `El yıkama, enfeksiyonların önlenmesinde en etkili yöntemlerden biridir. Dünya Sağlık Örgütü verilerine göre, düzenli el yıkama alışkanlığı:

• Solunum yolu enfeksiyonlarını %16-21 oranında
• Mide-bağırsak enfeksiyonlarını %31 oranında
• Göz enfeksiyonlarını %50 oranında azaltır

Özellikle pandemi dönemlerinde el hijyeni hayati önem taşır. Alkol bazlı el dezenfektanları, sabun ve suya ulaşamadığınız durumlarda alternatif olabilir, ancak gözle görülür kirlenme varsa mutlaka su ve sabunla yıkama yapılmalıdır.`,
    sources: [
      'Dünya Sağlık Örgütü (WHO) El Hijyeni Kılavuzu',
      'T.C. Sağlık Bakanlığı Enfeksiyon Kontrol Rehberi',
      'CDC (Hastalık Kontrol ve Önleme Merkezi)',
      'Amerikan Halk Sağlığı Birliği'
    ],
    recommendations: [
      'Antibakteriyel sabunlar yerine normal sabun kullanın',
      'El kremini ihmal etmeyin, kuru eller çatlaklara ve enfeksiyonlara yol açabilir',
      'Çocuklara el yıkama alışkanlığını küçük yaşta kazandırın',
      'İş yerinde ve evde sıvı sabun kullanmayı tercih edin',
      'Ortak havlu kullanımından kaçının'
    ]
  },
  2: {
    steps: [
      {
        title: 'Uyku Düzeni Oluşturma',
        content: `1. Her gün aynı saatte yatın ve kalkın
2. Yatmadan 2 saat önce yemek yemeyi bırakın
3. Yatak odanızı karanlık ve serin tutun (18-21°C)
4. Yatmadan önce rahatlatıcı aktiviteler yapın
5. Hafta sonları da aynı uyku düzenini koruyun
6. Gün içinde şekerleme yapıyorsanız 20-30 dakikayı geçmeyin
7. Uyku öncesi rutininizi oluşturun (örn: ılık duş, kitap okuma)
8. Yatakta telefon, tablet gibi elektronik cihazları kullanmayın`,
        image: 'https://picsum.photos/seed/sleep1/400/300'
      },
      {
        title: 'İdeal Uyku Ortamı',
        content: `• Yatak odası sıcaklığı: 18-21°C arası
• Nem oranı: %40-60 arası
• Gürültü seviyesi: 30 desibelin altında
• Işık seviyesi: Minimum (karartma perdeleri kullanın)
• Yatak konforu: Orta sertlikte, anatomik yapıya uygun
• Yastık seçimi: Boyun ve omurga desteği sağlayan
• Nevresim: Doğal malzemeden, nefes alabilen kumaşlar
• Elektronik cihazlar: Yatak odasından uzak tutulmalı`,
        image: 'https://picsum.photos/seed/sleep2/400/300'
      },
      {
        title: 'Uyku Kalitesini Artırma Yöntemleri',
        content: `• Düzenli egzersiz yapın (yatmadan en az 3 saat önce)
• Kafein tüketimini öğleden sonra sınırlayın
• Akşam yemeğini hafif tutun
• Alkol ve sigaradan uzak durun
• Stres yönetimi için meditasyon veya nefes egzersizleri yapın
• Yatak odasını sadece uyku ve dinlenme için kullanın
• Uyku günlüğü tutun ve uyku kalitenizi takip edin
• Gerekirse profesyonel yardım alın`,
        image: 'https://picsum.photos/seed/sleep3/400/300'
      }
    ],
    additionalInfo: `Kaliteli uyku, fiziksel ve mental sağlığımız için hayati önem taşır. Yetersiz uyku:

• Bağışıklık sistemini zayıflatır
• Metabolizmayı yavaşlatır
• Konsantrasyon ve hafızayı olumsuz etkiler
• Duygu durum bozukluklarına yol açabilir
• Kalp-damar hastalıkları riskini artırır
• Kilo kontrolünü zorlaştırır

Yetişkinler için ideal uyku süresi 7-9 saat arasındadır. Ancak kalite, süreden daha önemlidir.`,
    sources: [
      'Amerikan Uyku Tıbbı Akademisi',
      'T.C. Sağlık Bakanlığı Uyku Hijyeni Rehberi',
      'Avrupa Uyku Araştırmaları Derneği',
      'Harvard Tıp Fakültesi Uyku Araştırmaları Bölümü'
    ],
    recommendations: [
      'Uyku bozukluğu yaşıyorsanız mutlaka bir uzmana başvurun',
      'Uyku ilaçlarını doktor kontrolü olmadan kullanmayın',
      'Uyku borcu kavramını ciddiye alın, kaybedilen uykuyu telafi edin',
      'Vardiyalı çalışıyorsanız özel uyku stratejileri geliştirin',
      'Çocukların uyku düzenine özellikle dikkat edin'
    ]
  },
  3: {
    steps: [
      {
        title: 'Besin Çeşitliliği',
        content: 'Her öğünde farklı besin gruplarından yiyecekler tüketin. Tabağınızı renkli tutun.',
        image: 'https://picsum.photos/seed/nutrition1/400/300'
      },
      {
        title: 'Porsiyon Kontrolü',
        content: 'Aşırı yemekten kaçının. Küçük porsiyonlarla başlayın ve yavaş yiyin.',
        image: 'https://picsum.photos/seed/nutrition2/400/300'
      }
    ],
    additionalInfo: 'Dengeli beslenme, hastalıklardan korunmanın ve sağlıklı yaşamın temelidir.',
    sources: ['Türkiye Diyetisyenler Derneği', 'T.C. Sağlık Bakanlığı']
  },
  4: {
    steps: [
      {
        title: 'Düzenli Temizlik',
        content: 'Evinizi düzenli olarak havalandırın ve sık kullanılan yüzeyleri temizleyin.',
        image: 'https://picsum.photos/seed/cleaning1/400/300'
      },
      {
        title: 'Doğru Temizlik Ürünleri',
        content: 'Her yüzey için uygun temizlik ürünlerini kullanın ve karıştırmaktan kaçının.',
        image: 'https://picsum.photos/seed/cleaning2/400/300'
      }
    ],
    additionalInfo: 'Temiz bir çevre, sağlıklı bir yaşam için önemlidir ve hastalıkların yayılmasını önler.',
    sources: ['CDC (Hastalık Kontrol Merkezi)', 'T.C. Sağlık Bakanlığı']
  },
  5: {
    steps: [
      {
        title: 'Günlük Su İhtiyacı',
        content: 'Günde en az 8-10 bardak su için. Susama hissi beklemeyin.',
        image: 'https://picsum.photos/seed/water1/400/300'
      },
      {
        title: 'Su İçme Alışkanlığı',
        content: 'Yanınızda su şişesi bulundurun ve düzenli aralıklarla için.',
        image: 'https://picsum.photos/seed/water2/400/300'
      }
    ],
    additionalInfo: 'Yeterli su tüketimi, vücudun tüm sistemlerinin düzgün çalışması için gereklidir.',
    sources: ['Avrupa Gıda Güvenliği Otoritesi', 'T.C. Sağlık Bakanlığı']
  },
  6: {
    steps: [
      {
        title: 'Kardiyovasküler Egzersizler',
        content: 'Koşu, yüzme, bisiklet gibi aktivitelerle kalbinizi güçlendirin. Başlangıçta düşük tempoda başlayıp kademeli olarak artırın.',
        image: 'https://picsum.photos/seed/cardio/400/300'
      },
      {
        title: 'Kuvvet Antrenmanı',
        content: 'Haftada en az 2-3 kez ağırlık çalışması veya vücut ağırlığıyla egzersiz yapın. Tüm ana kas gruplarını çalıştırmaya özen gösterin.',
        image: 'https://picsum.photos/seed/strength/400/300'
      }
    ],
    additionalInfo: 'Düzenli egzersiz, kalp-damar sağlığını iyileştirir, kilo kontrolüne yardımcı olur ve stres seviyesini düşürür.',
    sources: ['Dünya Sağlık Örgütü (WHO)', 'Amerikan Spor Hekimliği Koleji (ACSM)']
  },
  7: {
    steps: [
      {
        title: 'Dinamik Germe',
        content: 'Egzersiz öncesi dinamik germe hareketleri yapın. Kollar, bacaklar ve gövde için kontrollü salınım hareketleri uygulayın.',
        image: 'https://picsum.photos/seed/dynamic/400/300'
      },
      {
        title: 'Statik Germe',
        content: 'Egzersiz sonrası statik germe yapın. Her pozisyonu 15-30 saniye tutun ve sert çekilme hissi yerine hafif bir gerilme hissedin.',
        image: 'https://picsum.photos/seed/static/400/300'
      }
    ],
    additionalInfo: 'Doğru germe teknikleri, kas esnekliğini artırır, kan dolaşımını iyileştirir ve sakatlanma riskini azaltır.',
    sources: ['Amerikan Spor Fizyoterapistleri Derneği', 'Türkiye Fizyoterapistler Derneği']
  },
  8: {
    steps: [
      {
        title: 'Günlük Adım Hedefi',
        content: 'Günde en az 10.000 adım atmayı hedefleyin. Akıllı saat veya telefon uygulamaları ile adımlarınızı takip edin.',
        image: 'https://picsum.photos/seed/steps/400/300'
      },
      {
        title: 'Doğru Yürüyüş Tekniği',
        content: 'Başınız dik, omuzlarınız geride ve karın kaslarınız hafif kasılı olacak şekilde yürüyün. Topuktan başlayıp parmak ucunda bitirin.',
        image: 'https://picsum.photos/seed/technique/400/300'
      }
    ],
    additionalInfo: 'Düzenli yürüyüş, en basit ve etkili egzersiz formlarından biridir. Eklem dostu olması ve her yaşta yapılabilmesi en büyük avantajlarıdır.',
    sources: ['Amerikan Kalp Derneği', 'T.C. Sağlık Bakanlığı Fiziksel Aktivite Rehberi']
  }
};

export default function TipDetail() {
  const router = useRouter();
  const params = useParams();
  const tipId = Number(params.id);
  const tip = tips.find(t => t.id === tipId);

  if (!tip) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">İpucu Bulunamadı</h1>
          <button 
            onClick={() => router.push('/')}
            className="text-blue-600 hover:text-blue-800"
          >
            Ana Sayfaya Dön
          </button>
        </div>
      </div>
    );
  }

  const details = tipDetails[tipId as keyof typeof tipDetails];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.push('/')}
              className="text-gray-600 hover:text-gray-900"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <h1 className="text-3xl font-bold text-gray-900">{tip.title}</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {/* Ana Görsel */}
          <div className="relative h-64 sm:h-96">
            <Image
              src={tipImages[tip.title.toLowerCase().replace(/\s+/g, '-') as keyof typeof tipImages] || 'https://picsum.photos/seed/default/800/600'}
              alt={tip.title}
              fill
              className="object-cover"
              unoptimized
            />
          </div>

          {/* İçerik */}
          <div className="p-6">
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Genel Bakış</h2>
                <span className={`px-3 py-1 text-sm rounded-full font-medium ${categoryColors[tip.category]}`}>
                  {tip.category}
                </span>
              </div>
              <p className="mt-4 text-gray-700 text-lg leading-relaxed">{tip.content}</p>
            </div>

            {details && (
              <>
                {/* Adımlar */}
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Detaylı Bilgi</h2>
                  <div className="grid gap-6 md:grid-cols-2">
                    {details.steps.map((step, index) => (
                      <div key={index} className="border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
                        <div className="relative h-48 mb-4">
                          <Image
                            src={step.image}
                            alt={step.title}
                            fill
                            className="object-cover rounded-lg"
                            unoptimized
                          />
                        </div>
                        <h3 className="font-bold text-xl mb-3 text-gray-900">{step.title}</h3>
                        <p className="text-gray-700 leading-relaxed">{step.content}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Ek Bilgiler */}
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-6 mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b border-blue-200">Ek Bilgi</h2>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">{details.additionalInfo}</p>
                </div>

                {/* Kaynaklar */}
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">Kaynaklar</h2>
                  <ul className="list-disc list-inside text-gray-700 space-y-2">
                    {details.sources.map((source, index) => (
                      <li key={index} className="hover:text-gray-900 transition-colors">{source}</li>
                    ))}
                  </ul>
                </div>

                {/* Öneriler - Eğer recommendations varsa göster */}
                {details.recommendations && (
                  <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-6 mt-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b border-green-200">Öneriler</h2>
                    <ul className="space-y-2">
                      {details.recommendations.map((recommendation, index) => (
                        <li key={index} className="flex items-start gap-2 text-gray-700">
                          <span className="text-green-600 mt-1">•</span>
                          <span className="leading-relaxed">{recommendation}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
} 