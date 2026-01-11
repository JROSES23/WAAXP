export default function ConversationList() {
    return (
      <aside
        style={{
          background: "#F6FBFA",
          borderRight: "1px solid #e2efec",
          padding: 12,
          overflowY: "auto",
        }}
      >
        <h3 style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>
          Conversaciones
        </h3>
  
        {[
          { name: "Juan Pérez", unread: true, status: "interés" },
          { name: "María López", unread: false, status: "cotizando" },
          { name: "Ferretería San Luis", unread: false, status: "venta" },
        ].map((c) => (
          <div
            key={c.name}
            style={{
              display: "flex",
              gap: 10,
              padding: 10,
              borderRadius: 10,
              background: "#ffffff",
              marginBottom: 8,
              cursor: "pointer",
              border: "1px solid #e2efec",
            }}
          >
            {/* Avatar */}
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                background: "#0f766e",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              {c.name[0]}
            </div>
  
            {/* Info */}
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <strong style={{ fontSize: 14 }}>{c.name}</strong>
                {c.unread && (
                  <span
                    style={{
                      background: "#0f766e",
                      color: "#fff",
                      borderRadius: 12,
                      fontSize: 10,
                      padding: "2px 6px",
                    }}
                  >
                    nuevo
                  </span>
                )}
              </div>
  
              <p style={{ fontSize: 12, color: "#6b7f7a" }}>
                Consulta por producto…
              </p>
            </div>
          </div>
        ))}
      </aside>
    );
  }
  