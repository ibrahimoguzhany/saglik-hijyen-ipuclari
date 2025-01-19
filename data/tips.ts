export interface Tip {
  id: number;
  title: string;
  content: string;
  category: 'sağlık' | 'hijyen' | 'spor';
  date: string;
}

export const tips: Tip[] = [
  {
    id: 1,
    title: 'Düzenli El Yıkama',
    content: 'Ellerinizi en az 20 saniye boyunca sabun ve suyla yıkayın. Özellikle yemeklerden önce ve sonra, tuvaleti kullandıktan sonra ve dışarıdan eve geldiğinizde bu kurala dikkat edin.',
    category: 'hijyen',
    date: '2024-03-20'
  },
  {
    id: 2,
    title: 'Yeterli Uyku',
    content: 'Yetişkinler için günde 7-9 saat uyku optimal sağlık için önemlidir. Düzenli uyku saatleri bağışıklık sisteminizi güçlendirir.',
    category: 'sağlık',
    date: '2024-03-21'
  },
  {
    id: 3,
    title: 'Dengeli Beslenme',
    content: 'Günlük beslenmenizde protein, karbonhidrat ve sağlıklı yağları dengeli bir şekilde tüketin. Bol miktarda sebze ve meyve tüketmeyi ihmal etmeyin.',
    category: 'sağlık',
    date: '2024-03-22'
  },
  {
    id: 4,
    title: 'Çevre Temizliği',
    content: 'Yaşam alanlarınızı düzenli olarak temizleyin. Özellikle sık dokunulan yüzeyleri (kapı kolları, masa, telefon vb.) dezenfekte etmeyi unutmayın.',
    category: 'hijyen',
    date: '2024-03-23'
  },
  {
    id: 5,
    title: 'Su Tüketimi',
    content: 'Günde en az 2-2.5 litre su için. Yeterli su tüketimi metabolizmanızı hızlandırır ve vücudunuzdaki toksinlerin atılmasına yardımcı olur.',
    category: 'sağlık',
    date: '2024-03-24'
  },
  {
    id: 6,
    title: 'Düzenli Egzersiz',
    content: 'Haftada en az 150 dakika orta şiddetli veya 75 dakika yüksek şiddetli egzersiz yapın. Düzenli fiziksel aktivite, fiziksel ve mental sağlığınızı iyileştirir.',
    category: 'spor',
    date: '2024-03-25'
  },
  {
    id: 7,
    title: 'Doğru Germe Egzersizleri',
    content: 'Egzersiz öncesi ve sonrası germe hareketleri yapmak, sakatlanma riskini azaltır ve kas esnekliğini artırır. Her germe hareketi için 15-30 saniye bekleyin.',
    category: 'spor',
    date: '2024-03-26'
  },
  {
    id: 8,
    title: 'Yürüyüş Alışkanlığı',
    content: 'Her gün en az 30 dakika tempolu yürüyüş yapın. Asansör yerine merdiven kullanın ve kısa mesafeleri yürümeyi tercih edin.',
    category: 'spor',
    date: '2024-03-27'
  }
]; 