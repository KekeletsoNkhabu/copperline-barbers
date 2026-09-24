/** Services and barbers. Seeded into the database and used as a display fallback if the database is unreachable. */
export const catalogServices = [
  { slug: "haircut", name: "Haircut", category: "Hair", priceCents: 18000, durationMinutes: 30, description: "Clipper and scissor cut finished with a neck shave and styling." },
  { slug: "skin-fade", name: "Skin Fade", category: "Hair", priceCents: 22000, durationMinutes: 45, description: "A clean blend down to the skin, with the top cut and styled to suit you." },
  { slug: "scissor-cut", name: "Scissor Cut", category: "Hair", priceCents: 24000, durationMinutes: 45, description: "Cut entirely with shears, best for longer or textured hair." },
  { slug: "kids-cut", name: "Kids Cut", category: "Hair", priceCents: 13000, durationMinutes: 30, description: "Haircut for boys and girls under 12. Parents welcome to stay." },
  { slug: "beard-trim", name: "Beard Trim", category: "Beard and shave", priceCents: 10000, durationMinutes: 20, description: "Shaped, lined and tidied, finished with a hot towel." },
  { slug: "hot-towel-shave", name: "Hot Towel Shave", category: "Beard and shave", priceCents: 17000, durationMinutes: 30, description: "A traditional straight razor shave with hot towels and pre-shave oil." },
  { slug: "haircut-and-beard", name: "Haircut and Beard", category: "Packages", priceCents: 27000, durationMinutes: 60, description: "Any haircut with a full beard trim. Saves R10 against booking separately." },
];

export const catalogBarbers = [
  { slug: "thabo-mokoena", name: "Thabo Mokoena", title: "Founder and master barber", image: "/barbers/thabo.jpg", workingDays: [2, 3, 4, 5, 6],
    bio: "Thabo opened Copperline in 2014 after ten years working in Johannesburg shops. He is known for precise skin fades and for never rushing a client out of the chair." },
  { slug: "priya-naidoo", name: "Priya Naidoo", title: "Senior barber", image: "/barbers/priya.jpg", workingDays: [2, 3, 4, 5],
    bio: "Priya trained in classic scissor work and specialises in longer cuts, tapers and textured styles. She is the person to ask when you are not sure what you want." },
  { slug: "liam-fourie", name: "Liam Fourie", title: "Barber, beards and shaves", image: "/barbers/liam.jpg", workingDays: [3, 4, 5, 6],
    bio: "Liam runs the straight razor side of the shop. Hot towel shaves and beard shaping are his focus, and he keeps the shop's leather strops in order." },
  { slug: "ayanda-khumalo", name: "Ayanda Khumalo", title: "Barber, fades and kids", image: "/barbers/ayanda.jpg", workingDays: [2, 4, 5, 6],
    bio: "Ayanda joined in 2021 and looks after most of our younger clients. Patient with restless kids, and quick with a sharp taper or a clean line-up." },
];
