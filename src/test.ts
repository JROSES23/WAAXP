import { handleMessageReceived } from './handlers/handleMessageReceived';

async function testSistema() {
  console.log('🚀 INICIANDO PRUEBAS DE PRODUCTOS (DB)\n');

  try {
    console.log('PRUEBA 2: Cotización de Zapatillas');
    
    await handleMessageReceived({
      business_id: 'negocio_demo', // Asegúrate de usar el ID que pusimos en el SQL
      phone: '+56912345678',
      message: 'Precio de zapatillas' // 👈 ESTO activará la búsqueda en Supabase
    });

    console.log('\n✅ Prueba finalizada');
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testSistema();