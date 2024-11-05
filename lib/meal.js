import sql from 'better-sqlite3';
import slugify from 'slugify';
import xss from 'xss';

import fs from 'node:fs';

const db = sql('meals.db');

export async function getMeals() {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    // throw new Error('loading meals failed');
    return db.prepare('SELECT * FROM meals').all();
}

export function getMeal(slug) {
    return db.prepare('SELECT * fROM meals WHERE slug = ?').get(slug)
}

export async function saveMeal(meal) {
    meal.slug = slugify(meal.title, { lower: true });
    meal.instructions = xss(meal.instructions);

    const extension = meal.image.name.split('.').pop();
    const fileName = `${meal.slug}.${extension}`;

    const stream = fs.createWriteStream(`public/imgages/${fileName}`);
    const bufferedImage = await meal.image.arrayBuffer();

    stream.write(Buffer.from(bufferedImage), (error) => {
        if (error) {
            throw new Error('Saveing image failed!');
        }
    });
    meal.image = `/imgages/${fileName}`;

    db.prepare(`
        INSERT INTO meals
            (title, summary, instructions, creator, creator_email, image, slug)
        VALUES (
            @title,
            @summary,
            @instructions, 
            @creator, 
            @creator_email,
            @image,
            @slug
        )  
    `).run(meal);
}