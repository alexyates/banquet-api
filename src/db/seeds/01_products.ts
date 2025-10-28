// src/db/seeds/01_products.ts

import type { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
    await knex("products").del();
    await knex('products').insert([
        {
            id: 1,
            name: 'The Classic Longboard',
            description: `Rediscover the soul of surfing with The Classic Longboard. This board is all about effortless paddling, early wave entry, and unmatched stability, making it a dream for both beginners finding their feet and seasoned surfers looking for a stylish, cruisey ride.

Its generous volume and gentle rocker let you catch even the smallest swells, while the classic shape is perfect for learning to cross-step or simply enjoying a smooth, buttery glide down the line. If you want to maximize your wave count and surf with style, this is your board.

## Key Features
- **Dimensions:** 9'0" x 22.5" x 3"
- **Construction:** High-density EPS foam core with a durable epoxy shell.
- **Fin Setup:** Single fin box for that classic, pivotal longboard feel.`,
            //
            price_in_pence: 69999,
            image_url: '/surfboard.webp',
            category: 'surfboard',
            brand: 'WaveRider',
            //
            rating: 4.5,
            deal_type: null,
            deal_discount: null,
            //
            model: 'Classic-90',
            dimensions: `9'0" x 22.5" x 3"`,
            volume: '72L',
            ability: 'Beginner to Advanced',
            conditions: 'Knee to shoulder-high waves',
            construction: 'EPS Foam Core / Epoxy Shell',
            fin_system: 'Single Fin Box',
        },
        {
            id: 2,
            name: 'High-Performance Shortboard',
            description: `Unleash your full potential in critical waves with the ShredStix Pro-X. This is not a board for the faint-hearted; it's a finely-tuned weapon designed for vertical snaps in the pocket and progressive aerials above the lip.

The Pro-X features a refined single concave for blistering speed and a responsive tail rocker that allows for lightning-fast directional changes. It’s the board of choice for our team riders when the waves turn on, offering the perfect blend of speed, control, and explosive performance.

## Key Features
- **Dimensions:** 6'2" x 19" x 2.5"
- **Construction:** Ultralight PU blank with carbon tail patches for durability and flex.
- **Best Conditions:** Chest-high to double-overhead, powerful waves.`,
            //
            price_in_pence: 74999,
            image_url: '/surfboard.webp',
            category: 'surfboard',
            brand: 'ShredStix',
            //
            rating: 4.8,
            deal_type: 'percentage',
            deal_discount: 10,
            //
            model: 'Pro-X',
            dimensions: `6'2" x 19" x 2.5"`,
            volume: '30.5L',
            ability: 'Intermediate to Pro',
            conditions: 'Chest-high to double-overhead',
            construction: 'PU Foam / Carbon Tail Patch',
            fin_system: 'FCS II Thruster',
        },
        {
            id: 3,
            name: 'Pro Comp Leash',
            description: `When you're charging a heavy set, the last thing you need to worry about is your gear. The StayTied Comp-6 leash is engineered for peace of mind.

Built with a high-strength, lightweight 6mm polyurethane cord, it minimizes drag without compromising on durability. The double-swivel design prevents tangles, while the comfortable neoprene cuff ensures it stays securely on your ankle, session after session. Trust StayTied to keep you connected.`,
            //            
            price_in_pence: 2999,
            image_url: '/surfboard.webp',
            category: 'accessory',
            brand: 'StayTied',
            //
            rating: 4.7,
            deal_type: null,
            deal_discount: null,
            //
            model: 'Comp-6',
            dimensions: null,
            volume: null,
            ability: null,
            conditions: null,
            construction: null,
            fin_system: null,
        },
        {
            id: 4,
            name: 'Eco-Friendly Surf Wax',
            description: `Get superior grip that's good for your board and great for the ocean. Our StickyLeaf CoolWater wax is made from a blend of all-natural, biodegradable ingredients, offering incredible traction without the harmful petrochemicals found in traditional waxes.

It's easy to apply, creates perfect beads for all-day grip, and has a fresh, subtle scent. Make the switch and feel the difference.`,
            //
            price_in_pence: 499,
            image_url: '/surfboard.webp',
            category: 'accessory',
            brand: 'StickyLeaf',
            //
            rating: 4.9,
            deal_type: null,
            deal_discount: null,
            //
            model: 'CoolWater',
            dimensions: null,
            volume: null,
            ability: null,
            conditions: null,
            construction: null,
            fin_system: null,
        },
        {
            id: 5,
            name: 'Retro Rocket Fish',
            description: `Turn average, mushy days into your personal playground. The WaveRider Rocket Fish is a modern take on a classic twin-fin design, built to generate effortless speed and bring a dose of fun back to your everyday surfs.

Its wider outline and flatter rocker help you paddle in early and fly across even the softest sections, while the deep swallowtail provides a pivot point for surprisingly snappy turns. It's fast, loose, and guaranteed to put a smile on your face.`,
            //
            price_in_pence: 54995,
            image_url: '/surfboard.webp',
            category: 'surfboard',
            brand: 'WaveRider',
            //
            rating: 4.6,
            deal_type: null,
            deal_discount: null,
            //
            model: 'Rocket-58',
            dimensions: `8'0" x 22" x 3.2"`,
            volume: '85L',
            ability: 'First-time Beginner',
            conditions: 'Small, rolling waves',
            construction: 'Soft IXPE Deck / HDPE Slick Bottom',
            fin_system: 'Flexible Tri-Fin (Included)',
        },
        {
            id: 6,
            name: 'The Dolphin Soft Top',
            description: `The perfect start to a lifelong surfing adventure! The AquaGlide Dolphin is the ultimate beginner board, designed with safety, durability, and stability as top priorities.

The high-volume foam core makes paddling and catching waves incredibly easy, while the soft, forgiving deck minimizes bumps and bruises. Its durable slick bottom ensures a smooth glide, helping new surfers build confidence and master the basics faster than ever.`,
            //            
            price_in_pence: 29950,
            image_url: '/surfboard.webp',
            category: 'surfboard',
            brand: 'AquaGlide',
            //
            rating: 4.2,
            deal_type: 'fixed_amount',
            deal_discount: 2500,
            //
            model: 'Dolphin-80',
            dimensions: `5'8" x 21" x 2.6"`,
            volume: '34L',
            ability: 'All Levels',
            conditions: 'Ankle to head-high waves',
            construction: 'PU Foam / Gloss Finish',
            fin_system: 'Futures Twin Fin',
        },
        {
            id: 7,
            name: '3/2mm Furnace Comp Wetsuit',
            description: `Extend your summer sessions and stay warm without sacrificing performance. The ThermoSurf Furnace Comp is a premium 3/2mm wetsuit engineered for maximum flexibility and warmth.

Featuring our ultra-stretchy, eco-conscious neoprene and a quick-drying thermal lining across the chest and back, this suit keeps your core warm and your movements unrestricted. Glued and blind-stitched seams minimize water entry, letting you stay out longer and surf stronger.`,
            //
            price_in_pence: 24999,
            image_url: '/surfboard.webp',
            category: 'accessory',
            brand: 'ThermoSurf',
            //
            rating: 4.7,
            deal_type: null,
            deal_discount: null,
            //
            model: 'Furnace-Comp',
            dimensions: null,
            volume: null,
            ability: null,
            conditions: null,
            construction: null,
            fin_system: null,
        },
        {
            id: 8,
            name: 'Carbon-Tech Thruster Fins',
            description: `Upgrade your ride and feel the difference. The ShredStix Carbon-Tech thruster set is designed for the surfer who demands all-round performance.
            
            The balanced template offers a perfect combination of drive, pivot, and release, while the lightweight carbon base provides stiffness for powerful bottom turns and explosive speed. The refined foil and flexible tip allow for a responsive feel through turns, making your board feel more alive than ever.`,
            //
            price_in_pence: 8995,
            image_url: '/surfboard.webp',
            category: 'accessory',
            brand: 'ShredStix',
            //
            rating: 4.9,
            deal_type: null,
            deal_discount: null,
            //
            model: 'Carbon-Thruster',
            dimensions: null,
            volume: null,
            ability: null,
            conditions: null,
            construction: null,
            fin_system: null,
        },
        {
            id: 9,
            name: '5-Piece Arch Tail Pad',
            description: `Lock in your back foot for critical maneuvers with the GripTide Arch-5 tail pad. This 5-piece pad allows for customizable spread to fit any tail shape, from narrow shortboards to wider fish designs.

The high-grip diamond groove texture ensures your foot stays planted, while the central arch bar provides crucial feedback for precise foot placement. It's the ultimate connection between you and your board.`,
            //
            price_in_pence: 3499,
            image_url: '/surfboard.webp',
            category: 'accessory',
            brand: 'GripTide',
            //
            rating: 4.4,
            deal_type: null,
            deal_discount: null,
            //
            model: 'Arch-5',
            dimensions: null,
            volume: null,
            ability: null,
            conditions: null,
            construction: null,
            fin_system: null,
        },
        {
            id: 10,
            name: 'Daylight Thruster Board Bag',
            description: `Your board is an investment—protect it. The BoardShield Daylight bag is essential for everyday use, guarding your board against dings, scratches, and harmful UV rays during transport.

Featuring a durable, heat-reflective outer shell and 5mm of padded protection, it's the perfect lightweight solution for trips to the local break or for storing your board safely at home.`,
            //
            price_in_pence: 7495,
            image_url: '/surfboard.webp',
            category: 'accessory',
            brand: 'BoardShield',
            //
            rating: 4.6,
            deal_type: 'percentage',
            deal_discount: 15,
            //
            model: 'Daylight-62',
            dimensions: null,
            volume: null,
            ability: null,
            conditions: null,
            construction: null,
            fin_system: null,
        },
    ]);
};
