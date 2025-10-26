// src/db/seeds/02_newsletters.ts

import type { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
    // Deletes ALL existing entries
    await knex("newsletters").del();

    // Inserts seed entries
    await knex("newsletters").insert([
        {
            id: 1,
            subject: "The Summer Collection Has Arrived!",
            content: `
# Fresh Boards, Fresh Gear!

The wait is over! Our brand new Summer Collection has just dropped, and it's packed with everything you need to make this your best season yet.

**New Arrivals:**
- **The Retro Rocket Fish:** A twin-fin design that glides through even the weakest summer waves. Perfect for having fun on those smaller days.
- **Eco-Friendly Surf Wax:** Get the best grip with our all-natural, environmentally friendly surf wax. Good for your board, great for the ocean.
- **Lightweight Comp Leashes:** Feel the freedom with our new ultra-light competition leashes. Strong, reliable, and barely noticeable.

Check out the full collection on the website and get ready to hit the water!
            `,
            // Set a specific publication date in the past
            published_at: new Date('2025-06-15 09:00:00')
        },
        {
            id: 2,
            subject: "Get Ready: Winter Swells Are Coming",
            content: `
# Are You Prepared for Cold Water?

The days are getting shorter and the water is getting colder, but that means one thing: powerful winter swells are on their way! Don't let the chill keep you out of the water. We've got the gear to keep you warm and charging all season long.

**Essential Winter Gear:**
- **5/4mm Hooded Wetsuits:** Our top-rated hooded suits offer the ultimate barrier against the cold without sacrificing flexibility.
- **Split-Toe Booties:** Keep your feet warm and maintain your board feel with our new range of 3mm and 5mm booties.
- **Gloves & Mitts:** Don't let numb fingers end your session early.

Surfing isn't just a summer sport. Gear up now and be ready for the best waves of the year.
            `,
            published_at: new Date('2025-09-01 10:30:00')
        },
        {
            id: 3,
            subject: "🔥 20% Off Summer Sale - Final Days! 🔥",
            content: `
# Last Chance for a Deal!

Our annual Summer Surf Sale is coming to an end, but there's still time to score big. We're offering **20% OFF** on all high-performance shortboards and selected summer wetsuits.

Whether you're looking to upgrade your board for sharper turns or need a flexible suit for those late-season sessions, now is the time to grab it.

The sale ends this Sunday! Don't miss out.

*Deal applies to selected products only. See website for details.*
            `,
            published_at: new Date('2025-08-28 12:00:00')
        },
    ]);
};
