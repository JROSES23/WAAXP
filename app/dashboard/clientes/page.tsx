'use client'

export default function ClientesPage() {
  const stats = [
    { label: 'Clientes activos', value: '3', icon: 'users' },
    { label: 'Oportunidades', value: '1', icon: 'lightning' },
    { label: 'Valor total', value: '$12.000', icon: 'money' }
  ];

  const clientes = [
    {
      id: 1,
      nombre: 'Juan Pérez',
      empresa: 'Pérez Construcciones',
      estado: 'Activo',
      conversaciones: 8,
      ultimaCompra: '14-01-2024',
      valorTotal: '$4200',
      potencial: 'Alto'
    },
    {
      id: 2,
      nombre: 'María López',
      empresa: 'Ferretería López',
      estado: 'Activo',
      conversaciones: 5,
      ultimaCompra: '09-01-2024',
      valorTotal: '$2800',
      potencial: 'Medio'
    },
    {
      id: 3,
      nombre: 'David Frarez',
      empresa: 'Taller Mecánico',
      estado: 'Inactivo',
      conversaciones: 3,
      ultimaCompra: '19-11-2023',
      valorTotal: '$1500',
      potencial: 'Bajo'
    }
  ];

  const renderIcon = (name: string) => {
    const color = "#0f766e";
    
    if (name === 'users') {
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );
    }
    
    if (name === 'lightning') {
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
      );
    }
    
    if (name === 'money') {
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
          <circle cx="12" cy="12" r="1" />
          <path d="M12 1v6m0 6v6" />
          <path d="M4.22 4.22l4.24 4.24M15.54 15.54l4.24 4.24M1 12h6m6 0h6M4.22 19.78l4.24-4.24M15.54 8.46l4.24-4.24" />
        </svg>
      );
    }
    
    return null;
  };

  return (
    <div>
      {/* Descripción */}
      <div style={{ marginBottom: 24 }}>
        <p style={{ color: "#6B7280", fontSize: 14 }}>
          Gestiona tus clientes y visualiza su historial
        </p>
      </div>

      {/* Stats cards */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(3, 1fr)", 
        gap: 20,
        marginBottom: 32
      }}>
        {stats.map((stat, i) => (
          <div
            key={i}
            style={{
              background: "#ffffff",
              padding: 20,
              borderRadius: 12,
              border: "1px solid #e2efec",
              boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{
                width: 48,
                height: 48,
                background: "#E6F4EF",
                borderRadius: 10,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#0f766e",
                flexShrink: 0
              }}>
                {renderIcon(stat.icon)}
              </div>
              <div>
                <p style={{ fontSize: 12, color: "#6b7f7a", marginBottom: 4 }}>
                  {stat.label}
                </p>
                <p style={{ fontSize: 24, fontWeight: 700, color: "#1a1a1a" }}>
                  {stat.value}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Buscador y filtros */}
      <div style={{
        display: "flex",
        gap: 12,
        marginBottom: 24,
        alignItems: "center"
      }}>
        <input
          type="text"
          placeholder="Buscar por nombre o empresa..."
          style={{
            flex: 1,
            padding: "10px 16px",
            border: "1px solid #e2efec",
            borderRadius: 8,
            fontSize: 14,
            outline: "none"
          }}
        />
        <select
          style={{
            padding: "10px 16px",
            border: "1px solid #e2efec",
            borderRadius: 8,
            fontSize: 14,
            outline: "none",
            background: "#ffffff",
            cursor: "pointer"
          }}
        >
          <option>Todos</option>
          <option>Activos</option>
          <option>Inactivos</option>
        </select>
      </div>

      {/* Tabla de clientes */}
      <div style={{
        background: "#ffffff",
        borderRadius: 12,
        border: "1px solid #e2efec",
        boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
        overflowX: "auto"
      }}>
        <table style={{
          width: "100%",
          borderCollapse: "collapse"
        }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #e2efec", background: "#F9FCFB" }}>
              <th style={{ 
                padding: "14px 20px", 
                textAlign: "left", 
                fontSize: 12, 
                fontWeight: 600, 
                color: "#5f7f7a",
                textTransform: "uppercase",
                letterSpacing: "0.5px"
              }}>
                CLIENTE
              </th>
              <th style={{ 
                padding: "14px 20px", 
                textAlign: "left", 
                fontSize: 12, 
                fontWeight: 600, 
                color: "#5f7f7a",
                textTransform: "uppercase",
                letterSpacing: "0.5px"
              }}>
                ESTADO
              </th>
              <th style={{ 
                padding: "14px 20px", 
                textAlign: "left", 
                fontSize: 12, 
                fontWeight: 600, 
                color: "#5f7f7a",
                textTransform: "uppercase",
                letterSpacing: "0.5px"
              }}>
                CONVERSACIONES
              </th>
              <th style={{ 
                padding: "14px 20px", 
                textAlign: "left", 
                fontSize: 12, 
                fontWeight: 600, 
                color: "#5f7f7a",
                textTransform: "uppercase",
                letterSpacing: "0.5px"
              }}>
                ÚLTIMA COMPRA
              </th>
              <th style={{ 
                padding: "14px 20px", 
                textAlign: "left", 
                fontSize: 12, 
                fontWeight: 600, 
                color: "#5f7f7a",
                textTransform: "uppercase",
                letterSpacing: "0.5px"
              }}>
                VALOR TOTAL
              </th>
              <th style={{ 
                padding: "14px 20px", 
                textAlign: "left", 
                fontSize: 12, 
                fontWeight: 600, 
                color: "#5f7f7a",
                textTransform: "uppercase",
                letterSpacing: "0.5px"
              }}>
                POTENCIAL
              </th>
            </tr>
          </thead>
          <tbody>
            {clientes.map((cliente) => (
              <tr 
                key={cliente.id}
                style={{ 
                  borderBottom: "1px solid #e2efec",
                  cursor: "pointer",
                  transition: "background 0.2s"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#F9FCFB";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                }}
              >
                <td style={{ padding: "16px 20px" }}>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 600, color: "#1a1a1a", marginBottom: 2 }}>
                      {cliente.nombre}
                    </p>
                    <p style={{ fontSize: 12, color: "#6b7f7a" }}>
                      {cliente.empresa}
                    </p>
                  </div>
                </td>
                <td style={{ padding: "16px 20px" }}>
                  <span style={{
                    display: "inline-block",
                    padding: "4px 10px",
                    borderRadius: 999,
                    fontSize: 12,
                    fontWeight: 600,
                    background: cliente.estado === 'Activo' ? "#E6F4EF" : "#f3f4f6",
                    color: cliente.estado === 'Activo' ? "#0f766e" : "#6b7280"
                  }}>
                    {cliente.estado}
                  </span>
                </td>
                <td style={{ padding: "16px 20px", fontSize: 14, color: "#1a1a1a" }}>
                  {cliente.conversaciones}
                </td>
                <td style={{ padding: "16px 20px", fontSize: 14, color: "#1a1a1a" }}>
                  {cliente.ultimaCompra}
                </td>
                <td style={{ padding: "16px 20px", fontSize: 14, fontWeight: 600, color: "#0f766e" }}>
                  {cliente.valorTotal}
                </td>
                <td style={{ padding: "16px 20px" }}>
                  <span style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    display: "inline-block",
                    background: cliente.potencial === 'Alto' ? "#10b981" : cliente.potencial === 'Medio' ? "#f59e0b" : "#ef4444"
                  }} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
