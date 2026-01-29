// src/db/products.ts
import { pool } from './connection';

export interface Product {
    id: string;
    name: string;
    price: number;
    description: string;
    category: string;
    stock: number;
}

type ProductRow = Omit<Product, "price"> & { price: number | string };

export const initializeProducts = async (businessId: string) => {
    console.log(`🔌 Sistema de productos conectado (Modo: PostgreSQL Full Text Search)`);
};

export const findProducts = async (query: string): Promise<Product[]> => {
    try {
        // 🚀 ESTA ES LA MAGIA DE LA ESCALABILIDAD
        // Usamos 'websearch_to_tsquery' configurado en español ('spanish').
        // Busca en el nombre Y en la descripción al mismo tiempo.
        
        const sql = `
            SELECT * FROM products 
            WHERE to_tsvector('spanish', name || ' ' || description) @@ websearch_to_tsquery('spanish', $1)
            AND stock > 0
        `;

        const result = await pool.query<ProductRow>(sql, [query]);

        return result.rows.map(row => ({
            ...row,
            price: Number(row.price)
        }));

    } catch (error) {
        console.error("❌ Error buscando productos en BD:", error);
        return [];
    }
};
