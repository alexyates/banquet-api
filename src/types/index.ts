// src/types/index.ts

/**
 * Represents a User record in the database.
 * The password field is included as it exists on the record,
 * but should always be omitted when sending user data to the client.
 */
export type User = {
    id: number;
    email: string;
    password: string;
    created_at: string | Date;
    updated_at: string | Date;
};

/**
 * Represents the category of a product.
 * Using a dedicated type for enums is a good practice.
 */
export type ProductCategory = 'surfboard' | 'accessory';

/**
 * Represents a Product record in the database.
 */
export type Product = {
    id: number;
    name: string;
    description: string;
    price_in_pence: number;
    image_url: string;
    category: ProductCategory;
    created_at: string | Date;
    updated_at: string | Date;
};

/**
 * Represents a Cart record, linking a user to their shopping session.
 */
export type Cart = {
    id: number;
    user_id: number;
    created_at: string | Date;
    updated_at: string | Date;
};

/**
 * Represents an item within a cart, linking a cart to a product.
 */
export type CartItem = {
    id: number;
    cart_id: number;
    product_id: number;
    quantity: number;
    created_at: string | Date;
    updated_at: string | Date;
};

export type SubscriberStatus = 'subscribed' | 'unsubscribed';

/**
 * Represents a newsletter subscriber.
 * A subscriber might not be a registered user
 */
export type Subscriber = {
    id: number;
    email: string;
    status: SubscriberStatus;
    user_id: number | null;
    created_at: string | Date;
    updated_at: string | Date;
};

/**
 * Represents an archived newsletter.
 */
export type Newsletter = {
    id: number;
    subject: string;
    content: string;
    published_at: string | Date;
    created_at: string | Date;
    updated_at: string | Date;
};
