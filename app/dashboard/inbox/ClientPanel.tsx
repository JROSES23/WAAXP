<div
  style={{
    marginBottom: 16,
    padding: 10,
    borderRadius: 8,
    background: "#E6F4EF",
    color: "#065f46",
    fontWeight: 600,
    fontSize: 13,
    textAlign: "center",
  }}
>
  Conversación en curso
</div>

export default function ClientPanel() {
    return (
      <aside
        style={{
          borderLeft: "1px solid #e2efec",
          padding: 16,
          background: "#F9FCFB",
        }}
      >
        <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>
          Cliente
        </h3>
  
        <p><strong>Interés:</strong> Compra mayorista</p>
<p><strong>Última acción IA:</strong> Envió cotización</p>
<p><strong>Probabilidad:</strong> Alta</p>

  
        <div
          style={{
            marginTop: 16,
            padding: 12,
            borderRadius: 8,
            background: "#ffffff",
            border: "1px solid #e2efec",
          }}
        >
          <strong>Nota</strong>
          <p style={{ fontSize: 12, color: "#6b7f7a" }}>
            Cliente preguntando por precio. Alta intención.
          </p>
        </div>
      </aside>
    );
  }
  