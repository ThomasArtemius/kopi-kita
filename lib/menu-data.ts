export type MenuCategory = "kopi" | "non-kopi" | "pastry";

export interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  category: MenuCategory;
  image: string;
  available: boolean;
}

export const menuData: MenuItem[] = [
  {
    id: 1,
    name: "Kopi Susu Kita",
    description:
      "Perpaduan espresso rich dan susu segar dengan gula aren yang manisnya pas di hati.",
    price: 22000,
    category: "kopi",
    image: "/images/menu/kopi-susu-kita.jpg",
    available: true,
  },
  {
    id: 2,
    name: "Americano",
    description:
      "Espresso murni dan air panas, sederhana tapi bikin melek dan fokus seharian.",
    price: 18000,
    category: "kopi",
    image: "/images/menu/americano.jpg",
    available: true,
  },
  {
    id: 3,
    name: "Es Kopi Gula Aren",
    description:
      "Sensasi dingin, manis karamel gula aren, dan pahit kopi yang klop banget di siang hari.",
    price: 20000,
    category: "kopi",
    image: "/images/menu/es-kopi-gula-aren.jpg",
    available: true,
  },
  {
    id: 4,
    name: "Matcha Latte",
    description:
      "Bubuk matcha premium diseduh lembut dengan susu creamy, hijau menyegarkan setiap tegukan.",
    price: 25000,
    category: "non-kopi",
    image: "/images/menu/matcha-latte.jpg",
    available: true,
  },
  {
    id: 5,
    name: "Coklat Panas",
    description:
      "Coklat leleh kental yang hangat dan manis, teman sempurna saat hujan atau malam santai.",
    price: 23000,
    category: "non-kopi",
    image: "/images/menu/coklat-panas.jpg",
    available: true,
  },
  {
    id: 6,
    name: "Croissant",
    description:
      "Lapisan mentega renyah di luar, lembut mengembang di dalam, wangi banget saat baru dipanggang.",
    price: 18000,
    category: "pastry",
    image: "/images/menu/croissant.jpg",
    available: true,
  },
  {
    id: 7,
    name: "Roti Bakar Keju",
    description:
      "Roti panggang keju leleh melimpah, gurih meleleh di setiap gigitan yang bikin nagih.",
    price: 17000,
    category: "pastry",
    image: "/images/menu/roti-bakar-keju.jpg",
    available: true,
  },
  {
    id: 8,
    name: "Banana Bread",
    description:
      "Roti pisang lembut dan harum, manis alami yang cocok jadi teman ngopi santai.",
    price: 19000,
    category: "pastry",
    image: "/images/menu/banana-bread.jpg",
    available: false,
  },
];

export default menuData;
