import React from 'react';

interface ImpactBlockProps {
    ventasRecuperadas: number;
    conversacionesAtendidas: number;
    horasAhorradas: number;
}

const ImpactBlock: React.FC<ImpactBlockProps> = ({
    ventasRecuperadas = 485000,
    conversacionesAtendidas = 127,
    horasAhorradas = 18
}) => {
    const formatMoney = (amount: number): string => {
        return new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP',
            minimumFractionDigits: 0
        }).format(amount);
    };

    return (
        <div
            style={{
                background: '#ffffff',
                borderRadius: 10,
                padding: '16px 20px',
                width: '100%',
            }}
        >
            {/* Layout horizontal - todas las métricas en fila */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

                {/* Ventas recuperadas */}
                <div>
                    <p style={{ color: '#6b7f7a', fontSize: 12, margin: 0, marginBottom: 4 }}>
                        Ventas recuperadas
                    </p>
                    <p style={{ color: '#0f766e', fontSize: 22, fontWeight: 700, margin: 0 }}>
                        {formatMoney(ventasRecuperadas)}
                    </p>
                </div>

                {/* Separador */}
                <div style={{ height: 50, width: 1, background: '#c9d1d9' }} />

                {/* Chats atendidos */}
                <div style={{ textAlign: 'center' }}>
                    <p style={{ color: '#6b7f7a', fontSize: 12, margin: 0, marginBottom: 4 }}>
                        Chats atendidos
                    </p>
                    <p style={{ color: '#1f2d2b', fontSize: 20, fontWeight: 600, margin: 0 }}>
                        {conversacionesAtendidas}
                    </p>
                </div>

                {/* Separador */}
                <div style={{ height: 50, width: 1, background: '#c9d1d9' }} />

                {/* Horas ahorradas */}
                <div style={{ textAlign: 'center' }}>
                    <p style={{ color: '#6b7f7a', fontSize: 12, margin: 0, marginBottom: 4 }}>
                        Horas ahorradas
                    </p>
                    <p style={{ color: '#1f2d2b', fontSize: 20, fontWeight: 600, margin: 0 }}>
                        {horasAhorradas}h
                    </p>
                </div>

            </div>
        </div>
    );
};

export default ImpactBlock;
