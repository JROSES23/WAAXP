type QueryResult<T = unknown> = { rows: T[] };

const missingDatabaseError = new Error(
  "DATABASE_URL no está configurada. Define la variable para habilitar la conexión."
);

export const pool = {
  async query<T = unknown>(
    _text: string,
    _params?: unknown[]
  ): Promise<QueryResult<T>> {
    throw missingDatabaseError;
  },
  async end(): Promise<void> {
    return;
  },
};
