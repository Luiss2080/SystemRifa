import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { History, RotateCcw } from 'lucide-react';
import { getAuditoriaApi } from '../../features/panel/panelApi.js';
import { formatearFecha } from '../../utils/format.js';
import { Badge } from '../../components/ui/Badge.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { DataTable } from '../../components/ui/DataTable.jsx';
import { Input } from '../../components/ui/Input.jsx';

const ENTIDADES_RAPIDAS = ['', 'pago', 'rifa', 'solicitud', 'usuario', 'premio'];

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
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700 ring-1 ring-indigo-200">
            <History className="h-3.5 w-3.5" />
            Trazabilidad e historial inmutable
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Auditoría del sistema</h1>
          <p className="text-sm text-slate-600">
            Bitácora verificable de aprobaciones, pagos, sorteos, anulaciones y cambios de permisos.
          </p>
        </div>
      </div>

      <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap gap-1.5">
            {ENTIDADES_RAPIDAS.map((ent) => (
              <button
                key={ent || 'all'}
                type="button"
                onClick={() => {
                  setEntidad(ent);
                  setPage(1);
                }}
                className={`rounded-xl px-3 py-1.5 text-xs font-semibold capitalize transition cursor-pointer ${
                  entidad.toLowerCase() === ent
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-50 text-slate-600 ring-1 ring-slate-200 hover:bg-emerald-50 hover:text-emerald-700'
                }`}
              >
                {ent || 'Todas las entidades'}
              </button>
            ))}
          </div>

          {(entidad || accion) && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setEntidad('');
                setAccion('');
                setPage(1);
              }}
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Limpiar filtros
            </Button>
          )}
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:max-w-2xl">
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
