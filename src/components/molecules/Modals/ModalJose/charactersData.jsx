const CHARACTERS_DATA = [
  {
    personId: "joseluis",
    name: "José Luis",
    avatar: "/images/avatar/jose-luis-avatar.png",
    mainText: "Te diré cuándo aparecerá la caja, pero tú dime: ¿Cuántos logos has encontrado?",
    conversation: [
      {
        id: "ninguno",
        mainChoice: "Ninguno",
        message: "¡No pasa nada! Todavía hay tiempo para encontrarlos 😉",
      },
      {
        id: "menos_dos",
        mainChoice: "Menos de dos",
        message:
          "¡Muy bien! Quédate conectado y que sigue llenando tu Caja Mágica. Aprovecha el tiempo que queda...",
      },
      {
        id: "mas_dos",
        mainChoice: "Más de dos",
        message:
          "¡Estás muy cerca de llenar tu Caja Mágica! 🎉  No pierdas tiempo para lograr tu objetivo. Solo quedan...",
      },
    ],
    timer: true
  },
  {
    personId: "priscillavargas",
    name: "Priscilla Vargas",
    avatar: "/images/avatar/priscilla-avatar.png",
    mainText: "¡Hola! ¿Cómo va tu búsqueda? ¿Ya encontraste algún logo?",
    conversation: [
      {
        id: "si",
        mainChoice: "¡Sí!",
        message: [
          "¡Qué bien! 😊 Cuando llenes tu caja mira estos productos ¡Te van a encantar!",
          "¡No te detengas! 🙌 Llenar tu caja te traerá grandes sorpresas. Usa tu premio para comprar alguno de mis productos favoritos:",
          "¡Vas muy bien! 👏 Recuerda que puedes usar tu premio en alguno de estos productos que me encantan:",
        ],
      },
      {
        id: "aun_no",
        mainChoice: "Aún no",
        message: [
          "No te preocupes, ¡pronto llenarás tu Caja Mágica! 😉",
          "Busca a José Luis y descubre cuánto tiempo tienes para encontrar tus logos 👀",
        ],
      },
    ],
    products: [
     {
      product: "Auriculares",
      brand: "Hoco",
      link: "https://www.hoco.com.ar/auriculares",
      img: '/images/products/product-auriculares-hoco.png'
    },
    {
      product: "Perfume La Vie Est Belle",
      brand: "Lancôme",
      link: "https://www.hoco.com.ar/auriculares",
      img: '/images/products/product-perfume-lancome.png'
    },
    {
      product: "Cafetera Espresso",
      brand: "Philips",
      link: "https://www.hoco.com.ar/auriculares",
      img: '/images/products/product-cafetera-philips.png'
    },
    {
      product: "Cafetera Espresso",
      brand: "Oster",
      link: "https://www.hoco.com.ar/auriculares",
      img: '/images/products/product-cafetera-oster.png'
    },
    {
      product: "Power bank",
      brand: "Philips",
      link: "https://www.hoco.com.ar/auriculares",
      img: '/images/products/product-power-bank.png'
    },
    ]
  },
];

export default CHARACTERS_DATA;
