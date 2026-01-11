// src/sales/discounts.ts

export interface DiscountResult {
    applied: boolean;
    name: string; // Nombre de la promo (ej: "Mayorista")
    percentage: number; // 10% = 10
    amount: number; // Cuánto dinero se descontó
    finalTotal: number;
}

export const applyDiscounts = (subtotal: number, totalItems: number): DiscountResult => {
    // --- REGLAS DE NEGOCIO ---
    
    // REGLA 1: Si lleva 3 o más productos -> 10% OFF
    if (totalItems >= 3) {
        const discountAmount = Math.round(subtotal * 0.10);
        return {
            applied: true,
            name: "🔥 Pack Mayorista (10% OFF)",
            percentage: 10,
            amount: discountAmount,
            finalTotal: subtotal - discountAmount
        };
    }

    // REGLA 2: Si compra más de $100.000 -> 5% OFF
    if (subtotal > 100000) {
        const discountAmount = Math.round(subtotal * 0.05);
        return {
            applied: true,
            name: "✨ Descuento por Monto (5% OFF)",
            percentage: 5,
            amount: discountAmount,
            finalTotal: subtotal - discountAmount
        };
    }

    // Si no aplica nada
    return {
        applied: false,
        name: "",
        percentage: 0,
        amount: 0,
        finalTotal: subtotal
    };
};