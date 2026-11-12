import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAuditoriaApi } from '../../features/panel/panelApi.js';
import { formatearFecha } from '../../utils/format.js';
import { Badge } from '../../components/ui/Badge.jsx';
import { DataTable } from '../../components/ui/DataTable.jsx';
import { Input } from '../../components/ui/Input.jsx';

export function AdminAuditoriaPage() {
  const [entidad, setEntidad] = useState('');
  const [accion, setAccion] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-auditoria', { entidad, accion, page }],
    queryFn: () =>
      getAuditoriaApi({
        page,
        limit: 20,
        ...(entidad.trim() ? { entidad: entidad.trim() } : {}),
        ...(accion.trim() ? { accion: accion.trim() } : {}),
      }),
  });

  const columns = [
    { key: 'fecha', label: 'Fecha', render: (r) => formatearFecha(r.fecha) },
    {
      key: 'usuario',
      label: 'Usuario',
      render: (r) => r.usuario?.alias || `ID ${r.usuarioId}`,
    },
    {
      key: 'entidad',
      label: 'Entidad',
      render: (r) => (
        <span className="font-mono text-xs">
          {r.entidad} #{r.entidadId}
        </span>
      ),
    },
    { key: 'accion', label: 'Acción', render: (r) => <Badge color="indigo">{r.accion}</Badge> },
    {
      key: 'detalle',
      label: 'Detalle',
      render: (r) => (
        <pre className="max-w-md overflow-x-auto rounded bg-slate-50 p-1.5 font-mono text-[11px] text-slate-700">
          {r.detalle ? JSON.stringify(r.detalle) : '—'}
        </pre>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Auditoría del sistema</h1>
        <p className="text-sm text-slate-500">
          Bitácora inmutable de acciones críticas realizadas en la plataforma
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:max-w-xl">
        <Input
          label="Filtrar por entidad"
          placeholder="Ej. pago, rifa, solicitud, usuario"
          value={entidad}
          onChange={(e) => {
            setEntidad(e.target.value);
            setPage(1);
          }}
        />
        <Input
          label="Filtrar por acción"
          placeholder="Ej. CONFIRMAR_PAGO, REALIZAR_SORTEO"
          value={accion}
          onChange={(e) => {
            setAccion(e.target.value);
            setPage(1);
          }}
        />
      </div>

      <DataTable
        columns={columns}
        data={data?.items || []}
        loading={isLoading}
        rowKey="auditoriaId"
        page={data?.pagination?.page || 1}
        totalPages={data?.pagination?.totalPages || 1}
        total={data?.pagination?.total || 0}
        onPageChange={setPage}
        emptyTitle="Sin eventos de auditoría"
      />
    </div>
  );
}

