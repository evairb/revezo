import { useEffect, useState } from "react";
import { CalendarDays, Clock, Plus, RefreshCw } from "lucide-react";

import { getServices, deactivateService } from "../service";
import type { Service } from "../types";

const weekdays = [
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
  "Domingo",
]

export const ServicesPage = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadServices = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getServices();
      setServices(response.results);
    } catch {
      setError("Não foi possível carregar os cultos.")
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadServices();
  }, []);

  const handleDeactivate = async (service: Service) => {
    const confirmed = window.confirm(
      `Deseja realmente desativar o culto "${service.name}"?`,
    );

    if (!confirmed) return;

    try {
      await deactivateService(service.id);

      setServices((current) =>
        current.map((item) =>
          item.id === service.id
            ? { ...item, is_active: false }
            : item,
        ),
      );
    } catch {
      setError("Não foi possível desativar o culto.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Cultos</h1>
          <p className="mt-2 text-muted">
            Consulte e gerencie os cultos da igreja.
          </p>
        </div>

        <button
          type="button"
          className="flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 font-medium text-white hover:opacity-90"
          onClick={() => {
            // A abertura do formulário será implementada na próxima etapa.
          }}
        >
          <Plus size={18} />
          Novo culto
        </button>
      </div>

      <div className="rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border p-4">
          <h2 className="font-semibold">Todos os cultos</h2>

          <button
            type="button"
            onClick={() => void loadServices()}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-muted/10 disabled:opacity-50"
          >
            <RefreshCw size={16} />
            Atualizar
          </button>
        </div>

        {loading ? (
          <div className="p-10 text-center text-muted">
            Carregando cultos...
          </div>
        ) : error ? (
          <div className="space-y-4 p-10 text-center">
            <p className="text-red-500">{error}</p>
            <button
              type="button"
              onClick={() => void loadServices()}
              className="rounded-lg border border-border px-4 py-2"
            >
              Tentar novamente
            </button>
          </div>
        ) : services.length === 0 ? (
          <div className="p-10 text-center">
            <CalendarDays className="mx-auto mb-3 text-muted" size={32} />
            <h3 className="font-semibold">Nenhum culto cadastrado</h3>
            <p className="mt-2 text-sm text-muted">
              Quando houver cultos cadastrados, eles aparecerão aqui.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {services.map((service) => (
              <div
                key={service.id}
                className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold">{service.name}</h3>

                    <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                      {service.service_type === "fixed" ? "Fixo" : "Especial"}
                    </span>

                    {!service.is_active && (
                      <span className="rounded-full bg-muted/20 px-2.5 py-1 text-xs text-muted">
                        Inativo
                      </span>
                    )}
                  </div>

                  <p className="mt-1 text-sm text-muted">
                    {service.church_name}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted">
                    <span className="flex items-center gap-2">
                      <CalendarDays size={16} />
                      {service.service_type === "fixed"
                        ? weekdays[service.day_of_week ?? 0]
                        : service.date
                          ? new Date(`${service.date}T12:00:00`).toLocaleDateString("pt-BR")
                          : "Data não informada"}
                    </span>

                    <span className="flex items-center gap-2">
                      <Clock size={16} />
                      {service.time.slice(0, 5)}
                    </span>
                  </div>
                </div>

                {service.is_active && (
                  <button
                    type="button"
                    onClick={() => void handleDeactivate(service)}
                    className="self-start rounded-lg border border-border px-3 py-2 text-sm hover:bg-muted/10 sm:self-center"
                  >
                    Desativar
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}