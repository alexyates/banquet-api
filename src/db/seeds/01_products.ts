// src/db/seeds/01_products.ts

import type { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
    await knex("products").del();
    await knex('products').insert([
        {
            id: 1,
            name: 'The Classic Longboard',
            description: 'A perfect board for cruising on small to medium waves. Stable and easy to ride.',
            price_in_pence: 69999, // £699.99
            image_url: '/images/longboard.jpg',
            category: 'surfboard',
            brand: 'WaveRider',
            model: 'Classic-90',
            rating: 4.5,
            deal_type: null,
            deal_discount: null,
        },
        {
            id: 2,
            name: 'High-Performance Shortboard',
            description: 'For the advanced surfer looking to execute sharp turns and aerial maneuvers.',
            price_in_pence: 74999, // £749.99
            image_url: '/images/shortboard.jpg',
            category: 'surfboard',
            brand: 'ShredStix',
            model: 'Pro-X',
            rating: 4.8,
            deal_type: 'percentage',
            deal_discount: 10,
        },
        {
            id: 3,
            name: 'Pro Comp Leash',
            description: 'A reliable 6ft competition leash that will keep you connected to your board.',
            price_in_pence: 2999, // £29.99
            image_url: '/images/leash.jpg',
            category: 'accessory',
            brand: 'StayTied',
            model: 'Comp-6',
            rating: 4.7,
            deal_type: null,
            deal_discount: null,
        },
        {
            id: 4,
            name: 'Eco-Friendly Surf Wax',
            description: 'Get the best grip with our all-natural, environmentally friendly surf wax.',
            price_in_pence: 499, // £4.99
            image_url: '/images/wax.jpg',
            category: 'accessory',
            brand: 'StickyLeaf',
            model: 'CoolWater',
            rating: 4.9,
            deal_type: null,
            deal_discount: null,
        },
        {
            id: 5,
            name: 'Retro Rocket Fish',
            description: 'A twin-fin fish design that excels in mushy, everyday waves. Fast and loose.',
            price_in_pence: 54995, // £549.95
            image_url: '/images/retro-fish.jpg',
            category: 'surfboard',
            brand: 'WaveRider',
            model: 'Rocket-58',
            rating: 4.6,
            deal_type: null,
            deal_discount: null,
        },
        {
            id: 6,
            name: 'The Dolphin Soft Top',
            description: 'The ultimate beginner board. Safe, durable, and provides excellent stability for learning.',
            price_in_pence: 29950, // £299.50
            image_url: '/images/soft-top.jpg',
            category: 'surfboard',
            brand: 'AquaGlide',
            model: 'Dolphin-80',
            rating: 4.2,
            deal_type: 'fixed_amount',
            deal_discount: 2500,
        },
        {
            id: 7,
            name: '3/2mm Furnace Comp Wetsuit',
            description: 'Full-length summer wetsuit with internal thermal lining for maximum warmth and flexibility.',
            price_in_pence: 24999, // £249.99
            image_url: '/images/wetsuit.jpg',
            category: 'accessory',
            brand: 'ThermoSurf',
            model: 'Furnace-Comp',
            rating: 4.7,
            deal_type: null,
            deal_discount: null,
        },
        {
            id: 8,
            name: 'Carbon-Tech Thruster Fins',
            description: 'A balanced set of three fins for all-round performance. Lightweight carbon construction.',
            price_in_pence: 8995, // £89.95
            image_url: '/images/fins.jpg',
            category: 'accessory',
            brand: 'ShredStix',
            model: 'Carbon-Thruster',
            rating: 4.9,
            deal_type: null,
            deal_discount: null,
        },
        {
            id: 9,
            name: '5-Piece Arch Tail Pad',
            description: 'High-grip EVA foam tail pad with a central arch bar for ultimate foot placement.',
            price_in_pence: 3499, // £34.99
            image_url: '/images/tail-pad.jpg',
            category: 'accessory',
            brand: 'GripTide',
            model: 'Arch-5',
            rating: 4.4,
            deal_type: null,
            deal_discount: null,
        },
        {
            id: 10,
            name: 'Daylight Thruster Board Bag',
            description: 'Protect your board from dings and sun damage with this padded, reflective board bag.',
            price_in_pence: 7495, // £74.95
            image_url: '/images/board-bag.jpg',
            category: 'accessory',
            brand: 'BoardShield',
            model: 'Daylight-62',
            rating: 4.6,
            deal_type: 'percentage',
            deal_discount: 15,
        },
    ]);
};
