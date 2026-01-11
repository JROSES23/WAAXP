<div
  style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 14px",
    borderBottom: "1px solid #e2efec",
    background: "#F6FBFA",
  }}
>
  <strong>Juan Pérez</strong>

  <span
    style={{
      background: "#E6F4EF",
      color: "#065f46",
      fontSize: 12,
      padding: "4px 10px",
      borderRadius: 999,
      fontWeight: 600,
    }}
  >
    Cotizando
  </span>
</div>

export default function ChatPanel() {
    return (
      <section
        style={{
          display: "flex",
          flexDirection: "column",
          padding: 16,
        }}
      >
       <div style={{ flex: 1, overflowY: "auto", paddingBottom: 16 }}>
  <div
    style={{
      maxWidth: 420,
      background: "#f1f5f4",
      padding: 12,
      borderRadius: "12px 12px 12px 4px",
      marginBottom: 8,
      fontSize: 14,
    }}
  >
    Hola, quería saber el precio del producto
  </div>

  <div
    style={{
      maxWidth: 420,
      background: "#DCF8C6",
      padding: 12,
      borderRadius: "12px 12px 4px 12px",
      marginLeft: "auto",
      fontSize: 14,
    }}
  >
    Claro 🙂 ¿Cuántas unidades necesitas?
  </div>
</div>

  
<div
  style={{
    display: "flex",
    gap: 8,
    padding: 12,
    borderTop: "1px solid #e2efec",
    background: "#ffffff",
  }}
>
  <input
    placeholder="Escribe un mensaje o deja que la IA responda…"
    style={{
      flex: 1,
      padding: "12px 14px",
      borderRadius: 10,
      border: "1px solid #d1e7e2",
      fontSize: 14,
      outline: "none",
    }}
  />
  <button
    style={{
      background: "#0f766e",
      color: "#fff",
      border: "none",
      borderRadius: 10,
      padding: "0 16px",
      fontWeight: 600,
      cursor: "pointer",
    }}
  >
    Enviar
  </button>
</div>

      </section>
    );
  }
  